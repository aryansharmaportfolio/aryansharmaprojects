import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Hand, Rotate3d } from "lucide-react";

// --- 3D COMPONENTS ---

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

// --- UI COMPONENTS ---

function InstructionOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div 
      onClick={onDismiss}
      className="absolute inset-0 z-[200] bg-neutral-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-neutral-950/50 group px-4"
    >
       <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
           <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Rotate3d className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white animate-[spin_8s_linear_infinite]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white text-black p-1.5 sm:p-2 rounded-full shadow-lg animate-bounce">
                    <Hand className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
           </div>

           <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tighter uppercase drop-shadow-lg mb-2 text-center">
               Tap to Explore
           </h2>
           
           <div className="flex items-center gap-2 sm:gap-4 text-blue-200 text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase bg-black/40 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full border border-white/10">
               <span>Drag to Rotate</span>
               <div className="w-1 h-1 bg-white rounded-full opacity-50" />
               <span>Pinch to Zoom</span>
           </div>
       </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function ZoomerCFDViewer() {
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="w-full h-[350px] sm:h-[450px] md:h-[600px] lg:h-[700px] relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 font-sans select-none group">
      
      {/* HEADER */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-50 transition-all duration-500 pointer-events-none">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 tracking-tighter">ZOOMER</h1>
        <p className="text-neutral-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>

      {/* INSTRUCTION OVERLAY */}
      {!hasInteracted && <InstructionOverlay onDismiss={() => setHasInteracted(true)} />}

      {/* 3D SCENE */}
      <Canvas shadows dpr={[1, 2]}>
        {/* Adjusted camera for better mobile viewing - closer and more centered */}
        <PerspectiveCamera makeDefault position={[1400, 500, 850]} fov={window.innerWidth < 768 ? 50 : 35} />
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Html center className="text-neutral-400 font-mono text-xs">Loading Model...</Html>}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[50, 100, 50]} intensity={2} castShadow />
          
          <Center top>
            <ZoomerRocket />
          </Center>

          <CameraControls 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.8} 
            minDistance={window.innerWidth < 768 ? 900 : 1200} 
            maxDistance={window.innerWidth < 768 ? 1100 : 1300} 
          />
          <ContactShadows resolution={1024} scale={300} blur={3} opacity={0.2} far={100} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
