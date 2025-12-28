import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, Environment, PerspectiveCamera, ContactShadows, Grid } from "@react-three/drei";
import * as THREE from "three";
import { 
  Wind, 
  Search, 
  MousePointer2, 
  X,
  ChevronRight, 
  CornerUpLeft, 
  Hand, 
  Rotate3d,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils"; 

// --- 1. CONFIGURATION ---

// The 4 Root Chord Variations
const AERODYNAMICS_CONFIG = [
  { id: 'short', label: 'Short Chord', cd: 0.52, turbulence: 0.8, color: '#ef4444' },   // Red (High Drag)
  { id: 'std',   label: 'Standard',    cd: 0.45, turbulence: 0.5, color: '#f59e0b' },   // Orange
  { id: 'long',  label: 'Long Chord',  cd: 0.38, turbulence: 0.3, color: '#3b82f6' },   // Blue
  { id: 'ext',   label: 'Extended',    cd: 0.32, turbulence: 0.1, color: '#10b981' },   // Green (Low Drag)
];

const ZOOM_ZONES: Record<string, { pos: [number, number, number], look: [number, number, number], title: string, desc: string }> = {
  overview: { pos: [200, 50, 200], look: [0, 20, 0], title: "Overview", desc: "Full Vehicle Stack" },
  nose: { 
    pos: [50, 80, 50], look: [0, 60, 0], 
    title: "Nose Cone", 
    desc: "Von Kármán geometry designed for transonic stability. Houses the main parachute deployment system and GPS tracker." 
  },
  payload: { 
    pos: [50, 40, 50], look: [0, 30, 0], 
    title: "Avionics Bay", 
    desc: "Contains dual Stratologger flight computers for redundant recovery deployment. Structural backbone of the vehicle." 
  },
  fins: { 
    pos: [60, -40, 60], look: [0, -40, 0], 
    title: "Fin Can", 
    desc: "High-strength G10 fiberglass fins with through-the-wall mounting for maximum aerodynamic load handling." 
  }
};

// --- 2. 3D COMPONENTS ---

function ZoomerRocket() {
  // LOAD SINGLE FILE
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);
  // Clone to protect materials
  const clone = useMemo(() => scene.clone(), [scene]);

  return (
    <group ref={ref}>
      <primitive object={clone} />
    </group>
  );
}

/**
 * WIND TUNNEL LINES (The "Fancy Lines")
 * Adapts based on the selected Aerodynamic Profile
 */
