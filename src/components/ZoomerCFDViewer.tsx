import { useState, useRef, useLayoutEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { Search, ArrowDown, X, CornerUpLeft, Hand, Rotate3d, Wind, Layers } from "lucide-react";

// --- CONFIGURATION ---
const ROCKET_PARTS_CONFIG = {
  nose: { file: "/zoomer-parts/zoomer_nose_cone.glb", name: "Nose Cone" },
  inner: { file: "/zoomer-parts/zoomer_inner_tube.glb", name: "Payload Tube" },
  body: { file: "/zoomer-parts/zoomer_body_tube.glb", name: "Airframe" },
  fins: { file: "/zoomer-parts/zoomer_fin_can.glb", name: "Fin Can" }
};

// --- DATA: DETAILS & SPECS ---
const PART_DETAILS: Record<string, any> = {
  "nose cone": {
    title: "Nose Cone",
    subtitle: "Aerodynamic Fairing",
    description: "The nose cone reduces drag and houses the main parachute deployment system.",
    specs: [
      { label: "Material", value: "Fiberglass" },
      { label: "Shape", value: "Von Kármán" },
      { label: "Length", value: "24 inches" }
    ],
    features: ["Metal tip", "GPS Tracker Bay"]
  },
  "airframe": {
    title: "Avionics & Payload",
    subtitle: "Flight Computer Housing",
    description: "The main body tube contains the flight computers and serves as the structural backbone.",
    specs: [
      { label: "Diameter", value: "4 inches" },
      { label: "Material", value: "Blue Tube" },
      { label: "Computers", value: "2x Stratologgers" }
    ],
    features: ["Dual Deploy", "Camera Shroud"]
  },
  "fin can": {
    title: "Fin Can",
    subtitle: "Propulsion Section",
    description: "This section houses the motor mount and handles the immense thrust loads.",
    specs: [
      { label: "Motor", value: "75mm Mount" },
      { label: "Fins", value: "3x Trapezoidal" },
      { label: "Material", value: "G10 Fiberglass" }
    ],
    features: ["Through-the-wall fins", "Aeropack Retainer"]
  }
};

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-black font-mono text-xs bg-white/90 p-3 rounded border border-black/10 shadow-lg backdrop-blur z-50 whitespace-nowrap">
        Calibrating Geometry... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// --- AUTOMATIC STACKING LOGIC ---
// This hook calculates the exact bounding boxes to stack parts automatically.
function useAutoStacking(parts: any) {
    const [offsets, setOffsets] = useState({ nose: 0, inner: 0, body: 0, fins: 0 });
    const [calculated, setCalculated] = useState(false);

    useLayoutEffect(() => {
        // Wait for all parts to be loaded
        if (!parts.body.current || !parts.nose.current || !parts.fins.current) return;

        // 1. Measure BODY (The Anchor)
        const bodyBox = new THREE.Box3().setFromObject(parts.body.current);
        const bodyTopY = bodyBox.max.y;
        const bodyBottomY = bodyBox.min.y;

        // 2. Measure NOSE
        const noseBox = new THREE.Box3().setFromObject(parts.nose.current);
        // We want the BOTTOM of the nose (noseBox.min.y) to touch the TOP of the body (bodyTopY)
        // Offset = TargetY - CurrentY
        const noseOffset = bodyTopY - noseBox.min.y;

        // 3. Measure FINS
        const finsBox = new THREE.Box3().setFromObject(parts.fins.current);
        // We want the TOP of the fins (finsBox.max.y) to touch the BOTTOM of the body (bodyBottomY)
        const finsOffset = bodyBottomY - finsBox.max.y;

        // 4. Measure INNER TUBE (Payload)
        // Usually sits inside body, slightly offset up? Let's center it in the top half of body.
        const innerOffset = bodyTopY - 10; // Simple manual adjustment for internal part

        setOffsets({
            body: 0,
            nose: noseOffset,
            fins: finsOffset,
            inner: innerOffset
        });
        setCalculated(true);

    }, [parts.body.current, parts.nose.current, parts.fins.current]);

    return { offsets, calculated };
}

// --- INDIVIDUAL ROCKET PART ---
// Updated to strictly preserve colors
const RocketPart = ({ type, file, exploded, offset, onHover }: any) => {
  const { scene } = useGLTF(file);
  const ref = useRef<THREE.Group>(null);
  
  // Clone logic removed to ensure materials are absolutely preserved.
  // We use the primitive directly. 
  
  useFrame((_, delta) => {
    if (!ref.current) return;
    
    // EXPLOSION LOGIC
    // We explode relative to the calculated "offset" (the stack position)
    let explodeY = 0;
    if (exploded > 0) {
        if (type === 'nose') explodeY = exploded * 40;
        if (type === 'inner') explodeY = exploded * 20;
        if (type === 'fins') explodeY = exploded * -40;
    }

    const targetY = offset + explodeY;
    easing.damp3(ref.current.position, [0, targetY, 0], 0.3, delta);
  });

  return (
    <group ref={ref} onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)}>
        {/* Pass the scene directly to preserve original materials */}
        <primitive object={scene} />
    </group>
  );
};

