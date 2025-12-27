import { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html, Environment, Center, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Wind, RotateCcw, Hand, Rotate3d } from "lucide-react";
import { cn } from "@/lib/utils";

// --- CONFIGURATION ---

// 1. YOUR ROCKET PARTS
const ROCKET_PARTS = [
  "/zoomer-parts/zoomer_nose_cone.glb",
  "/zoomer-parts/zoomer_body_tube.glb",
  "/zoomer-parts/zoomer_fin_can.glb",
  "/zoomer-parts/zoomer_inner_tube.glb",
];

// 2. TELEMETRY DATA (The "Simulation")
const DRAG_DATA = {
  small:  [0.25, 0.29, 0.45, 0.38], 
  medium: [0.32, 0.35, 0.52, 0.44], 
  large:  [0.45, 0.48, 0.65, 0.55], 
  custom: [0.38, 0.41, 0.58, 0.49]  
};

const VARIANTS = [
  { id: "small", label: "Low Drag" },
  { id: "medium", label: "Standard" },
  { id: "large", label: "High Stability" },
  { id: "custom", label: "Experimental" },
];

// --- COMPONENTS ---

// 1. SINGLE PART LOADER
function RocketPart({ file }: { file: string }) {
  const { scene } = useGLTF(file);
  const clone = useMemo(() => scene.clone(), [scene]);

  useMemo(() => {
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Material: Clean White/Ceramic finish similar to Falcon
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#ffffff", 
          roughness: 0.4,
          metalness: 0.1,
        });
      }
    });
  }, [clone]);

  return <primitive object={clone} />;
}

// 2. ROCKET ASSEMBLY
function RocketAssembly() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}> 
      {ROCKET_PARTS.map((partFile, index) => (
        <RocketPart key={index} file={partFile} />
      ))}
    </group>
  );
}

// 3. PARTICLE SYSTEM (The Wind - Adapted for Light Background)
function WindTunnel({ speed }: { speed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 1500; 
  
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

    // Color: Dark Grey to Blue (Visible on White Background)
    const color = new THREE.Color().setHSL(0.6, 0.8, 0.4); 
    (meshRef.current.material as THREE.MeshBasicMaterial).color = color;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.min(0.5, speed * 0.8);

    particles.forEach((particle, i) => {
      // Move particles
      particle.z -= (particle.speedOffset * speed * 200 * delta); 
      if (particle.z < -100) particle.z = 100;

      // Deflection logic
      const dist = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
      let renderX = particle.x;
      let renderY = particle.y;
      
      if (dist < 15) {
         const angle = Math.atan2(particle.y, particle.x);
         renderX = Math.cos(angle) * 15; 
         renderY = Math.sin(angle) * 15;
      }

      dummy.position.set(renderX, renderY, particle.z);
      dummy.scale.set(1, 1, Math.max(1, speed * 20)); 
      dummy.rotation.x = Math.PI / 2;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.03, 0.03, 2, 4]} />
      <meshBasicMaterial transparent opacity={0.2} color="#3b82f6" />
    </instancedMesh>
  );
}

// --- INSTRUCTION OVERLAY (Matching Falcon) ---
function InstructionOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div 
      onClick={onDismiss}
      className="absolute inset-0 z-[200] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-white/40 group px-4"
    >
       <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
           <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-full h-full bg-white/80 backdrop-blur-md border border-black/10 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Rotate3d className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-black animate-[spin_8s_linear_infinite]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black text-white p-1.5 sm:p-2 rounded-full shadow-lg animate-bounce">
                    <Hand className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
           </div>

           <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-black tracking-tighter uppercase drop-shadow-sm mb-2 text-center">
               Tap to Interact
           </h2>
           
           <div className="flex items-center gap-2 sm:gap-4 text-neutral-500 text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase bg-white/80 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full border border-black/5 shadow-sm">
               <span>Drag to Rotate</span>
               <div className="w-1 h-1 bg-black rounded-full opacity-20" />
               <span>Simulation Active</span>
           </div>
       </div>
    </div>
  );
}

