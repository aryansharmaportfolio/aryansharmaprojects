import { useState, useRef, useMemo, Suspense, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { AlertCircle, ArrowDown, ChevronRight, ChevronDown, X, CornerUpLeft, Hand, Rotate3d } from "lucide-react";

// --- TYPE DEFINITIONS ---
type StaticZone = { pos: number[]; look: number[]; type: "static" };
type DynamicZone = { offset: number[]; lookOffset: number[]; type: "dynamic"; refId: string };
type ZoomZone = StaticZone | DynamicZone;

// --- CONFIGURATION ---
const ROCKET_STACK = {
  top: { file: "/rocket-parts/part_top.glb", explodeOffset: -120, explodeAxis: "z", baseMaterial: "white" },
  middle: { file: "/rocket-parts/part_middle.glb", explodeOffset: 0, explodeAxis: "y", baseMaterial: "black" },
  bottom: { file: "/rocket-parts/part_bottom.glb", explodeOffset: 0, explodeAxis: "y", baseMaterial: "white", accentMaterial: "black" }
};

const ZOOM_ZONES: Record<string, ZoomZone> = {
  overview: { pos: [250, 40, 350], look: [0, 10, 0], type: "static" },
  fairing: { offset: [100, 30, -160], lookOffset: [-80, 15, -40], type: "dynamic", refId: "top" },
  "second stage booster": { offset: [60, 15, 80], lookOffset: [0, 25, 0], type: "dynamic", refId: "top" },
  interstage: { offset: [170, 100, 10], lookOffset: [-40, 95, 0], type: "dynamic", refId: "middle" },
  gridfins: { pos: [-2, 100, 230], look: [0, 45, 200], type: "static" },
  "merlin 9 boosters": { pos: [15, 90, 280], look: [0, -35, 200], type: "static" },
};

const PART_DETAILS: Record<string, { title: string; subtitle: string; description: string; specs: { label: string; value: string }[]; features: string[] }> = {
  fairing: {
    title: "Payload Fairing", subtitle: "Composite Payload Protection",
    description: "The fairing protects satellites during ascent through Earth's atmosphere. Made of carbon composite, it's jettisoned ~3 minutes into flight.",
    specs: [{ label: "Height", value: "13.1 m" }, { label: "Diameter", value: "5.2 m" }, { label: "Mass", value: "~1900 kg" }, { label: "Material", value: "Carbon Composite" }],
    features: ["Pneumatic separation", "Recoverable via sea vessels", "Acoustic absorption", "Radio-transparent windows"]
  },
  "second stage booster": {
    title: "Second Stage", subtitle: "Orbital Insertion",
    description: "Powered by a single Merlin Vacuum Engine, the second stage delivers payloads to orbit with multiple restart capability.",
    specs: [{ label: "Engine", value: "1x Merlin Vac" }, { label: "Thrust", value: "981 kN" }, { label: "Burn Time", value: "397 sec" }, { label: "Propellant", value: "LOX / RP-1" }],
    features: ["Multiple restart capability", "Redundant computers", "N2 attitude thrusters", "Al-Li alloy tanks"]
  },
  interstage: {
    title: "Interstage", subtitle: "Stage Separation",
    description: "Connects first and second stages. Houses pneumatic pushers for separation and grid fin actuators.",
    specs: [{ label: "Length", value: "~8m" }, { label: "Material", value: "Carbon Fiber" }, { label: "System", value: "Pneumatic" }],
    features: ["Engine enclosure", "Nozzle protection", "Grid Fin actuators", "Stowage points"]
  },
  gridfins: {
    title: "Grid Fins", subtitle: "Hypersonic Control",
    description: "Titanium grid fins orient the rocket during reentry for precise landing.",
    specs: [{ label: "Material", value: "Titanium" }, { label: "Actuation", value: "Hydraulic" }, { label: "Quantity", value: "4 Fins" }],
    features: ["Reentry resistant", "Foldable design", "Precise targeting", "Thermal protection"]
  },
  "merlin 9 boosters": {
    title: "Octaweb", subtitle: "Main Propulsion",
    description: "Nine Merlin 1D engines generate 1.7M lbf thrust at sea level to lift the vehicle.",
    specs: [{ label: "Engines", value: "9x Merlin 1D" }, { label: "Thrust (SL)", value: "7,607 kN" }, { label: "Thrust (Vac)", value: "8,227 kN" }, { label: "TWR", value: "> 150:1" }],
    features: ["Octaweb structure", "Deep throttling", "Propulsive landing", "Engine-out redundancy"]
  },
};

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-black font-mono text-xs bg-white/90 p-3 rounded border border-black/10 shadow-lg backdrop-blur z-50 whitespace-nowrap">
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// --- ROCKET SECTION ---
const RocketSection = forwardRef(({ config, exploded, setHovered }: any, ref: any) => {
  const gltf = useGLTF(config.file) as any;
  const originalScene = gltf.scene as THREE.Group;
  const scene = useMemo(() => originalScene.clone(), [originalScene]);
  const internalRef = useRef<THREE.Group>(null);
  const groupRef = ref || internalRef;

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
          const isEngineOrFin = name.includes("engine") || name.includes("nozzle") || name.includes("leg") || name.includes("octaweb");
          node.material = isEngineOrFin 
            ? new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.5, metalness: 0.5 })
            : new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3, metalness: 0.1 });
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
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <primitive object={scene} />
    </group>
  );
});
RocketSection.displayName = "RocketSection";

