import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, Environment, PerspectiveCamera, ContactShadows, Grid } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { 
  Wind, Rocket, Search, Play, Pause, RotateCcw, 
  Maximize, Activity, Gauge, MousePointer2, X 
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

const ANNOTATIONS: Record<string, { title: string, desc: string }> = {
  nose: { title: "Nose Cone", desc: "Von Kármán Geometry for transonic stability." },
  payload: { title: "Avionics Bay", desc: "Dual-deployment altimeters (Stratologger)." },
  fins: { title: "Fin Can", desc: "Fillet-reinforced G10 fiberglass fins." }
};

// --- 2. 3D COMPONENTS ---

/**
 * ROCKET MODEL
 * Loads the SINGLE file.
 */
function ZoomerRocket({ mode, flightTime, rotationSpeed }: { mode: string, flightTime: number, rotationSpeed: number }) {
  // POINTING TO THE SINGLE FILE
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);

  // Clone to protect materials
  const clone = useMemo(() => scene.clone(), [scene]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (mode === "INSPECT") {
      // Hangar: Rotate
      ref.current.rotation.y += rotationSpeed * delta;
      easing.damp3(ref.current.position, [0, 0, 0], 0.5, delta);
      easing.damp3(ref.current.rotation, [0, ref.current.rotation.y, 0], 0.5, delta);
    } else {
      // Flight: Simulate physics movement
      const idx = Math.floor(flightTime);
      const next = Math.min(idx + 1, FLIGHT_PROFILE.length - 1);
      const progress = flightTime - idx;
      
      // Interpolate pitch
      const pitch = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].pitch, FLIGHT_PROFILE[next].pitch, progress) * (Math.PI / 180);
      const vel = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].vel, FLIGHT_PROFILE[next].vel, progress);

      // Apply Tilt
      easing.damp3(ref.current.rotation, [pitch, 0, -pitch * 0.5], 0.2, delta);
      
      // Shake Effect (High Speed = High Shake)
      const shake = Math.sin(state.clock.elapsedTime * 60) * 0.1 * (vel / 200);
      ref.current.position.set(shake, shake, shake);
    }
  });

  return (
    <group ref={ref}>
      <primitive object={clone} />
      {/* Engine Flame (Only in Flight) */}
      <EnginePlume visible={mode === "FLIGHT" && flightTime < 8} />
    </group>
  );
}

/**
 * ENGINE PLUME
 * Adjusted for White Background (Brighter Core, Darker Edges)
 */
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

/**
 * CFD FIELD (NEW LOGIC)
 * Uses physical cylinders that are visible against white.
 * Color shifts: Blue (Slow) -> Red (Fast).
 */
function CFDField({ active, velocity }: { active: boolean, velocity: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 800;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 80, // Tighter cluster around rocket
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 80
      ),
      speed: Math.random() * 0.5 + 0.5,
      angle: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Visibility fade
    const targetOpacity = active ? Math.min(0.8, 0.2 + (velocity / 300)) : 0;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1);

    // Color Physics: Blue (Low Vel) -> Red (High Vel/Max Q)
    const color = new THREE.Color().setHSL(0.6 - (velocity / 600), 0.9, 0.5); 
    mat.color.lerp(color, 0.1);

    particles.forEach((p, i) => {
      // Speed multiplier
      const speedFactor = 1 + (velocity / 20);
      p.pos.y -= p.speed * 40 * delta * speedFactor;

      // Loop particles
      if (p.pos.y < -120) p.pos.y = 120;

      // Aerodynamic Deflection (Wrap around cylinder)
      const r = 10; // Rocket Radius approx
      const dist = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
      
      let x = p.pos.x;
      let z = p.pos.z;

      // If hitting rocket, push out
      if (dist < r) {
        const angle = Math.atan2(z, x);
        x = Math.cos(angle) * r;
        z = Math.sin(angle) * r;
      }

      dummy.position.set(x, p.pos.y, z);
      // Stretch lines based on speed
      dummy.scale.set(0.05, p.speed * (2 + velocity/50), 0.05);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Box Geometry is cheaper to render than Cylinder */}
      <boxGeometry args={[1, 1, 1]} /> 
      <meshStandardMaterial transparent opacity={0} color="#3b82f6" />
    </instancedMesh>
  );
}
// --- 3. UI COMPONENTS ---

