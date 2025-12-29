import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  PerspectiveCamera, 
  Environment, 
  Center,
  Html,
  Stats
} from "@react-three/drei";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wind, 
  Gauge, 
  Layers, 
  Activity,
  Maximize2,
  Settings2,
  Thermometer,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// --- SHADER DEFINITIONS (For High-Performance Flow Visualization) ---
// ------------------------------------------------------------------

/**
 * Vertex Shader for Flow Lines
 * Handles positioning and passing velocity/pressure data to the fragment shader.
 */
const flowLineVertexShader = `
  attribute float velocity;
  attribute float pressure;
  attribute float progress; // 0.0 to 1.0 along the line
  
  varying float vVelocity;
  varying float vPressure;
  varying float vProgress;
  varying vec3 vColor;

  uniform vec3 colorLow;
  uniform vec3 colorHigh;
  uniform float time;

  void main() {
    vVelocity = velocity;
    vPressure = pressure;
    vProgress = progress;
    
    // Mix color based on velocity for that "heat map" look along the line
    vColor = mix(colorLow, colorHigh, velocity);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment Shader for Flow Lines
 * Renders the line with opacity gradients and dashed effects based on time.
 */
const flowLineFragmentShader = `
  varying float vVelocity;
  varying float vPressure;
  varying float vProgress;
  varying vec3 vColor;
  
  uniform float time;
  uniform float opacity;
  uniform float dashSize;
  uniform float gapSize;

  void main() {
    // Create a moving dash pattern
    float totalSize = dashSize + gapSize;
    float moveOffset = time * (1.0 + vVelocity * 2.0); // Faster flow = faster animation
    float dashPosition = mod(vProgress * 50.0 - moveOffset, totalSize);
    
    // Discard pixels in the gap to create transparency
    if (dashPosition > dashSize) {
      discard;
    }

    // Soft edges for the line
    float alpha = opacity;
    
    // Fade out at the very beginning and end of the line
    alpha *= smoothstep(0.0, 0.1, vProgress) * (1.0 - smoothstep(0.9, 1.0, vProgress));

    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ------------------------------------------------------------------
// --- TYPES & CONSTANTS ---
// ------------------------------------------------------------------

interface AeroConfig {
  id: string;
  name: string;
  chordLength: number;
  dragCoeff: number;
  liftCoeff: number;
  colorLow: string;
  colorHigh: string;
  description: string;
  machLimit: number;
}

const AERO_CONFIGS: AeroConfig[] = [
  {
    id: "cfg-1",
    name: "Subsonic Sport",
    chordLength: 150,
    dragCoeff: 0.42,
    liftCoeff: 0.15,
    colorLow: "#3b82f6", // Blue
    colorHigh: "#ef4444", // Red
    description: "Standard configuration for low-altitude flights.",
    machLimit: 0.8
  },
  {
    id: "cfg-2",
    name: "Transonic Stable",
    chordLength: 200,
    dragCoeff: 0.38,
    liftCoeff: 0.12,
    colorLow: "#10b981", // Emerald
    colorHigh: "#f59e0b", // Amber
    description: "Optimized for stability near Mach 1.0.",
    machLimit: 1.2
  },
  {
    id: "cfg-3",
    name: "Hypersonic Wedge",
    chordLength: 280,
    dragCoeff: 0.32,
    liftCoeff: 0.08,
    colorLow: "#6366f1", // Indigo
    colorHigh: "#ec4899", // Pink
    description: "Experimental profile for high-speed efficiency.",
    machLimit: 3.5
  }
];

// ------------------------------------------------------------------
// --- PHYSICS ENGINE CORE (Simplified for React) ---
// ------------------------------------------------------------------

class FlowParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  originalPos: THREE.Vector3;
  life: number;
  maxLife: number;
  history: THREE.Vector3[];
  
  constructor(startPos: THREE.Vector3) {
    this.position = startPos.clone();
    this.originalPos = startPos.clone();
    this.velocity = new THREE.Vector3(0, -1, 0);
    this.life = 0;
    this.maxLife = 100 + Math.random() * 50;
    this.history = [];
  }

  reset() {
    this.position.copy(this.originalPos);
    this.velocity.set(0, -1, 0);
    this.life = 0;
    this.history = [];
  }

  update(dt: number, repulsionStrength: number, turbulence: number) {
    this.life += dt * 10;
    
    // Store history for line rendering
    // In a real optimized system, we'd write to a buffer directly
    this.history.push(this.position.clone());
    if (this.history.length > 50) this.history.shift();

    // -- Physics Calculation --
    
    // 1. Base Flow (Uniform Downward)
    const baseFlow = new THREE.Vector3(0, -5, 0);
    
    // 2. Obstacle Repulsion (Point Source approximation)
    const obstaclePos = new THREE.Vector3(0, 0, 0);
    const distVec = new THREE.Vector3().subVectors(this.position, obstaclePos);
    const dist = distVec.length();
    const safeDist = Math.max(dist, 0.1);
    
    // Repulsion force falls off with distance squared
    const repulsionForce = distVec.normalize().multiplyScalar(repulsionStrength / (safeDist * safeDist));
    
    // 3. Turbulence (Perlin noise-ish via simple sin/cos)
    const turbForce = new THREE.Vector3(
      Math.sin(this.position.y * 2 + performance.now() * 0.001) * turbulence,
      0,
      Math.cos(this.position.y * 2 + performance.now() * 0.001) * turbulence
    );

    // Apply forces
    this.velocity.lerp(baseFlow.add(repulsionForce).add(turbForce), 0.1);
    
    // Integrate position
    this.position.add(this.velocity.clone().multiplyScalar(dt));

    // Boundary check / Reset
    if (this.position.y < -8 || dist < 0.2) {
      this.reset();
    }
  }
}