// --- SCENE CONTROLLER ---
function SceneController({ currentZone, cameraControlsRef, partsRefs }: any) {
  const prevZone = useRef(currentZone);
  const lastCenter = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!cameraControlsRef.current) return;
    const targetConfig = ZOOM_ZONES[currentZone];
    if (!targetConfig) return;

    if (targetConfig.type === "dynamic") {
      const dynamicConfig = targetConfig as DynamicZone;
      const activePartRef = dynamicConfig.refId === "middle" ? partsRefs.middle : partsRefs.top;
      if (activePartRef?.current) {
        const box = new THREE.Box3().setFromObject(activePartRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const zoneChanged = prevZone.current !== currentZone;
        const partMoved = center.distanceTo(lastCenter.current) > 0.1;
        if (zoneChanged || partMoved) {
          const camPos = new THREE.Vector3().copy(center).add(new THREE.Vector3(...dynamicConfig.offset));
          const camLook = new THREE.Vector3().copy(center).add(new THREE.Vector3(...dynamicConfig.lookOffset));
          cameraControlsRef.current.setLookAt(camPos.x, camPos.y, camPos.z, camLook.x, camLook.y, camLook.z, true);
          lastCenter.current.copy(center);
          prevZone.current = currentZone;
        }
      }
    } else if (prevZone.current !== currentZone) {
      const staticConfig = targetConfig as StaticZone;
      cameraControlsRef.current.setLookAt(staticConfig.pos[0], staticConfig.pos[1], staticConfig.pos[2], staticConfig.look[0], staticConfig.look[1], staticConfig.look[2], true);
      prevZone.current = currentZone;
    }
  });

  return null;
}

// --- INSTRUCTION OVERLAY ---
function InstructionOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div onClick={onDismiss} className="absolute inset-0 z-[200] bg-neutral-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
            <Rotate3d className="w-6 h-6 text-white animate-[spin_8s_linear_infinite]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white text-black p-1.5 rounded-full shadow-lg animate-bounce">
            <Hand className="w-3 h-3" />
          </div>
        </div>
        <h2 className="text-xl font-black text-white tracking-tighter uppercase mb-2">Tap to Explore</h2>
        <div className="flex items-center gap-2 text-blue-200 text-[10px] font-bold tracking-[0.1em] uppercase bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <span>Drag</span>
          <div className="w-1 h-1 bg-white rounded-full opacity-50" />
          <span>Pinch</span>
        </div>
      </div>
    </div>
  );
}

// --- ACCORDION ---
function DetailAccordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-3 flex items-center justify-between text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>{children}</div>
    </div>
  );
}

