import { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html, Environment, Center } from "@react-three/drei";
import * as THREE from "three";
import { Wind, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// --- CONFIGURATION ---

// 1. YOUR ROCKET PARTS (Updated with your real names)
// Ensure these 4 files are inside: /public/zoomer-parts/
const ROCKET_PARTS = [
  "/zoomer-parts/zoomer_nose_cone.glb",
  "/zoomer-parts/zoomer_body_tube.glb",
  "/zoomer-parts/zoomer_fin_can.glb",
  "/zoomer-parts/zoomer_inner_tube.glb",
];

// 2. TELEMETRY DATA (The "Simulation")
// The visual model stays the same, but these numbers change based on the button selected.
// Format: [Mach 0.1, Mach 0.5, Mach 1.0, Mach 2.0]
const DRAG_DATA = {
  small:  [0.25, 0.29, 0.45, 0.38], // Data for "Low Drag"
  medium: [0.32, 0.35, 0.52, 0.44], // Data for "Standard"
  large:  [0.45, 0.48, 0.65, 0.55], // Data for "High Stability"
  custom: [0.38, 0.41, 0.58, 0.49]  // Data for "Experimental"
};

const VARIANTS = [
  { id: "small", label: "Low Drag Config" },
  { id: "medium", label: "Standard Config" },
  { id: "large", label: "High Stability" },
  { id: "custom", label: "Experimental" },
];

// --- COMPONENTS ---

// 1. SINGLE PART LOADER
// Helper to load one GLB part and apply the "Wind Tunnel" silver material
function RocketPart({ file }: { file: string }) {
  const { scene } = useGLTF(file);
  const clone = useMemo(() => scene.clone(), [scene]);

  useMemo(() => {
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Material: Silver/Aluminum Test Model look
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#e5e5e5", 
          roughness: 0.3,
          metalness: 0.8,
        });
      }
    });
  }, [clone]);

  return <primitive object={clone} />;
}

// 2. ROCKET ASSEMBLY
// Renders the 4 separate parts together as one unit
function RocketAssembly() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}> {/* Rotate to point horizontally */}
      {ROCKET_PARTS.map((partFile, index) => (
        <RocketPart key={index} file={partFile} />
      ))}
    </group>
  );
}

// 3. PARTICLE SYSTEM (The Wind)
function WindTunnel({ speed }: { speed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 2000; 
  
  const [dummy] = useState(() => new THREE.Object3D());
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        z: (Math.random() - 0.5) * 200, 
        x: (Math.random() - 0.5) * 100, 
        y: (Math.random() - 0.5) * 100, 
        speedOffset: Math.random() * 2 + 1, 
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Color: Blue (Slow) -> Red (Fast)
    const color = new THREE.Color().setHSL(0.6 - (speed * 0.6), 1, 0.5); 
    (meshRef.current.material as THREE.MeshBasicMaterial).color.lerp(color, 0.1);

    particles.forEach((particle, i) => {
      // Move particles
      particle.z -= (particle.speedOffset * speed * 200 * delta); 
      if (particle.z < -100) particle.z = 100;

      // Deflection: Push particles around the rocket cylinder
      const dist = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
      let renderX = particle.x;
      let renderY = particle.y;
      
      if (dist < 15) {
         const angle = Math.atan2(particle.y, particle.x);
         renderX = Math.cos(angle) * 15; 
         renderY = Math.sin(angle) * 15;
      }

      dummy.position.set(renderX, renderY, particle.z);
      // Stretch particles at high speed (Motion Blur)
      dummy.scale.set(1, 1, Math.max(1, speed * 20)); 
      dummy.rotation.x = Math.PI / 2;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.05, 0.05, 2, 4]} />
      <meshBasicMaterial transparent opacity={0.3} />
    </instancedMesh>
  );
}

// --- MAIN VIEWER COMPONENT ---

export default function ZoomerCFDViewer() {
  const [activeVariantId, setActiveVariantId] = useState("medium"); 
  const [sliderValue, setSliderValue] = useState(10); 
  const [dragValue, setDragValue] = useState(0);

  // Simulation Math
  const machNumber = (sliderValue / 100) * 2.0; 
  const normalizedSpeed = Math.max(0.1, sliderValue / 100);

  // Telemetry Calculation
  useEffect(() => {
    const data = DRAG_DATA[activeVariantId as keyof typeof DRAG_DATA];
    
    // Linear Interpolation between data points
    let val = 0;
    if (machNumber <= 0.5) {
      val = data[0] + (data[1] - data[0]) * (machNumber / 0.5);
    } else if (machNumber <= 1.0) {
      val = data[1] + (data[2] - data[1]) * ((machNumber - 0.5) / 0.5);
    } else {
      val = data[2] + (data[3] - data[2]) * ((machNumber - 1.0) / 1.0);
    }
    setDragValue(val);
  }, [sliderValue, activeVariantId, machNumber]);

  return (
    <div className="w-full h-[600px] sm:h-[750px] relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
      
      {/* HEADER HUD */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic">VIRTUAL WIND TUNNEL</h2>
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs mt-1">
            <Wind className="w-3 h-3 animate-pulse" />
            <span>REAL-TIME CFD // ZOOMER L2</span>
          </div>
        </div>
        
        {/* DRAG COEFFICIENT DISPLAY */}
        <div className="bg-black/50 backdrop-blur-md border border-white/10 p-4 rounded-lg text-right">
           <span className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase block mb-1">
             Drag Coefficient (Cd)
           </span>
           <div className="text-4xl font-mono font-bold text-white tabular-nums tracking-tight text-shadow-glow">
             {dragValue.toFixed(4)}
           </div>
        </div>
      </div>

      {/* CONTROLS (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8 pt-20 z-10 flex flex-col gap-6">
        
        {/* CONFIG BUTTONS */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveVariantId(v.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 border",
                activeVariantId === v.id
                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-105"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* SLIDER */}
        <div className="flex items-center gap-6 max-w-3xl mx-auto w-full bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Flow Speed</span>
            <span className={cn("text-2xl font-black italic tabular-nums", machNumber > 1.0 ? "text-red-500" : "text-white")}>
                M {machNumber.toFixed(2)}
            </span>
          </div>
          <div className="flex-1 relative h-12 flex items-center">
            <input
              type="range" min="0" max="100" step="1"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all z-20 relative"
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-white/10 z-0 flex justify-between px-1">
               {[...Array(10)].map((_, i) => <div key={i} className="w-px h-2 bg-white/20" />)}
            </div>
          </div>
          <button 
             onClick={() => { setSliderValue(10); setActiveVariantId('medium'); }}
             className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
             title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D SCENE */}
      <Canvas shadows camera={{ position: [50, 20, 100], fov: 45 }}>
        <color attach="background" args={['#111']} />
        <fog attach="fog" args={['#111', 50, 300]} />
        
        <Suspense fallback={<Html center><span className="text-white font-mono animate-pulse">Initializing CFD Engine...</span></Html>}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={10} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#2563eb" />

          <Center>
            {/* The Rocket (Assembled from 4 parts) */}
            <RocketAssembly />
            
            {/* The Wind Particles */}
            <WindTunnel speed={normalizedSpeed} />
          </Center>

          <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} enableZoom={false} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
