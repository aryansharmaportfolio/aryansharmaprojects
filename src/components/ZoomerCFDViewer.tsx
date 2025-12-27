import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, Environment, PerspectiveCamera, Stars, Grid } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { 
  Wind, 
  Rocket, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  MousePointer2,
  Gauge,
  Activity,
  ChevronRight,
  Layers,
  X
} from "lucide-react";
import { cn } from "@/lib/utils"; 

// --- 1. CONSTANTS & MOCK TELEMETRY DATA ---

// This mimics a real flight profile: [Time, Altitude(m), Velocity(m/s), Pitch(deg)]
const FLIGHT_PROFILE = [
  { t: 0, alt: 0, vel: 0, pitch: 0 },
  { t: 1, alt: 10, vel: 20, pitch: 0 },
  { t: 2, alt: 40, vel: 45, pitch: 1 },
  { t: 3, alt: 100, vel: 80, pitch: 2 },
  { t: 4, alt: 200, vel: 120, pitch: 5 }, // Max Q region
  { t: 5, alt: 350, vel: 160, pitch: 8 },
  { t: 6, alt: 550, vel: 190, pitch: 12 },
  { t: 7, alt: 800, vel: 210, pitch: 15 },
  { t: 8, alt: 1100, vel: 180, pitch: 18 }, // Coast phase starts
  { t: 9, alt: 1350, vel: 120, pitch: 20 },
  { t: 10, alt: 1500, vel: 50, pitch: 22 }, // Apogee nearing
];

const ANNOTATIONS: Record<string, { pos: [number, number, number], title: string, desc: string }> = {
  nose: { pos: [0, 55, 0], title: "Nose Cone", desc: "Von Kármán Geometry" },
  payload: { pos: [0, 35, 0], title: "Payload Bay", desc: "Dual-Deploy Avionics" },
  fins: { pos: [0, -35, 0], title: "Fin Can", desc: "Carbon Fiber Reinforcement" }
};

// --- 2. TYPES ---

type ViewMode = "INSPECT" | "FLIGHT";
type SimulationState = "IDLE" | "PLAYING" | "PAUSED" | "COMPLETED";

// --- 3. SUB-COMPONENTS ---

/**
 * THE ROCKET MODEL
 * Handles loading, textures, and physical orientation based on mode.
 */
function ZoomerRocket({ mode, flightTime, rotationSpeed }: { mode: ViewMode, flightTime: number, rotationSpeed: number }) {
  // IMPORTANT: This path must match your file exactly!
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);

  // Clone scene to isolate materials
  const clone = useMemo(() => {
    const c = scene.clone();
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (mode === "INSPECT") {
      // Hangar Mode: Gentle rotation or manual
      ref.current.rotation.y += rotationSpeed * delta;
      // Reset position/tilt smoothly
      easing.damp3(ref.current.position, [0, 0, 0], 0.5, delta);
      easing.damp3(ref.current.rotation, [0, ref.current.rotation.y, 0], 0.5, delta);
    } else {
      // Flight Mode: Interpolate position based on time
      const currentStep = Math.floor(flightTime);
      const nextStep = Math.min(currentStep + 1, FLIGHT_PROFILE.length - 1);
      const progress = flightTime - currentStep;

      const dataA = FLIGHT_PROFILE[currentStep];
      const dataB = FLIGHT_PROFILE[nextStep];

      // Interpolate pitch (Tilt)
      const targetPitch = THREE.MathUtils.lerp(dataA.pitch, dataB.pitch, progress) * (Math.PI / 180);
      
      // We simulate altitude visually by bobbing + background move, 
      // but strictly moving the mesh up too far breaks lights.
      // Instead, we tilt the rocket and move it slightly.
      easing.damp3(ref.current.rotation, [targetPitch, 0, -targetPitch * 0.5], 0.2, delta);
      
      // Add slight vibration for "Engine Rumble"
      const rumble = Math.sin(state.clock.elapsedTime * 50) * 0.2 * (dataA.vel / 200);
      ref.current.position.set(rumble, rumble, rumble);
    }
  });

  return (
    <group ref={ref}>
      <primitive object={clone} />
      
      {/* Engine Plume (Visible only in Flight) */}
      <EnginePlume visible={mode === "FLIGHT" && flightTime < 8} intensity={1} />
    </group>
  );
}

