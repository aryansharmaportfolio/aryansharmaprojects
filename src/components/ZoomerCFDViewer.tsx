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

// --- 2. 3D COMPONENTS ---

function ZoomerRocket() {
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(), [scene]);

  // Ensure rocket is pointing along Positive X axis
  return (
    <group ref={ref}>
      <primitive object={clone} />
    </group>
  );
}

/**
 * GENERATOR: We calculate "Vertical" flow (falling down Y) 
 * because the math is easier, then we simply ROTATE the group 90 degrees later.
 */
function generateStreamline(
  startX: number, 
  startZ: number, 
  turbulence: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const steps = 60;
  const stepSize = 5;
  
  // Start "above" (will become "left of" after rotation)
  let x = startX;
  let y = 100; 
  let z = startZ;
  
  for (let i = 0; i < steps; i++) {
    points.push(new THREE.Vector3(x, y, z));
    
    // Flow moves "Down" Y (which we will rotate to be X)
    let flowX = 0;
    let flowY = -stepSize;
    let flowZ = 0;
    
    // Radial distance from center (simulated cylinder)
    const radialDist = Math.sqrt(x * x + z * z);
    const angle = Math.atan2(z, x);
    
    // Basic Collision: If close to center (radius < 10), push out
    if (radialDist < 12 && y < 80 && y > -80) {
      const pushFactor = (12 - radialDist) * 0.5;
      flowX += Math.cos(angle) * pushFactor;
      flowZ += Math.sin(angle) * pushFactor;
    }
    
    // Turbulence
    const tScale = turbulence * 0.5;
    flowX += (Math.random() - 0.5) * tScale;
    flowZ += (Math.random() - 0.5) * tScale;
    
    x += flowX;
    y += flowY;
    z += flowZ;
  }
  return points;
}

function Streamline({ points, color, active, delay }: any) {
  const lineRef = useRef<any>(null);
  const progressRef = useRef(delay);
  
  useFrame((_, delta) => {
    if (!lineRef.current) return;
    progressRef.current += delta * 40;
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

function CFDStreamlines({ active, profileIdx }: { active: boolean, profileIdx: number }) {
  const config = AERODYNAMICS_CONFIG[profileIdx];
  const streamlines = useMemo(() => {
    const lines: any[] = [];
    const rings = [15, 25, 35]; // Radii
    rings.forEach((r) => {
      const count = Math.floor(r * 0.8);
      for(let i=0; i<count; i++) {
        const angle = (i/count) * Math.PI * 2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        lines.push({ 
           points: generateStreamline(x, z, config.turbulence),
           delay: Math.random() * 100
        });
      }
    });
    return lines;
  }, [config.turbulence]);
  
  return (
    <group>
      {streamlines.map((l, i) => (
        <Streamline key={i} {...l} color={config.color} active={active} />
      ))}
    </group>
  );
}

function FlowParticles({ active, profileIdx }: { active: boolean, profileIdx: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 200;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const config = AERODYNAMICS_CONFIG[profileIdx];

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
       pos: new THREE.Vector3(
         (Math.random()-0.5) * 50, // spread X
         100 + Math.random() * 100, // start high Y
         (Math.random()-0.5) * 50  // spread Z
       ),
       speed: 1 + Math.random(),
       angle: Math.random() * Math.PI * 2,
       radius: 15 + Math.random() * 20
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, active ? 0.8 : 0, 0.1);
    mat.color.lerp(new THREE.Color(config.color), 0.05);

    particles.forEach((p, i) => {
      // Move "Down" Y
      p.pos.y -= p.speed * 60 * delta;
      
      // Reset
      if (p.pos.y < -100) {
        p.pos.y = 100;
        // Randomize cylinder position
        p.angle = Math.random() * Math.PI * 2;
        p.pos.x = Math.cos(p.angle) * p.radius;
        p.pos.z = Math.sin(p.angle) * p.radius;
      }
      
      // Update Instance
      dummy.position.copy(p.pos);
      dummy.scale.setScalar(0.4);
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

// --- UI COMPONENTS ---

function InstructionOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div onClick={onDismiss} className="absolute inset-0 z-[200] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-white/40 group px-4">
       <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
           <h2 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase mb-2 text-center drop-shadow-sm">Start Analysis</h2>
           <div className="flex items-center gap-4 text-neutral-500 text-[10px] font-bold tracking-widest uppercase bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
               <span>Click to Start</span>
           </div>
       </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function ZoomerCFDViewer() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cfdEnabled, setCfdEnabled] = useState(true);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(1); 
  const currentConfig = AERODYNAMICS_CONFIG[selectedVariationIdx];

  return (
    <div className="w-full h-[700px] relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 font-sans select-none group">
      
      {/* HEADER HUD */}
      <div className="absolute top-8 left-8 z-50">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">ZOOMER L2</h1>
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Wind Tunnel Simulation</p>
        <div className="mt-6 bg-white/80 backdrop-blur-md border border-neutral-200 p-4 rounded-xl shadow-sm w-48">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Drag Coefficient ($C_d$)</span>
            <div className="flex items-center gap-2">
                <span className="text-4xl font-mono font-black text-neutral-900 tracking-tighter">{currentConfig.cd.toFixed(2)}</span>
            </div>
        </div>
      </div>

      {!hasInteracted && <InstructionOverlay onDismiss={() => setHasInteracted(true)} />}

      <div className="absolute top-8 right-8 z-50">
         <button onClick={() => setCfdEnabled(!cfdEnabled)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border shadow-sm", cfdEnabled ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-neutral-400 border-neutral-200")}>
            <Wind className="w-3 h-3" /> Flow {cfdEnabled ? "ON" : "OFF"}
         </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl p-2 rounded-2xl border border-neutral-200 shadow-2xl flex gap-2">
         {AERODYNAMICS_CONFIG.map((config, idx) => (
             <button key={config.id} onClick={() => setSelectedVariationIdx(idx)} className={cn("px-4 py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 min-w-[90px]", selectedVariationIdx === idx ? "bg-neutral-900 text-white border-neutral-900 shadow-lg scale-105" : "bg-transparent text-neutral-500 border-transparent hover:bg-neutral-100")}>
                <span>{config.label}</span>
             </button>
         ))}
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 80, 250]} fov={40} />
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
          <Grid position={[0, -50, 0]} args={[1000, 1000]} cellSize={40} fadeDistance={500} />

          {/* === THE FIX: SINGLE GROUP FOR ALIGNMENT === */}
          <Center top>
            <group>
                {/* 1. THE ROCKET */}
                <ZoomerRocket />

                {/* 2. THE FLOW - ROTATED 90 DEGREES */}
                {/* We rotate -90 deg on Z to turn "Falling Down" into "Flowing Right" */}
                {/* We offset X by -85 to start at the Nose Tip */}
                <group rotation={[0, 0, -Math.PI / 2]} position={[-85, 0, 0]}>
                    <CFDStreamlines active={cfdEnabled} profileIdx={selectedVariationIdx} />
                    <FlowParticles active={cfdEnabled} profileIdx={selectedVariationIdx} />
                </group>
            </group>
          </Center>

          <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} minDistance={100} maxDistance={500} />
          <ContactShadows resolution={1024} scale={300} blur={3} opacity={0.2} far={100} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
