import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { Search, Move, AlertCircle, MousePointerClick, X, ChevronRight, CornerUpLeft } from "lucide-react";

// --- 1. DATA & CONFIGURATION ---

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

// --- EDITABLE COORDINATES SECTION ---
// Instructions:
// 1. 'pos': The [X, Y, Z] coordinates of the floating DOT.
// 2. 'camPos': The [X, Y, Z] coordinates where the CAMERA will move to when clicked.
// 3. 'lookAt': The [X, Y, Z] point the CAMERA will focus on.

const ANNOTATIONS = {
  top: [
    {
      id: "fairing",
      title: "Composite Fairing",
      subtitle: "Payload Protection",
      desc: "Made of carbon composite material, the fairing protects satellites during delivery to orbit.",
      stats: ["Height: 13.1m", "Diameter: 5.2m"],
      // EDIT POSITION OF DOT HERE: [Left/Right, Up/Down, Front/Back]
      pos: [0, 55, 10], 
      // EDIT ZOOM HERE: camPos = Camera Location, lookAt = Focus Point
      camPos: [50, 60, 50], lookAt: [0, 55, 0] 
    },
    {
      id: "second-stage",
      title: "Second Stage",
      subtitle: "Orbital Insertion",
      desc: "Powered by a single Merlin Vacuum Engine, this stage delivers the payload to its final orbit.",
      stats: ["Thrust: 981 kN", "Fuel: LOX/RP-1"],
      pos: [0, 15, 12],
      camPos: [60, 20, 60], lookAt: [0, 15, 0]
    }
  ],
  middle: [
    {
      id: "interstage",
      title: "Interstage",
      subtitle: "Pneumatic Pusher",
      desc: "Connects the first and second stages. It houses the pneumatic pushers.",
      stats: ["Material: Carbon Fiber", "Separation: Pneumatic"],
      pos: [0, 5, 12],
      camPos: [40, 5, 40], lookAt: [0, 5, 0]
    },
    {
      id: "gridfins",
      title: "Titanium Grid Fins",
      subtitle: "Hypersonic Control",
      desc: "These heat-resistant titanium fins manipulate lift and drag during re-entry.",
      stats: ["Material: Cast Titanium", "Control: Hydraulic"],
      pos: [0, 12, 10],
      camPos: [35, 12, 35], lookAt: [0, 12, 0]
    }
  ],
  bottom: [
    {
      id: "first-stage",
      title: "First Stage",
      subtitle: "Reusable Booster",
      desc: "The main structural backbone of the rocket. Incorporates propellant tanks.",
      stats: ["Height: 41.2m", "Diameter: 3.7m"],
      pos: [0, 20, 12],
      camPos: [100, 20, 100], lookAt: [0, 20, 0]
    },
    {
      id: "landing-legs",
      title: "Landing Legs",
      subtitle: "Carbon Fiber Assembly",
      desc: "Four legs made of carbon fiber. They deploy moments before touchdown.",
      stats: ["Span: 18m", "Deployment: Helium"],
      pos: [0, -30, 12],
      camPos: [50, -30, 50], lookAt: [0, -30, 0]
    },
    {
      id: "merlin-engines",
      title: "Octaweb / Merlin 1D",
      subtitle: "Propulsion System",
      desc: "Nine Merlin 1D engines arranged in an Octaweb structure.",
      stats: ["Thrust: 845 kN", "TWR: >150"],
      pos: [0, -42, 12],
      camPos: [30, -50, 30], lookAt: [0, -42, 0]
    }
  ]
};

