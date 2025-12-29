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

// The 4 Aerodynamic Variations
const AERODYNAMICS_CONFIG = [
  { id: 'short', label: 'Short Chord', cd: 0.52, turbulence: 0.8, color: '#ef4444' },   // Red
  { id: 'std',   label: 'Standard',    cd: 0.45, turbulence: 0.5, color: '#f59e0b' },   // Orange
  { id: 'long',  label: 'Long Chord',  cd: 0.38, turbulence: 0.3, color: '#3b82f6' },   // Blue
  { id: 'ext',   label: 'Extended',    cd: 0.32, turbulence: 0.1, color: '#10b981' },   // Green
];

// Rocket body parameters for flow calculation
const ROCKET_RADIUS = 8;
const ROCKET_NOSE_TIP_Y = 90;
const ROCKET_BODY_END_Y = -60;
const FIN_RADIUS = 25;
const FIN_Y_START = -40;
const FIN_Y_END = -60;

// --- 2. 3D COMPONENTS ---

function ZoomerRocket() {
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(), [scene]);

  return (
    <group ref={ref}>
      <primitive object={clone} />
    </group>
  );
}

/**
 * Generate a single streamline path that flows around the rocket
 */
function generateStreamline(
  startX: number, 
  startZ: number, 
  turbulence: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const steps = 80;
  const stepSize = 4;
  
  let x = startX;
  let y = ROCKET_NOSE_TIP_Y + 60; // Start above the nose
  let z = startZ;
  
  for (let i = 0; i < steps; i++) {
    points.push(new THREE.Vector3(x, y, z));
    
    // Calculate distance from rocket centerline
    const radialDist = Math.sqrt(x * x + z * z);
    const angle = Math.atan2(z, x);
    
    // Flow velocity (moves down along Y)
    let flowY = -stepSize;
    let flowX = 0;
    let flowZ = 0;
    
    // Determine effective radius at this Y position
    let effectiveRadius = ROCKET_RADIUS;
    
    // Nose cone region - gradually increase radius
    if (y > ROCKET_BODY_END_Y && y < ROCKET_NOSE_TIP_Y) {
      const noseProgress = (ROCKET_NOSE_TIP_Y - y) / (ROCKET_NOSE_TIP_Y - ROCKET_BODY_END_Y);
      effectiveRadius = ROCKET_RADIUS * Math.sqrt(noseProgress);
    }
    
    // Fin region - expand deflection radius
    if (y < FIN_Y_START && y > FIN_Y_END) {
      const finProgress = (FIN_Y_START - y) / (FIN_Y_START - FIN_Y_END);
      effectiveRadius = ROCKET_RADIUS + (FIN_RADIUS - ROCKET_RADIUS) * finProgress;
    }
    
    // Deflection around body - potential flow around cylinder
    const deflectionZone = effectiveRadius * 2.5;
    if (radialDist < deflectionZone && y < ROCKET_NOSE_TIP_Y && y > ROCKET_BODY_END_Y) {
      // Strength of deflection (stronger when closer)
      const deflectionStrength = 1 - (radialDist / deflectionZone);
      const pushForce = deflectionStrength * 0.8;
      
      // Push outward radially
      flowX += Math.cos(angle) * pushForce * stepSize;
      flowZ += Math.sin(angle) * pushForce * stepSize;
      
      // Accelerate flow around the body (venturi effect)
      flowY *= (1 + deflectionStrength * 0.5);
    }
    
    // Add turbulence
    const turbulenceAmount = turbulence * 0.3;
    flowX += (Math.random() - 0.5) * turbulenceAmount;
    flowZ += (Math.random() - 0.5) * turbulenceAmount;
    
    // Behind fins - wake turbulence
    if (y < FIN_Y_END && radialDist < FIN_RADIUS * 1.5) {
      const wakeTurbulence = turbulence * 1.5;
      flowX += (Math.random() - 0.5) * wakeTurbulence;
      flowZ += (Math.random() - 0.5) * wakeTurbulence;
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
    progressRef.current += delta * 30;
    if (progressRef.current > 100) progressRef.current = 0;
    
    lineRef.current.material.dashOffset = -progressRef.current;
    lineRef.current.material.opacity = active ? 0.7 : 0;
  });
  
  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={1.5}
      dashed
      dashScale={2}
      dashSize={3}
      dashOffset={0}
      transparent
      opacity={0}
    />
  );
}

