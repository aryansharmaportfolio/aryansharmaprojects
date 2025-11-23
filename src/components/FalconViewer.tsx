import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { Search, Move, AlertCircle, MousePointerClick, X, ChevronRight, ArrowDown, Info, Minimize } from "lucide-react";

// --- 1. CONFIGURATION & DATA ---

// EDITING INSTRUCTIONS:
// 1. markerPos: [X, Y, Z] -> Controls where the floating circle appears relative to the part.
//    - Y is Vertical (Up/Down)
//    - Z is Depth (Forward/Back)
//    - X is Horizontal (Left/Right)
// 2. camPos: [X, Y, Z] -> Where the camera moves TO when you click the marker.
// 3. lookAt: [X, Y, Z] -> What point the camera looks AT when zoomed in.

const ANNOTATIONS = {
  top: [
    {
      id: "fairing",
      title: "Composite Fairing",
      subtitle: "Payload Protection",
      desc: "Made of carbon composite material, the fairing protects satellites during delivery to orbit. It is jettisoned approximately 3 minutes into flight.",
      stats: ["Height: 13.1m", "Diameter: 5.2m", "Mass: 1900kg"],
      // Edit these numbers to move the pointer: [Horizontal, Vertical, Depth]
      markerPos: [0, 55, 6], 
      // Edit these numbers to change the zoomed-in view:
      camPos: [40, 60, 40], 
      lookAt: [0, 55, 0]
    },
    {
      id: "second-stage",
      title: "Second Stage",
      subtitle: "Orbital Insertion",
      desc: "Powered by a single Merlin Vacuum Engine, this stage delivers the payload to its final orbit. It carries its own fuel and oxidizer.",
      stats: ["Thrust: 981 kN", "Burn Time: 397s", "Fuel: LOX/RP-1"],
      markerPos: [0, 15, 6],
      camPos: [40, 20, 40],
      lookAt: [0, 15, 0]
    }
  ],
  middle: [
    {
      id: "interstage",
      title: "Interstage",
      subtitle: "Pneumatic Pusher",
      desc: "Connects the first and second stages. It houses the pneumatic pushers and protects the vacuum engine during ascent.",
      stats: ["Material: Carbon Fiber", "Separation: Pneumatic"],
      markerPos: [0, 6, 6],
      camPos: [30, 10, 30],
      lookAt: [0, 5, 0]
    },
    {
      id: "gridfins",
      title: "Titanium Grid Fins",
      subtitle: "Hypersonic Control",
      desc: "These heat-resistant titanium fins manipulate lift and drag during the booster's re-entry to steer it to the landing zone.",
      stats: ["Material: Cast Titanium", "Control: Hydraulic/Electric"],
      markerPos: [0, 14, 6], // Moved up slightly
      camPos: [25, 25, 25],
      lookAt: [0, 12, 0]
    }
  ],
  bottom: [
    {
      id: "first-stage",
      title: "First Stage",
      subtitle: "Reusable Booster",
      desc: "The main structural backbone of the rocket. It incorporates the propellant tanks for the 9 Merlin engines.",
      stats: ["Height: 41.2m", "Diameter: 3.7m", "Empty Mass: 25,600kg"],
      markerPos: [0, 20, 6],
      camPos: [60, 20, 60],
      lookAt: [0, 20, 0]
    },
    {
      id: "merlin-engines",
      title: "Merlin 1D Engines",
      subtitle: "Propulsion System",
      desc: "Nine Merlin 1D engines arranged in an Octaweb structure. They provide 1.7 million pounds of thrust at liftoff.",
      stats: ["Thrust: 845 kN", "ISP: 282s", "Configuration: Octaweb"],
      markerPos: [0, -42, 6],
      camPos: [20, -60, 30], // Low angle looking up
      lookAt: [0, -45, 0]
    }
  ]
};

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

