import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, Environment, PerspectiveCamera, ContactShadows, Grid, Line } from "@react-three/drei";
import * as THREE from "three";
import { 
  Wind, 
  Hand, 
  Rotate3d,
} from "lucide-react";
import { cn } from "@/lib/utils"; 

// --- 1. CONFIGURATION ---

const AERODYNAMICS_CONFIG = [
  { id: 'short', label: 'Short Chord', cd: 0.52, turbulence: 0.8, color: '#ef4444' },   
  { id: 'std',   label: 'Standard',    cd: 0.45, turbulence: 0.5, color: '#f59e0b' },   
  { id: 'long',  label: 'Long Chord',  cd: 0.38, turbulence: 0.3, color: '#3b82f6' },   
  { id: 'ext',   label: 'Extended',    cd: 0.32, turbulence: 0.1, color: '#10b981' },   
];

// --- UPDATED GEOMETRY PARAMETERS (HORIZONTAL X-AXIS) ---
// We assume the rocket length is roughly 150 units, centered.
// Nose is at -X, Tail is at +X.
const ROCKET_RADIUS = 8;
const ROCKET_NOSE_TIP_X = -85; // Start well to the left
const ROCKET_BODY_END_X = 60;  // End to the right
const FIN_RADIUS = 25;
const FIN_X_START = 40;
const FIN_X_END = 60;

// --- 2. 3D COMPONENTS ---

function ZoomerRocket() {
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(), [scene]);

  // Rotate model if necessary to align with X-axis. 
  // If your GLB is already horizontal, you might not need rotation.
  // Assuming standard orientation, we leave it or adjust rotation here:
  return (
    <group ref={ref}>
      <primitive object={clone} />
    </group>
  );
}

/**
 * Generate a single streamline path that flows HORIZONTALLY (X-Axis)
 */
function generateStreamline(
  startRadius: number, 
  angle: number, 
  turbulence: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const steps = 60; // Fewer steps for smoother lines
  const stepSize = 5; // Larger steps to cover more distance
  
  // Convert polar start coordinates (Radius/Angle) to Cartesian Y/Z
  // We start X well in front of the nose
  let x = ROCKET_NOSE_TIP_X - 40; 
  let y = Math.cos(angle) * startRadius;
  let z = Math.sin(angle) * startRadius;
  
  for (let i = 0; i < steps; i++) {
    points.push(new THREE.Vector3(x, y, z));
    
    // --- AXIS SWAP LOGIC ---
    // Primary movement is along X (Left to Right)
    let flowX = stepSize;
    let flowY = 0;
    let flowZ = 0;
    
    // Current Radial Distance from center line (X-axis)
    const radialDist = Math.sqrt(y * y + z * z);
    const radialAngle = Math.atan2(z, y);
    
    // Determine effective radius of the rocket at this X position
    let effectiveRadius = ROCKET_RADIUS;
    
    // 1. Nose Cone Logic (Parabolic shape increasing from tip)
    // If we are past the nose tip but before the main body
    if (x > ROCKET_NOSE_TIP_X && x < (ROCKET_NOSE_TIP_X + 40)) {
      const noseProgress = (x - ROCKET_NOSE_TIP_X) / 40; // 0 to 1
      effectiveRadius = ROCKET_RADIUS * Math.sqrt(Math.max(0, noseProgress));
    }
    
    // 2. Fin Logic (Bulge at the back)
    if (x > FIN_X_START && x < FIN_X_END) {
      const finProgress = (x - FIN_X_START) / (FIN_X_END - FIN_X_START);
      effectiveRadius = ROCKET_RADIUS + (FIN_RADIUS - ROCKET_RADIUS) * finProgress;
    }
    
    // 3. Collision/Deflection Logic
    // If streamline is too close to the body, push it out
    const deflectionZone = effectiveRadius * 1.8; // Influence zone
    
    if (radialDist < deflectionZone && x > ROCKET_NOSE_TIP_X) {
      // Strength: 1.0 if touching surface, 0.0 if at edge of zone
      const deflectionStrength = Math.pow(1 - (radialDist / deflectionZone), 2);
      const pushForce = deflectionStrength * 3.0;
      
      // Push Y and Z outwards based on angle
      flowY += Math.cos(radialAngle) * pushForce;
      flowZ += Math.sin(radialAngle) * pushForce;
      
      // Venturi effect: Speed up X slightly when squeezed
      flowX *= (1 + deflectionStrength * 0.2);
    }
    
    // 4. Turbulence
    const turbulenceAmount = turbulence * 0.5;
    if (x > FIN_X_END) {
        // Wake turbulence is stronger behind the rocket
        flowY += (Math.random() - 0.5) * turbulenceAmount * 2;
        flowZ += (Math.random() - 0.5) * turbulenceAmount * 2;
    } else {
        flowY += (Math.random() - 0.5) * turbulenceAmount * 0.2;
        flowZ += (Math.random() - 0.5) * turbulenceAmount * 0.2;
    }
    
    x += flowX;
    y += flowY;
    z += flowZ;
  }
  
  return points;
}

