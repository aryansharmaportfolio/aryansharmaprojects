import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { Search, Move } from "lucide-react";

// --- 1. CONFIGURATION ---
const ROCKET_STACK = {
  top: {
    file: "/rocket-parts/part_top.glb", 
    explodeY: 80, // Increased separation distance
    baseMaterial: "white"
  },
  middle: {
    file: "/rocket-parts/part_middle.glb",
    explodeY: 0, 
    baseMaterial: "black"
  },
  bottom: {
    file: "/rocket-parts/part_bottom.glb",
    explodeY: 0, 
    // Changing this to a dark metal because coloring individual engines 
    // is impossible if the model is a single merged mesh.
    baseMaterial: "metal" 
  }
};

// MASSIVELY increased coordinates to handle large-scale models
const ZOOM_ZONES = {
  overview:   { pos: [300, 50, 500], look: [0, 10, 0] }, 
  fairing:    { pos: [50, 100, 100], look: [0, 80, 0] },
  interstage: { pos: [50, 40, 80],   look: [0, 20, 0] }, 
  engines:    { pos: [50, -40, 80],  look: [0, -50, 0] },
};

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-black font-mono text-sm bg-white/90 p-4 rounded border border-black/10 shadow-lg backdrop-blur z-50">
        Loading Model... {progress.toFixed(0)}%
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
        if (config.baseMaterial === "white") {
          node.material = new THREE.MeshStandardMaterial({
            color: "#ffffff", roughness: 0.3, metalness: 0.1,
          });
        } 
        else if (config.baseMaterial === "black") {
          node.material = new THREE.MeshStandardMaterial({
            color: "#151515", roughness: 0.4, metalness: 0.3,
          });
        }
        else if (config.baseMaterial === "metal") {
           // Darker metallic look for the booster to differentiate it 
           // since we can't color engines separately
           node.material = new THREE.MeshStandardMaterial({
            color: "#888888", roughness: 0.2, metalness: 0.8,
          });
        }
      }
    });
  }, [scene, config]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = exploded * config.explodeY;
    easing.damp3(groupRef.current.position, [0, targetY, 0], 0.3, delta);
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

// --- ZOOM INDICATOR COMPONENT ---
function ZoomIndicator({ controlsRef }: { controlsRef: any }) {
  const [zoomPct, setZoomPct] = useState(100);
  const { camera } = useThree();
  // Adjusted base distance for large scale model
  const BASE_DIST = 500; 

  useFrame(() => {
    if (!controlsRef.current) return;
    const dist = camera.position.distanceTo(controlsRef.current.getTarget(new THREE.Vector3()));
    const pct = Math.round((BASE_DIST / dist) * 100);
    setZoomPct(pct);
  });

  // Explicit Z-Index to ensure visibility
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
    // Force initial camera position on mount to prevent "inside model" view
    if (cameraControlsRef.current) {
        const { pos, look } = ZOOM_ZONES[currentZone as keyof typeof ZOOM_ZONES] || ZOOM_ZONES.overview;
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
  const cameraControlsRef = useRef<CameraControls>(null);

  return (
    <div className="w-full h-[700px] relative bg-white border border-neutral-200 overflow-hidden shadow-sm group">
      
      {/* 1. HEADER OVERLAY */}
      <div className="absolute top-8 left-8 z-50 pointer-events-none">
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">FALCON 9</h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Interactive 3D Schematic</p>
      </div>

      {/* 2. ZOOM BUTTONS */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {Object.keys(ZOOM_ZONES).map((zone) => (
          <button
            key={zone}
            onClick={() => setCurrentZone(zone)}
            className={`
              text-right text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-md transition-all duration-200
              ${currentZone === zone 
                ? "bg-neutral-900 text-white shadow-md translate-x-[-4px]" 
                : "bg-white/80 text-neutral-400 hover:text-neutral-900 hover:bg-white"}
            `}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* 3. STAGE SEPARATION SLIDER */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-80 bg-white/90 p-5 rounded-2xl border border-neutral-100 shadow-lg backdrop-blur-md">
        <div className="flex justify-between w-full text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          <span>Stowed</span>
          <span>Stage Separation</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={exploded}
          onChange={(e) => setExploded(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 hover:accent-neutral-700 transition-colors"
        />
      </div>

      {/* 4. DRAG INDICATOR (Always visible now) */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-full shadow-xl">
        <Move className="w-3 h-3" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Drag to look around</span>
      </div>

      {/* 3D CANVAS */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [300, 50, 500], far: 5000 }}>
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Loader />}>
            <Environment preset="studio" />
            <ambientLight intensity={0.6} />
            <directionalLight position={[100, 100, 50]} intensity={1.5} castShadow />

            <Center top>
              <group rotation={[0, 0, 0]}>
                  {/* Top: Moves Up */}
                  <RocketSection type="top" config={ROCKET_STACK.top} exploded={exploded} setHovered={setHovered} />
                  {/* Middle: Stays with Bottom */}
                  <RocketSection type="middle" config={ROCKET_STACK.middle} exploded={exploded} setHovered={setHovered} />
                  {/* Bottom: Static */}
                  <RocketSection type="bottom" config={ROCKET_STACK.bottom} exploded={exploded} setHovered={setHovered} />
              </group>
            </Center>

            <ContactShadows resolution={1024} scale={200} blur={2} opacity={0.25} far={100} color="#000000" />
            
            {/* CAMERA CONTROLS 
               - minDistance={100}: Huge barrier to prevent clipping
               - maxDistance={1000}: Allows zooming out significantly
            */}
            <CameraControls 
              ref={cameraControlsRef} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.6} 
              minDistance={100} 
              maxDistance={1000} 
            />
            
            <ZoomIndicator controlsRef={cameraControlsRef} />
            <SceneController currentZone={currentZone} cameraControlsRef={cameraControlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