// --- ANNOTATION MARKER COMPONENT ---
// Sleek, transparent circle design
function AnnotationMarker({ data, onClick, isSelected }: { data: any, onClick: () => void, isSelected: boolean }) {
  return (
    <Html position={data.markerPos} zIndexRange={[100, 0]}>
      <div 
        className="group relative cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {/* Outer Ring - Expands on hover */}
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          rounded-full border border-white/40 transition-all duration-500 ease-out
          ${isSelected ? 'w-12 h-12 border-white/80 opacity-100' : 'w-8 h-8 opacity-50 group-hover:w-10 group-hover:opacity-80'}
        `} />
        
        {/* Inner Dot */}
        <div className={`
          w-2 h-2 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]
          transition-transform duration-300
          ${isSelected ? 'scale-150' : 'scale-100 group-hover:scale-125'}
        `} />

        {/* Label (Hidden by default, shows on hover) */}
        <div className={`
          absolute left-[2rem] top-1/2 -translate-y-1/2 whitespace-nowrap
          transition-all duration-300 pointer-events-none
          ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 translate-x-2'}
        `}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
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
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none', zIndex: 50 }} zIndexRange={[100, 0]}>
      <div className="fixed top-20 right-8 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-black/5">
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
  const [showSliderHint, setShowSliderHint] = useState(false);
  
  const [selectedPart, setSelectedPart] = useState<any | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);

  // Main Interaction Handler
  const handleAnnotationClick = (annotation: any) => {
    // Guard: Require separation for internal parts
    if (annotation.id === "second-stage" && exploded < 0.2) {
      setWarning("Deploy stage separation to view!");
      setShowSliderHint(true); 
      setTimeout(() => {
        setWarning(null);
        setShowSliderHint(false);
      }, 4000);
      return; 
    }
    
    setWarning(null);
    setSelectedPart(annotation);

    // FLY TO THE PART
    if (cameraControlsRef.current) {
      cameraControlsRef.current.setLookAt(
        annotation.camPos[0], annotation.camPos[1], annotation.camPos[2], // Eye
        annotation.lookAt[0], annotation.lookAt[1], annotation.lookAt[2], // Target
        true // Animate
      );
    }
  };

  // Handle "Click Out" logic
  const resetView = () => {
    setSelectedPart(null);
    if (cameraControlsRef.current) {
      // Return to Overview
      cameraControlsRef.current.setLookAt(300, 50, 400, 0, 10, 0, true);
    }
  };

  const handleSliderChange = (e: any) => {
    setExploded(parseFloat(e.target.value));
    if (showSliderHint) setShowSliderHint(false);
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

      {/* 1. TOP PROMPTS */}
      <div className={`absolute top-8 left-0 right-0 z-50 pointer-events-none flex flex-col items-center transition-opacity duration-1000 ${!hasInteracted ? 'opacity-0' : 'opacity-100'}`}>
        {/* Bouncing Prompt (Hides when a part is selected) */}
        <div className={`
          flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-black/5
          transition-all duration-500 transform
          ${selectedPart ? 'translate-y-[-200%] opacity-0' : 'translate-y-0 opacity-100 animate-bounce'}
        `}>
          <Info className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-800">Click a part to explore details</span>
        </div>

        {/* Exit Prompt (Shows ONLY when a part is selected) */}
        <div className={`
          absolute top-0 flex items-center gap-2 bg-black/80 text-white backdrop-blur px-4 py-2 rounded-full shadow-lg
          transition-all duration-500 transform
          ${selectedPart ? 'translate-y-0 opacity-100' : 'translate-y-[-200%] opacity-0'}
        `}>
          <Minimize className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Click background to return</span>
        </div>
      </div>

      {/* 2. HEADER (Left) */}
      <div className={`absolute top-8 left-8 z-40 pointer-events-none transition-opacity duration-1000 ${!hasInteracted ? 'opacity-0' : 'opacity-100'}`}>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">FALCON 9</h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>

      {/* 3. WARNING POPUP */}
      {warning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wide">{warning}</span>
        </div>
      )}

      {/* --- TECH SIDEBAR (RIGHT) --- */}
      <div className={`
        absolute top-0 right-0 bottom-0 w-96 z-[60]
        bg-black/85 backdrop-blur-xl border-l border-white/10
        shadow-2xl transform transition-transform duration-500 ease-out
        flex flex-col text-white
        ${selectedPart ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <button 
          onClick={resetView}
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

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

      {/* 4. SLIDER CONTAINER */}
      <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-96 bg-white/95 p-6 rounded-2xl border border-neutral-200 shadow-xl backdrop-blur-md transition-all duration-1000 delay-200 ${!hasInteracted ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'} ${selectedPart ? 'opacity-0 pointer-events-none' : ''}`}>
        
        {showSliderHint && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-red-600 animate-bounce flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-widest bg-white px-2 py-1 rounded shadow mb-1">Slide Me!</span>
            <ArrowDown className="w-8 h-8 fill-current" />
          </div>
        )}

        <div className="flex justify-between w-full text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
          <span>Stowed</span>
          <span className="text-neutral-900">Stage Separation</span>
          <span>Deployed</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={exploded}
          onChange={handleSliderChange}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 hover:accent-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>

      {/* 5. DRAG INDICATOR */}
      <div className={`absolute bottom-8 left-8 z-40 pointer-events-none flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-xl opacity-90 transition-opacity duration-1000 delay-500 ${!hasInteracted ? 'opacity-0' : 'opacity-100'}`}>
        <Move className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Drag to look around</span>
      </div>

      {/* 3D CANVAS */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [300, 50, 400], far: 5000 }} onPointerMissed={resetView}>
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
              minDistance={150} 
              maxDistance={600} 
            />
            
            <ZoomIndicator controlsRef={cameraControlsRef} />
            <SceneController currentZone={currentZone} cameraControlsRef={cameraControlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