/**
 * Single animated streamline
 */
function Streamline({ 
  points, 
  color, 
  active, 
  delay 
}: { 
  points: THREE.Vector3[], 
  color: string, 
  active: boolean,
  delay: number 
}) {
  const lineRef = useRef<any>(null);
  const progressRef = useRef(delay);
  
  useFrame((_, delta) => {
    if (!lineRef.current) return;
    
    // Animate dash offset for flowing effect
    progressRef.current += delta * 40; // Speed of flow
    if (progressRef.current > 100) progressRef.current = 0;
    
    lineRef.current.material.dashOffset = -progressRef.current;
    lineRef.current.material.opacity = active ? 0.6 : 0;
  });
  
  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={1.5}
      dashed
      dashScale={3}
      dashSize={4}
      dashOffset={0}
      transparent
      opacity={0}
    />
  );
}

/**
 * CFD Streamlines Field
 */
function CFDStreamlines({ active, profileIdx }: { active: boolean, profileIdx: number }) {
  const config = AERODYNAMICS_CONFIG[profileIdx];
  
  // Generate streamlines in a grid pattern around the rocket
  const streamlines = useMemo(() => {
    const lines: { points: THREE.Vector3[], delay: number }[] = [];
    
    // Create concentric rings of flow
    const rings = [10, 15, 22, 30]; 
    const pointsPerRing = [6, 10, 14, 18];
    
    rings.forEach((radius, ringIdx) => {
      const numPoints = pointsPerRing[ringIdx];
      for (let i = 0; i < numPoints; i++) {
        // Angle around the X-axis
        const angle = (i / numPoints) * Math.PI * 2;
        
        const points = generateStreamline(radius, angle, config.turbulence);
        lines.push({
          points,
          delay: Math.random() * 100 
        });
      }
    });
    
    return lines;
  }, [config.turbulence]);
  
  return (
    <group>
      {streamlines.map((line, idx) => (
        <Streamline
          key={`${profileIdx}-${idx}`}
          points={line.points}
          color={config.color}
          active={active}
          delay={line.delay}
        />
      ))}
    </group>
  );
}

/**
 * Animated flow particles (Dots that fly by)
 */