// Preset views for the buttons on the right (Optional fallback)
const ZOOM_ZONES = {
  overview:             { pos: [300, 50, 400], look: [0, 10, 0] }, 
  fairing:              { pos: [50, 180, 50],  look: [0, 160, 0] },
  "second stage booster": { pos: [60, 110, 60], look: [0, 120, 0] }, 
  interstage:           { pos: [40, 50, 40],   look: [0, 30, 0] },
  gridfins:             { pos: [35, 75, 35],   look: [0, 55, 0] },
  "merlin 9 boosters":  { pos: [20, -70, 20],  look: [0, -45, 0] },
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

// --- SIMPLIFIED ANNOTATION MARKER ---
function AnnotationMarker({ data, onClick, isSelected }: { data: any, onClick: () => void, isSelected: boolean }) {
  return (
    <Html position={data.pos} zIndexRange={[100, 0]}>
      <div 
        className="group relative cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {/* Simplified Transparent Circle */}
        <div className={`
          flex items-center justify-center transition-all duration-500
          ${isSelected ? 'scale-125' : 'hover:scale-110'}
        `}>
            {/* Outer Ring */}
            <div className={`
                absolute w-8 h-8 rounded-full border border-white/40
                ${isSelected ? 'animate-none opacity-100 border-white' : 'animate-ping opacity-20'}
            `} />
            
            {/* Inner Dot */}
            <div className={`
                w-4 h-4 rounded-full backdrop-blur-sm border border-white/80
                ${isSelected ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-white/10 hover:bg-white/30'}
            `} />
        </div>

        {/* Label only appears on hover (removed line connector) */}
        <div className={`
          absolute left-full top-1/2 -translate-y-1/2 ml-4
          transition-all duration-300 pointer-events-none
          ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-2'}
        `}>
          <span className="text-white text-[10px] font-bold tracking-widest uppercase bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
            {data.title}
          </span>
        </div>
      </div>
    </Html>
  );
}

// --- ROCKET SECTION COMPONENT ---
function RocketSection({ config, exploded, setHovered, annotations, onAnnotationClick, selectedAnnotationId }: any) {
  const { scene: originalScene } = useGLTF(config.file);
  const scene = useMemo(() => originalScene.clone(), [originalScene]);
  const groupRef = useRef<THREE.Group>(null);

  useMemo(() => {
    scene.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.geometry) node.geometry.computeVertexNormals();

        if (config.baseMaterial === "white" && !config.accentMaterial) {
          node.material = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.1 });
        } else if (config.baseMaterial === "black") {
          node.material = new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.4, metalness: 0.3 });
        } else if (config.baseMaterial === "white" && config.accentMaterial === "black") {
          const name = node.name.toLowerCase();
          if (name.includes("engine") || name.includes("nozzle") || name.includes("leg") || name.includes("octaweb")) {
             node.material = new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.5, metalness: 0.5 });
          } else {
            node.material = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.1 });
          }
        }
      }
    });
  }, [scene, config]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const offsetValue = exploded * config.explodeOffset;
    const targetPos: [number, number, number] = [0, 0, 0];
    if (config.explodeAxis === "x") targetPos[0] = offsetValue; 
    else if (config.explodeAxis === "z") targetPos[2] = offsetValue; 
    else targetPos[1] = offsetValue; 
    easing.damp3(groupRef.current.position, targetPos, 0.3, delta);
  });

  return (
    <group 
      ref={groupRef} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
       
      {annotations && annotations.map((ann: any) => (
        <AnnotationMarker 
          key={ann.id} 
          data={ann} 
          onClick={() => onAnnotationClick(ann)}
          isSelected={selectedAnnotationId === ann.id}
        />
      ))}
    </group>
  );
}

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
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none', zIndex: 0 }}>
      <div className="fixed top-20 right-8 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-black/5 z-0">
        <Search className="w-3 h-3 text-neutral-500" />
        <span className="text-xs font-mono font-bold text-neutral-700">{zoomPct}%</span>
      </div>
    </Html>
  );
}

