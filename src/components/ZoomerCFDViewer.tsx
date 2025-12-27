import { useState, useRef, useMemo, Suspense, useEffect, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, CameraControls, Html, Center, ContactShadows, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { Search, ArrowDown, X, CornerUpLeft, Hand, Rotate3d, Wind } from "lucide-react";

// --- TYPE DEFINITIONS ---
type StaticZone = { pos: number[]; look: number[]; type: "static" };
type DynamicZone = { offset: number[]; lookOffset: number[]; type: "dynamic"; refId: string };
type ZoomZone = StaticZone | DynamicZone;

// --- 1. CONFIGURATION (MANUAL ASSEMBLY) ---
// TWEAK THE 'position' Y-VALUES IF YOU SEE GAPS!
const ROCKET_STACK = {
  nose: {
    file: "/zoomer-parts/zoomer_nose_cone.glb",
    position: [0, 52, 0],   // <--- MOVE UP: Sits on top of the body
    explodeOffset: 50,      // Explodes further UP
    explodeAxis: "y",
    name: "Nose Cone"
  },
  inner: {
    file: "/zoomer-parts/zoomer_inner_tube.glb",
    position: [0, 20, 0],   // <--- Inside the body
    explodeOffset: 20,
    explodeAxis: "y",
    name: "Payload Tube"
  },
  body: {
    file: "/zoomer-parts/zoomer_body_tube.glb",
    position: [0, 0, 0],    // <--- CENTER: This is the anchor
    explodeOffset: 0,
    explodeAxis: "y",
    name: "Airframe"
  },
  fins: {
    file: "/zoomer-parts/zoomer_fin_can.glb",
    position: [0, -38, 0],  // <--- MOVE DOWN: Sits below the body
    explodeOffset: -40,     // Explodes DOWN
    explodeAxis: "y",
    name: "Fin Can"
  }
};

// Camera Zones
const ZOOM_ZONES: Record<string, ZoomZone> = {
  overview: { pos: [150, 50, 150], look: [0, 10, 0], type: "static" },
  
  "nose cone": { 
    offset: [40, 10, 40],      
    lookOffset: [0, 0, 0],      
    type: "dynamic",
    refId: "nose"    
  }, 
  "avionics bay": { 
    offset: [50, 0, 50],       
    lookOffset: [0, 0, 0],       
    type: "dynamic",
    refId: "body" 
  },
  "fin can": { 
    offset: [50, 20, 50],       
    lookOffset: [0, 0, 0],       
    type: "dynamic",
    refId: "fins" 
  },
};

// Part Details
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
  "avionics bay": {
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
        Loading Rocket... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// --- ROCKET SECTION (FIXED: Uses Base Position + Original Colors) ---
const RocketSection = forwardRef(({ config, exploded, setHovered }: any, ref: any) => {
  const { scene } = useGLTF(config.file);
  const clone = useMemo(() => scene.clone(), [scene]);
  const internalRef = useRef<THREE.Group>(null);
  const groupRef = ref || internalRef;

  useMemo(() => {
    clone.traverse((node: any) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        // IMPORTANT: We REMOVED the material override here.
        // The original SolidWorks/GLB colors will now appear.
      }
    });
  }, [clone]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // 1. Get Base Position (The Manual Stack)
    const [baseX, baseY, baseZ] = config.position;

    // 2. Calculate Explosion
    const offsetValue = exploded * config.explodeOffset;
    
    const targetY = baseY + (config.explodeAxis === "y" ? offsetValue : 0);
    const targetX = baseX + (config.explodeAxis === "x" ? offsetValue : 0);
    const targetZ = baseZ + (config.explodeAxis === "z" ? offsetValue : 0);

    easing.damp3(groupRef.current.position, [targetX, targetY, targetZ], 0.3, delta);
  });

  return (
    <group 
      ref={groupRef} 
      position={config.position} // Set initial position
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={clone} />
    </group>
  );
});
RocketSection.displayName = "RocketSection";

