import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

// --- 1. CONFIGURATION ---
const ROCKET_STACK = {
  top: {
    file: "/rocket-parts/part_top.glb", 
    explodeY: 25,  // Increased from 6 to 25 for dramatic effect
    baseMaterial: "white"
  },
  middle: {
    file: "/rocket-parts/part_middle.glb",
    explodeY: 10,  // Increased from 3 to 10
    baseMaterial: "black" // Interstage/Grid fins
  },
  bottom: {
    file: "/rocket-parts/part_bottom.glb",
    explodeY: 0, 
    baseMaterial: "black" // Engines/Legs
  }
};

// Adjusted coordinates to be further away to fix "too zoomed in" issue
const ZOOM_ZONES = {
  overview:   { pos: [20, 5, 35],   look: [0, 5, 0] }, // Default view (Max Zoom Out)
  fairing:    { pos: [5, 20, 10],   look: [0, 18, 0] },
  interstage: { pos: [6, 12, 8],    look: [0, 10, 0] }, // Grid fins area
  engines:    { pos: [6, -5, 8],    look: [0, -4, 0] },
};

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-black font-mono text-sm bg-white/80 p-4 rounded border border-black/10 shadow-lg backdrop-blur">
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
        
        // Ensure geometry calculates normals for smooth lighting
        if (node.geometry) {
          node.geometry.computeVertexNormals();
        }

        // Apply Materials strictly based on config
        if (config.baseMaterial === "white") {
          node.material = new THREE.MeshStandardMaterial({
            color: "#ffffff", 
            roughness: 0.3, 
            metalness: 0.1,
          });
        } else if (config.baseMaterial === "black") {
          node.material = new THREE.MeshStandardMaterial({
            color: "#151515", // Very dark grey instead of pure black for better definition
            roughness: 0.4, 
            metalness: 0.3,
          });
        }
      }
    });
  }, [scene, config]);

  // Handle Explode Animation
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

// --- SCENE CONTROLLER ---
function SceneController({ currentZone, cameraControlsRef }: any) {
  useEffect(() => {
    if (cameraControlsRef.current && ZOOM_ZONES[currentZone as keyof typeof ZOOM_ZONES]) {
      const { pos, look } = ZOOM_ZONES[currentZone as keyof typeof ZOOM_ZONES];
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
    <div className="w-full h-[600px] relative bg-white border border-neutral-200 overflow-hidden shadow-sm">
      
      {/* 1. HEADER OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">FALCON 9</h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Interactive CAD View</p>
      </div>

      {/* 2. ZOOM CONTROLS */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
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

      {/* 3. SLIDER CONTROL */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 w-72 bg-white/90 p-4 rounded-xl border border-neutral-100 shadow-sm backdrop-blur-sm">
        <div className="flex justify-between w-full text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          <span>Assembled</span>
          <span>Exploded</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={exploded}
          onChange={(e) => setExploded(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
        />
      </div>

      {/* 4. 3D CANVAS */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [20, 5, 35] }}>
        
        <color attach="background" args={['#ffffff']} />
        
        <Suspense fallback={<Loader />}>
            <Environment preset="studio" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />

            <Center top>
              <group rotation={[0, 0, 0]}>
                  <RocketSection type="top" config={ROCKET_STACK.top} exploded={exploded} setHovered={setHovered} />
                  <RocketSection type="middle" config={ROCKET_STACK.middle} exploded={exploded} setHovered={setHovered} />
                  <RocketSection type="bottom" config={ROCKET_STACK.bottom} exploded={exploded} setHovered={setHovered} />
              </group>
            </Center>

            <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.25} far={10} color="#000000" />
            
            {/* CAMERA CONTROLS 
              - minDistance: Prevents zooming too close (inside the model)
              - maxDistance: Prevents zooming out too far (limits to 'overview' distance)
            */}
            <CameraControls 
              ref={cameraControlsRef} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.6} 
              minDistance={10} 
              maxDistance={45} // Locked to keep model visible
            />
            
            <SceneController currentZone={currentZone} cameraControlsRef={cameraControlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