/**
 * CFD Streamlines Field
 * Creates multiple streamlines that flow around the rocket
 */
function CFDStreamlines({ active, profileIdx }: { active: boolean, profileIdx: number }) {
  const config = AERODYNAMICS_CONFIG[profileIdx];
  
  // Generate streamlines in a grid pattern around the rocket
  const streamlines = useMemo(() => {
    const lines: { points: THREE.Vector3[], delay: number }[] = [];
    
    // Create streamlines in concentric rings
    const rings = [12, 18, 25, 35]; // Different radii
    const pointsPerRing = [8, 12, 16, 20];
    
    rings.forEach((radius, ringIdx) => {
      const numPoints = pointsPerRing[ringIdx];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const points = generateStreamline(x, z, config.turbulence);
        lines.push({
          points,
          delay: Math.random() * 100 // Random phase for animation
        });
      }
    });
    
    return lines;
  }, [config.turbulence]);
  
  // Interpolate color based on profile
  const lineColor = useMemo(() => config.color, [config.color]);
  
  return (
    <group>
      {streamlines.map((line, idx) => (
        <Streamline
          key={`${profileIdx}-${idx}`}
          points={line.points}
          color={lineColor}
          active={active}
          delay={line.delay}
        />
      ))}
    </group>
  );
}

/**
 * Animated flow particles along streamlines for extra visual effect
 */
function FlowParticles({ active, profileIdx }: { active: boolean, profileIdx: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 400;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const config = AERODYNAMICS_CONFIG[profileIdx];

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 30;
      return {
        pos: new THREE.Vector3(
          Math.cos(angle) * radius,
          ROCKET_NOSE_TIP_Y + 60 - Math.random() * 200,
          Math.sin(angle) * radius
        ),
        speed: Math.random() * 0.5 + 0.5,
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
      const speedMultiplier = 1 + (1 - config.turbulence) * 2;
      p.pos.y -= p.speed * 50 * delta * speedMultiplier;

      if (p.pos.y < ROCKET_BODY_END_Y - 40) {
        p.pos.y = ROCKET_NOSE_TIP_Y + 60;
        p.angle = Math.random() * Math.PI * 2;
        p.baseRadius = 10 + Math.random() * 30;
        p.pos.x = Math.cos(p.angle) * p.baseRadius;
        p.pos.z = Math.sin(p.angle) * p.baseRadius;
      }

      // Deflect around rocket body
      const radialDist = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
      let effectiveRadius = ROCKET_RADIUS * 1.5;
      
      if (p.pos.y < FIN_Y_START && p.pos.y > FIN_Y_END) {
        effectiveRadius = FIN_RADIUS * 1.2;
      }
      
      if (radialDist < effectiveRadius) {
        const pushAngle = Math.atan2(p.pos.z, p.pos.x);
        p.pos.x = Math.cos(pushAngle) * effectiveRadius;
        p.pos.z = Math.sin(pushAngle) * effectiveRadius;
      }

      // Turbulence
      p.pos.x += (Math.random() - 0.5) * config.turbulence * 0.5;
      p.pos.z += (Math.random() - 0.5) * config.turbulence * 0.5;

      dummy.position.copy(p.pos);
      dummy.scale.setScalar(0.5);
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
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(1); // Default to 'Standard'

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

      {/* 4. VARIATION SELECTOR (Prominent at Bottom) */}
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
        {/* Adjusted Camera: Positioned further away (700, 700, 250) */}
        <PerspectiveCamera makeDefault position={[700, 700, 250]} fov={35} />
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center className="text-neutral-400 font-mono text-xs">Loading Model...</Html>}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
          
          <Grid position={[0, -80, 0]} args={[1000, 1000]} cellSize={40} cellThickness={1} cellColor="#e5e5e5" sectionSize={200} sectionThickness={1.5} sectionColor="#d4d4d4" fadeDistance={500} />

          <Center top>
            <ZoomerRocket />
            <CFDStreamlines active={cfdEnabled} profileIdx={selectedVariationIdx} />
            <FlowParticles active={cfdEnabled} profileIdx={selectedVariationIdx} />
          </Center>

          {/* Camera Controls 
             - NO Auto Rotate
             - Max Distance Increased to 1500 to allow the 700+ camera position 
          */}
          <CameraControls 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.8} 
            minDistance={1000} 
            maxDistance={1200} 
          />
          <ContactShadows resolution={1024} scale={300} blur={3} opacity={0.2} far={100} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