function TelemetryCard({ label, value, unit, icon: Icon, color }: any) {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-neutral-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-neutral-100", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">{label}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-neutral-900 leading-none">{value}</span>
            <span className="text-[10px] text-neutral-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. MAIN EXPORT ---

export default function ZoomerCFDViewer() {
  const [mode, setMode] = useState<"INSPECT" | "FLIGHT">("INSPECT");
  const [simState, setSimState] = useState<"IDLE" | "PLAYING" | "PAUSED">("IDLE");
  const [flightTime, setFlightTime] = useState(0);
  const [cfdEnabled, setCfdEnabled] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  const cameraControlsRef = useRef<CameraControls>(null);

  // Camera Logic
  useEffect(() => {
    if (!cameraControlsRef.current) return;
    if (mode === "INSPECT") {
      // Zoomed OUT Hangar View
      cameraControlsRef.current.setLookAt(200, 50, 200, 0, 0, 0, true);
      cameraControlsRef.current.minDistance = 100; // Prevent clipping
      cameraControlsRef.current.maxDistance = 400;
    } else {
      // Cinematic Chase View
      cameraControlsRef.current.setLookAt(-120, -20, 120, 0, 50, 0, true);
    }
  }, [mode]);

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

  // Derived Values
  const idx = Math.floor(flightTime);
  const next = Math.min(idx + 1, FLIGHT_PROFILE.length - 1);
  const progress = flightTime - idx;
  const currentAlt = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].alt, FLIGHT_PROFILE[next].alt, progress);
  const currentVel = THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].vel, FLIGHT_PROFILE[next].vel, progress);
  const currentAccel = (FLIGHT_PROFILE[next].vel - FLIGHT_PROFILE[idx].vel);

  return (
    <div className="w-full h-[700px] relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 font-sans select-none">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-3xl font-black tracking-tighter text-neutral-900">ZOOMER L2</h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", mode === "FLIGHT" ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
            {mode === "FLIGHT" ? "Flight Telemetry" : "Interactive Hangar"}
          </p>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setCfdEnabled(!cfdEnabled)}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              cfdEnabled ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-neutral-400 border-neutral-200")}
          >
            <Wind className="w-3 h-3" /> CFD
          </button>
          <button 
            onClick={() => setActiveAnnotation(activeAnnotation ? null : 'nose')}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              activeAnnotation ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-400 border-neutral-200")}
          >
            <Search className="w-3 h-3" /> X-RAY
          </button>
        </div>
      </div>

      {/* TELEMETRY HUD (Glassmorphism) */}
      <div className={cn("absolute top-32 right-8 w-64 flex flex-col gap-3 transition-all duration-500 z-40 pointer-events-none",
        mode === "FLIGHT" ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
      )}>
        <TelemetryCard label="Altitude" value={currentAlt.toFixed(0)} unit="m" icon={Maximize} color="text-emerald-500" />
        <TelemetryCard label="Velocity" value={currentVel.toFixed(0)} unit="m/s" icon={Activity} color="text-blue-500" />
        <TelemetryCard label="G-Force" value={(1 + currentAccel/9.8).toFixed(1)} unit="G" icon={Gauge} color="text-orange-500" />
      </div>

      {/* ANNOTATION POPUP */}
      {mode === "INSPECT" && activeAnnotation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="absolute top-0 left-24 bg-white/90 backdrop-blur border border-neutral-200 p-5 rounded-xl w-72 shadow-xl animate-in fade-in slide-in-from-left-4">
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-neutral-900">{ANNOTATIONS['nose'].title}</h3>
                <button className="pointer-events-auto" onClick={() => setActiveAnnotation(null)}><X className="w-4 h-4 text-neutral-400 hover:text-neutral-900"/></button>
             </div>
             <p className="text-sm text-neutral-500 leading-relaxed">{ANNOTATIONS['nose'].desc}</p>
          </div>
        </div>
      )}

      {/* CONTROLS (Bottom Bar) */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-50 flex flex-col items-center gap-6 bg-gradient-to-t from-white via-white/80 to-transparent">
        
        {/* Scrubber */}
        <div className="w-full max-w-xl flex items-center gap-4">
          <span className="text-[10px] text-neutral-400 font-bold w-12 text-right">T+{flightTime.toFixed(1)}s</span>
          <div className="relative flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
             <div className="absolute top-0 left-0 h-full bg-neutral-900 transition-all duration-75" style={{ width: `${(flightTime/10)*100}%` }} />
          </div>
          <span className="text-[10px] text-neutral-400 font-bold w-12">T+10s</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 pointer-events-auto bg-white/80 backdrop-blur-xl px-6 py-2 rounded-2xl border border-neutral-200 shadow-xl">
          <button onClick={() => { setSimState("IDLE"); setFlightTime(0); setMode("INSPECT"); }} className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900">
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => {
              if (mode === "INSPECT") { setMode("FLIGHT"); setSimState("PLAYING"); setFlightTime(0); } 
              else { setSimState(s => s === "PLAYING" ? "PAUSED" : "PLAYING"); }
            }}
            className="flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-transform active:scale-95 shadow-lg"
          >
            {simState === "PLAYING" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {mode === "INSPECT" ? "LAUNCH" : (simState === "PLAYING" ? "PAUSE" : "RESUME")}
          </button>

          {mode === "INSPECT" && (
            <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 ml-2">
              <MousePointer2 className="w-4 h-4 text-neutral-400" />
              <input type="range" min="0" max="2" step="0.1" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-20 h-1 bg-neutral-200 rounded-full accent-neutral-900" />
            </div>
          )}
        </div>
      </div>

      {/* 3D CANVAS */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[200, 50, 200]} fov={40} />
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center className="text-neutral-400 font-mono text-xs">Loading Avionics...</Html>}>
          {/* Lighting: Studio Clear */}
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
          
          {/* Floor Grid (Subtle) */}
          <Grid position={[0, -80, 0]} args={[1000, 1000]} cellSize={40} cellThickness={1} cellColor="#e5e5e5" sectionSize={200} sectionThickness={1.5} sectionColor="#d4d4d4" fadeDistance={500} />

          <Center top>
            <ZoomerRocket mode={mode} flightTime={flightTime} rotationSpeed={rotationSpeed} />
            {/* CFD is active if enabled AND (flying OR spinning fast) */}
            <CFDField active={cfdEnabled && (mode === "FLIGHT" || rotationSpeed > 0.8)} velocity={mode === "FLIGHT" ? currentVel : rotationSpeed * 100} />
          </Center>

          <CameraControls ref={cameraControlsRef} />
          {/* Soft Shadows for grounding */}
          <ContactShadows resolution={1024} scale={300} blur={3} opacity={0.2} far={100} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
