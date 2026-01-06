import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Search, AlertCircle, ArrowDown, ChevronRight, ChevronDown, X, CornerUpLeft, Hand, Rotate3d } from "lucide-react";

// --- TYPE DEFINITIONS ---
type ZoomZone = { 
  pos: number[]; 
  look: number[]; 
  label: string;
};

// --- ZOOM CONFIGURATION ---
const ZOOM_ZONES: Record<string, ZoomZone> = {
  overview: { 
    pos: [300, 50, 400], 
    look: [0, 10, 0], 
    label: "Overview" 
  },
  nosecone: { 
    pos: [50, 180, 50],  
    look: [0, 140, 0],   
    label: "Nose Cone" 
  },
  avionics: { 
    pos: [60, 100, 60],  
    look: [0, 80, 0],    
    label: "Avionics Bay" 
  },
  fins: { 
    pos: [60, 20, 60],   
    look: [0, 10, 0],    
    label: "Fin Can" 
  },
  motor: { 
    pos: [40, -40, 40],  
    look: [0, 0, 0],     
    label: "Motor Mount" 
  },
};

// --- PART DETAILS DATA ---
const PART_DETAILS: Record<string, { 
    title: string; 
    subtitle: string;
    description: string;
    specs: { label: string; value: string }[];
    features: string[];
}> = {
  nosecone: {
    title: "Nose Cone",
    subtitle: "Aerodynamic Payload Fairing",
    description: "A 5:1 Von Kármán ogive nose cone constructed from fiberglass. It houses the primary GPS tracking unit and ballast weight to ensure optimal stability margins during transonic flight.",
    specs: [
        { label: "Shape", value: "5:1 Ogive" },
        { label: "Material", value: "Filament Wound Fiberglass" },
        { label: "Payload", value: "TeleGPS Tracker" },
        { label: "Length", value: "24 inches" }
    ],
    features: [
        "Radio-transparent material",
        "Removable bulkhead",
        "Internal ballast chamber",
        "Metal tip for durability"
    ]
  },
  avionics: {
    title: "Avionics Bay",
    subtitle: "Dual Deployment System",
    description: "The brain of the rocket. This section contains redundant altimeters that control the deployment of the drogue parachute at apogee and the main parachute at a predetermined altitude.",
    specs: [
        { label: "Primary", value: "StratologgerCF" },
        { label: "Secondary", value: "RRC3 Sport" },
        { label: "Power", value: "2x 9V LiPo" },
        { label: "Switching", value: "Screw Switches" }
    ],
    features: [
        "Redundant flight computers",
        "Dual-deployment logic",
        "Modular sled design",
        "External arming access"
    ]
  },
  fins: {
    title: "Fin Can",
    subtitle: "Stability & Control",
    description: "Three trapezoidal fins mounted in a 120-degree configuration. Secured using through-the-wall mounting to the motor mount tube and reinforced with internal fiberglass fillets for maximum stiffness.",
    specs: [
        { label: "Count", value: "3 Fins" },
        { label: "Material", value: "G10 Fiberglass" },
        { label: "Thickness", value: "0.125 inch" },
        { label: "Span", value: "6.5 inches" }
    ],
    features: [
        "Through-the-wall mounting",
        "High-temp epoxy fillets",
        "Flutter-resistant geometry",
        "Precision alignment"
    ]
  },
  motor: {
    title: "Motor Section",
    subtitle: "High Power Propulsion",
    description: "Designed to accommodate 54mm and 75mm solid rocket motors. The motor mount tube transfers thrust to the airframe via centering rings and is the structural backbone of the lower section.",
    specs: [
        { label: "Mount", value: "75mm MMT" },
        { label: "Retainer", value: "AeroPack Flanged" },
        { label: "Class", value: "Level 2 (J/K/L)" },
        { label: "Thrust", value: "~1500N Avg" }
    ],
    features: [
        "Interchangeable motor adapters",
        "Positive motor retention",
        "Kevlar shock cord mounting",
        "Rail buttons for launch guide"
    ]
  },
};

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-black font-mono text-sm bg-white/90 p-4 rounded border border-black/10 shadow-lg backdrop-blur z-50 whitespace-nowrap">
        Loading Model... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// --- ROCKET MODEL ---