// --- MAIN COMPONENT ---
export default function FalconViewer() {
  const [exploded, setExploded] = useState(0); 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hovered, setHovered] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // SIDEBAR & SELECTION STATE
  const [selectedPart, setSelectedPart] = useState<any | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);

  // Handle clicking a specific part dot
  const handleAnnotationClick = (data: any) => {
    setSelectedPart(data);
    // Execute Zoom based on editable coordinates
    if (cameraControlsRef.current && data.camPos && data.lookAt) {
        cameraControlsRef.current.setLookAt(
            data.camPos[0], data.camPos[1], data.camPos[2],
            data.lookAt[0], data.lookAt[1], data.lookAt[2],
            true // animate
        );
    }
  };

  // Handle clicking the "Back" logic
  const handleCloseSidebar = () => {
    setSelectedPart(null);
    // Reset to overview
    const overview = ZOOM_ZONES.overview;
    cameraControlsRef.current?.setLookAt(
        overview.pos[0], overview.pos[1], overview.pos[2],
        overview.look[0], overview.look[1], overview.look[2],
        true
    );
  };

  // Handle manual zone buttons (on the right)
  const handleZoneClick = (zoneKey: string) => {
    if (zoneKey === "second stage booster" && exploded < 0.2) {
      setWarning("Deploy stage seperation first!");
      setTimeout(() => setWarning(null), 3000);
      return; 
    }
    setWarning(null);
    const target = ZOOM_ZONES[zoneKey as keyof typeof ZOOM_ZONES] || ZOOM_ZONES.overview;
    cameraControlsRef.current?.setLookAt(target.pos[0], target.pos[1], target.pos[2], target.look[0], target.look[1], target.look[2], true);
  };

  return (
    <div className="w-full h-[700px] relative bg-white border border-neutral-200 overflow-hidden shadow-sm group select-none font-sans">
      
      {/* --- INTRO OVERLAY --- */}
      <div 
        className={`
          absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center 
          transition-all duration-700 cursor-pointer
          ${hasInteracted ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        onClick={() => setHasInteracted(true)}
      >
        <div className="text-center group-hover:scale-105 transition-transform duration-500">
          <MousePointerClick className="w-16 h-16 text-white mx-auto mb-6 animate-pulse opacity-90" />
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
            CLICK TO START
          </h2>
          <p className="text-white/70 font-mono text-xs uppercase tracking-[0.3em]">
            Interactive 3D Schematic
          </p>
        </div>
      </div>

      {/* 1. TOP BOUNCING PROMPT */}
      <div className={`
        absolute top-8 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-500
        ${hasInteracted && !selectedPart ? 'opacity-100' : 'opacity-0'}
      `}>
         <div className="bg-white/90 backdrop-blur border border-neutral-200 px-4 py-2 rounded-full shadow-sm animate-bounce">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 flex items-center gap-2">
                <MousePointerClick className="w-3 h-3" />
                Click points to explore details
            </p>
         </div>
      </div>

      {/* HEADER */}
      <div className={`absolute top-8 left-8 z-40 pointer-events-none transition-opacity duration-1000 ${!hasInteracted ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">FALCON 9</h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>

      {/* WARNING POPUP */}
      {warning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wide">{warning}</span>
        </div>
      )}

      {/* --- INVISIBLE CLICK-OUT LAYER (When a part is selected) --- */}
      {selectedPart && (
        <div 
            className="absolute inset-0 z-[55] cursor-zoom-out"
            onClick={handleCloseSidebar}
        >
            {/* "Return" Prompt */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur pointer-events-none animate-pulse">
                <p className="text-xs font-mono font-bold flex items-center gap-2">
                    <CornerUpLeft className="w-3 h-3" />
                    CLICK ANYWHERE TO RETURN
                </p>
            </div>
        </div>
      )}

      {/* --- TECH SIDEBAR (RIGHT) --- */}
      <div className={`
        absolute top-0 right-0 bottom-0 w-96 z-[60]
        bg-black/90 backdrop-blur-xl border-l border-white/10
        shadow-2xl transform transition-transform duration-500 ease-out
        flex flex-col text-white
        ${selectedPart ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Close Button */}
        <button 
          onClick={handleCloseSidebar}
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Sidebar Content */}
        {selectedPart && (
          <div className="p-10 flex flex-col h-full overflow-y-auto">
            <div className="mb-8">
              <div className="text-xs font-mono text-blue-400 mb-2 uppercase tracking-widest">Component Detail</div>
              <h2 className="text-4xl font-black tracking-tight mb-1">{selectedPart.title}</h2>
              <div className="h-1 w-20 bg-blue-500/50 rounded-full mb-4"></div>
              <h3 className="text-xl font-light text-white/80">{selectedPart.subtitle}</h3>
            </div>

            <p className="text-white/70 leading-relaxed mb-10 text-sm border-l-2 border-white/10 pl-4">
              {selectedPart.desc}
            </p>

            <div className="space-y-4 mb-auto">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Technical Specifications</h4>
              {selectedPart.stats && selectedPart.stats.map((stat: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm font-mono text-white/90 bg-white/5 p-3 rounded border border-white/5 hover:border-white/20 transition-colors">
                  <ChevronRight className="w-3 h-3 text-blue-400" />
                  {stat}
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">SpaceX // Vehicle Schematic</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. ZOOM BUTTONS (Hidden when sidebar open) */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 transition-all duration-500 delay-100 ${!hasInteracted ? 'opacity-0' : 'opacity-100'} ${selectedPart ? 'translate-x-20 opacity-0 pointer-events-none' : ''}`}>
        {Object.keys(ZOOM_ZONES).map((zone) => (
          <button
            key={zone}
            onClick={() => handleZoneClick(zone)}
            className="text-right text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-md transition-all duration-200 bg-white/80 text-neutral-400 hover:text-neutral-900 hover:bg-white"
          >
            {zone}
          </button>
        ))}
      </div>

      {/* 4. SLIDER (Hidden when sidebar open) */}
      <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-96 bg-white/95 p-6 rounded-2xl border border-neutral-200 shadow-xl backdrop-blur-md transition-all duration-1000 delay-200 ${!hasInteracted ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'} ${selectedPart ? 'translate-y-20 opacity-0 pointer-events-none' : ''}`}>
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
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 hover:accent-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>

      {/* 5. DRAG INDICATOR */}
      <div className={`absolute bottom-8 left-8 z-40 pointer-events-none flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-xl opacity-90 transition-opacity duration-1000 delay-500 ${!hasInteracted ? 'opacity-0' : 'opacity-100'}`}>
        <Move className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Drag to look around</span>
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
                  <RocketSection 
                    type="top" 
                    config={ROCKET_STACK.top} 
                    exploded={exploded} 
                    setHovered={setHovered} 
                    annotations={ANNOTATIONS.top}
                    onAnnotationClick={handleAnnotationClick}
                    selectedAnnotationId={selectedPart?.id}
                  />
                  <RocketSection 
                    type="middle" 
                    config={ROCKET_STACK.middle} 
                    exploded={exploded} 
                    setHovered={setHovered} 
                    annotations={ANNOTATIONS.middle}
                    onAnnotationClick={handleAnnotationClick}
                    selectedAnnotationId={selectedPart?.id}
                  />
                  <RocketSection 
                    type="bottom" 
                    config={ROCKET_STACK.bottom} 
                    exploded={exploded} 
                    setHovered={setHovered} 
                    annotations={ANNOTATIONS.bottom}
                    onAnnotationClick={handleAnnotationClick}
                    selectedAnnotationId={selectedPart?.id}
                  />
              </group>
            </Center>

            <ContactShadows resolution={1024} scale={300} blur={2} opacity={0.2} far={100} color="#000000" />
            
            <CameraControls 
              ref={cameraControlsRef} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.6} 
              minDistance={10} 
              maxDistance={600} 
            />
            
            <ZoomIndicator controlsRef={cameraControlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