// --- CFD WIND VISUALIZATION ---
function CFDStreamlines({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 500;
  const [dummy] = useState(() => new THREE.Object3D());
  
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      y: (Math.random() - 0.5) * 300,
      x: (Math.random() - 0.5) * 100,
      z: (Math.random() - 0.5) * 100,
      speed: Math.random() * 0.5 + 0.5
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current || !visible) return;
    
    particles.forEach((p, i) => {
      p.y -= p.speed * 100 * delta; // Move down
      if (p.y < -150) p.y = 150;
      
      const dist = Math.sqrt(p.x * p.x + p.z * p.z);
      let renderX = p.x;
      let renderZ = p.z;
      if (dist < 10) {
         const angle = Math.atan2(p.z, p.x);
         renderX = Math.cos(angle) * 10;
         renderZ = Math.sin(angle) * 10;
      }

      dummy.position.set(renderX, p.y, renderZ);
      dummy.scale.set(0.2, Math.max(2, p.speed * 10), 0.2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.2, 0.2, 1, 4]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
    </instancedMesh>
  );
}

// --- ZOOM INDICATOR ---
function ZoomIndicator({ controlsRef }: { controlsRef: any }) {
  const [zoomPct, setZoomPct] = useState(100);
  const { camera } = useThree();
  const BASE_DIST = 200; 

  useFrame(() => {
    if (!controlsRef.current) return;
    const dist = camera.position.distanceTo(controlsRef.current.getTarget(new THREE.Vector3()));
    const pct = Math.round((BASE_DIST / dist) * 100);
    setZoomPct(pct);
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
        const activePartRef = partsRefs[dynamicConfig.refId];
        
        if (activePartRef?.current) {
            const box = new THREE.Box3().setFromObject(activePartRef.current);
            const center = new THREE.Vector3();
            box.getCenter(center); 

            const zoneChanged = prevZone.current !== currentZone;
            const partMoved = center.distanceTo(lastCenter.current) > 0.1;

            if (zoneChanged || partMoved) {
                const camPos = new THREE.Vector3().copy(center).add(new THREE.Vector3(...dynamicConfig.offset));
                const camLook = new THREE.Vector3().copy(center).add(new THREE.Vector3(...dynamicConfig.lookOffset));

                cameraControlsRef.current.setLookAt(
                    camPos.x, camPos.y, camPos.z,
                    camLook.x, camLook.y, camLook.z,
                    true 
                );

                lastCenter.current.copy(center);
                prevZone.current = currentZone;
            }
        }
    } 
    else if (prevZone.current !== currentZone) {
        const staticConfig = targetConfig as StaticZone;
        cameraControlsRef.current.setLookAt(
            staticConfig.pos[0], staticConfig.pos[1], staticConfig.pos[2],
            staticConfig.look[0], staticConfig.look[1], staticConfig.look[2],
            true
        );
        prevZone.current = currentZone;
    }
  });

  return null;
}