// --- MAIN VIEWER COMPONENT ---

export default function ZoomerCFDViewer() {
  const [activeVariantId, setActiveVariantId] = useState("medium"); 
  const [sliderValue, setSliderValue] = useState(10); 
  const [dragValue, setDragValue] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Simulation Math
  const machNumber = (sliderValue / 100) * 2.0; 
  const normalizedSpeed = Math.max(0.1, sliderValue / 100);

  useEffect(() => {
    const data = DRAG_DATA[activeVariantId as keyof typeof DRAG_DATA];
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
    <div className="w-full h-[600px] sm:h-[750px] relative bg-white rounded-none sm:rounded-xl overflow-hidden border border-neutral-200 shadow-sm group font-sans">
      
      {/* 1. HEADER (Falcon Style) */}
      <div className="absolute top-8 left-8 z-50 transition-all duration-500 opacity-100">
         <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tighter">ZOOMER ROCKET</h1>
         <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>
      
      {/* 2. HUD: DRAG COEFFICIENT (Clean Glass Style) */}
      <div className="absolute top-8 right-8 z-40 bg-white/80 backdrop-blur-md border border-black/5 px-4 py-3 rounded-lg text-right shadow-sm">
           <span className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase block mb-1">
             Drag Coeff (Cd)
           </span>
           <div className="text-3xl font-mono font-bold text-neutral-900 tabular-nums tracking-tight">
             {dragValue.toFixed(4)}
           </div>
      </div>

      {/* 3. INSTRUCTION OVERLAY */}
      {!hasInteracted && <InstructionOverlay onDismiss={() => setHasInteracted(true)} />}

      {/* 4. BOTTOM CONTROLS (Floating Island Style) */}
      <div className={cn(
        "absolute bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-2xl bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-2xl z-40 flex flex-col gap-4 transition-all duration-700",
        !hasInteracted ? "translate-y-20 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}>
        
        {/* VARIANT TABS */}
        <div className="flex justify-center gap-2">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveVariantId(v.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border",
                activeVariantId === v.id
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-md"
                  : "bg-neutral-100 text-neutral-500 border-transparent hover:bg-neutral-200"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* SLIDER & SPEED */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[9px] text-neutral-400 font-bold uppercase">Mach</span>
            <span className={cn("text-xl font-black italic tabular-nums", machNumber > 1.0 ? "text-red-500" : "text-neutral-900")}>
                {machNumber.toFixed(2)}
            </span>
          </div>
          
          <div className="flex-1 relative h-8 flex items-center">
             <input
              type="range" min="0" max="100" step="1"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 hover:accent-neutral-700 transition-all z-20"
            />
          </div>

          <button 
             onClick={() => { setSliderValue(10); setActiveVariantId('medium'); }}
             className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors"
             title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D SCENE (Studio Lighting & White Background) */}
      <Canvas shadows dpr={[1, 2]} camera={{ position: [100, 50, 200], fov: 40 }}>
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center><span className="text-black font-mono text-xs">Loading Model...</span></Html>}>
          {/* Lighting Environment - 'studio' matches Falcon viewer */}
          <Environment preset="studio" />
          <ambientLight intensity={0.4} />
          <spotLight position={[50, 50, 50]} angle={0.2} penumbra={1} intensity={0.8} castShadow />

          {/* Center automatically fixes camera framing so it's not "Zoomed In Wrong" */}
          <Center>
            <RocketAssembly />
            <WindTunnel speed={normalizedSpeed} />
          </Center>

          {/* Contact Shadows for "Grounding" effect without dark abyss */}
          <ContactShadows resolution={1024} scale={200} blur={2} opacity={0.25} far={50} color="#000000" />

          {/* Controls */}
          <OrbitControls 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
            enableZoom={true} 
            enablePan={false}
            minDistance={50}
            maxDistance={500}
            autoRotate={!hasInteracted}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
