import { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html, Environment, Center } from "@react-three/drei";
import * as THREE from "three";
import { Wind, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// --- STEP 3: CONFIGURE YOUR DATA HERE ---

// The single 3D model file to load
const ROCKET_MODEL_PATH = "/zoomer-model/zoomer_full.glb";

// 1. YOUR DRAG DATA (Cd)
// This is where you put your specific SolidWorks Flow Simulation numbers.
// Format: [Value at Mach 0.1, Value at Mach 0.5, Value at Mach 1.0, Value at Mach 2.0]
const DRAG_DATA = {
  small:  [0.25, 0.29, 0.45, 0.38],
  medium: [0.32, 0.35, 0.52, 0.44], // Standard
  large:  [0.45, 0.48, 0.65, 0.55],
  custom: [0.38, 0.41, 0.58, 0.49] 
};

// 2. YOUR VARIANTS
// Notice we removed the "file" path from here since we use one model.
const VARIANTS = [
  { id: "small", label: "Low Drag Config" },
  { id: "medium", label: "Standard Config" },
  { id: "large", label: "High Stability" },
  { id: "custom", label: "Experimental" },
];

// --- COMPONENTS ---

// 1. THE ROCKET (Static, One Model)
function RocketModel() {
  const { scene } = useGLTF(ROCKET_MODEL_PATH);
  
  // Clone the scene so we can modify materials without messing up the cache
  const clone = useMemo(() => scene.clone(), [scene]);

  // Apply a "Wind Tunnel Model" look (Silver/Metallic)
  useMemo(() => {
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Make it look like aluminum/testing material
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#e5e5e5", 
          roughness: 0.3,
          metalness: 0.8,
        });
      }
    });
  }, [clone]);

  // Rotate it so it lays flat (pointing towards the wind)
  // Adjust rotation inside the [ ] if your model points up/down
  return <primitive object={clone} rotation={[0, 0, Math.PI / 2]} />;
}

