import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  CameraControls,
  Html,
  Environment,
  PerspectiveCamera,
  ContactShadows,
  Grid,
  Line,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// 1. CONFIG
// -----------------------------------------------------------------------------

const AERODYNAMICS_CONFIG = [
  { id: "short", label: "Short Chord", cd: 0.52, turbulence: 0.8, color: "#ef4444" },
  { id: "std",   label: "Standard",    cd: 0.45, turbulence: 0.5, color: "#f59e0b" },
  { id: "long",  label: "Long Chord",  cd: 0.38, turbulence: 0.3, color: "#3b82f6" },
  { id: "ext",   label: "Extended",    cd: 0.32, turbulence: 0.1, color: "#10b981" },
];

// -----------------------------------------------------------------------------
// 2. FLOW MATH (GENERATOR)
// We generate along X, but we will ROTATE the group 90deg to match Z
// -----------------------------------------------------------------------------

function generateStreamlinePoints(
  radius: number,
  angle: number,
  turbulence: number
) {
  const points: THREE.Vector3[] = [];
  const steps = 45;

  // Start "left" (relative to the flow group)
  let x = -140;
  let y = Math.cos(angle) * radius;
  let z = Math.sin(angle) * radius;

  for (let i = 0; i < steps; i++) {
    points.push(new THREE.Vector3(x, y, z));

    let flowX = 6;
    let flowY = 0;
    let flowZ = 0;

    const currentRadius = Math.sqrt(y * y + z * z);
    
    // Collision Obstacle (The Rocket Body)
    // We map the collision logic relative to the flow line's local space
    let obstacleRadius = 8;
    if (x < -80) {
      obstacleRadius = THREE.MathUtils.mapLinear(x, -140, -80, 0, 8);
    }

    if (currentRadius < obstacleRadius + 2) {
      const push = (obstacleRadius + 2 - currentRadius) * 0.6;
      const a = Math.atan2(z, y);
      flowY += Math.cos(a) * push;
      flowZ += Math.sin(a) * push;
    }

    flowY += (Math.random() - 0.5) * turbulence * 0.4;
    flowZ += (Math.random() - 0.5) * turbulence * 0.4;

    x += flowX;
    y += flowY;
    z += flowZ;
  }

  return points;
}

// -----------------------------------------------------------------------------
// 3. 3D OBJECTS
// -----------------------------------------------------------------------------

function ZoomerRocket() {
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const clone = useMemo(() => scene.clone(), [scene]);

  return (
    // ROCKET: Kept strictly original orientation
    <primitive object={clone} />
  );
}

function Streamline({ points, color, active, delay }: any) {
  const ref = useRef<any>(null);
  const offset = useRef(delay);

  useFrame((_, delta) => {
    if (!ref.current) return;
    offset.current += delta * 40;
    if (offset.current > 100) offset.current = 0;
    ref.current.material.dashOffset = -offset.current;
    ref.current.material.opacity = active ? 0.6 : 0;
  });

  return (
    <Line
      ref={ref}
      points={points}
      color={color}
      lineWidth={1.5}
      dashed
      dashScale={3}
      dashSize={4}
      transparent
      opacity={0}
    />
  );
}

function CFDStreamlines({ active, profileIdx }: { active: boolean; profileIdx: number }) {
  const cfg = AERODYNAMICS_CONFIG[profileIdx];

  const lines = useMemo(() => {
    const result: any[] = [];
    [10, 16, 24].forEach((r) => {
      const count = Math.floor(r * 0.8);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        result.push({
          points: generateStreamlinePoints(r, angle, cfg.turbulence),
          delay: Math.random() * 100,
        });
      }
    });
    return result;
  }, [cfg.turbulence]);

  return (
    <group>
      {lines.map((l, i) => (
        <Streamline key={i} {...l} color={cfg.color} active={active} />
      ))}
    </group>
  );
}

