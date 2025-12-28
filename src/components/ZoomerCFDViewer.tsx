import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, Environment, PerspectiveCamera, ContactShadows, Grid } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { 
  Wind, Rocket, Search, Play, Pause, RotateCcw, 
  Maximize, Activity, Gauge, MousePointer2, X,
  ChevronRight, ChevronDown, CornerUpLeft, Hand, Rotate3d,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils"; 

// --- 1. CONFIGURATION ---

const FLIGHT_PROFILE = [
  { t: 0, alt: 0, vel: 0, pitch: 0 },
  { t: 1, alt: 10, vel: 20, pitch: 0 },
  { t: 2, alt: 40, vel: 45, pitch: 1 },
  { t: 3, alt: 100, vel: 80, pitch: 2 },
  { t: 4, alt: 200, vel: 120, pitch: 5 }, // Max Q
  { t: 5, alt: 350, vel: 160, pitch: 8 },
  { t: 6, alt: 550, vel: 190, pitch: 12 },
  { t: 7, alt: 800, vel: 210, pitch: 15 },
  { t: 8, alt: 1100, vel: 180, pitch: 18 },
  { t: 9, alt: 1350, vel: 120, pitch: 20 },
  { t: 10, alt: 1500, vel: 50, pitch: 22 },
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

const SPEC_DATA: Record<string, { label: string, value: string }[]> = {
  nose: [{ label: "Material", value: "Fiberglass" }, { label: "Shape", value: "Von Kármán" }],
  payload: [{ label: "Computers", value: "2x Stratologger" }, { label: "Recovery", value: "Dual Deploy" }],
  fins: [{ label: "Span", value: "14 inches" }, { label: "Material", value: "G10/Carbon" }]
};

// --- 2. 3D COMPONENTS ---

function ZoomerRocket({ mode, flightTime, rotationSpeed }: { mode: string, flightTime: number, rotationSpeed: number }) {
  // LOAD SINGLE FILE
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (mode === "INSPECT") {
      // Hangar: Rotate
      ref.current.rotation.y += rotationSpeed * delta;
      easing.damp3(ref.current.position, [0, 0, 0], 0.5, delta);
      easing.damp3(ref.current.rotation, [0, ref.current.rotation.y, 0], 0.5, delta);
    } else {
      // Flight: Physics Sim
      const idx = Math.floor(flightTime);
      const next = Math.min(idx + 1, FLIGHT_PROFILE.length - 1);
      const progress = flightTime - idx;
      
      const pitch = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].pitch, FLIGHT_PROFILE[next].pitch, progress) * (Math.PI / 180);
      const vel = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].vel, FLIGHT_PROFILE[next].vel, progress);

      easing.damp3(ref.current.rotation, [pitch, 0, -pitch * 0.5], 0.2, delta);
      const shake = Math.sin(state.clock.elapsedTime * 60) * 0.1 * (vel / 200);
      ref.current.position.set(shake, shake, shake);
    }
  });

  return (
    <group ref={ref}>
      <primitive object={clone} />
      {/* Engine Flame */}
      <EnginePlume visible={mode === "FLIGHT" && flightTime < 8} />
    </group>
  );
}

