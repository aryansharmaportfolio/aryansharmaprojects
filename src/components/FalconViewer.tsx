import { useState, useRef, useMemo, Suspense, useEffect, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { Search, MousePointer2, AlertCircle, ArrowDown, ChevronRight, ChevronDown, X, CornerUpLeft } from "lucide-react";

// --- 1. CONFIGURATION ---
const ROCKET_STACK = {
  top: {
    file: "/rocket-parts/part_top.glb", 
    explodeOffset: -120, 
    explodeAxis: "z", 
    baseMaterial: "white"
  },
  middle: {
    file: "/rocket-parts/part_middle.glb",
    explodeOffset: 0, 
    explodeAxis: "y",
    baseMaterial: "black"
  },
  bottom: {
    file: "/rocket-parts/part_bottom.glb",
    explodeOffset: 0, 
    explodeAxis: "y",
    baseMaterial: "white", 
    accentMaterial: "black" 
  }
};

// --- ZOOM CONFIGURATION ---
// UPDATED: Added Y-offsets to Interstage to fix "looking below" issue
const ZOOM_ZONES = {
  overview:             { pos: [300, 50, 400], look: [0, 10, 0], type: "static" },
  
  // DYNAMIC PARTS
  fairing: { 
    offset: [100, 40, 30],     
    lookOffset: [-100, 200, 0],     
    type: "dynamic",
    refId: "top"    
  }, 
  
  "second stage booster": { 
    offset: [100, 40, 100],     
    lookOffset: [0, 50, 0],     
    type: "dynamic",
    refId: "top"    
  }, 
  
  // FIXED: Lifted Y offsets by 120 units to target the black cylinder properly
  interstage: { 
    offset: [200, 120, 80],      // Lifted Camera UP
    lookOffset: [-50, 120, 0],      // Lifted Target UP
    type: "dynamic",
    refId: "middle" 
  },
  
  // STATIC PARTS
  gridfins:             { pos: [35, 75, 35],  look: [0, 55, 0], type: "static" },
  "merlin 9 boosters":  { pos: [20, -70, 20],  look: [0, -45, 0], type: "static" },
};

// --- PART DETAILS DATA ---
const PART_DETAILS: Record<string, { 
    title: string; 
    subtitle: string;
    description: string;
    specs: { label: string; value: string }[];
    features: string[];
}> = {
  fairing: {
    title: "Payload Fairing",
    subtitle: "Composite Payload Protection",
    description: "The fairing protects satellites and other payloads during ascent through Earth's atmosphere. Made of carbon composite material, the fairing is jettisoned approximately 3 minutes into flight, allowing the payload to be deployed into orbit.",
    specs: [
        { label: "Height", value: "13.1 m / 43 ft" },
        { label: "Diameter", value: "5.2 m / 17 ft" },
        { label: "Mass", value: "~1900 kg" },
        { label: "Material", value: "Carbon Composite" }
    ],
    features: [
        "Pneumatic separation system",
        "Recoverable via sea vessels",
        "Acoustic absorption blankets",
        "Radio-transparent windows"
    ]
  },
  "second stage booster": {
    title: "Second Stage",
    subtitle: "Orbital Insertion Stage",
    description: "Powered by a single Merlin Vacuum Engine, the second stage delivers the payload to its final orbit. It is designed to restart multiple times in space to place payloads into different trajectories.",
    specs: [
        { label: "Engine", value: "1x Merlin Vacuum" },
        { label: "Thrust", value: "981 kN / 220.5 klbf" },
        { label: "Burn Time", value: "397 sec" },
        { label: "Propellant", value: "LOX / RP-1" }
    ],
    features: [
        "Multiple restart capability",
        "Redundant flight computers",
        "Nitrogen gas thrusters for attitude control",
        "High-strength Al-Li alloy tanks"
    ]
  },
  interstage: {
    title: "Interstage",
    subtitle: "Stage Connection & Separation",
    description: "The interstage connects the first and second stages. It houses the pneumatic pushers that separate the stages during flight. The grid fins are also stowed here during ascent.",
    specs: [
        { label: "Length", value: "Estimated ~8m" },
        { label: "Material", value: "Carbon Fiber Composite" },
        { label: "System", value: "Pneumatic Pusher" }
    ],
    features: [
        "Encloses Merlin Vacuum Engine",
        "Protects engine nozzle during ascent",
        "Houses Grid Fin actuators",
        "Grid fin stowage points"
    ]
  },
  gridfins: {
    title: "Titanium Grid Fins",
    subtitle: "Hypersonic Control Surfaces",
    description: "Hypersonic grid fins orient the rocket during reentry by moving the center of pressure. These heat-resistant titanium fins allow the first stage to steer itself through the atmosphere for a precise landing.",
    specs: [
        { label: "Material", value: "Cast Titanium" },
        { label: "Actuation", value: "Open Hydraulic System" },
        { label: "Quantity", value: "4 Fins" }
    ],
    features: [
        "Withstands reentry temperatures",
        "Foldable for ascent aerodynamics",
        "Precise landing site targeting",
        "Passive thermal protection"
    ]
  },
  "merlin 9 boosters": {
    title: "First Stage / Octaweb",
    subtitle: "Main Propulsion System",
    description: "The Octaweb houses nine Merlin 1D engines. These engines burn RP-1 rocket grade kerosene and liquid oxygen, generating over 1.7 million pounds of thrust at sea level to lift the vehicle off the pad.",
    specs: [
        { label: "Engines", value: "9x Merlin 1D" },
        { label: "Thrust (SL)", value: "7,607 kN / 1.7M lbf" },
        { label: "Thrust (Vac)", value: "8,227 kN / 1.8M lbf" },
        { label: "TWR", value: "> 150:1 (Engine)" }
    ],
    features: [
        "Octaweb stress distribution structure",
        "Deep throttling capability",
        "Propulsive landing capability",
        "Engine-out redundancy"
    ]
  },
};

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-black font-mono text-sm bg-white/90 p-4 rounded border border-black/10 shadow-lg backdrop-blur z-50 whitespace-nowrap">
        Loading Schematic... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// --- ROCKET SECTION COMPONENT ---
const RocketSection = forwardRef(({ config, exploded, setHovered }: any, ref: any) => {
  const { scene: originalScene } = useGLTF(config.file);
  const scene = useMemo(() => originalScene.clone(), [originalScene]);
  const internalRef = useRef<THREE.Group>(null);
  const groupRef = ref || internalRef;

  useMemo(() => {
    scene.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.geometry) {
          node.geometry.computeVertexNormals();
        }
        if (config.baseMaterial === "white" && !config.accentMaterial) {
          node.material = new THREE.MeshStandardMaterial({
            color: "#ffffff", roughness: 0.3, metalness: 0.1,
          });
        } 
        else if (config.baseMaterial === "black") {
          node.material = new THREE.MeshStandardMaterial({
            color: "#151515", roughness: 0.4, metalness: 0.3,
          });
        }
        else if (config.baseMaterial === "white" && config.accentMaterial === "black") {
          const name = node.name.toLowerCase();
          const isEngineOrFin = name.includes("engine") || name.includes("nozzle") || name.includes("leg") || name.includes("octaweb");
          if (isEngineOrFin) {
             node.material = new THREE.MeshStandardMaterial({
              color: "#151515", roughness: 0.5, metalness: 0.5,
            });
          } else {
            node.material = new THREE.MeshStandardMaterial({
              color: "#ffffff", roughness: 0.3, metalness: 0.1,
            });
          }
        }
      }
    });
  }, [scene, config]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const offsetValue = exploded * config.explodeOffset;
    const targetPos: [number, number, number] = [0, 0, 0];
    if (config.explodeAxis === "x") {
      targetPos[0] = offsetValue; 
    } else if (config.explodeAxis === "z") {
      targetPos[2] = offsetValue; 
    } else {
      targetPos[1] = offsetValue; 
    }
    easing.damp3(groupRef.current.position, targetPos, 0.3, delta);
  });

  return (
    <group 
      ref={groupRef} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
    </group>
  );
});
RocketSection.displayName = "RocketSection";