function FlowParticles({ active, profileIdx }: { active: boolean; profileIdx: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cfg = AERODYNAMICS_CONFIG[profileIdx];
  const count = 200;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = 12 + Math.random() * 20;
        return {
          pos: new THREE.Vector3(-120 + Math.random() * 240, Math.cos(a) * r, Math.sin(a) * r),
          speed: 40 + Math.random() * 20,
        };
      }),
    []
  );

  useFrame((_, delta) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, active ? 0.7 : 0, 0.1);
    mat.color.lerp(new THREE.Color(cfg.color), 0.05);

    particles.forEach((p, i) => {
      p.pos.x += p.speed * delta;
      
      if (p.pos.x > 140) p.pos.x = -140;

      // Radial collision check
      const r = Math.sqrt(p.pos.y*p.pos.y + p.pos.z*p.pos.z);
      if (r < 10) {
         const ang = Math.atan2(p.pos.z, p.pos.y);
         p.pos.y = Math.cos(ang) * 12;
         p.pos.z = Math.sin(ang) * 12;
      }

      dummy.position.copy(p.pos);
      dummy.scale.setScalar(0.4);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial transparent opacity={0} />
    </instancedMesh>
  );
}

// -----------------------------------------------------------------------------
// 4. MAIN VIEWER
// -----------------------------------------------------------------------------

export default function ZoomerCFDViewer() {
  const [flowOn, setFlowOn] = useState(true);
  const [variant, setVariant] = useState(1);
  const cfg = AERODYNAMICS_CONFIG[variant];

  return (
    <div className="relative w-full h-[700px] bg-white rounded-xl overflow-hidden border border-neutral-200 font-sans select-none shadow-sm group">
      
      {/* --- HUD --- */}
      <div className="absolute top-8 left-8 z-50">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tighter">ZOOMER L2</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">
          Wind Tunnel Simulation
        </p>

        <div className="mt-6 bg-white/80 backdrop-blur-md border border-neutral-200 p-4 rounded-xl shadow-sm w-48 animate-in slide-in-from-left-4 fade-in duration-700">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
            Drag Coefficient ($C_d$)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-mono font-black text-neutral-900 tracking-tighter transition-all duration-300">
                {cfg.cd.toFixed(2)}
            </span>
             <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase transition-colors duration-300", 
                cfg.cd < 0.4 ? "bg-emerald-100 text-emerald-600" : 
                cfg.cd > 0.5 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            )}>
                {cfg.cd < 0.4 ? "Low" : cfg.cd > 0.5 ? "High" : "Avg"}
            </span>
          </div>
        </div>
      </div>

      {/* --- FLOW TOGGLE BUTTON --- */}
      <div className="absolute top-8 right-8 z-50">
        <button
          onClick={() => setFlowOn(!flowOn)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all border shadow-sm",
            flowOn
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-white text-neutral-400 border-neutral-200"
          )}
        >
          <Wind className="w-3 h-3" />
          Flow {flowOn ? "ON" : "OFF"}
        </button>
      </div>

       {/* --- VARIATION SELECTOR --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl p-2 rounded-2xl border border-neutral-200 shadow-2xl flex gap-2">
         {AERODYNAMICS_CONFIG.map((config, idx) => (
             <button
                key={config.id}
                onClick={() => setVariant(idx)}
                className={cn(
                    "px-4 py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 min-w-[90px]",
                    variant === idx 
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-lg scale-105" 
                        : "bg-transparent text-neutral-500 border-transparent hover:bg-neutral-100"
                )}
             >
                <span>{config.label}</span>
             </button>
         ))}
      </div>

      {/* --- 3D SCENE --- */}
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[-200, 100, 200]} fov={35} />
        <color attach="background" args={["#ffffff"]} />

        <Suspense fallback={<Html center className="text-neutral-400 font-mono text-xs">Loading Model...</Html>}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[60, 80, 40]} intensity={2} castShadow />

          <Grid
            position={[0, -40, 0]}
            args={[600, 600]}
            cellSize={30}
            fadeDistance={300}
            sectionColor="#d4d4d4"
            cellColor="#e5e5e5"
          />

          <Center>
              <group>
                  {/* 1. ROCKET: Original Orientation */}
                  <ZoomerRocket />

                  {/* 2. FLOW: Rotated 90 degrees on Y-axis to match depth/length */}
                  <group rotation={[0, Math.PI / 2, 0]}>
                      <CFDStreamlines active={flowOn} profileIdx={variant} />
                      <FlowParticles active={flowOn} profileIdx={variant} />
                  </group>
              </group>
          </Center>

          <CameraControls
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2 + 0.2}
            minDistance={180}
            maxDistance={500}
          />

          <ContactShadows
            scale={300}
            blur={3}
            opacity={0.25}
            far={120}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
