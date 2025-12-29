import React, { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  PerspectiveCamera, 
  Environment, 
  Line,
  Html,
  Center
} from "@react-three/drei";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  SquareActivity, 
  Settings2, 
  Wind, 
  Info,
  RotateCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types ---

interface AeroConfig {
  id: string;
  name: string;
  chordLength: number; // in mm
  dragCoeff: number;
  color: string;
  description: string;
}

// --- Configuration Data ---

const AERO_CONFIGS: AeroConfig[] = [
  {
    id: "cfg-1",
    name: "Short Chord",
    chordLength: 150,
    dragCoeff: 0.42,
    color: "#3b82f6", // Blue
    description: "Minimal surface area, lower friction but higher pressure drag."
  },
  {
    id: "cfg-2",
    name: "Medium Chord",
    chordLength: 200,
    dragCoeff: 0.38,
    color: "#10b981", // Emerald
    description: "Balanced profile for subsonic stability."
  },
  {
    id: "cfg-3",
    name: "Long Chord",
    chordLength: 250,
    dragCoeff: 0.35,
    color: "#f59e0b", // Amber
    description: "Optimized fineness ratio for trans-sonic regimes."
  },
  {
    id: "cfg-4",
    name: "Experimental",
    chordLength: 300,
    dragCoeff: 0.45,
    color: "#ef4444", // Red
    description: "High lift surface, significant induced drag penalty."
  }
];

// --- 3D Components ---

// The Rocket Model
const RocketModel = ({ 
  rotationSpeed = 0 
}: { 
  rotationSpeed?: number 
}) => {
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current && rotationSpeed > 0) {
      ref.current.rotation.y += rotationSpeed * delta;
    }
  });

  return (
    <group ref={ref}>
      <Center>
        <primitive 
          object={scene} 
          scale={0.008} 
          rotation={[0, 0, 0]} 
        />
      </Center>
    </group>
  );
};

// Fake CFD Streamlines Component
// Generates lines that flow around the center (0,0,0) based on potential flow math
const Streamlines = ({ 
  active, 
  repulsion, 
  color 
}: { 
  active: boolean; 
  repulsion: number; 
  color: string; 
}) => {
  const lineCount = 60; // Number of streamlines
  const segments = 40;  // Vertex density per line
  const speed = 0.5;    // Flow speed

  // Refs for animation
  const linesRef = useRef<any[]>([]);
  const materialRefs = useRef<THREE.LineDashedMaterial[]>([]);

  // Generate paths based on "Potential Flow" (Uniform + Source)
  // Flow is assumed to be coming from +Y down to -Y (or vice versa)
  // Let's assume rocket is aligned Y-up, and flow comes from +Y (top) to -Y (bottom)
  const lines = useMemo(() => {
    const tempLines = [];
    
    // Create a grid of start points above the rocket
    const width = 6;
    const heightStart = 5;
    const heightEnd = -5;

    for (let i = 0; i < lineCount; i++) {
      const points: THREE.Vector3[] = [];
      
      // Random start X/Z within a radius
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 2.5; // Don't start exactly at 0
      const startX = Math.cos(angle) * radius;
      const startZ = Math.sin(angle) * radius;

      let currentPos = new THREE.Vector3(startX, heightStart, startZ);

      // Integrate path
      for (let s = 0; s < segments; s++) {
        points.push(currentPos.clone());

        // Basic Potential Flow: Velocity = Uniform + Repulsion
        // V_uniform = (0, -1, 0)
        const uniform = new THREE.Vector3(0, -1, 0);
        
        // Repulsion from center (Sphere/Point source)
        // V_source = k * P / |P|^3
        const distSq = currentPos.lengthSq();
        const dist = Math.sqrt(distSq);
        
        // Avoid division by zero
        const safeDist = Math.max(dist, 0.1); 
        
        // Repulsion vector pointing away from center
        const repulsionVec = currentPos.clone().normalize();
        
        // Dynamic repulsion strength based on proximity
        // Closer = stronger push
        const strength = (repulsion * 5) / (safeDist * safeDist);
        repulsionVec.multiplyScalar(strength);

        // Resultant velocity
        const velocity = uniform.add(repulsionVec).normalize().multiplyScalar(speed);

        currentPos.add(velocity);
        
        // Stop if we hit bottom
        if (currentPos.y < heightEnd) break;
      }
      tempLines.push(points);
    }
    return tempLines;
  }, [repulsion]); // Regenerate when config changes (repulsion changes)

  // Animate dashed lines
  useFrame((state) => {
    if (!active) return;
    
    // Animate dash offset to make it look like flow
    const time = state.clock.getElapsedTime();
    
    materialRefs.current.forEach((mat) => {
      if (mat) {
        // Move the dash pattern
        mat.dashOffset = -time * 10;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1, 0.05);
      }
    });
  });

  if (!active) return null;

  return (
    <group>
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={color}
          lineWidth={1.5}
          dashed
          dashScale={2}
          dashSize={0.4}
          gapSize={0.2}
          opacity={0.6}
          transparent
          ref={(el) => (linesRef.current[index] = el)}
          onUpdate={(line) => {
            if (line.material instanceof THREE.LineDashedMaterial) {
               materialRefs.current[index] = line.material;
            }
          }}
        />
      ))}
    </group>
  );
};