function ZoomerModel({ setHovered }: { setHovered: (v: boolean) => void }) {
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const clone = useMemo(() => {
    const c = scene.clone();
    c.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        // Optional: Enhance material if needed
        if (node.material) {
           node.material.roughness = 0.5;
           node.material.metalness = 0.5;
        }
      }
    });
    return c;
  }, [scene]);

  return (
    <primitive 
      object={clone} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

// --- ZOOM INDICATOR ---
function ZoomIndicator({ controlsRef }: { controlsRef: any }) {
  const [zoomPct, setZoomPct] = useState(100);
  const { camera } = useThree();
  const BASE_DIST = 400; 

  useFrame(() => {
    if (!controlsRef.current) return;
    const dist = camera.position.distanceTo(controlsRef.current.getTarget(new THREE.Vector3()));
    const pct = Math.round((BASE_DIST / dist) * 100);
    setZoomPct(pct);
  });

  return (
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none', zIndex: 40 }} zIndexRange={[40, 0]}>
      <div className="fixed top-20 right-8 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-black/5">
        <Search className="w-3 h-3 text-neutral-500" />
        <span className="text-xs font-mono font-bold text-neutral-700">{zoomPct}%</span>
      </div>
    </Html>
  );
}

// --- SCENE CONTROLLER ---
function SceneController({ currentZone, cameraControlsRef }: any) {
  useFrame(() => {
    if (!cameraControlsRef.current) return;
    const targetConfig = ZOOM_ZONES[currentZone];
    if (!targetConfig) return;

    // Smoothly interpolate camera position and look-at target
    cameraControlsRef.current.setLookAt(
        targetConfig.pos[0], targetConfig.pos[1], targetConfig.pos[2],
        targetConfig.look[0], targetConfig.look[1], targetConfig.look[2],
        true 
    );
  });
  return null;
}

// --- INSTRUCTION OVERLAY ---
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

// --- ACCORDION COMPONENT ---
function DetailAccordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <span className="text-sm font-bold uppercase tracking-wider text-neutral-200 group-hover:text-white transition-colors">
          {title}
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

export default function ZoomerCFDViewer() {
  const [currentZone, setCurrentZone] = useState("overview");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hovered, setHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cameraControlsRef = useRef<CameraControls>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleZoneClick = (zoneKey: string) => {
    setCurrentZone(zoneKey);
  };

  const handleReturnToOverview = () => {
    setCurrentZone("overview");
  };

  const isOverview = currentZone === "overview";
  const currentDetails = PART_DETAILS[currentZone];

  return (
    <div 
      className="w-full h-[400px] sm:h-[550px] md:h-[750px] relative bg-white border border-neutral-200 overflow-hidden shadow-sm group font-sans"
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(80, 80, 80, 0.5); 
            border-radius: 20px;
            border: 2px solid rgba(0,0,0,0);
            background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(120, 120, 120, 0.8);
            border: 2px solid rgba(0,0,0,0);
            background-clip: content-box;
        }
      `}</style>

      {/* 1. HEADER */}
      <div className={`absolute top-4 left-4 sm:top-8 sm:left-8 z-50 transition-all duration-500 ${isOverview ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tighter">ZOOMER ROCKET</h1>
        <p className="text-neutral-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>

      {/* 2. FULL SCREEN INSTRUCTION OVERLAY */}
      {!hasInteracted && <InstructionOverlay onDismiss={handleInteraction} />}

      {/* 3. OVERVIEW PART SELECTION */}
      <div className={`absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1 sm:gap-2 transition-all duration-500 ${isOverview ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className="hidden sm:flex absolute -top-16 right-0 w-48 text-right flex-col items-end gap-1 animate-bounce">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-white/90 px-2 py-1 rounded">
                Click To Inspect
            </span>
            <ArrowDown className="w-5 h-5 text-neutral-400 mr-4" />
        </div>

        {Object.entries(ZOOM_ZONES).map(([key, zone]) => {
          if (key === 'overview') return null; 
          return (
            <button
              key={key}
              onClick={() => handleZoneClick(key)}
              className="text-right text-[8px] sm:text-[10px] font-bold tracking-widest uppercase px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all duration-200 bg-white/80 text-neutral-400 hover:text-neutral-900 hover:bg-white hover:scale-105 border border-transparent hover:border-neutral-100 shadow-sm"
            >
              {isMobile ? zone.label : zone.label}
            </button>
          );
        })}
      </div>

      {/* 4. SIDEBAR: DETAILED VIEW */}
      <div 
        className={`absolute top-0 left-0 h-full w-full md:w-[400px] bg-neutral-950/95 backdrop-blur-xl z-50 text-white shadow-2xl transition-transform duration-700 ease-bezier flex flex-col ${!isOverview ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="p-4 sm:p-6 md:p-8 pb-4 shrink-0 border-b border-white/5 relative z-20 bg-neutral-950/50 backdrop-blur-md">
            <div className="flex justify-between items-start gap-4">
                <button 
                    onClick={handleReturnToOverview}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/20 group w-full justify-center mb-3 sm:mb-4"
                >
                    <CornerUpLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Return to Overview</span>
                </button>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="px-2 sm:px-3 py-1 border border-blue-500/30 bg-blue-500/10 rounded-full text-[8px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-blue-400">
                    System Detail
                </div>
                 <button 
                    onClick={handleReturnToOverview}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors text-neutral-500 hover:text-white"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 pt-4 relative z-10 pb-32 sm:pb-40">
            {currentDetails && (
                <>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter leading-none mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
                        {currentDetails.title}
                    </h2>
                    <h3 className="text-sm sm:text-base md:text-lg text-blue-400 font-medium mb-4 sm:mb-6 tracking-tight flex items-center gap-2">
                        {currentDetails.subtitle}
                    </h3>
                    
                    <div className="w-full h-px bg-white/10 mb-6" />
                    
                    <p className="text-neutral-300 leading-relaxed text-sm font-light opacity-90 mb-8 border-l-2 border-blue-500 pl-4">
                        {currentDetails.description}
                    </p>

                    <div className="border-t border-white/10 pb-20">
                        <DetailAccordion title="Technical Specifications" defaultOpen={true}>
                            <div className="grid grid-cols-2 gap-3 py-2">
                                {currentDetails.specs.map((spec, i) => (
                                    <div key={i} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                        <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-1">{spec.label}</span>
                                        <span className="text-xs font-mono text-blue-100">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </DetailAccordion>

                        <DetailAccordion title="Mission Features">
                            <ul className="space-y-2 py-2">
                                {currentDetails.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-xs text-neutral-300 p-2 hover:bg-white/5 rounded transition-colors">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </DetailAccordion>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* 3D CANVAS */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [300, 50, 400], far: 5000 }}>
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Loader />}>
            <Environment preset="studio" />
            <ambientLight intensity={0.6} />
            <directionalLight position={[100, 100, 50]} intensity={1.5} castShadow />

            <Center top>
              <group rotation={[0, 0, 0]}>
                 <ZoomerModel setHovered={setHovered} />
              </group>
            </Center>

            <ContactShadows resolution={1024} scale={300} blur={2} opacity={0.2} far={100} color="#000000" />
            
            <CameraControls 
              ref={cameraControlsRef} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.6} 
              minDistance={50} 
              maxDistance={600} 
            />
            
            <ZoomIndicator controlsRef={cameraControlsRef} />
            
            <SceneController 
                currentZone={currentZone} 
                cameraControlsRef={cameraControlsRef} 
            />
        </Suspense>
      </Canvas>
    </div>
  );
}
