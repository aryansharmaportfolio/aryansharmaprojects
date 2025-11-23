import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { Search, Move, AlertCircle, ArrowDown, ChevronLeft, X } from "lucide-react";

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
const ZOOM_ZONES = {
  overview:             { pos: [300, 50, 400], look: [0, 10, 0] },
  
  fairing:              { pos: [50, 180, 50],  look: [0, 160, 0] },
  
  "second stage booster": { pos: [60, 110, 60], look: [0, 120, 0] }, 
  
  interstage:           { pos: [40, 50, 40],   look: [0, 30, 0] },
  
  gridfins:             { pos: [35, 75, 35],   look: [0, 55, 0] },
  
  "merlin 9 boosters":  { pos: [20, -70, 20],  look: [0, -45, 0] },
};

// --- PART DETAILS DATA ---
const PART_DETAILS: Record<string, { title: string; description: string }> = {
  fairing: {
    title: "Payload Fairing",
    description: "The fairing protects satellites and other payloads during ascent through Earth's atmosphere. Made of carbon composite material, the fairing is jettisoned approximately 3 minutes into flight, allowing the payload to be deployed into orbit.",
  },
  "second stage booster": {
    title: "Second Stage",
    description: "The second stage, powered by a single Merlin Vacuum Engine, delivers the payload to its final orbit. It is designed to restart multiple times in space to place payloads into different trajectories.",
  },
  interstage: {
    title: "Interstage & Pushers",
    description: "The interstage connects the first and second stages. It houses the pneumatic pushers that separate the stages during flight. The grid fins are also stowed here during ascent.",
  },
  gridfins: {
    title: "Titanium Grid Fins",
    description: "Hypersonic grid fins orient the rocket during reentry by moving the center of pressure. These heat-resistant titanium fins allow the first stage to steer itself through the atmosphere for a precise landing.",
  },
  "merlin 9 boosters": {
    title: "Merlin 9 Engines",
    description: "The Octaweb houses nine Merlin 1D engines. These engines burn RP-1 rocket grade kerosene and liquid oxygen, generating over 1.7 million pounds of thrust at sea level to lift the vehicle off the pad.",
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
function RocketSection({ config, exploded, setHovered }: any) {
  const { scene: originalScene } = useGLTF(config.file);
  const scene = useMemo(() => originalScene.clone(), [originalScene]);
  const groupRef = useRef<THREE.Group>(null);

  useMemo(() => {
    scene.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        
        if (node.geometry) {
          node.geometry.computeVertexNormals();
        }

        // --- MATERIAL LOGIC ---
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

  // --- ANIMATION LOGIC ---
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
}

// --- ZOOM INDICATOR ---
function ZoomIndicator({ controlsRef }: { controlsRef: any }) {
  const [zoomPct, setZoomPct] = useState(100);
  const { camera } = useThree();
  const BASE_DIST = 500; // Matches default view distance

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
function SceneController({ currentZone, cameraControlsRef }: any) {
  useEffect(() => {
    if (cameraControlsRef.current && currentZone) {
      const target = ZOOM_ZONES[currentZone as keyof typeof ZOOM_ZONES] || ZOOM_ZONES.overview;
      const { pos, look } = target;
      cameraControlsRef.current.setLookAt(pos[0], pos[1], pos[2], look[0], look[1], look[2], true);
    }
  }, [currentZone, cameraControlsRef]);

  return null;
}

export default function FalconViewer() {
  const [exploded, setExploded] = useState(0); 
  const [currentZone, setCurrentZone] = useState("overview");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hovered, setHovered] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);

  const handleZoneClick = (zoneKey: string) => {
    // Prevent clicking separation dependent parts if not exploded
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
    <div className="w-full h-[700px] relative bg-white border border-neutral-200 overflow-hidden shadow-sm group font-sans">
      
      {/* 1. HEADER OVERLAY */}
      <div className={`absolute top-8 left-8 z-50 transition-opacity duration-500 ${isOverview ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">FALCON 9</h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Interactive 3D Model</p>
      </div>

      {/* 2. WARNING POPUP */}
      {warning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wide">{warning}</span>
        </div>
      )}

      {/* 3. RIGHT SIDE: PART SELECTION & BOUNCING ARROW (Overview Only) */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 transition-all duration-500 ${isOverview ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        
        {/* BOUNCING PROMPT */}
        <div className="absolute -top-16 right-0 w-48 text-right flex flex-col items-end gap-1 animate-bounce">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-white/90 px-2 py-1 rounded">
                Click a part to learn more
            </span>
            <ArrowDown className="w-5 h-5 text-neutral-400 mr-4" />
        </div>

        {Object.keys(ZOOM_ZONES).map((zone) => {
          if (zone === 'overview') return null; // Don't show overview button in list
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

      {/* 4. LEFT SIDE: DETAILED SIDEBAR (Detail View Only) */}
      <div 
        className={`absolute top-0 left-0 h-full w-full md:w-[400px] bg-black/85 backdrop-blur-md z-40 text-white p-12 flex flex-col justify-center transition-transform duration-700 ease-in-out ${!isOverview ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="space-y-6">
            <div className="inline-block px-3 py-1 border border-white/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">
                Component Detail
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9]">
                {currentDetails?.title || currentZone.toUpperCase()}
            </h2>
            
            <div className="w-12 h-1 bg-blue-500/80 rounded-full" />
            
            <p className="text-neutral-300 leading-relaxed text-sm md:text-base font-light opacity-90">
                {currentDetails?.description || "Detailed specifications for this component are currently being updated from the engineering telemetry database."}
            </p>
        </div>

        {/* RETURN BUTTON */}
        <button 
            onClick={handleReturnToOverview}
            className="absolute top-8 right-8 md:left-12 md:right-auto md:top-12 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
        >
            <div className="p-2 rounded-full border border-neutral-600 group-hover:border-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Back to Overview</span>
        </button>
      </div>

      {/* 5. STAGE SEPARATION SLIDER (Visible in both, but dimmed in detail) */}
      <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-96 bg-white/95 p-6 rounded-2xl border border-neutral-200 shadow-xl backdrop-blur-md transition-opacity duration-500 ${!isOverview ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

      {/* 6. DRAG INDICATOR */}
      <div className={`absolute bottom-8 left-8 z-40 pointer-events-none flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-xl opacity-90 transition-opacity duration-300 ${!isOverview ? 'opacity-0' : 'opacity-100'}`}>
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
                  <RocketSection type="top" config={ROCKET_STACK.top} exploded={exploded} setHovered={setHovered} />
                  <RocketSection type="middle" config={ROCKET_STACK.middle} exploded={exploded} setHovered={setHovered} />
                  <RocketSection type="bottom" config={ROCKET_STACK.bottom} exploded={exploded} setHovered={setHovered} />
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