// --- Main Viewer Component ---

const ZoomerCFDViewer = () => {
  const [activeConfigId, setActiveConfigId] = useState<string>("cfg-2");
  const [isRunning, setIsRunning] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.2);

  const activeConfig = AERO_CONFIGS.find(c => c.id === activeConfigId) || AERO_CONFIGS[0];

  // Derive simulation parameters from config
  // Longer chord = effectively "larger" obstacle in this fake simulation
  const repulsionStrength = (activeConfig.chordLength / 100) * 0.5;

  return (
    <div className="w-full h-[600px] relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      
      {/* 3D Scene */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[4, 2, 4]} />
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={!isRunning} // Stop rotation when simulating to focus on flow
          autoRotateSpeed={rotationSpeed * 5}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Environment preset="city" />

        {/* Content */}
        <RocketModel rotationSpeed={isRunning ? 0 : 0} />
        
        <Streamlines 
          active={isRunning} 
          repulsion={repulsionStrength} 
          color={activeConfig.color}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between">
        
        {/* Header / Stats */}
        <div className="flex justify-between items-start pointer-events-auto">
          <Card className="bg-black/40 backdrop-blur-md border-slate-700/50 p-4 text-white w-64">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm font-mono uppercase tracking-wider">
              <Wind className="w-4 h-4" />
              Aerodynamics
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-400">Drag Coefficient (Cd)</div>
                <div className="text-3xl font-bold font-mono text-white flex items-center gap-2">
                  {activeConfig.dragCoeff.toFixed(2)}
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", 
                    activeConfig.dragCoeff < 0.4 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {activeConfig.dragCoeff < 0.4 ? "OPTIMAL" : "HIGH"}
                  </span>
                </div>
              </div>
              
              <div className="h-px bg-slate-700/50" />
              
              <div>
                <div className="text-xs text-slate-400">Simulated Root Chord</div>
                <div className="text-xl font-mono text-white">
                  {activeConfig.chordLength} <span className="text-sm text-slate-500">mm</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Controls Top Right */}
          <div className="flex gap-2">
             <Button
                variant="outline"
                size="icon"
                className="bg-black/40 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                onClick={() => setRotationSpeed(prev => prev === 0 ? 0.2 : 0)}
             >
                <RotateCcw className={cn("w-4 h-4 transition-transform", rotationSpeed > 0 && "animate-spin-slow")} />
             </Button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="pointer-events-auto space-y-4">
          
          {/* Config Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AERO_CONFIGS.map((cfg) => (
              <button
                key={cfg.id}
                onClick={() => setActiveConfigId(cfg.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-200",
                  activeConfigId === cfg.id 
                    ? "bg-slate-800/80 border-slate-500 ring-1 ring-slate-500 shadow-lg translate-y-[-2px]" 
                    : "bg-black/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700 text-slate-400"
                )}
              >
                <div className="text-xs font-mono uppercase tracking-wider mb-1 opacity-70">
                  {cfg.id}
                </div>
                <div className={cn("font-medium text-sm", activeConfigId === cfg.id ? "text-white" : "text-slate-300")}>
                  {cfg.name}
                </div>
              </button>
            ))}
          </div>

          {/* Main Action Bar */}
          <Card className="bg-black/60 backdrop-blur-xl border-slate-700/50 p-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 rounded-full bg-slate-800 text-slate-300">
                <Settings2 className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-white">{activeConfig.name}</div>
                <div className="text-xs text-slate-400 truncate max-w-[200px]">{activeConfig.description}</div>
              </div>
            </div>

            <Button 
              size="lg"
              className={cn(
                "min-w-[140px] font-bold transition-all shadow-lg",
                isRunning 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                  : "bg-white hover:bg-slate-200 text-slate-900 shadow-white/10"
              )}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <>
                  <SquareActivity className="w-4 h-4 mr-2" /> Stop CFD
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 fill-current" /> Run Sim
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ZoomerCFDViewer;