// --- ZOOM INDICATOR ---
function ZoomIndicator({ controlsRef }: { controlsRef: any }) {
  const [zoomPct, setZoomPct] = useState(100);
  const { camera } = useThree();
  const BASE_DIST = 500; 

  useFrame(() => {
    if (!controlsRef.current) return;
    const dist = camera.position.distanceTo(controlsRef.current.getTarget(new THREE.Vector3()));
    const pct = Math.round((BASE_DIST / dist) * 100);
    setZoomPct(pct);
  });

  return (
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none', zIndex: 100 }} zIndexRange={[100, 0]}>
      <div className="fixed top-20 right-8 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-black/5">
        <Search className="w-3 h-3 text-neutral-500" />
        <span className="text-xs font-mono font-bold text-neutral-700">{zoomPct}%</span>
      </div>
    </Html>
  );
}

// --- SCENE CONTROLLER ---
function SceneController({ currentZone, cameraControlsRef, partsRefs }: any) {
  const prevZone = useRef(currentZone);
  const lastCenter = useRef(new THREE.Vector3()); 

  useFrame(() => {
    if (!cameraControlsRef.current) return;

    const targetConfig = ZOOM_ZONES[currentZone as keyof typeof ZOOM_ZONES] || ZOOM_ZONES.overview;

    // Determine which part to track based on refId
    const activePartRef = targetConfig.refId === "middle" ? partsRefs.middle : partsRefs.top;

    // DYNAMIC TRACKING LOGIC
    if (targetConfig.type === "dynamic" && activePartRef?.current) {
        const box = new THREE.Box3().setFromObject(activePartRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center); 

        const zoneChanged = prevZone.current !== currentZone;
        const partMoved = center.distanceTo(lastCenter.current) > 0.1;

        if (zoneChanged || partMoved) {
            // Apply Manual Offsets to the Calculated Center
            const camPos = new THREE.Vector3().copy(center).add(new THREE.Vector3(...targetConfig.offset));
            const camLook = new THREE.Vector3().copy(center).add(new THREE.Vector3(...targetConfig.lookOffset));

            cameraControlsRef.current.setLookAt(
                camPos.x, camPos.y, camPos.z,
                camLook.x, camLook.y, camLook.z,
                true 
            );

            lastCenter.current.copy(center);
            prevZone.current = currentZone;
        }
    } 
    // STATIC LOGIC
    else if (prevZone.current !== currentZone) {
        const { pos, look } = targetConfig;
        if(pos && look) {
            cameraControlsRef.current.setLookAt(
                pos[0], pos[1], pos[2],
                look[0], look[1], look[2],
                true
            );
        }
        prevZone.current = currentZone;
    }
  });

  return null;
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

export default function FalconViewer() {
  const [exploded, setExploded] = useState(0); 
  const [currentZone, setCurrentZone] = useState("overview");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hovered, setHovered] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);
  
  // REFS FOR TRACKING PARTS
  const topPartRef = useRef<THREE.Group>(null);
  const middlePartRef = useRef<THREE.Group>(null);

  const handleZoneClick = (zoneKey: string) => {
    if (zoneKey === "second stage booster" && exploded < 0.2) {
      setWarning("Deploy stage seperation first!");
      setTimeout(() => setWarning(null), 3000);
      return; 
    }
    setWarning(null);
    setCurrentZone(zoneKey);
  };

  const handleReturnToOverview = () => {
    setCurrentZone("overview");
  };

  const isOverview = currentZone === "overview";
  const currentDetails = PART_DETAILS[currentZone];

  return (
    <div className="w-full h-[750px] relative bg-white border border-neutral-200 overflow-hidden shadow-sm group font-sans">
      
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
      <div className={`absolute top-8 left-8 z-50 transition-all duration-500 ${isOverview ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">FALCON 9</h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>

      {/* 2. WARNING POPUP WITH ARROW */}
      {warning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] flex flex-col items-center animate-bounce">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">{warning}</span>
          </div>
          <ArrowDown className="w-10 h-10 text-red-500 filter drop-shadow-md" strokeWidth={3} />
        </div>
      )}

      {/* 3. CLICK TO DRAG PROMPT */}
      <div className={`absolute bottom-8 right-8 z-[60]`}>
         <div className="flex items-center gap-3 bg-white/90 backdrop-blur border border-neutral-200 px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform animate-pulse">
            <MousePointer2 className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Click & Drag to Rotate</span>
         </div>
      </div>

      {/* 4. OVERVIEW PART SELECTION */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 transition-all duration-500 ${isOverview ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className="absolute -top-16 right-0 w-48 text-right flex flex-col items-end gap-1 animate-bounce">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-white/90 px-2 py-1 rounded">
                Click On Each Part To View In More Detail!
            </span>
            <ArrowDown className="w-5 h-5 text-neutral-400 mr-4" />
        </div>

        {Object.keys(ZOOM_ZONES).map((zone) => {
          if (zone === 'overview') return null; 
          return (
            <button
              key={zone}
              onClick={() => handleZoneClick(zone)}
              className="text-right text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-md transition-all duration-200 bg-white/80 text-neutral-400 hover:text-neutral-900 hover:bg-white hover:scale-105 border border-transparent hover:border-neutral-100 shadow-sm"
            >
              {zone}
            </button>
          );
        })}
      </div>

      {/* 5. SIDEBAR: DETAILED VIEW */}
      <div 
        className={`absolute top-0 left-0 h-full w-full md:w-[400px] bg-neutral-950/95 backdrop-blur-xl z-50 text-white shadow-2xl transition-transform duration-700 ease-bezier flex flex-col ${!isOverview ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="p-8 pb-4 shrink-0 border-b border-white/5 relative z-20 bg-neutral-950/50 backdrop-blur-md">
            <div className="flex justify-between items-start gap-4">
                <button 
                    onClick={handleReturnToOverview}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/20 group w-full justify-center mb-4"
                >
                    <CornerUpLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Return to Overview</span>
                </button>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="px-3 py-1 border border-blue-500/30 bg-blue-500/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-blue-400">
                    System Analysis
                </div>
                 <button 
                    onClick={handleReturnToOverview}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors text-neutral-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 relative z-10 pb-40">
            {currentDetails && (
                <>
                    <h2 className="text-4xl font-black tracking-tighter leading-none mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
                        {currentDetails.title}
                    </h2>
                    <h3 className="text-lg text-blue-400 font-medium mb-6 tracking-tight flex items-center gap-2">
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

      {/* 6. SLIDER */}
      <div className={`absolute bottom-40 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-80 md:w-96 p-4 md:p-6 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-500 
        ${!isOverview ? 'opacity-0 pointer-events-none translate-y-20' : 'opacity-100 translate-y-0'}
        ${warning ? 'bg-red-50/90 border-red-200 ring-2 ring-red-400 ring-offset-2' : 'bg-white/90 border-neutral-200'}
      `}>
        
        <div className="flex justify-between w-full text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
          <span>Stowed</span>
          <span className="text-neutral-900">Stage Separation</span>
          <span>Deployed</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={exploded}
          onChange={(e) => setExploded(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 ${warning ? 'bg-red-200 accent-red-500' : 'bg-neutral-200 accent-neutral-900 hover:accent-neutral-700'}`}
        />
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
                  <RocketSection ref={topPartRef} type="top" config={ROCKET_STACK.top} exploded={exploded} setHovered={setHovered} />
                  <RocketSection ref={middlePartRef} type="middle" config={ROCKET_STACK.middle} exploded={exploded} setHovered={setHovered} />
                  <RocketSection type="bottom" config={ROCKET_STACK.bottom} exploded={exploded} setHovered={setHovered} />
              </group>
            </Center>

            <ContactShadows resolution={1024} scale={300} blur={2} opacity={0.2} far={100} color="#000000" />
            
            <CameraControls 
              ref={cameraControlsRef} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.6} 
              minDistance={80} 
              maxDistance={600} 
            />
            
            <ZoomIndicator controlsRef={cameraControlsRef} />
            
            <SceneController 
                currentZone={currentZone} 
                cameraControlsRef={cameraControlsRef} 
                partsRefs={{ top: topPartRef, middle: middlePartRef }}
            />
        </Suspense>
      </Canvas>
    </div>
  );
}