// --- CFD VISUALIZATION ---
function CFDStreamlines({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 300;
  const [dummy] = useState(() => new THREE.Object3D());
  
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      y: (Math.random() - 0.5) * 300,
      x: (Math.random() - 0.5) * 60,
      z: (Math.random() - 0.5) * 60,
      speed: Math.random() * 0.5 + 0.5
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current || !visible) return;
    particles.forEach((p, i) => {
      p.y -= p.speed * 80 * delta; 
      if (p.y < -150) p.y = 150;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(0.1, p.speed * 5, 0.1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.2, 0.2, 1, 4]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
    </instancedMesh>
  );
}

// --- MAIN ROCKET ASSEMBLY MANAGER ---
function RocketAssembly({ exploded, onHover }: { exploded: number, onHover: (v: boolean) => void }) {
    // We need refs to pass to the auto-stacker
    const noseRef = useRef(null);
    const bodyRef = useRef(null);
    const innerRef = useRef(null);
    const finsRef = useRef(null);
    
    // "Dummy" components to load the GLBs first so we can measure them
    const { scene: noseScene } = useGLTF(ROCKET_PARTS_CONFIG.nose.file);
    const { scene: bodyScene } = useGLTF(ROCKET_PARTS_CONFIG.body.file);
    const { scene: innerScene } = useGLTF(ROCKET_PARTS_CONFIG.inner.file);
    const { scene: finsScene } = useGLTF(ROCKET_PARTS_CONFIG.fins.file);

    // Create refs for measurement
    // We attach these refs to invisible helper objects first to calculate geometry
    const partsRefs = useMemo(() => ({
        nose: { current: noseScene },
        body: { current: bodyScene },
        fins: { current: finsScene }
    }), [noseScene, bodyScene, finsScene]);

    const { offsets, calculated } = useAutoStacking(partsRefs);

    if (!calculated) return null;

    return (
        <group>
            <RocketPart type="nose" file={ROCKET_PARTS_CONFIG.nose.file} exploded={exploded} offset={offsets.nose} onHover={onHover} />
            <RocketPart type="inner" file={ROCKET_PARTS_CONFIG.inner.file} exploded={exploded} offset={offsets.inner} onHover={onHover} />
            <RocketPart type="body" file={ROCKET_PARTS_CONFIG.body.file} exploded={exploded} offset={offsets.body} onHover={onHover} />
            <RocketPart type="fins" file={ROCKET_PARTS_CONFIG.fins.file} exploded={exploded} offset={offsets.fins} onHover={onHover} />
        </group>
    );
}

// --- UI COMPONENTS ---
function ZoomIndicator({ controlsRef }: { controlsRef: any }) {
  const [zoomPct, setZoomPct] = useState(100);
  const { camera } = useThree();
  useFrame(() => {
    if (!controlsRef.current) return;
    const dist = camera.position.distanceTo(controlsRef.current.getTarget(new THREE.Vector3()));
    setZoomPct(Math.round((200 / dist) * 100));
  });
  return (
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none', zIndex: 40 }} zIndexRange={[40, 0]}>
      <div className="fixed top-24 right-6 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-black/5">
        <Search className="w-3 h-3 text-neutral-500" />
        <span className="text-xs font-mono font-bold text-neutral-700">{zoomPct}%</span>
      </div>
    </Html>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function ZoomerCFDViewer() {
  const [exploded, setExploded] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hovered, setHovered] = useState(false);
  const [showCFD, setShowCFD] = useState(true);
  const cameraControlsRef = useRef<CameraControls>(null);

  return (
    <div className="w-full h-[600px] sm:h-[750px] relative bg-neutral-100 border border-neutral-200 overflow-hidden shadow-sm group font-sans rounded-xl">
      
      {/* HEADER */}
      <div className="absolute top-6 left-6 z-50">
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter italic">ZOOMER L2</h1>
        <div className="flex items-center gap-2 mt-1">
           <Layers className="w-3 h-3 text-blue-500" />
           <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Auto-Assembled Model</p>
        </div>
      </div>

      {/* CFD TOGGLE */}
      <div className="absolute top-6 right-6 z-50">
          <button 
             onClick={() => setShowCFD(!showCFD)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${showCFD ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-900'}`}
          >
              <Wind className="w-3 h-3" />
              {showCFD ? "Flow: ON" : "Flow: OFF"}
          </button>
      </div>

      {/* SLIDER */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-80 p-4 rounded-2xl bg-white/80 border border-neutral-200 shadow-xl backdrop-blur-md">
        <div className="flex justify-between w-full text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
          <span>Stowed</span>
          <span className="text-neutral-900">Exploded View</span>
        </div>
        <input 
          type="range" min="0" max="1" step="0.01" value={exploded}
          onChange={(e) => setExploded(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* 3D SCENE */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [150, 50, 150] }}>
        <color attach="background" args={['#f5f5f5']} />
        
        <Suspense fallback={<Loader />}>
            {/* LIGHTING FIX: 
               1. Using 'city' preset for neutral, realistic reflections (better for colors).
               2. Lowered direct light intensity so it doesn't wash out the orange/black.
            */}
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[50, 100, 50]} intensity={1} castShadow />

            <Center top>
               <RocketAssembly exploded={exploded} onHover={setHovered} />
               <CFDStreamlines visible={showCFD} />
            </Center>

            <ContactShadows resolution={1024} scale={300} blur={2} opacity={0.2} far={100} color="#000000" />
            
            <CameraControls ref={cameraControlsRef} minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} minDistance={50} maxDistance={400} />
            <ZoomIndicator controlsRef={cameraControlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
