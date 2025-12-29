import React, { useState, useMemo, useRef, useEffect, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  PerspectiveCamera, 
  Environment, 
  Center,
  Html,
  Stats,
  Instance,
  Instances
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
  Zap,
  ArrowRight,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// --- SHADER DEFINITIONS ---
// ------------------------------------------------------------------

// 1. Flow Lines Shader (Advanced)
const flowVertexShader = `
  attribute float speed;
  attribute float life;
  attribute float offset;
  
  varying float vSpeed;
  varying float vLife;
  varying vec3 vColor;

  uniform vec3 colorLow;
  uniform vec3 colorHigh;
  uniform float time;

  // Simple pseudo-random
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vSpeed = speed;
    vLife = life;
    
    // Dynamic color mixing based on speed
    vColor = mix(colorLow, colorHigh, clamp(speed * 0.5, 0.0, 1.0));

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const flowFragmentShader = `
  varying float vSpeed;
  varying float vLife;
  varying vec3 vColor;
  
  uniform float time;
  uniform float opacity;

  void main() {
    // Fade out based on life (head and tail)
    float alpha = opacity * smoothstep(0.0, 0.2, vLife) * (1.0 - smoothstep(0.8, 1.0, vLife));
    
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

// 2. Vector Field Arrow Shader (Instanced)
const arrowVertexShader = `
  attribute vec3 instanceOffset;
  attribute vec3 instanceDirection;
  attribute float instanceMagnitude;
  
  varying vec3 vColor;
  
  uniform vec3 colorSafe;
  uniform vec3 colorDanger;

  // Rotation matrix from direction
  mat4 rotationMatrix(vec3 axis, float angle) {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;
      
      return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                  0.0,                                0.0,                                0.0,                                1.0);
  }

  void main() {
    // Calculate color based on magnitude (pressure/velocity)
    vColor = mix(colorSafe, colorDanger, clamp(instanceMagnitude, 0.0, 1.0));

    // Align arrow to direction (assuming default arrow points +Y)
    vec3 defaultDir = vec3(0.0, 1.0, 0.0);
    vec3 dir = normalize(instanceDirection);
    vec3 axis = cross(defaultDir, dir);
    float angle = acos(dot(defaultDir, dir));
    
    mat4 rot = rotationMatrix(axis, angle);
    
    // Scale based on magnitude
    float scale = 0.5 + instanceMagnitude * 0.5;
    mat4 scaleMat = mat4(scale,0,0,0, 0,scale,0,0, 0,0,scale,0, 0,0,0,1);

    vec3 transformed = (rot * scaleMat * vec4(position, 1.0)).xyz;
    vec3 finalPos = instanceOffset + transformed;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const arrowFragmentShader = `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 0.8);
  }
