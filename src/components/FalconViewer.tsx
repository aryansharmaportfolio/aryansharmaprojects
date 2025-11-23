import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, Decal, Environment, OrbitControls, Html, Center, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

// --- 1. CONFIGURATION ---
// These point to the 3 parts you need to export from SolidWorks
const ROCKET_STACK = {
  top: {
    file: "/rocket-parts/part_top.glb", 
    explodeY: 6, // Moves UP 6 meters
    baseMaterial: "white"
  },
  middle: {
    file: "/rocket-parts/part_middle.glb",
    explodeY: 3, // Moves UP 3 meters
    baseMaterial: "black"
  },
  bottom: {
    file: "/rocket-parts/part_bottom.glb",
    explodeY: 0, // Stays put
    baseMaterial: "white",
    hasDecals: true
  }
};

// Camera Zoom Targets
const ZOOM_ZONES = {
  overview: { pos: [10, 5, 15], look: [0, 5, 0] },
  engines: { pos: [4, -2, 4], look: [0, -4, 0] },
  gridfins: { pos: [3, 7, 3], look: [0, 6, 0] },
  interstage: { pos: [4, 9, 4], look: [0, 8, 0] },
  fairing: { pos: [3, 15, 5], look: [0, 13, 0] }
};

function RocketSection({ type, config, exploded, setHovered }: any) {
  // Load the model
  const { scene } = useGLTF(config.file);
  const ref = useRef<THREE.Group>(null);
  
  // Load your textures (Make sure these are in public folder!)
  const logoTex = useTexture('/spacex.png'); 
  const flagTex = useTexture('/flag.png');

  // --- VISUALS: Apply Apple-style materials ---
  useMemo(() => {
    scene.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        
        // Override grey CAD material with nice paint
        if (config.baseMaterial === "white") {
          node.material = new THREE.MeshPhysicalMaterial({
            color: "#ffffff", roughness: 0.25, metalness: 0.1, clearcoat: 0.8
          });
        } else if (config.baseMaterial === "black") {
          node.material = new THREE.MeshStandardMaterial({
            color: "#111111", roughness: 0.8, metalness: 0.2
          });
        }
      }
    });
  }, [scene, config]);

  // --- ANIMATION: The Explode Logic ---
  useFrame((state, delta) => {
    if (!ref.current) return;
    // Move part based on 'exploded' slider value (0 to 1)
    const targetY = exploded * config.explodeY;
    easing.damp3(ref.current.position, [0, targetY, 0], 0.3, delta);
  });

  return (
    <group 
      ref={ref} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} />
      
      {/* --- DECALS: Only on the Bottom Part --- */}
      {config.hasDecals && (
        <>
          {/* SpaceX Logo - Vertical on the side */}
          {/* Adjust 'position' X/Y/Z until it sits on the rocket surface */}
          <Decal 
            position={[0, 3, 1.6]} 
            rotation={[0, 0, -Math.PI/2]} 
            scale={[5, 0.8, 1]} 
            map={logoTex} 
          />
          
          {/* Flag - Near the top of booster */}
          <Decal 
            position={[0, 8, 1.6]} 
            rotation={[0, 0, 0]} 
            scale={[0.8, 0.5, 1]} 
            map={flagTex} 
          />
        </>
      )}
    </group>
  );
}

// --- MAIN COMPONENT ---
export default function FalconViewer() {
  const [exploded, setExploded] = useState(0); // 0 = closed, 1 = open
  const [cameraTarget, setCameraTarget] = useState("overview");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hovered, setHovered] = useState(false);

  return (
    <div className="w-full h-[600px] relative bg-gradient-to-b from-neutral-900 to-neutral-950 overflow-hidden">
      
      {/* --- UI OVERLAYS --- */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-1">FALCON 9</h1>
        <p className="text-white/60 text-sm font-mono uppercase tracking-widest">Interactive Schematic</p>
      </div>

      {/* --- ZOOM LABELS --- */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
        {Object.keys(ZOOM_ZONES).map((zone) => (
          <button
            key={zone}
            onClick={() => setCameraTarget(zone)}
            className={`
              text-right text-sm font-bold tracking-widest uppercase transition-all duration-300
              ${cameraTarget === zone ? "text-white scale-110" : "text-white/40 hover:text-white"}
            `}
          >
            {zone}
          </button>
        ))}
      </div>

      {/* --- SEPARATION SLIDER --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 w-64">
        <label className="text-white/80 text-xs font-bold tracking-widest uppercase">Stage Separation</label>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={exploded}
          onChange={(e) => setExploded(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>

      {/* --- 3D CANVAS --- */}
      <Canvas shadows dpr={[1, 2]}>
        <Rig target={ZOOM_ZONES[cameraTarget as keyof typeof ZOOM_ZONES]} />
        
        <fog attach="fog" args={['#0a0a0a', 10, 50]} />
        <Environment preset="city" />
        <ambientLight intensity={0.4} />
        <spotLight position={[20, 20, 10]} angle={0.15} penumbra={1} intensity={60} castShadow />
        
        <Center top>
          <group rotation={[0, 0, 0]}>
            <RocketSection type="top" config={ROCKET_STACK.top} exploded={exploded} setHovered={setHovered} />
            <RocketSection type="middle" config={ROCKET_STACK.middle} exploded={exploded} setHovered={setHovered} />
            <RocketSection type="bottom" config={ROCKET_STACK.bottom} exploded={exploded} setHovered={setHovered} />
          </group>
        </Center>

        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
        
        <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
    </div>
  );
}

// --- CAMERA RIG (Smooth Zooming) ---
function Rig({ target }: any) {
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, target.pos, 0.4, delta);
    const currentLookAt = new THREE.Vector3(0, 0, 0); 
    easing.damp3(state.controls?.target || currentLookAt, target.look, 0.4, delta);
  });
  return null;
}