function FlowParticles({ active, profileIdx }: { active: boolean, profileIdx: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 300;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const config = AERODYNAMICS_CONFIG[profileIdx];

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 25;
      
      // Start randomly along the X axis so they don't all spawn at once
      const startX = (Math.random() * 200) - 100;
      
      return {
        pos: new THREE.Vector3(
          startX,
          Math.cos(angle) * radius,
          Math.sin(angle) * radius
        ),
        speed: Math.random() * 0.8 + 0.8,
        baseRadius: radius,
        angle: angle
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const targetOpacity = active ? 0.8 : 0;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
    mat.color.lerp(new THREE.Color(config.color), 0.05);

    particles.forEach((p, i) => {
      // Move along X axis (positive direction)
      p.pos.x += p.speed * 60 * delta;

      // Reset if passed the tail
      if (p.pos.x > ROCKET_BODY_END_X + 50) {
        p.pos.x = ROCKET_NOSE_TIP_X - 50; // Spawn back at front
        
        // Randomize new position slightly
        p.angle = Math.random() * Math.PI * 2;
        p.baseRadius = 12 + Math.random() * 25;
        p.pos.y = Math.cos(p.angle) * p.baseRadius;
        p.pos.z = Math.sin(p.angle) * p.baseRadius;
      }

      // Deflect around rocket body (Radial Check)
      const radialDist = Math.sqrt(p.pos.y * p.pos.y + p.pos.z * p.pos.z);
      let effectiveRadius = ROCKET_RADIUS * 1.2; // slight buffer
      
      if (p.pos.x > FIN_X_START && p.pos.x < FIN_X_END) {
        effectiveRadius = FIN_RADIUS * 1.1;
      }
      
      // If inside the body, push out
      if (radialDist < effectiveRadius && p.pos.x > ROCKET_NOSE_TIP_X) {
        const pushAngle = Math.atan2(p.pos.z, p.pos.y);
        p.pos.y = Math.cos(pushAngle) * effectiveRadius;
        p.pos.z = Math.sin(pushAngle) * effectiveRadius;
      }

      // Add Turbulence jitter
      p.pos.y += (Math.random() - 0.5) * config.turbulence * 0.3;
      p.pos.z += (Math.random() - 0.5) * config.turbulence * 0.3;

      dummy.position.copy(p.pos);
      dummy.scale.setScalar(0.4); // Smaller particles
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial transparent opacity={0} color={config.color} />
    </instancedMesh>
  );
}

// --- 3. UI COMPONENTS ---

function InstructionOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div 
      onClick={onDismiss}
      className="absolute inset-0 z-[200] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-white/40 group px-4"
    >
       <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
           <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-full h-full bg-white shadow-xl rounded-full flex items-center justify-center border border-neutral-100 group-hover:scale-110 transition-transform duration-300">
                    <Rotate3d className="w-8 h-8 text-neutral-900 animate-[spin_10s_linear_infinite]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-neutral-900 text-white p-2 rounded-full shadow-lg animate-bounce">
                    <Hand className="w-4 h-4" />
                </div>
           </div>
           <h2 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase mb-2 text-center drop-shadow-sm">
               Start Analysis
           </h2>
           <div className="flex items-center gap-4 text-neutral-500 text-[10px] font-bold tracking-widest uppercase bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
               <span>Drag to Rotate</span>
               <div className="w-1 h-1 bg-neutral-300 rounded-full" />
               <span>Test Variations</span>
           </div>
       </div>
    </div>
  );
}

// --- 4. MAIN COMPONENT ---

export default function ZoomerCFDViewer() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cfdEnabled, setCfdEnabled] = useState(true);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(1); 

  const currentConfig = AERODYNAMICS_CONFIG[selectedVariationIdx];

  return (
    <div className="w-full h-[700px] relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 font-sans select-none group">
      
      {/* 1. HEADER & HUD */}
      <div className="absolute top-8 left-8 z-50 transition-all duration-500">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">ZOOMER L2</h1>
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Wind Tunnel Simulation</p>
        
        {/* DRAG COEFFICIENT HUD */}
        <div className="mt-6 bg-white/80 backdrop-blur-md border border-neutral-200 p-4 rounded-xl shadow-sm w-48 animate-in slide-in-from-left-4 fade-in duration-700">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Drag Coefficient ($C_d$)</span>
            <div className="flex items-center gap-2">
                <span className="text-4xl font-mono font-black text-neutral-900 tracking-tighter transition-all duration-300">
                    {currentConfig.cd.toFixed(2)}
                </span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase transition-colors duration-300", 
                    currentConfig.cd < 0.4 ? "bg-emerald-100 text-emerald-600" : 
                    currentConfig.cd > 0.5 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}>
                    {currentConfig.cd < 0.4 ? "Low" : currentConfig.cd > 0.5 ? "High" : "Avg"}
                </span>
            </div>
        </div>
      </div>

      {/* 2. INSTRUCTION OVERLAY */}
      {!hasInteracted && <InstructionOverlay onDismiss={() => setHasInteracted(true)} />}

      {/* 3. TOP RIGHT CONTROLS */}
      <div className="absolute top-8 right-8 z-50 flex flex-col gap-2 items-end">
         <button 
            onClick={() => setCfdEnabled(!cfdEnabled)}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border shadow-sm",
              cfdEnabled ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-neutral-400 border-neutral-200")}
         >
            <Wind className="w-3 h-3" /> Flow Lines {cfdEnabled ? "ON" : "OFF"}
         </button>
      </div>

      {/* 4. VARIATION SELECTOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl p-2 rounded-2xl border border-neutral-200 shadow-2xl flex gap-2">
         {AERODYNAMICS_CONFIG.map((config, idx) => (
             <button
                key={config.id}
                onClick={() => setSelectedVariationIdx(idx)}
                className={cn(
                    "px-4 py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 min-w-[90px]",
                    selectedVariationIdx === idx 
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-lg scale-105" 
                        : "bg-transparent text-neutral-500 border-transparent hover:bg-neutral-100"
                )}
             >
                <span>{config.label}</span>
             </button>
         ))}
      </div>

      {/* 3D SCENE */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 100, 300]} fov={40} />
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center className="text-neutral-400 font-mono text-xs">Loading Model...</Html>}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
          
          <Grid position={[0, -50, 0]} args={[1000, 1000]} cellSize={40} cellThickness={1} cellColor="#e5e5e5" sectionSize={200} sectionThickness={1.5} sectionColor="#d4d4d4" fadeDistance={500} />

          <Center top>
            <ZoomerRocket />
            <CFDStreamlines active={cfdEnabled} profileIdx={selectedVariationIdx} />
            <FlowParticles active={cfdEnabled} profileIdx={selectedVariationIdx} />
          </Center>

          <CameraControls 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.8} 
            minDistance={200} 
            maxDistance={500} 
          />
          <ContactShadows resolution={1024} scale={300} blur={3} opacity={0.2} far={100} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