function WindTunnelField({ active, profileIdx }: { active: boolean, profileIdx: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 600;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const config = AERODYNAMICS_CONFIG[profileIdx];

  // Initialize Particles
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 60,  // Tighter X spread
        (Math.random() - 0.5) * 200, // Y spread (Height)
        (Math.random() - 0.5) * 60   // Z spread
      ),
      speed: Math.random() * 0.5 + 0.5,
      offset: Math.random() * 100
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    
    // 1. Fade In/Out based on "active"
    const targetOpacity = active ? 0.6 : 0;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
    
    // 2. Color Transition based on Profile (Red -> Green)
    mat.color.lerp(new THREE.Color(config.color), 0.05);

    particles.forEach((p, i) => {
      // 3. Movement Logic
      // "Better" aerodynamics (low turbulence) = Faster, smoother lines
      const speedMultiplier = 1 + (1 - config.turbulence) * 2; 
      
      p.pos.y -= p.speed * 60 * delta * speedMultiplier; // Move Down

      // Reset when hitting bottom
      if (p.pos.y < -100) p.pos.y = 150;

      // 4. "Fake" Deflection (Go around the rocket)
      const r = 12; // Rocket Radius
      const dist = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
      
      let x = p.pos.x;
      let z = p.pos.z;

      // If particle is inside the rocket radius, push it out
      if (dist < r) {
        // Add "Turbulence" jitter if aerodynamics are bad
        const jitter = (Math.random() - 0.5) * config.turbulence * 2;
        
        const angle = Math.atan2(z, x);
        x = Math.cos(angle + jitter) * r;
        z = Math.sin(angle + jitter) * r;
      }

      dummy.position.set(x, p.pos.y, z);
      
      // Stretch lines based on speed
      const stretch = 0.5 + (1 - config.turbulence) * 2; 
      dummy.scale.set(0.05, stretch, 0.05);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} /> 
      <meshStandardMaterial transparent opacity={0} color="#3b82f6" />
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

function DetailSidebar({ zoneKey, onClose }: { zoneKey: string, onClose: () => void }) {
  const data = ZOOM_ZONES[zoneKey];
  if (!data || zoneKey === 'overview') return null;

  return (
    <div className="absolute top-0 left-0 h-full w-full md:w-[350px] bg-white/95 backdrop-blur-xl z-50 shadow-2xl transition-transform duration-500 border-r border-neutral-200 flex flex-col animate-in slide-in-from-left">
       <div className="p-6 pb-4 border-b border-neutral-100 bg-white/50">
          <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-xs font-bold uppercase tracking-wide mb-4 transition-colors">
             <CornerUpLeft className="w-3 h-3" /> Return to Overview
          </button>
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-3xl font-black text-neutral-900 tracking-tighter">{data.title}</h2>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Component Analysis</span>
             </div>
             <button onClick={onClose}><X className="w-5 h-5 text-neutral-400 hover:text-neutral-900" /></button>
          </div>
       </div>
       
       <div className="p-6 overflow-y-auto">
          <p className="text-sm text-neutral-600 leading-relaxed mb-8 border-l-2 border-blue-500 pl-4">
             {data.desc}
          </p>
       </div>
    </div>
  );
}

// --- 4. MAIN EXPORT ---

export default function ZoomerCFDViewer() {
  const [currentZone, setCurrentZone] = useState("overview");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cfdEnabled, setCfdEnabled] = useState(true);
  
  // New State: Variation Selection
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(1); // Default to 'Standard'

  const cameraControlsRef = useRef<CameraControls>(null);

  // Camera Logic
  useEffect(() => {
    if (!cameraControlsRef.current) return;
    const target = ZOOM_ZONES[currentZone];
    if (target) {
      cameraControlsRef.current.setLookAt(...target.pos, ...target.look, true);
    }
  }, [currentZone]);

  const currentConfig = AERODYNAMICS_CONFIG[selectedVariationIdx];

  return (
    <div className="w-full h-[700px] relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 font-sans select-none group">
      
      {/* 1. HEADER & HUD */}
      <div className={`absolute top-8 left-8 z-50 transition-all duration-500 ${currentZone === 'overview' ? 'opacity-100' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">ZOOMER L2</h1>
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Wind Tunnel Simulation</p>
        
        {/* DRAG COEFFICIENT COUNTER */}
        <div className="mt-6 bg-white/80 backdrop-blur-md border border-neutral-200 p-4 rounded-xl shadow-sm w-48 animate-in slide-in-from-left-4 fade-in duration-700">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Drag Coefficient ($C_d$)</span>
            <div className="flex items-center gap-2">
                <span className="text-4xl font-mono font-black text-neutral-900 tracking-tighter">
                    {currentConfig.cd.toFixed(2)}
                </span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase", 
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

      {/* 3. SIDEBAR */}
      <DetailSidebar zoneKey={currentZone} onClose={() => setCurrentZone('overview')} />

      {/* 4. RIGHT SIDE CONTROLS (ZOOM BUTTONS) */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 transition-all duration-500 ${currentZone === 'overview' ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
         {Object.keys(ZOOM_ZONES).map((zone) => (
            zone !== 'overview' && (
              <button
                key={zone}
                onClick={() => setCurrentZone(zone)}
                className="text-right text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-md bg-white/80 text-neutral-400 hover:text-neutral-900 border border-transparent hover:border-neutral-100 shadow-sm transition-all hover:scale-105"
              >
                {ZOOM_ZONES[zone].title}
              </button>
            )
         ))}
      </div>

      {/* 5. TOP RIGHT CONTROLS */}
      <div className="absolute top-8 right-8 z-50 flex flex-col gap-2 items-end">
         <button 
            onClick={() => setCfdEnabled(!cfdEnabled)}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border shadow-sm",
              cfdEnabled ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-neutral-400 border-neutral-200")}
         >
            <Wind className="w-3 h-3" /> Flow Lines {cfdEnabled ? "ON" : "OFF"}
         </button>
      </div>

      {/* 6. BOTTOM CONTROL BAR (VARIATIONS) */}
      <div className={cn("absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-2 py-2 rounded-2xl border border-neutral-200 shadow-xl transition-all duration-500 flex gap-2", 
         currentZone === "overview" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none")}>
         
         {AERODYNAMICS_CONFIG.map((config, idx) => (
             <button
                key={config.id}
                onClick={() => setSelectedVariationIdx(idx)}
                className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 min-w-[80px]",
                    selectedVariationIdx === idx 
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-md scale-105" 
                        : "bg-transparent text-neutral-500 border-transparent hover:bg-neutral-100"
                )}
             >
                <span>{config.label}</span>
             </button>
         ))}
      </div>

      {/* 3D SCENE */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[200, 50, 200]} fov={40} />
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center className="text-neutral-400 font-mono text-xs">Loading Model...</Html>}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
          
          <Grid position={[0, -80, 0]} args={[1000, 1000]} cellSize={40} cellThickness={1} cellColor="#e5e5e5" sectionSize={200} sectionThickness={1.5} sectionColor="#d4d4d4" fadeDistance={500} />

          <Center top>
            <ZoomerRocket />
            <WindTunnelField active={cfdEnabled} profileIdx={selectedVariationIdx} />
          </Center>

          {/* Camera Controls - NO AUTO ROTATE */}
          <CameraControls ref={cameraControlsRef} minDistance={50} maxDistance={400} />
          <ContactShadows resolution={1024} scale={300} blur={3} opacity={0.2} far={100} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