`;


// ------------------------------------------------------------------
// --- DATA & CONFIG ---
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
  },
  {
    id: "cfg-4",
    name: "Vortex Generator",
    chordLength: 180,
    dragCoeff: 0.55,
    liftCoeff: 0.45,
    colorLow: "#8b5cf6", // Violet
    colorHigh: "#22c55e", // Green
    description: "High-AoA config designed to maintain attached flow.",
    machLimit: 0.95
  }
];

// ------------------------------------------------------------------
// --- SIMULATION ENGINE (Non-React, Optimized) ---
// ------------------------------------------------------------------

class FluidSolver {
  particles: Float32Array; // [x, y, z, vx, vy, vz, life, speed]
  count: number;
  bounds: { x: number, y: number, z: number };
  
  constructor(count: number) {
    this.count = count;
    this.particles = new Float32Array(count * 8);
    this.bounds = { x: 5, y: 8, z: 5 };
    this.reset();
  }

  reset() {
    for (let i = 0; i < this.count; i++) {
      this.spawnParticle(i);
    }
  }

  spawnParticle(index: number) {
    const i = index * 8;
    // Position (Top emitter)
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 4.0; // Uniform disk
    
    this.particles[i] = Math.cos(angle) * r;     // x
    this.particles[i+1] = 6 + Math.random() * 2; // y (start high)
    this.particles[i+2] = Math.sin(angle) * r;   // z
    
    // Velocity (Initial downward push)
    this.particles[i+3] = 0;    // vx
    this.particles[i+4] = -1.0; // vy
    this.particles[i+5] = 0;    // vz
    
    this.particles[i+6] = 0;    // life (0 to 1)
    this.particles[i+7] = 1.0;  // speed ref
  }

  update(dt: number, repulsion: number, turbulence: number, speedMult: number) {
    const p = this.particles;
    const center = new THREE.Vector3(0, 0, 0); // Obstacle center
    
    for (let i = 0; i < this.count; i++) {
      const idx = i * 8;
      
      // Update Life
      p[idx+6] += dt * 0.2 * speedMult;
      
      // Respawn if dead or out of bounds
      if (p[idx+6] > 1.0 || p[idx+1] < -6) {
        this.spawnParticle(i);
        continue;
      }

      const x = p[idx];
      const y = p[idx+1];
      const z = p[idx+2];
      
      // -- PHYSICS --
      
      // 1. Uniform Flow Field (Downwards)
      let fx = 0;
      let fy = -2.0;
      let fz = 0;
      
      // 2. Obstacle Interaction (Potential Flow approximation)
      const distSq = x*x + y*y + z*z;
      const dist = Math.sqrt(distSq);
      
      if (dist < 8.0) { // Optimization: only calc near object
        const safeDist = Math.max(dist, 0.5);
        // Force vector pointing away from center
        const nx = x / safeDist;
        const ny = y / safeDist;
        const nz = z / safeDist;
        
        // Strength falls off with distance
        // Modulate strength based on "y" to simulate shape (cylinder vs sphere)
        // A rocket is tall, so we care more about XZ distance mostly
        const radialDist = Math.sqrt(x*x + z*z);
        const verticalFactor = Math.abs(y) < 2.0 ? 1.5 : 0.5; // Stronger near body center
        
        const force = (repulsion * 10 * verticalFactor) / (distSq + 0.1);
        
        fx += nx * force;
        fy += ny * force * 0.5; // Deflect vertically less
        fz += nz * force;
      }

      // 3. Turbulence (Perlin-ish)
      const t = performance.now() * 0.001 * speedMult;
      fx += Math.sin(y * 2.0 + t) * turbulence;
      fz += Math.cos(y * 2.0 + t) * turbulence;
      
      // Integration (Euler)
      const vx = p[idx+3] + fx * dt * 5.0;
      const vy = p[idx+4] + fy * dt * 5.0;
      const vz = p[idx+5] + fz * dt * 5.0;
      
      // Damping
      p[idx+3] = vx * 0.95;
      p[idx+4] = vy * 0.95;
      p[idx+5] = vz * 0.95;
      
      // Position Update
      p[idx]   += p[idx+3] * dt * speedMult;
      p[idx+1] += p[idx+4] * dt * speedMult;
      p[idx+2] += p[idx+5] * dt * speedMult;
      
      // Store Speed for visual
      p[idx+7] = Math.sqrt(vx*vx + vy*vy + vz*vz);
    }
  }
}

// ------------------------------------------------------------------
// --- 3D SUB-COMPONENTS ---
// ------------------------------------------------------------------

// 1. Particle System Renderer
// Uses GL_POINTS or LineSegments depending on mode. Here we use optimized Trails.
const FlowParticles = ({ 
  count, 
  isRunning, 
  config, 
  simSpeed, 
  turbulence 
}: { 
  count: number, 
  isRunning: boolean, 
  config: AeroConfig, 
  simSpeed: number,
  turbulence: number 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const trailRef = useRef<THREE.LineSegments>(null);
  
  // Physics Engine Instance
  const solver = useMemo(() => new FluidSolver(count), [count]);
  
  // Fixed Geometry buffers for Trails (LineSegments)
  // Each particle has a trail of N segments
  const TRAIL_LENGTH = 10;
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * TRAIL_LENGTH * 2 * 3); // 2 verts per segment, 3 coords
    const speeds = new Float32Array(count * TRAIL_LENGTH * 2);
    const lifes = new Float32Array(count * TRAIL_LENGTH * 2);
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('life', new THREE.BufferAttribute(lifes, 1));
    return geo;
  }, [count]);
  
  // History buffer to store trail positions for render
  const historyRef = useRef<Float32Array[]>([]); 
  
  // Initialize history
  useEffect(() => {
    historyRef.current = Array(count).fill(0).map(() => new Float32Array(TRAIL_LENGTH * 3));
    solver.reset();
  }, [count, solver]);

  useFrame((state, delta) => {
    if (!isRunning || !trailRef.current) return;
    
    // Physics Step
    const repulsion = config.chordLength / 150;
    solver.update(Math.min(delta, 0.1), repulsion, turbulence, simSpeed);
    
    // Update Geometry Buffers
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
      
      // Shift history
      const hist = historyRef.current[i];
      // Move everything back 3 slots
      hist.copyWithin(3, 0, (TRAIL_LENGTH - 1) * 3);
      // Set new head
      hist[0] = x;
      hist[1] = y;
      hist[2] = z;
      
      // Update Attributes
      for (let t = 0; t < TRAIL_LENGTH - 1; t++) {
        const segIdx = (i * TRAIL_LENGTH + t) * 2; // 2 vertices per segment
        
        // Start vertex of segment
        positions[segIdx * 3]     = hist[t * 3];
        positions[segIdx * 3 + 1] = hist[t * 3 + 1];
        positions[segIdx * 3 + 2] = hist[t * 3 + 2];
        speeds[segIdx] = s;
        lifes[segIdx] = l;
        
        // End vertex of segment
        positions[(segIdx + 1) * 3]     = hist[(t + 1) * 3];
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
    mat.uniforms.time.value = state.clock.elapsedTime;
    mat.uniforms.colorLow.value.set(config.colorLow);
    mat.uniforms.colorHigh.value.set(config.colorHigh);
  });

  return (
    <lineSegments ref={trailRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial 
        vertexShader={flowVertexShader}
        fragmentShader={flowFragmentShader}
        uniforms={{
          time: { value: 0 },
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

// 2. Vector Field Grid (Arrows)
const VectorField = ({ active, config }: { active: boolean, config: AeroConfig }) => {
  const count = 500;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create a static grid of points
  const dummies = useMemo(() => {
    const arr = [];
    for (let i=0; i<count; i++) {
      const obj = new THREE.Object3D();
      // Grid pattern
      const row = Math.floor(i / 10);
      const col = i % 10;
      const layer = Math.floor(i / 100);
      
      obj.position.set(
        (col - 4.5) * 1.5,
        (layer - 2.5) * 2.0,
        (row % 10 - 4.5) * 1.5
      );
      obj.updateMatrix();
      arr.push(obj);
    }
    return arr;
  }, []);
  
  // Custom geometry for an arrow
  const arrowGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.1, 0.4, 8);
    geo.rotateX(Math.PI / 2); // Point Z
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !active) return;
    
    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const basePos = dummies[i].position;
      
      // Calculate Vector at this position (Simplified Potential Flow)
      const dist = basePos.length();
      const safeDist = Math.max(dist, 1.0);
      
      // Base flow (down)
      const flow = new THREE.Vector3(0, -1, 0);
      
      // Deflection around 0,0,0
      if (dist < 4.0) {
        const repulsion = basePos.clone().normalize().multiplyScalar(4.0 / (safeDist * safeDist));
        flow.add(repulsion);
      }
      
      // Turbulence
      flow.x += Math.sin(basePos.y + time) * 0.1;
      flow.z += Math.cos(basePos.y + time) * 0.1;
      
      // Align dummy
      dummy.position.copy(basePos);
      dummy.lookAt(basePos.clone().add(flow));
      dummy.scale.setScalar(flow.length()); // Scale by magnitude
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Color based on velocity
      const speed = flow.length();
      color.set(config.colorLow).lerp(new THREE.Color(config.colorHigh), Math.min(speed - 0.8, 1));
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[arrowGeo, undefined, count]}>
      <meshStandardMaterial />
    </instancedMesh>
  );
};

// 3. The Rocket Model
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
// --- MAIN APP COMPONENT ---
// ------------------------------------------------------------------

const ZoomerCFDViewer = () => {
  const [activeConfigId, setActiveConfigId] = useState<string>("cfg-2");
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState<"flow" | "vectors" | "pressure">("flow");
  
  // Advanced Settings
  const [simSpeed, setSimSpeed] = useState([1.0]);
  const [turbulence, setTurbulence] = useState([0.1]);
  const [particleCount, setParticleCount] = useState([200]); // Safe default
  
  const activeConfig = AERO_CONFIGS.find(c => c.id === activeConfigId) || AERO_CONFIGS[0];

  return (
    <div className="w-full h-[850px] flex flex-col xl:flex-row gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900 shadow-2xl overflow-hidden font-sans">
      
      {/* LEFT COLUMN: Control Interface */}
      <div className="w-full xl:w-[420px] flex flex-col gap-4 order-2 xl:order-1 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Main Status Card */}
        <Card className="p-0 bg-slate-900/60 border-slate-800 text-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
          
          <div className="p-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/10">
                  <Wind className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight tracking-tight">Zoomer CFD</h2>
                  <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Physics Engine v2.5</p>
                </div>
              </div>
              <Badge variant="outline" className={cn(
                "border-slate-700 font-mono text-xs transition-colors",
                isRunning ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-800 text-slate-500"
              )}>
                {isRunning ? "RUNNING" : "STANDBY"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
               <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800/60 relative overflow-hidden group">
                  <div className="absolute right-2 top-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Drag Coeff (Cd)</div>
                  <div className="text-2xl font-mono text-white tracking-tighter">{activeConfig.dragCoeff}</div>
               </div>
               <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800/60 relative overflow-hidden group">
                  <div className="absolute right-2 top-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Gauge className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Max Mach</div>
                  <div className="text-2xl font-mono text-white tracking-tighter">{activeConfig.machLimit}</div>
               </div>
            </div>

            <Button 
              className={cn(
                "w-full h-12 font-bold tracking-wide transition-all duration-300 relative overflow-hidden group",
                isRunning 
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
              )}
              onClick={() => setIsRunning(!isRunning)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="flex items-center justify-center gap-2">
                {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isRunning ? "HALT SIMULATION" : "INITIALIZE SOLVER"}
              </div>
            </Button>
          </div>
        </Card>

        {/* Control Tabs */}
        <Card className="flex-1 bg-slate-900/40 border-slate-800 p-0 overflow-hidden flex flex-col backdrop-blur-sm">
          <Tabs defaultValue="config" className="w-full flex flex-col h-full">
            <div className="p-1 m-2 bg-slate-950/80 rounded-lg border border-slate-800">
              <TabsList className="w-full grid grid-cols-3 bg-transparent h-9">
                <TabsTrigger value="config" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs">Config</TabsTrigger>
                <TabsTrigger value="physics" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs">Physics</TabsTrigger>
                <TabsTrigger value="visual" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs">View</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              
              {/* CONFIG TAB */}
              <TabsContent value="config" className="mt-0 space-y-3">
                <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest pl-1">Aerodynamic Profile</Label>
                {AERO_CONFIGS.map((cfg) => (
                  <div 
                    key={cfg.id}
                    onClick={() => setActiveConfigId(cfg.id)}
                    className={cn(
                      "group cursor-pointer p-3 rounded-lg border transition-all duration-200 relative overflow-hidden",
                      activeConfigId === cfg.id 
                        ? "bg-slate-800/80 border-blue-500/50 shadow-md shadow-blue-900/10" 
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    {/* Active Indicator Strip */}
                    {activeConfigId === cfg.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                    )}
                    
                    <div className="flex justify-between items-center mb-1 pl-2">
                      <span className={cn(
                        "font-medium text-sm",
                        activeConfigId === cfg.id ? "text-blue-400" : "text-slate-300"
                      )}>{cfg.name}</span>
                      <ArrowRight className={cn(
                        "w-3 h-3 transition-transform opacity-0 group-hover:opacity-100",
                        activeConfigId === cfg.id ? "text-blue-500 translate-x-0 opacity-100" : "text-slate-600 -translate-x-2"
                      )} />
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 pl-2 mb-2 font-mono">
                      <span>Chord: {cfg.chordLength}mm</span>
                      <span>Cl: {cfg.liftCoeff}</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-2 leading-relaxed border-t border-slate-800/50 pt-2 mt-2">
                      {cfg.description}
                    </p>
                  </div>
                ))}
              </TabsContent>

              {/* PHYSICS TAB */}
              <TabsContent value="physics" className="mt-0 space-y-6 px-1">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-300 flex items-center gap-2"><Settings2 className="w-3 h-3"/> Time Step</Label>
                      <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{simSpeed[0]}x</span>
                    </div>
                    <Slider 
                      value={simSpeed} 
                      onValueChange={setSimSpeed} 
                      max={3} 
                      step={0.1} 
                      className="[&_.relative]:h-1.5 [&_span]:bg-blue-600"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-300 flex items-center gap-2"><Wind className="w-3 h-3"/> Turbulence</Label>
                      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{(turbulence[0] * 100).toFixed(0)}%</span>
                    </div>
                    <Slider 
                      value={turbulence} 
                      onValueChange={setTurbulence} 
                      max={0.5} 
                      step={0.01} 
                      className="[&_.relative]:h-1.5 [&_span]:bg-purple-600"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-300 flex items-center gap-2"><Layers className="w-3 h-3"/> Resolution</Label>
                      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{particleCount[0]} pts</span>
                    </div>
                    <Slider 
                      value={particleCount} 
                      onValueChange={setParticleCount} 
                      min={50} 
                      max={500} 
                      step={50} 
                      className="[&_.relative]:h-1.5 [&_span]:bg-emerald-600"
                    />
                  </div>
                </div>

                <div className="p-3 bg-yellow-900/20 rounded border border-yellow-700/30">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-yellow-500/80 leading-snug">
                      <strong>GPU Load Warning:</strong> Higher resolution creates more trails. If frame rate drops, reduce particle count.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* VISUAL TAB */}
              <TabsContent value="visual" className="mt-0 space-y-2">
                <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-2 block">Visualization Modes</Label>
                
                <div 
                  className={cn("flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all", 
                    viewMode === 'flow' ? "bg-slate-800 border-blue-500/50" : "bg-slate-950/50 border-slate-800 hover:bg-slate-900")}
                  onClick={() => setViewMode('flow')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded text-blue-400">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">Streamlines</div>
                      <div className="text-[10px] text-slate-500">Lagrangian particle trails</div>
                    </div>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full border", viewMode === 'flow' ? "bg-blue-500 border-blue-500" : "border-slate-600")} />
                </div>

                <div 
                  className={cn("flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all", 
                    viewMode === 'vectors' ? "bg-slate-800 border-purple-500/50" : "bg-slate-950/50 border-slate-800 hover:bg-slate-900")}
                  onClick={() => setViewMode('vectors')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded text-purple-400">
                      <MousePointer2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">Vector Field</div>
                      <div className="text-[10px] text-slate-500">Velocity direction grid</div>
                    </div>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full border", viewMode === 'vectors' ? "bg-purple-500 border-purple-500" : "border-slate-600")} />
                </div>

                <div 
                  className={cn("flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all", 
                    viewMode === 'pressure' ? "bg-slate-800 border-red-500/50" : "bg-slate-950/50 border-slate-800 hover:bg-slate-900")}
                  onClick={() => setViewMode('pressure')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded text-red-400">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">Thermal/Pressure</div>
                      <div className="text-[10px] text-slate-500">Surface distribution map</div>
                    </div>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full border", viewMode === 'pressure' ? "bg-red-500 border-red-500" : "border-slate-600")} />
                </div>

              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>

      {/* RIGHT COLUMN: 3D Viewport */}
      <div className="flex-1 order-1 xl:order-2 relative bg-black rounded-lg border border-slate-800 overflow-hidden group select-none">
        
        {/* HUD Elements */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
           <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-slate-300 border-slate-700/50 shadow-xl">
             <Zap className={cn("w-3 h-3 mr-2", isRunning ? "text-yellow-400 fill-yellow-400" : "text-slate-600")} />
             {isRunning ? "SOLVER ACTIVE" : "SOLVER IDLE"}
           </Badge>
           {isRunning && (
             <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-blue-400 border-blue-900/30 animate-pulse">
               Calculating...
             </Badge>
           )}
        </div>

        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="text-[10px] font-mono text-slate-600 text-right">
            GRID: 32x32x32<br/>
            SOLVER: EULER<br/>
            DELTA: FIXED
          </div>
        </div>

        {/* 3D Scene */}
        <Canvas shadows dpr={[1, 2]} className="w-full h-full cursor-move">
          <PerspectiveCamera makeDefault position={[6, 3, 6]} fov={45} />
          
          <OrbitControls 
            enablePan={false}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 1.5}
            minDistance={4}
            maxDistance={20}
            autoRotate={!isRunning && viewMode === 'flow'}
            autoRotateSpeed={0.5}
          />
          
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 5, 25]} />
          
          <ambientLight intensity={0.2} />
          <spotLight 
            position={[10, 10, 5]} 
            angle={0.3} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
          />
          <pointLight position={[-10, -5, -10]} intensity={0.5} color="#4f46e5" />
          
          <Environment preset="city" />

          <group position={[0, -1, 0]}>
            {/* Center Rocket */}
            <Suspense fallback={null}>
              <RocketModel rotationSpeed={isRunning ? 0 : 0.1} />
            </Suspense>

            {/* Simulation Layers */}
            {viewMode === 'flow' && (
              <FlowParticles 
                count={particleCount[0]} 
                isRunning={isRunning} 
                config={activeConfig}
                simSpeed={simSpeed[0]}
                turbulence={turbulence[0]}
              />
            )}
            
            {viewMode === 'vectors' && (
               <VectorField active={isRunning} config={activeConfig} />
            )}

            {/* Floor Grid */}
            <gridHelper args={[20, 20, 0x1e293b, 0x0f172a]} position={[0, -1.5, 0]} />
          </group>

          {/* <Stats /> */}
        </Canvas>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Helper Badge Component Definition */}
      <div className="hidden">
        {/* Simple Badge component inline if imported one fails or for portability */}
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80"></div>
      </div>
    </div>
  );
};

// Simple Badge Component wrapper since we import it but might need customization
function Badge({ className, variant = "default", ...props }: any) {
  return (
    <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)} {...props} />
  )
}

export default ZoomerCFDViewer;