// ------------------------------------------------------------------
// --- 3D COMPONENTS ---
// ------------------------------------------------------------------

const RocketModel = React.memo(({ rotationSpeed }: { rotationSpeed: number }) => {
  const { scene } = useGLTF("/zoomer_full_rocket.glb");
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current && rotationSpeed > 0) {
      ref.current.rotation.y += rotationSpeed * delta;
    }
  });

  // Apply a custom material for "interaction" visualization could go here
  // For now, we stick to the standard GLTF material but ensure shadows
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group ref={ref}>
      <Center>
        <primitive object={scene} scale={0.008} rotation={[0, 0, 0]} />
      </Center>
    </group>
  );
});

RocketModel.displayName = "RocketModel";

const SimulationRenderer = ({ 
  isRunning, 
  config, 
  particleCount = 100,
  turbulence = 0.1
}: { 
  isRunning: boolean; 
  config: AeroConfig; 
  particleCount?: number;
  turbulence?: number;
}) => {
  // We use a custom shader material for the lines
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // We manage particles in a ref to avoid re-renders
  const particles = useMemo(() => {
    const arr: FlowParticle[] = [];
    const width = 8;
    const depth = 8;
    for (let i = 0; i < particleCount; i++) {
      // Create a grid/disk distribution above the rocket
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 4.0;
      const startPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        6 + Math.random() * 4, // Staggered heights
        Math.sin(angle) * radius
      );
      arr.push(new FlowParticle(startPos));
    }
    return arr;
  }, [particleCount]);

  // Geometry for rendering lines
  // We will update this geometry every frame
  const geomRef = useRef<THREE.BufferGeometry>(null);

  useFrame((state, delta) => {
    if (!isRunning || !geomRef.current || !materialRef.current) return;

    // Update time uniform for shader
    materialRef.current.uniforms.time.value = state.clock.elapsedTime;

    // Physics Update Step
    // To scale this to "Grand Scale", we would move this to a WebWorker
    const repulsion = (config.chordLength / 100) * 1.5;
    
    // Prepare arrays for BufferAttribute updates
    // For rendering, we draw a trail for each particle
    const positions: number[] = [];
    const velocities: number[] = [];
    const progresses: number[] = [];

    particles.forEach((p) => {
      p.update(delta, repulsion, turbulence);
      
      // Construct line strip from history
      // Note: This is CPU intensive for high counts. 
      // Optimized version would use GPGPU.
      for (let i = 0; i < p.history.length - 1; i++) {
        const curr = p.history[i];
        const next = p.history[i+1];
        
        positions.push(curr.x, curr.y, curr.z);
        positions.push(next.x, next.y, next.z);
        
        // Pass normalized speed for color mapping
        const speed = p.velocity.length() / 10.0; // Normalizing factor
        velocities.push(speed);
        velocities.push(speed); // Same speed for segment

        // Progress for dashing
        progresses.push(i / p.history.length);
        progresses.push((i + 1) / p.history.length);
      }
    });

    // Update Geometry
    const posAttr = new THREE.Float32BufferAttribute(positions, 3);
    const velAttr = new THREE.Float32BufferAttribute(velocities, 1);
    const progAttr = new THREE.Float32BufferAttribute(progresses, 1);

    geomRef.current.setAttribute('position', posAttr);
    geomRef.current.setAttribute('velocity', velAttr);
    geomRef.current.setAttribute('progress', progAttr);
    
    // Mark as needing update
    // geomRef.current.attributes.position.needsUpdate = true; // Not needed if we replace attribute
  });

  return (
    <group>
      <lineSegments>
        <bufferGeometry ref={geomRef} />
        <shaderMaterial 
          ref={materialRef}
          vertexShader={flowLineVertexShader}
          fragmentShader={flowLineFragmentShader}
          uniforms={{
            time: { value: 0 },
            colorLow: { value: new THREE.Color(config.colorLow) },
            colorHigh: { value: new THREE.Color(config.colorHigh) },
            opacity: { value: 0.8 },
            dashSize: { value: 0.3 },
            gapSize: { value: 0.2 }
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

// ------------------------------------------------------------------
// --- UI & MAIN COMPONENT ---
// ------------------------------------------------------------------

const ZoomerCFDViewer = () => {
  const [activeConfigId, setActiveConfigId] = useState<string>("cfg-2");
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState<"flow" | "pressure" | "thermal">("flow");
  
  // Advanced Settings State
  const [simSpeed, setSimSpeed] = useState([1.0]);
  const [turbulence, setTurbulence] = useState([0.1]);
  const [particleCount, setParticleCount] = useState([150]);
  
  const activeConfig = AERO_CONFIGS.find(c => c.id === activeConfigId) || AERO_CONFIGS[0];

  return (
    <div className="w-full h-[800px] flex flex-col xl:flex-row gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-2xl overflow-hidden">
      
      {/* LEFT COLUMN: Controls & Analytics */}
      <div className="w-full xl:w-[400px] flex flex-col gap-4 order-2 xl:order-1 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Header Card */}
        <Card className="p-5 bg-slate-900/50 border-slate-800 text-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Zoomer CFD Engine</h2>
              <p className="text-xs text-slate-400 font-mono">v2.4.0-alpha • Potential Flow</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-950/50 p-3 rounded border border-slate-800/50">
              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Drag Coeff</div>
              <div className="text-2xl font-mono text-white">{activeConfig.dragCoeff}</div>
            </div>
            <div className="bg-slate-950/50 p-3 rounded border border-slate-800/50">
              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Mach Limit</div>
              <div className="text-2xl font-mono text-white">{activeConfig.machLimit}</div>
            </div>
          </div>

          <Button 
            className={cn(
              "w-full h-12 font-bold tracking-wide transition-all",
              isRunning 
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
            )}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <><Pause className="w-4 h-4 mr-2" /> PAUSE SIMULATION</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> INITIALIZE SOLVER</>
            )}
          </Button>
        </Card>

        {/* Configuration Tabs */}
        <Card className="flex-1 bg-slate-900/50 border-slate-800 p-0 overflow-hidden flex flex-col">
          <Tabs defaultValue="config" className="w-full flex flex-col h-full">
            <div className="p-4 border-b border-slate-800">
              <TabsList className="w-full grid grid-cols-3 bg-slate-950">
                <TabsTrigger value="config">Config</TabsTrigger>
                <TabsTrigger value="physics">Physics</TabsTrigger>
                <TabsTrigger value="visual">Visuals</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <TabsContent value="config" className="mt-0 space-y-4">
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs uppercase font-bold">Root Chord Profile</Label>
                  {AERO_CONFIGS.map((cfg) => (
                    <div 
                      key={cfg.id}
                      onClick={() => setActiveConfigId(cfg.id)}
                      className={cn(
                        "group cursor-pointer p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02]",
                        activeConfigId === cfg.id 
                          ? "bg-slate-800 border-blue-500/50 shadow-md shadow-blue-900/10" 
                          : "bg-slate-950/30 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn(
                          "font-medium text-sm",
                          activeConfigId === cfg.id ? "text-blue-400" : "text-slate-300"
                        )}>{cfg.name}</span>
                        {activeConfigId === cfg.id && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{cfg.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="physics" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-300">Simulation Speed</Label>
                    <span className="text-xs font-mono text-slate-500">{simSpeed[0]}x</span>
                  </div>
                  <Slider 
                    value={simSpeed} 
                    onValueChange={setSimSpeed} 
                    max={3} 
                    step={0.1} 
                    className="py-2"
                  />
                  
                  <div className="flex justify-between items-center pt-2">
                    <Label className="text-slate-300">Fluid Turbulence</Label>
                    <span className="text-xs font-mono text-slate-500">{(turbulence[0] * 100).toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={turbulence} 
                    onValueChange={setTurbulence} 
                    max={0.5} 
                    step={0.01} 
                    className="py-2"
                  />

                  <div className="flex justify-between items-center pt-2">
                    <Label className="text-slate-300">Particle Count</Label>
                    <span className="text-xs font-mono text-slate-500">{particleCount[0]}</span>
                  </div>
                  <Slider 
                    value={particleCount} 
                    onValueChange={setParticleCount} 
                    min={50} 
                    max={500} 
                    step={10} 
                    className="py-2"
                  />
                </div>

                <div className="p-3 bg-yellow-500/5 rounded border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <p className="text-xs text-yellow-500/80">
                      Increasing particle count above 300 may impact performance on mobile devices.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="visual" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <Label className="text-slate-400 text-xs uppercase font-bold">Data Layers</Label>
                  
                  <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded text-purple-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">Flow Streamlines</div>
                        <div className="text-xs text-slate-500">Velocity gradients</div>
                      </div>
                    </div>
                    <Switch checked={viewMode === "flow"} onCheckedChange={() => setViewMode("flow")} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded text-red-400">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">Pressure Map</div>
                        <div className="text-xs text-slate-500">Surface distribution</div>
                      </div>
                    </div>
                    <Switch checked={viewMode === "pressure"} onCheckedChange={() => setViewMode("pressure")} />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded text-orange-400">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">Thermal Analysis</div>
                        <div className="text-xs text-slate-500">Kinetic heating</div>
                      </div>
                    </div>
                    <Switch checked={viewMode === "thermal"} onCheckedChange={() => setViewMode("thermal")} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>

      {/* RIGHT COLUMN: 3D Viewport */}
      <div className="flex-1 order-1 xl:order-2 relative bg-black rounded-lg border border-slate-800 overflow-hidden group">
        
        {/* Viewport Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
           <Badge variant="outline" className="bg-black/50 backdrop-blur text-slate-300 border-slate-700">
             <Zap className="w-3 h-3 mr-1 text-yellow-400" />
             {isRunning ? "SOLVER ACTIVE" : "READY"}
           </Badge>
           <Badge variant="outline" className="bg-black/50 backdrop-blur text-slate-300 border-slate-700">
             FPS: 60
           </Badge>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <Button size="icon" variant="ghost" className="bg-black/50 hover:bg-slate-800 text-white">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* 3D Scene */}
        <Canvas shadows className="w-full h-full">
          <PerspectiveCamera makeDefault position={[5, 2, 5]} fov={50} />
          
          <OrbitControls 
            enablePan={false}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI - 0.1}
            minDistance={3}
            maxDistance={15}
          />
          
          {/* Environment & Lights */}
          <color attach="background" args={['#020617']} />
          <fog attach="fog" args={['#020617', 5, 20]} />
          
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
          />
          <Environment preset="city" />

          {/* Simulation Content */}
          <group position={[0, -1, 0]}>
            <Suspense fallback={null}>
              <RocketModel rotationSpeed={isRunning ? 0 : 0.1} />
            </Suspense>
            
            <SimulationRenderer 
              isRunning={isRunning} 
              config={activeConfig}
              particleCount={particleCount[0]}
              turbulence={turbulence[0]}
            />
            
            {/* Floor Grid for reference */}
            <gridHelper args={[20, 20, 0x1e293b, 0x0f172a]} position={[0, -2, 0]} />
          </group>

          {/* Performance Stats */}
          {/* <Stats /> */}
        </Canvas>

        {/* Overlay Gradient for depth */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>
    </div>
  );
};

export default ZoomerCFDViewer;
