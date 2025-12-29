import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  PerspectiveCamera, 
  Environment, 
  Center
} from "@react-three/drei";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Square, 
  Wind, 
  Activity,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// --- SHADER DEFINITIONS ---
// ------------------------------------------------------------------

const flowVertexShader = `
  attribute float speed;
  attribute float life;
  
  varying float vSpeed;
  varying float vLife;
  varying vec3 vColor;

  uniform vec3 colorLow;
  uniform vec3 colorHigh;

  void main() {
    vSpeed = speed;
    vLife = life;
    
    // Color gradient based on speed
    vColor = mix(colorLow, colorHigh, clamp(speed * 0.5, 0.0, 1.0));

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const flowFragmentShader = `
  varying float vSpeed;
  varying float vLife;
  varying vec3 vColor;
  
  uniform float opacity;

  void main() {
    // Soft particle look with fade in/out based on life
    float alpha = opacity * smoothstep(0.0, 0.1, vLife) * (1.0 - smoothstep(0.9, 1.0, vLife));
    
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ------------------------------------------------------------------
// --- CONFIGURATION ---
// ------------------------------------------------------------------

interface AeroConfig {
  id: string;
  name: string;
  chordLength: number; // mm
  dragCoeff: number;
  colorLow: string;
  colorHigh: string;
}

const AERO_CONFIGS: AeroConfig[] = [
  {
    id: "short",
    name: "Short Chord",
    chordLength: 150,
    dragCoeff: 0.42,
    colorLow: "#3b82f6", // Blue
    colorHigh: "#ef4444", // Red
  },
  {
    id: "medium",
    name: "Medium Chord",
    chordLength: 200,
    dragCoeff: 0.38,
    colorLow: "#10b981", // Emerald
    colorHigh: "#f59e0b", // Amber
  },
  {
    id: "long",
    name: "Long Chord",
    chordLength: 280,
    dragCoeff: 0.32,
    colorLow: "#6366f1", // Indigo
    colorHigh: "#ec4899", // Pink
  },
  {
    id: "experimental",
    name: "Experimental",
    chordLength: 180,
    dragCoeff: 0.55,
    colorLow: "#8b5cf6", // Violet
    colorHigh: "#22c55e", // Green
  }
];

// ------------------------------------------------------------------
// --- PHYSICS ENGINE (Optimized) ---
// ------------------------------------------------------------------

class FluidSolver {
  particles: Float32Array; // [x, y, z, vx, vy, vz, life, speed]
  count: number;
  
  constructor(count: number) {
    this.count = count;
    this.particles = new Float32Array(count * 8);
    this.reset();
  }

  reset() {
    for (let i = 0; i < this.count; i++) {
      this.spawnParticle(i);
    }
  }

  spawnParticle(index: number) {
    const i = index * 8;
    // Emitter area (Disk above rocket)
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 3.5; 
    
    this.particles[i] = Math.cos(angle) * r;     // x
    this.particles[i+1] = 6 + Math.random() * 2; // y (start high)
    this.particles[i+2] = Math.sin(angle) * r;   // z
    
    // Initial velocity (Downwards)
    this.particles[i+3] = 0;    
    this.particles[i+4] = -1.5; 
    this.particles[i+5] = 0;    
    
    this.particles[i+6] = 0;    // life
    this.particles[i+7] = 1.0;  // speed
  }

  update(dt: number, repulsionStrength: number) {
    const p = this.particles;
    
    for (let i = 0; i < this.count; i++) {
      const idx = i * 8;
      
      // Age particle
      p[idx+6] += dt * 0.4;
      
      // Respawn
      if (p[idx+6] > 1.0 || p[idx+1] < -6) {
        this.spawnParticle(i);
        continue;
      }

      const x = p[idx];
      const y = p[idx+1];
      const z = p[idx+2];
      
      // --- FORCES ---
      // 1. Base Flow (Downwards)
      let fx = 0;
      let fy = -4.0;
      let fz = 0;
      
      // 2. Obstacle Repulsion (Fake CFD interaction)
      const distSq = x*x + y*y + z*z;
      const dist = Math.sqrt(distSq);
      
      if (dist < 6.0) {
        const safeDist = Math.max(dist, 0.5);
        // Push away from center (0,0,0)
        const push = (repulsionStrength * 20.0) / (distSq + 0.1);
        
        fx += (x / safeDist) * push;
        fz += (z / safeDist) * push;
        fy += (y / safeDist) * push * 0.5; // Less vertical deflection
      }

      // Integration
      p[idx+3] += fx * dt;
      p[idx+4] += fy * dt;
      p[idx+5] += fz * dt;
      
      // Damping
      p[idx+3] *= 0.95;
      p[idx+4] *= 0.95;
      p[idx+5] *= 0.95;
      
      // Move
      p[idx]   += p[idx+3] * dt;
      p[idx+1] += p[idx+4] * dt;
      p[idx+2] += p[idx+5] * dt;
      
      // Speed calc for shader
      p[idx+7] = Math.sqrt(p[idx+3]**2 + p[idx+4]**2 + p[idx+5]**2);
    }
  }
}

// ------------------------------------------------------------------
// --- 3D COMPONENTS ---
// ------------------------------------------------------------------

const FlowSimulation = ({ 
  isRunning, 
  config 
}: { 
  isRunning: boolean; 
  config: AeroConfig;
}) => {
  const count = 400; // Number of flow lines
  const TRAIL_LENGTH = 15; // Length of each line
  
  const trailRef = useRef<THREE.LineSegments>(null);
  const solver = useMemo(() => new FluidSolver(count), []);
  
  // Create buffers once
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * TRAIL_LENGTH * 2 * 3);
    const speeds = new Float32Array(count * TRAIL_LENGTH * 2);
    const lifes = new Float32Array(count * TRAIL_LENGTH * 2);
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('life', new THREE.BufferAttribute(lifes, 1));
    return geo;
  }, []);
  
  // History for trail rendering
  const historyRef = useRef<Float32Array[]>([]);
  
  useEffect(() => {
    historyRef.current = Array(count).fill(0).map(() => new Float32Array(TRAIL_LENGTH * 3));
    solver.reset();
  }, []);

  useFrame((_, delta) => {
    if (!isRunning || !trailRef.current) return;
    
    // Config-based physics parameter
    const repulsion = config.chordLength / 100;
    
    solver.update(Math.min(delta, 0.05), repulsion);
    
    // Update buffers
    const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
    const speeds = trailRef.current.geometry.attributes.speed.array as Float32Array;
    const lifes = trailRef.current.geometry.attributes.life.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const idx = i * 8;
      const x = solver.particles[idx];
      const y = solver.particles[idx+1];
      const z = solver.particles[idx+2];
      const s = solver.particles[idx+7];
      const l = solver.particles[idx+6];
      
      // Update history trail
      const hist = historyRef.current[i];
      hist.copyWithin(3, 0, (TRAIL_LENGTH - 1) * 3);
      hist[0] = x;
      hist[1] = y;
      hist[2] = z;
      
      // Update geometry attributes
      for (let t = 0; t < TRAIL_LENGTH - 1; t++) {
        const segIdx = (i * TRAIL_LENGTH + t) * 2;
        
        // Point A
        positions[segIdx * 3] = hist[t * 3];
        positions[segIdx * 3 + 1] = hist[t * 3 + 1];
        positions[segIdx * 3 + 2] = hist[t * 3 + 2];
        speeds[segIdx] = s;
        lifes[segIdx] = l;
        
        // Point B
        positions[(segIdx + 1) * 3] = hist[(t + 1) * 3];
        positions[(segIdx + 1) * 3 + 1] = hist[(t + 1) * 3 + 1];
        positions[(segIdx + 1) * 3 + 2] = hist[(t + 1) * 3 + 2];
        speeds[segIdx + 1] = s;
        lifes[segIdx + 1] = l;
      }
    }
    
    trailRef.current.geometry.attributes.position.needsUpdate = true;
    trailRef.current.geometry.attributes.speed.needsUpdate = true;
    trailRef.current.geometry.attributes.life.needsUpdate = true;
    
    // Update shader uniforms
    const mat = trailRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.colorLow.value.set(config.colorLow);
    mat.uniforms.colorHigh.value.set(config.colorHigh);
  });

  if (!isRunning) return null;

  return (
    <lineSegments ref={trailRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial 
        vertexShader={flowVertexShader}
        fragmentShader={flowFragmentShader}
        uniforms={{
          colorLow: { value: new THREE.Color(config.colorLow) },
          colorHigh: { value: new THREE.Color(config.colorHigh) },
          opacity: { value: 0.8 }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};

const RocketModel = React.memo(({ rotationSpeed }: { rotationSpeed: number }) => {
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
        <primitive object={scene} scale={0.008} rotation={[0, 0, 0]} />
      </Center>
    </group>
  );
});
RocketModel.displayName = "RocketModel";

// ------------------------------------------------------------------
// --- MAIN COMPONENT ---
// ------------------------------------------------------------------

const ZoomerCFDViewer = () => {
  const [activeConfigId, setActiveConfigId] = useState<string>("medium");
  const [isRunning, setIsRunning] = useState(false);
  
  const activeConfig = AERO_CONFIGS.find(c => c.id === activeConfigId) || AERO_CONFIGS[0];

  return (
    <Card className="w-full bg-white border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row h-[700px]">
        
        {/* LEFT: Controls & Data */}
        <div className="w-full md:w-80 p-6 flex flex-col border-r border-slate-100 bg-white z-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wind className="w-6 h-6 text-slate-700" />
              CFD Analysis
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a root chord configuration to simulate aerodynamic flow.
            </p>
          </div>

          {/* Configuration Selection */}
          <div className="flex-1 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Configurations
            </div>
            {AERO_CONFIGS.map((cfg) => (
              <button
                key={cfg.id}
                onClick={() => setActiveConfigId(cfg.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200",
                  activeConfigId === cfg.id
                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <div className="font-medium text-sm">{cfg.name}</div>
                <div className={cn(
                  "text-xs mt-0.5",
                  activeConfigId === cfg.id ? "text-slate-300" : "text-slate-400"
                )}>
                  Chord: {cfg.chordLength}mm
                </div>
              </button>
            ))}
          </div>

          {/* Data Display */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Simulation Results
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Drag Coefficient (Cd)</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 tracking-tighter">
                {activeConfig.dragCoeff.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <Button
              size="lg"
              className={cn(
                "w-full font-bold transition-all h-12 text-sm uppercase tracking-wide",
                isRunning 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4 mr-2 fill-current" /> Stop Simulation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 fill-current" /> Run Flow Simulation
                </>
              )}
            </Button>
          </div>
        </div>

        {/* RIGHT: 3D Visualization */}
        <div className="flex-1 relative bg-slate-100">
          <Canvas dpr={[1, 2]} className="w-full h-full">
            <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={45} />
            <OrbitControls 
              enablePan={false}
              minPolarAngle={0.1}
              maxPolarAngle={Math.PI / 1.5}
              minDistance={3}
              maxDistance={12}
              autoRotate={!isRunning}
              autoRotateSpeed={0.5}
            />
            
            {/* Lighting Setup for White Background */}
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Environment preset="city" />

            <group position={[0, -1, 0]}>
              <Suspense fallback={null}>
                <RocketModel rotationSpeed={isRunning ? 0 : 0.2} />
              </Suspense>
              
              <FlowSimulation 
                isRunning={isRunning} 
                config={activeConfig} 
              />
              
              {/* Subtle Grid */}
              <gridHelper args={[20, 20, 0xe2e8f0, 0xe2e8f0]} position={[0, -1.5, 0]} />
            </group>
          </Canvas>
          
          {/* Overlay Status Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm border-slate-200 text-slate-600 shadow-sm">
              {isRunning ? "Simulating..." : "Interactive View"}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ZoomerCFDViewer;