/**
 * ENGINE PLUME EFFECTS
 * A procedural shader-like mesh that glows
 */
function EnginePlume({ visible, intensity }: { visible: boolean, intensity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current || !visible) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.1;
    ref.current.scale.set(s, s * 1.5 + intensity, s);
    (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.8 + Math.sin(state.clock.elapsedTime * 30) * 0.2;
  });

  if (!visible) return null;

  return (
    <mesh ref={ref} position={[0, -55, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[4, 30, 16, 4, true]} />
      <meshStandardMaterial 
        color="#fb923c" 
        emissive="#ea580c" 
        emissiveIntensity={4} 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * CFD PARTICLE FIELD
 * High-performance InstancedMesh to visualize aerodynamics
 */
function CFDField({ active, velocity }: { active: boolean, velocity: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 1000;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Particle State
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 100
      ),
      speed: Math.random() * 0.5 + 0.5,
      offset: Math.random() * 100
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Fade in/out
    const targetOpacity = active ? Math.min(0.6, 0.2 + (velocity / 200)) : 0;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity,
      targetOpacity,
      0.1
    );

    // Color shift based on velocity (Blue -> Red at high speed)
    const color = new THREE.Color().setHSL(0.6 - (velocity / 500), 1.0, 0.5);
    (meshRef.current.material as THREE.MeshBasicMaterial).color.lerp(color, 0.1);

    particles.forEach((p, i) => {
      // Move particles down (Simulating rocket moving up)
      const flightSpeedFactor = 1 + (velocity / 10);
      p.pos.y -= p.speed * 50 * delta * flightSpeedFactor;

      // Reset height
      if (p.pos.y < -150) p.pos.y = 150;

      // Deflection around rocket body (Cylinder approx radius 10)
      const distXZ = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);
      if (distXZ < 12) {
        const angle = Math.atan2(p.pos.z, p.pos.x);
        const pushFactor = 12;
        p.pos.x = Math.cos(angle) * pushFactor;
        p.pos.z = Math.sin(angle) * pushFactor;
      }

      dummy.position.copy(p.pos);
      // Stretch based on speed
      dummy.scale.set(0.1, p.speed * (2 + velocity/10), 0.1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.5, 0.5, 1, 3]} />
      <meshBasicMaterial transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

/**
 * CINEMATIC CAMERA CONTROLLER
 * Switches between OrbitControls (Inspect) and ChaseCam (Flight)
 */
function CameraDirector({ mode }: { mode: ViewMode }) {
  const ref = useRef<CameraControls>(null);
  
  useEffect(() => {
    if (!ref.current) return;

    if (mode === "INSPECT") {
      // Reset to Inspection Angle
      ref.current.setLookAt(150, 50, 150, 0, 0, 0, true);
      ref.current.minDistance = 50;
      ref.current.maxDistance = 300;
      ref.current.enabled = true;
    } else {
      // Flight Angle (Low, Dramatic)
      ref.current.setLookAt(-100, -50, 100, 0, 50, 0, true);
      // ref.current.enabled = false; // Disable manual control during flight? Optional.
    }
  }, [mode]);

  return <CameraControls ref={ref} smoothTime={0.8} />;
}

// --- 4. MAIN COMPONENT ---

export default function ZoomerCFDViewer() {
  // State
  const [mode, setMode] = useState<ViewMode>("INSPECT");
  const [simState, setSimState] = useState<SimulationState>("IDLE");
  const [flightTime, setFlightTime] = useState(0);
  const [cfdEnabled, setCfdEnabled] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  // Derived Telemetry
  const telemetry = useMemo(() => {
    const idx = Math.floor(flightTime);
    const next = Math.min(idx + 1, FLIGHT_PROFILE.length - 1);
    const progress = flightTime - idx;
    
    if (!FLIGHT_PROFILE[idx]) return { alt: 0, vel: 0, accel: 0 };

    return {
      alt: THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].alt, FLIGHT_PROFILE[next].alt, progress),
      vel: THREE.MathUtils.lerp(FLIGHT_PROFILE[idx].vel, FLIGHT_PROFILE[next].vel, progress),
      // Simple accel derivation
      accel: (FLIGHT_PROFILE[next].vel - FLIGHT_PROFILE[idx].vel) / 1
    };
  }, [flightTime]);

  // Simulation Loop
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (simState === "PLAYING") {
        setFlightTime(prev => {
          if (prev >= 10) {
            setSimState("COMPLETED");
            return 10;
          }
          return prev + delta * 0.5; // 0.5x speed for dramatic effect
        });
      }
      frameId = requestAnimationFrame(loop);
    };

    if (simState === "PLAYING") {
      frameId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(frameId);
  }, [simState]);

  // Handlers
  const toggleSimulation = () => {
    if (mode === "INSPECT") {
      setMode("FLIGHT");
      setSimState("PLAYING");
      setFlightTime(0);
    } else {
      setSimState(prev => prev === "PLAYING" ? "PAUSED" : "PLAYING");
    }
  };

  const resetSimulation = () => {
    setSimState("IDLE");
    setFlightTime(0);
    setMode("INSPECT");
  };

  return (
    <div className="w-full h-[800px] relative bg-neutral-950 rounded-xl overflow-hidden shadow-2xl border border-neutral-800 font-mono text-white select-none">
      
      {/* --- UI LAYER: TOP BAR --- */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
        
        {/* Title Block */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-black tracking-tighter italic text-white">
              ZOOMER<span className="text-neutral-500">.SIM</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <span className={cn("w-2 h-2 rounded-full", mode === "FLIGHT" ? "bg-red-500 animate-pulse" : "bg-green-500")} />
            {mode === "FLIGHT" ? "Live Telemetry Active" : "Hangar Inspection Mode"}
          </div>
        </div>

        {/* Mode Toggle Switches */}
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setCfdEnabled(!cfdEnabled)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all hover:scale-105",
              cfdEnabled ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-neutral-900 border-neutral-800 text-neutral-500"
            )}
          >
            <Wind className="w-3 h-3" />
            CFD {cfdEnabled ? "ON" : "OFF"}
          </button>

          <button 
            onClick={() => activeAnnotation ? setActiveAnnotation(null) : setActiveAnnotation('nose')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all hover:scale-105",
              activeAnnotation ? "bg-white/10 border-white/30 text-white" : "bg-neutral-900 border-neutral-800 text-neutral-500"
            )}
          >
            <Search className="w-3 h-3" />
            X-RAY
          </button>
        </div>
      </div>

      {/* --- UI LAYER: TELEMETRY HUD (Flight Mode Only) --- */}
      <div className={cn(
        "absolute top-24 right-6 w-64 flex flex-col gap-2 transition-all duration-500 z-40 pointer-events-none",
        mode === "FLIGHT" ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
      )}>
        <TelemetryCard label="ALTITUDE" value={telemetry.alt.toFixed(0)} unit="m" icon={Maximize} color="text-emerald-400" />
        <TelemetryCard label="VELOCITY" value={telemetry.vel.toFixed(0)} unit="m/s" icon={Activity} color="text-blue-400" />
        <TelemetryCard label="G-FORCE" value={(1 + telemetry.accel / 9.8).toFixed(1)} unit="G" icon={Gauge} color="text-orange-400" />
      </div>

      {/* --- UI LAYER: ANNOTATIONS (Inspect Mode Only) --- */}
      {mode === "INSPECT" && activeAnnotation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="absolute top-0 left-32 bg-neutral-900/90 backdrop-blur border border-neutral-700 p-4 rounded-xl w-64 shadow-2xl animate-in fade-in slide-in-from-left-4">
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">{ANNOTATIONS['nose'].title}</h3>
                <button className="pointer-events-auto" onClick={() => setActiveAnnotation(null)}><X className="w-4 h-4 text-neutral-400 hover:text-white"/></button>
             </div>
             <p className="text-xs text-neutral-400 leading-relaxed">{ANNOTATIONS['nose'].desc}</p>
          </div>
        </div>
      )}

      {/* --- UI LAYER: BOTTOM CONTROLS --- */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-50 flex flex-col items-center gap-4 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent">
        
        {/* Timeline Scrubber */}
        <div className="w-full max-w-2xl flex items-center gap-4">
          <span className="text-[10px] text-neutral-500 font-bold w-12 text-right">T+{flightTime.toFixed(1)}s</span>
          <div className="relative flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
             <div 
               className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-75"
               style={{ width: `${(flightTime / 10) * 100}%` }}
             />
             {/* Markers */}
             <div className="absolute top-0 left-[40%] h-full w-0.5 bg-white/20" title="Max Q" />
             <div className="absolute top-0 left-[80%] h-full w-0.5 bg-white/20" title="MECO" />
          </div>
          <span className="text-[10px] text-neutral-500 font-bold w-12">T+10.0s</span>
        </div>

        {/* Main Control Bar */}
        <div className="flex items-center gap-4 pointer-events-auto bg-neutral-900/50 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/5 shadow-xl hover:border-white/10 transition-colors">
          
          <button 
            onClick={resetSimulation}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Reset Mission"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button 
            onClick={toggleSimulation}
            className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-transform active:scale-95 shadow-lg shadow-white/5"
          >
            {simState === "PLAYING" ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            {mode === "INSPECT" ? "LAUNCH SIMULATION" : (simState === "PLAYING" ? "PAUSE MISSION" : "RESUME MISSION")}
          </button>

          {mode === "INSPECT" && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
              <MousePointer2 className="w-4 h-4 text-neutral-500" />
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-20 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* --- 3D SCENE --- */}
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[100, 50, 100]} fov={45} />
        <color attach="background" args={['#0a0a0a']} />
        
        <Suspense fallback={<Html center className="text-orange-500 font-mono animate-pulse">Initializing Launch Systems...</Html>}>
          
          {/* Environment */}
          <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />
          <ambientLight intensity={0.2} />
          <pointLight position={[50, 50, 50]} intensity={1} color="#fb923c" distance={200} />
          <spotLight position={[-50, 100, 0]} intensity={2} angle={0.5} penumbra={1} castShadow shadow-bias={-0.0001} />

          {/* Grid Floor */}
          <Grid 
            position={[0, -80, 0]} 
            args={[1000, 1000]} 
            cellSize={20} 
            cellThickness={1} 
            cellColor="#262626" 
            sectionSize={100} 
            sectionThickness={1.5} 
            sectionColor="#404040" 
            fadeDistance={400} 
            fadeStrength={1} 
          />

          <Center top>
            <ZoomerRocket mode={mode} flightTime={flightTime} rotationSpeed={rotationSpeed} />
            <CFDField active={cfdEnabled && (mode === "FLIGHT" || rotationSpeed > 0.5)} velocity={telemetry.vel} />
          </Center>

          <CameraDirector mode={mode} />
          
        </Suspense>
      </Canvas>
    </div>
  );
}

// --- HELPER UI COMPONENT ---
function TelemetryCard({ label, value, unit, icon: Icon, color }: any) {
  return (
    <div className="bg-neutral-900/80 backdrop-blur-md border border-white/5 p-3 rounded-lg flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-md bg-neutral-800", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-neutral-500 tracking-widest uppercase">{label}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-white leading-none">{value}</span>
            <span className="text-[10px] text-neutral-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