// 2. THE PARTICLE SYSTEM (The Visual "Wind")
function WindTunnel({ speed }: { speed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 2000; // Number of particles
  
  // Create random starting positions for the lines
  const [dummy] = useState(() => new THREE.Object3D());
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        z: (Math.random() - 0.5) * 200, // Length of tunnel
        x: (Math.random() - 0.5) * 100, // Width
        y: (Math.random() - 0.5) * 100, // Height
        speedOffset: Math.random() * 2 + 1, // Some move faster than others
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Change color based on speed: Blue (Slow) -> Red (Fast)
    const color = new THREE.Color().setHSL(0.6 - (speed * 0.6), 1, 0.5); 
    (meshRef.current.material as THREE.MeshBasicMaterial).color.lerp(color, 0.1);

    particles.forEach((particle, i) => {
      // Move particle along Z axis
      // "speed" comes from the slider
      particle.z -= (particle.speedOffset * speed * 200 * delta); 

      // Reset position if it flies off screen
      if (particle.z < -100) particle.z = 100;

      // Simple "Collision": Push particles away from the center (where rocket is)
      const dist = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
      let renderX = particle.x;
      let renderY = particle.y;
      
      // If inside the rocket radius (approx 15 units), push it out
      if (dist < 15) {
         const angle = Math.atan2(particle.y, particle.x);
         renderX = Math.cos(angle) * 15; 
         renderY = Math.sin(angle) * 15;
      }

      // Update the instance
      dummy.position.set(renderX, renderY, particle.z);
      // Stretch the line based on speed (Motion Blur effect)
      dummy.scale.set(1, 1, Math.max(1, speed * 20)); 
      dummy.rotation.x = Math.PI / 2; // Rotate to face flow direction
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* The shape of one particle (a thin line) */}
      <cylinderGeometry args={[0.05, 0.05, 2, 4]} />
      <meshBasicMaterial transparent opacity={0.3} />
    </instancedMesh>
  );
}

// --- MAIN COMPONENT ---

export default function ZoomerCFDViewer() {
  const [variant, setVariant] = useState("medium"); // Default variant
  const [sliderValue, setSliderValue] = useState(10); // Start slow (10%)
  const [dragValue, setDragValue] = useState(0);

  // Math: Convert slider (0-100) to Mach Number (0.0 - 2.0)
  const machNumber = (sliderValue / 100) * 2.0; 
  const normalizedSpeed = Math.max(0.1, sliderValue / 100);

  // TELEMETRY LOGIC: Calculate drag based on current variant + speed
  useEffect(() => {
    // Get the data array for the currently selected variant
    const data = DRAG_DATA[variant as keyof typeof DRAG_DATA];
    
    // Interpolate between the 4 data points [0.1, 0.5, 1.0, 2.0]
    let val = 0;
    if (machNumber <= 0.5) {
      // Range 0.1 -> 0.5
      const pct = machNumber / 0.5;
      val = data[0] + (data[1] - data[0]) * pct;
    } else if (machNumber <= 1.0) {
      // Range 0.5 -> 1.0
      const pct = (machNumber - 0.5) / 0.5;
      val = data[1] + (data[2] - data[1]) * pct;
    } else {
      // Range 1.0 -> 2.0
      const pct = (machNumber - 1.0) / 1.0;
      val = data[2] + (data[3] - data[2]) * pct;
    }
    
    setDragValue(val);
  }, [sliderValue, variant, machNumber]);

  return (
    <div className="w-full h-[600px] sm:h-[750px] relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
      
      {/* 1. TOP HEADER: Telemetry Display */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic">VIRTUAL WIND TUNNEL</h2>
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs mt-1">
            <Wind className="w-3 h-3 animate-pulse" />
            <span>REAL-TIME CFD // ZOOMER L2</span>
          </div>
        </div>
        
        {/* DRAG COUNTER - This updates when you slide or click buttons */}
        <div className="bg-black/50 backdrop-blur-md border border-white/10 p-4 rounded-lg text-right">
           <span className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase block mb-1">
             Drag Coefficient (Cd)
           </span>
           <div className="text-4xl font-mono font-bold text-white tabular-nums tracking-tight text-shadow-glow">
             {dragValue.toFixed(4)}
           </div>
        </div>
      </div>

      {/* 2. BOTTOM CONTROLS */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8 pt-20 z-10 flex flex-col gap-6">
        
        {/* VARIANT BUTTONS */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 border",
                variant === v.id
                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-105"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* SPEED SLIDER */}
        <div className="flex items-center gap-6 max-w-3xl mx-auto w-full bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
          
          {/* Mach Number Display */}
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Flow Speed</span>
            <span className={cn(
                "text-2xl font-black italic tabular-nums",
                machNumber > 1.0 ? "text-red-500" : "text-white"
            )}>
                M {machNumber.toFixed(2)}
            </span>
          </div>

          <div className="flex-1 relative h-12 flex items-center">
            {/* The Actual Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all z-20 relative"
            />
            {/* Fake tick marks for style */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-white/10 z-0 flex justify-between px-1">
               {[...Array(10)].map((_, i) => <div key={i} className="w-px h-2 bg-white/20" />)}
            </div>
          </div>

          {/* Reset Button */}
          <button 
             onClick={() => { setSliderValue(10); setVariant('medium'); }}
             className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
             title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. 3D CANVAS */}
      <Canvas shadows camera={{ position: [50, 20, 100], fov: 45 }}>
        <color attach="background" args={['#111']} />
        <fog attach="fog" args={['#111', 50, 300]} />
        
        <Suspense fallback={<Html center><span className="text-white font-mono animate-pulse">Initializing CFD Engine...</span></Html>}>
          
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={10} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#2563eb" />

          <Center>
            <RocketModel />
            <WindTunnel speed={normalizedSpeed} />
          </Center>

          <OrbitControls 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5}
            enableZoom={false} 
            enablePan={false}
          />
          
        </Suspense>
      </Canvas>
    </div>
  );
}