export default function FalconViewerMobile() {
  const [exploded, setExploded] = useState(0);
  const [currentZone, setCurrentZone] = useState("overview");
  const [hovered, setHovered] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const cameraControlsRef = useRef<CameraControls>(null);
  const topPartRef = useRef<THREE.Group>(null);
  const middlePartRef = useRef<THREE.Group>(null);
  const bottomPartRef = useRef<THREE.Group>(null);

  const handleZoneClick = (zoneKey: string) => {
    if (zoneKey === "second stage booster" && exploded < 0.2) {
      setWarning("Deploy separation first!");
      setTimeout(() => setWarning(null), 3000);
      return;
    }
    setWarning(null);
    setCurrentZone(zoneKey);
  };

  const isOverview = currentZone === "overview";
  const currentDetails = PART_DETAILS[currentZone];

  const ZONE_SHORT_NAMES: Record<string, string> = {
    fairing: "Fairing",
    "second stage booster": "2nd Stage",
    interstage: "Interstage",
    gridfins: "Grid Fins",
    "merlin 9 boosters": "Merlin 9",
  };

  return (
    <div className="w-full h-[400px] relative bg-white border border-neutral-200 overflow-hidden shadow-sm font-sans">
      
      {/* HEADER */}
      <div className={`absolute top-3 left-3 z-50 transition-all duration-500 ${isOverview ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <h1 className="text-lg font-black text-neutral-900 tracking-tighter">FALCON 9</h1>
        <p className="text-neutral-500 text-[8px] font-bold uppercase tracking-widest">3D Model</p>
      </div>

      {/* WARNING */}
      {warning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] animate-bounce">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-bold text-xs">{warning}</span>
          </div>
        </div>
      )}

      {/* INSTRUCTION OVERLAY */}
      {!hasInteracted && <InstructionOverlay onDismiss={() => setHasInteracted(true)} />}

      {/* PART SELECTION - Horizontal at bottom */}
      <div className={`absolute z-40 transition-all duration-500 bottom-24 left-3 right-3 ${isOverview ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {Object.keys(ZOOM_ZONES).map((zone) => {
            if (zone === 'overview') return null;
            return (
              <button key={zone} onClick={() => handleZoneClick(zone)} className="shrink-0 text-[9px] font-bold tracking-wider uppercase px-3 py-2 rounded-md bg-white/95 text-neutral-600 active:bg-neutral-100 border border-neutral-200 shadow-sm">
                {ZONE_SHORT_NAMES[zone] || zone}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SHEET - Details panel */}
      <div className={`absolute z-50 bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-xl text-white rounded-t-2xl shadow-2xl transition-transform duration-500 ${!isOverview ? 'translate-y-0' : 'translate-y-full'}`} style={{ maxHeight: '55%' }}>
        <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mt-2" />
        
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          <button onClick={() => setCurrentZone("overview")} className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-bold uppercase">
            <CornerUpLeft className="w-3 h-3" />
            Back
          </button>
          <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Analysis</span>
          <button onClick={() => setCurrentZone("overview")} className="p-1 text-neutral-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 pb-8" style={{ maxHeight: 'calc(55vh - 60px)' }}>
          {currentDetails && (
            <>
              <h2 className="text-xl font-black tracking-tighter mb-1 text-white">{currentDetails.title}</h2>
              <h3 className="text-xs text-blue-400 font-medium mb-3">{currentDetails.subtitle}</h3>
              <p className="text-neutral-300 text-[11px] leading-relaxed mb-4 border-l-2 border-blue-500 pl-3">{currentDetails.description}</p>
              
              <DetailAccordion title="Specs" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-2">
                  {currentDetails.specs.map((spec, i) => (
                    <div key={i} className="bg-white/5 p-2 rounded-lg">
                      <span className="text-[7px] uppercase text-neutral-500 block">{spec.label}</span>
                      <span className="text-[10px] font-mono text-blue-100">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </DetailAccordion>
              
              <DetailAccordion title="Features" defaultOpen={false}>
                <ul className="space-y-1">
                  {currentDetails.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-neutral-300">
                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </DetailAccordion>
            </>
          )}
        </div>
      </div>

      {/* SLIDER - Fixed at bottom when in overview */}
      <div className={`absolute bottom-4 left-3 right-3 z-40 p-3 bg-white/95 backdrop-blur border border-neutral-200 rounded-xl shadow-lg transition-all duration-500 ${!isOverview ? 'opacity-0 pointer-events-none translate-y-20' : 'opacity-100'} ${warning ? 'border-red-300 ring-2 ring-red-400' : ''}`}>
        <div className="flex justify-between text-[8px] font-bold text-neutral-500 uppercase mb-1">
          <span>Stowed</span>
          <span className="text-neutral-900">Separation</span>
          <span>Deployed</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={exploded} onChange={(e) => setExploded(parseFloat(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-neutral-200 accent-neutral-900" />
      </div>

      {/* 3D CANVAS */}
      <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 50, position: [250, 40, 350], far: 5000 }}>
        <color attach="background" args={['#ffffff']} />
        <Suspense fallback={<Loader />}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[100, 100, 50]} intensity={1.5} castShadow />
          <Center top>
            <group rotation={[0, 0, 0]}>
              <RocketSection ref={topPartRef} config={ROCKET_STACK.top} exploded={exploded} setHovered={setHovered} />
              <RocketSection ref={middlePartRef} config={ROCKET_STACK.middle} exploded={exploded} setHovered={setHovered} />
              <RocketSection ref={bottomPartRef} config={ROCKET_STACK.bottom} exploded={exploded} setHovered={setHovered} />
            </group>
          </Center>
          <ContactShadows resolution={512} scale={250} blur={2} opacity={0.2} far={100} color="#000000" />
          <CameraControls ref={cameraControlsRef} minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} minDistance={120} maxDistance={450} />
          <SceneController currentZone={currentZone} cameraControlsRef={cameraControlsRef} partsRefs={{ top: topPartRef, middle: middlePartRef }} />
        </Suspense>
      </Canvas>
    </div>
  );
}