function EnginePlume({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current || !visible) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 25) * 0.15;
    ref.current.scale.set(s, s * 2, s);
  });
  if (!visible) return null;
  return (
    <mesh ref={ref} position={[0, -50, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[3, 40, 16, 1, true]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
    </mesh>
  );
}

function CFDField({ active, velocity }: { active: boolean, velocity: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 800;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 80),
      speed: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // VISIBILITY FIX: Use dark/bold colors for white background
    const targetOpacity = active ? Math.min(0.6, 0.2 + (velocity / 300)) : 0;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);
    
    // Color: Blue -> Red (Max Q)
    const color = new THREE.Color().setHSL(0.6 - (velocity / 600), 0.9, 0.4); 
    mat.color.lerp(color, 0.1);

    particles.forEach((p, i) => {
      const speedFactor = 1 + (velocity / 20);
      p.pos.y -= p.speed * 40 * delta * speedFactor;
      if (p.pos.y < -120) p.pos.y = 120;

      const r = 10;
      const dist = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
      let x = p.pos.x; let z = p.pos.z;

      if (dist < r) {
        const angle = Math.atan2(z, x);
        x = Math.cos(angle) * r; z = Math.sin(angle) * r;
      }

      dummy.position.set(x, p.pos.y, z);
      dummy.scale.set(0.05, p.speed * (2 + velocity/50), 0.05);
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
// --- 3. UI COMPONENTS (FALCON STYLE) ---

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
               Tap to Explore
           </h2>
           <div className="flex items-center gap-4 text-neutral-500 text-[10px] font-bold tracking-widest uppercase bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
               <span>Drag to Rotate</span>
               <div className="w-1 h-1 bg-neutral-300 rounded-full" />
               <span>Pinch to Zoom</span>
           </div>
       </div>
    </div>
  );
}

function DetailSidebar({ zoneKey, onClose }: { zoneKey: string, onClose: () => void }) {
  const data = ZOOM_ZONES[zoneKey];
  const specs = SPEC_DATA[zoneKey];
  if (!data || zoneKey === 'overview') return null;

  return (
    <div className="absolute top-0 left-0 h-full w-full md:w-[400px] bg-white/95 backdrop-blur-xl z-50 shadow-2xl transition-transform duration-500 border-r border-neutral-200 flex flex-col animate-in slide-in-from-left">
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
          
          {specs && (
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Specifications</h3>
               <div className="grid grid-cols-2 gap-3">
                  {specs.map((s, i) => (
                    <div key={i} className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                       <div className="text-[9px] font-bold text-neutral-400 uppercase">{s.label}</div>
                       <div className="text-sm font-mono font-bold text-neutral-900">{s.value}</div>
                    </div>
                  ))}
               </div>
            </div>
          )}
       </div>
    </div>
  );
}

// --- 4. MAIN EXPORT ---

export default function ZoomerCFDViewer() {
  const [mode, setMode] = useState<"INSPECT" | "FLIGHT">("INSPECT");
  const [currentZone, setCurrentZone] = useState("overview");
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Flight Sim State
  const [simState, setSimState] = useState<"IDLE" | "PLAYING" | "PAUSED">("IDLE");
  const [flightTime, setFlightTime] = useState(0);
  const [cfdEnabled, setCfdEnabled] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  const cameraControlsRef = useRef<CameraControls>(null);

  // Camera Logic
  useEffect(() => {
    if (!cameraControlsRef.current) return;
    
    if (mode === "INSPECT") {
      const target = ZOOM_ZONES[currentZone];
      if (target) {
        cameraControlsRef.current.setLookAt(...target.pos, ...target.look, true);
      }
    } else {
      // Chase Camera for Flight
      cameraControlsRef.current.setLookAt(-120, -20, 120, 0, 50, 0, true);
    }
  }, [mode, currentZone]);

  // Physics Loop
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      if (simState === "PLAYING") {
        setFlightTime(prev => prev >= 10 ? 10 : prev + delta * 0.5);
      }
      frameId = requestAnimationFrame(loop);
    };
    if (simState === "PLAYING") frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [simState]);

  // Derived Telemetry
  const idx = Math.floor(flightTime);
  const next = Math.min(idx + 1, FLIGHT_PROFILE.length - 1);
  const progress = flightTime - idx;
  const currentAlt = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].alt, FLIGHT_PROFILE[next].alt, progress);
  const currentVel = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].vel, FLIGHT_PROFILE[next].vel, progress);

  return (
    <div className="w-full h-[700px] relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 font-sans select-none group">
      
      {/* 1. HEADER */}
      <div className={`absolute top-8 left-8 z-50 transition-all duration-500 ${currentZone === 'overview' ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">ZOOMER L2</h1>
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>

      {/* 2. INSTRUCTION OVERLAY */}
      {!hasInteracted && <InstructionOverlay onDismiss={() => setHasInteracted(true)} />}

      {/* 3. SIDEBAR */}
      <DetailSidebar zoneKey={currentZone} onClose={() => setCurrentZone('overview')} />

      {/* 4. RIGHT SIDE CONTROLS (ZOOM BUTTONS) */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 transition-all duration-500 ${currentZone === 'overview' && mode === 'INSPECT' ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
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

      {/* 5. MODE TOGGLE (Flight vs Inspect) */}
      <div className="absolute top-8 right-8 z-50 flex flex-col gap-2 items-end">
         <button 
            onClick={() => {
               const newMode = mode === "INSPECT" ? "FLIGHT" : "INSPECT";
               setMode(newMode);
               setCurrentZone("overview");
               if(newMode === "INSPECT") { setSimState("IDLE"); setFlightTime(0); }
            }}
            className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase shadow-lg transition-all",
               mode === "FLIGHT" ? "bg-red-500 text-white" : "bg-neutral-900 text-white"
            )}
         >
            {mode === "INSPECT" ? <Rocket className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
            {mode === "INSPECT" ? "Launch Flight Sim" : "Return to Hangar"}
         </button>
         
         <button 
            onClick={() => setCfdEnabled(!cfdEnabled)}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border",
              cfdEnabled ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-neutral-400 border-neutral-200")}
         >
            <Wind className="w-3 h-3" /> CFD {cfdEnabled ? "ON" : "OFF"}
         </button>
      </div>

      {/* 6. FLIGHT HUD (Only in Flight Mode) */}
      <div className={cn("absolute bottom-8 left-8 z-40 transition-all duration-500", mode === "FLIGHT" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none")}>
         <div className="flex gap-4">
            <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-neutral-100">
               <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Altitude</div>
               <div className="text-2xl font-mono font-bold text-neutral-900">{currentAlt.toFixed(0)} <span className="text-sm text-neutral-400">m</span></div>
            </div>
            <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-neutral-100">
               <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Velocity</div>
               <div className="text-2xl font-mono font-bold text-neutral-900">{currentVel.toFixed(0)} <span className="text-sm text-neutral-400">m/s</span></div>
            </div>
            {/* Flight Controls */}
            <div className="flex items-center gap-2 bg-neutral-900 text-white p-2 rounded-xl shadow-xl">
               <button onClick={() => { setSimState("IDLE"); setFlightTime(0); }} className="p-2 hover:bg-neutral-800 rounded-lg"><RotateCcw className="w-5 h-5"/></button>
               <button onClick={() => setSimState(s => s === "PLAYING" ? "PAUSED" : "PLAYING")} className="p-2 hover:bg-neutral-800 rounded-lg">
                  {simState === "PLAYING" ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
               </button>
            </div>
         </div>
      </div>

      {/* 7. ROTATION SLIDER (Inspect Mode Only) */}
      <div className={cn("absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-64 bg-white/90 backdrop-blur px-4 py-3 rounded-full shadow-lg border border-neutral-100 transition-all duration-500", 
         mode === "INSPECT" && currentZone === "overview" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none")}>
         <div className="flex items-center gap-3">
            <MousePointer2 className="w-4 h-4 text-neutral-400" />
            <input 
               type="range" min="0" max="2" step="0.1" 
               value={rotationSpeed} 
               onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} 
               className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
         </div>
      </div>

      {/* 3D SCENE */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[200, 50, 200]} fov={40} />
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center className="text-neutral-400 font-mono text-xs">Loading Avionics...</Html>}>
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
          
          <Grid position={[0, -80, 0]} args={[1000, 1000]} cellSize={40} cellThickness={1} cellColor="#e5e5e5" sectionSize={200} sectionThickness={1.5} sectionColor="#d4d4d4" fadeDistance={500} />

          <Center top>
            <ZoomerRocket mode={mode} flightTime={flightTime} rotationSpeed={rotationSpeed} />
            {/* CFD is active if enabled AND (flying OR spinning fast) */}
            <CFDField active={cfdEnabled && (mode === "FLIGHT" || rotationSpeed > 0.8)} velocity={mode === "FLIGHT" ? currentVel : rotationSpeed * 100} />
          </Center>

          <CameraControls ref={cameraControlsRef} />
          <ContactShadows resolution={1024} scale={300} blur={3} opacity={0.2} far={100} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