// --- INSTRUCTION OVERLAY ---
function InstructionOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div 
      onClick={onDismiss}
      className="absolute inset-0 z-[200] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:bg-white/70 group px-4"
    >
       <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
           <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-full h-full bg-white shadow-xl rounded-full flex items-center justify-center border border-neutral-100 group-hover:scale-110 transition-transform duration-300">
                    <Rotate3d className="w-8 h-8 text-blue-600 animate-[spin_10s_linear_infinite]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-neutral-900 text-white p-2 rounded-full shadow-lg animate-bounce">
                    <Hand className="w-4 h-4" />
                </div>
           </div>

           <h2 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase mb-2 text-center">
               Explore Zoomer
           </h2>
           
           <div className="flex items-center gap-4 text-neutral-500 text-[10px] font-bold tracking-widest uppercase bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
               <span>Drag to Rotate</span>
               <div className="w-1 h-1 bg-neutral-300 rounded-full" />
               <span>Click Parts</span>
           </div>
       </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ZoomerCFDViewer() {
  const [exploded, setExploded] = useState(0); 
  const [currentZone, setCurrentZone] = useState("overview");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hovered, setHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCFD, setShowCFD] = useState(true);

  const cameraControlsRef = useRef<CameraControls>(null);
  
  // Refs for parts
  const noseRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const finsRef = useRef<THREE.Group>(null);

  // References dictionary for the controller
  const partsRefs = useMemo(() => ({
    nose: noseRef,
    inner: innerRef,
    body: bodyRef,
    fins: finsRef
  }), []);

  const handleZoneClick = (zoneKey: string) => {
    setCurrentZone(zoneKey);
  };

  const handleReturnToOverview = () => {
    setCurrentZone("overview");
  };

  const isOverview = currentZone === "overview";
  const currentDetails = PART_DETAILS[currentZone];

  return (
    <div className="w-full h-[600px] sm:h-[750px] relative bg-neutral-50 border border-neutral-200 overflow-hidden shadow-sm group font-sans rounded-xl">
      
      {/* 1. HEADER */}
      <div className={`absolute top-6 left-6 z-50 transition-all duration-500 ${isOverview ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter italic">ZOOMER L2</h1>
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
           Interactive Model
        </p>
      </div>

      {/* 2. INSTRUCTION OVERLAY */}
      {!hasInteracted && <InstructionOverlay onDismiss={() => setHasInteracted(true)} />}

      {/* 3. CFD TOGGLE */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-2 items-end">
          <button 
             onClick={() => setShowCFD(!showCFD)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${showCFD ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-900'}`}
          >
              <Wind className="w-3 h-3" />
              {showCFD ? "CFD: ON" : "CFD: OFF"}
          </button>
      </div>

      {/* 4. OVERVIEW PART SELECTION */}
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 transition-all duration-500 ${isOverview ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className="hidden sm:flex absolute -top-12 right-0 w-32 text-right flex-col items-end gap-1 animate-pulse">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-white/80 px-2 py-1 rounded">
                Select Part
            </span>
            <ArrowDown className="w-4 h-4 text-neutral-300 mr-2" />
        </div>

        {Object.keys(ZOOM_ZONES).map((zone) => {
          if (zone === 'overview') return null; 
          return (
            <button
              key={zone}
              onClick={() => handleZoneClick(zone)}
              className="text-right text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-lg transition-all duration-200 bg-white/80 text-neutral-400 hover:text-neutral-900 hover:bg-white hover:scale-105 border border-transparent hover:border-neutral-200 shadow-sm hover:shadow-md"
            >
              {zone}
            </button>
          );
        })}
      </div>

      {/* 5. SIDEBAR: DETAILED VIEW */}
      <div 
        className={`absolute top-0 left-0 h-full w-full md:w-[400px] bg-white/95 backdrop-blur-xl z-50 text-neutral-900 shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col border-r border-neutral-200 ${!isOverview ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 pb-4 shrink-0 border-b border-neutral-100 relative z-20 bg-white/50 backdrop-blur-md">
            <button 
                onClick={handleReturnToOverview}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-lg transition-all w-full justify-center mb-4 group"
            >
                <CornerUpLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Hangar</span>
            </button>
            
            <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-bold tracking-widest uppercase text-blue-500 border border-blue-100">
                    Component Analysis
                </div>
                 <button onClick={handleReturnToOverview} className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4 relative z-10">
            {currentDetails && (
                <>
                    <h2 className="text-4xl font-black tracking-tighter leading-none mb-2 text-neutral-900">
                        {currentDetails.title}
                    </h2>
                    <h3 className="text-lg text-blue-500 font-bold mb-6 tracking-tight flex items-center gap-2">
                        {currentDetails.subtitle}
                    </h3>
                    
                    <p className="text-neutral-600 leading-relaxed text-sm font-medium mb-8 border-l-2 border-blue-500 pl-4">
                        {currentDetails.description}
                    </p>

                    <div className="space-y-4">
                        <div>
                             <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Specifications</h4>
                             <div className="grid grid-cols-2 gap-3">
                                {currentDetails.specs.map((spec: any, i: number) => (
                                    <div key={i} className="flex flex-col bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-1">{spec.label}</span>
                                        <span className="text-xs font-mono font-bold text-neutral-800">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 mt-6">Key Features</h4>
                            <ul className="space-y-2">
                                {currentDetails.features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-neutral-600 p-2 bg-white border border-neutral-100 rounded-md">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>

      {/* 6. SLIDER */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 w-80 p-4 rounded-2xl bg-white/90 border border-neutral-200 shadow-xl backdrop-blur-md transition-all duration-500 
        ${!isOverview ? 'opacity-0 pointer-events-none translate-y-20' : 'opacity-100 translate-y-0'}
      `}>
        <div className="flex justify-between w-full text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
          <span>Stowed</span>
          <span className="text-neutral-900">Assembly View</span>
          <span>Exploded</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={exploded}
          onChange={(e) => setExploded(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
        />
      </div>

      {/* 3D CANVAS */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [150, 50, 150] }}>
        <color attach="background" args={['#fafafa']} />
        
        <Suspense fallback={<Loader />}>
            <Environment preset="studio" />
            <ambientLight intensity={0.7} />
            <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow shadow-bias={-0.0001} />
            <spotLight position={[-50, 50, 50]} intensity={1} angle={0.2} penumbra={1} color="#dbeafe" />

            <Center top>
               <group rotation={[0, 0, 0]}>
                  {/* Each section now reads its 'position' from the ROCKET_STACK config */}
                  <RocketSection ref={noseRef} config={ROCKET_STACK.nose} exploded={exploded} setHovered={setHovered} />
                  <RocketSection ref={innerRef} config={ROCKET_STACK.inner} exploded={exploded} setHovered={setHovered} />
                  <RocketSection ref={bodyRef} config={ROCKET_STACK.body} exploded={exploded} setHovered={setHovered} />
                  <RocketSection ref={finsRef} config={ROCKET_STACK.fins} exploded={exploded} setHovered={setHovered} />
               </group>
               
               <CFDStreamlines visible={showCFD} />
            </Center>

            <ContactShadows resolution={1024} scale={300} blur={2} opacity={0.2} far={100} color="#000000" />
            
            <CameraControls 
              ref={cameraControlsRef} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.8} 
              minDistance={50} 
              maxDistance={400} 
            />
            
            <ZoomIndicator controlsRef={cameraControlsRef} />
            
            <SceneController 
                currentZone={currentZone} 
                cameraControlsRef={cameraControlsRef} 
                partsRefs={partsRefs}
            />
        </Suspense>
      </Canvas>
    </div>
  );
}
