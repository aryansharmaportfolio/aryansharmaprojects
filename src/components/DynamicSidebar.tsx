import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// --- NEW SMOKE PARTICLE INTERFACE ---
interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  duration: number;
}

interface DynamicSidebarProps {
  returnSection: string;
}

// --- NEW ROCKET ICON COMPONENT ---
// We build the rocket with divs to animate it
const RocketIcon = ({ isLaunching, isIdle }: { isLaunching: boolean; isIdle: boolean }) => (
  <div
    className={cn(
      "relative w-8 h-20 transition-transform duration-500 ease-in-out",
      "rotate-[-135deg]", // Default rotation
      isIdle && !isLaunching && "animate-rocket-idle",
      isLaunching && "animate-rocket-launch"
    )}
  >
    {/* Body */}
    <div className="absolute bottom-4 left-1/2 w-8 h-20 -translate-x-1/2 bg-gradient-to-t from-gray-300 to-white rounded-t-full border-2 border-gray-400" />
    {/* Nose Cone */}
    <div className="absolute top-0 left-1/2 w-0 h-0 -translate-x-1/2 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-red-600" />
    {/* Fins */}
    <div className="absolute bottom-4 left-0 w-3 h-8 bg-red-600 rounded-l-md -skew-y-[30deg]" />
    <div className="absolute bottom-4 right-0 w-3 h-8 bg-red-600 rounded-r-md skew-y-[30deg]" />
    {/* Window */}
    <div className="absolute top-8 left-1/2 w-4 h-4 -translate-x-1/2 bg-blue-300 rounded-full border-2 border-gray-500" />
    
    {/* Thruster Base */}
    <div className="absolute bottom-0 left-1/2 w-6 h-4 -translate-x-1/2 bg-gray-500 rounded-b-md" />
  </div>
);


const DynamicSidebar = ({ returnSection }: DynamicSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLaunching, setIsLaunching] = useState(false);
  // --- Updated state name ---
  const [particles, setParticles] = useState<SmokeParticle[]>([]);
  const navigate = useNavigate();
  const particleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- HEAVILY MODIFIED PARTICLE GENERATOR ---
  const addParticle = (isLaunch = false) => {
    const newParticle: SmokeParticle = {
      id: Date.now() + Math.random(),
      x: Math.random() * 20 - 10, // Spread
      y: Math.random() * 10, // Start below rocket
      scale: Math.random() * 0.5 + (isLaunch ? 1.5 : 0.5),
      opacity: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 0.5 + (isLaunch ? 0.3 : 0.8), // Faster for launch
    };
    setParticles(prev => [...prev.slice(-50), newParticle]); // More particles
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isLaunching) {
      particleIntervalRef.current = setInterval(() => addParticle(false), 100); // Slower idle
    }
  };

  const handleMouseLeave = () => {
    if (particleIntervalRef.current) {
      clearInterval(particleIntervalRef.current);
    }
  };

  const handleLaunch = () => {
    if (isLaunching) return;

    setIsLaunching(true);
    if (particleIntervalRef.current) clearInterval(particleIntervalRef.current);

    // Intense particle burst for launch
    const launchInterval = setInterval(() => addParticle(true), 25); // Much faster

    setTimeout(() => {
      clearInterval(launchInterval);
    }, 1000); // Burst for 1 second

    setTimeout(() => {
      navigate("/", { state: { section: returnSection } });
      // Reset state after navigation
      setTimeout(() => setIsLaunching(false), 500); 
    }, 1200); // Navigate after launch anim finishes
  };

  const toggleSidebar = () => {
    if (isMobile) setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          className={cn(
            "fixed inset-0 bg-black/50 z-40 transition-opacity",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn("fixed top-0 left-0 h-full group z-50")}
      >
        {/* --- UPGRADED VERTICAL TAB --- */}
        <div
          onClick={isMobile ? toggleSidebar : undefined}
          className={cn(
            "absolute left-0 w-16 bg-black/60 backdrop-blur-md border-t-2 border-b-2 border-r-2 border-white/10 shadow-2xl flex items-center justify-center transition-all duration-500 ease-in-out cursor-pointer overflow-hidden",
            !isMobile && "group-hover:opacity-0 group-hover:translate-x-[-100%]",
            isMobile ? "h-64 top-1/2 -translate-y-1/2 rounded-r-lg" : "h-full top-0"
          )}
        >
          {/* Inner glow effect */}
          <div className={cn("absolute inset-0 animate-pulse-slow bg-white/10", isMobile && "rounded-r-lg")} />
          <div className={cn("absolute inset-1 border border-white/20", isMobile && "rounded-r-md")} />
          <span className="[writing-mode:vertical-rl] transform rotate-180 text-white text-3xl font-black uppercase tracking-widest text-shadow-glow">
            Back to Portfolio
          </span>
        </div>

        {/* --- UPGRADED HOVER PANEL --- */}
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-96 flex items-center justify-center bg-black/80 backdrop-blur-xl border-r-2 border-white/10 transition-transform duration-500 ease-in-out pointer-events-none overflow-hidden",
            isMobile
              ? (isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full")
              : "-translate-x-full group-hover:translate-x-0 group-hover:pointer-events-auto"
          )}
        >
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white hover:text-primary z-20">
              <X size={32} />
            </button>
          )}

          {/* Grid Background */}
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />
          
          {/* Scan Line Effect */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 animate-scan-line z-0" />

          {/* --- NEW LAUNCH BUTTON / ROCKET AREA --- */}
          <div
            onClick={handleLaunch}
            className="relative z-10 flex flex-col items-center gap-10 text-white font-semibold text-2xl tracking-wider transition-all duration-300 cursor-pointer w-full px-10"
          >
            {/* Rocket + Particle Container */}
            <div className="relative h-40 w-full flex items-center justify-center">
              <div className="absolute bottom-0 w-24 h-40">
                {/* Particle Emitter */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8">
                  {particles.map(p => (
                    <div
                      key={p.id}
                      className="absolute left-1/2 top-full w-3 h-3 rounded-full animate-thrust"
                      style={{
                        // @ts-ignore
                        '--x': `${p.x}px`,
                        '--y': `${p.y}px`,
                        '--scale-start': p.scale,
                        '--scale-end': p.scale * 0.1,
                        '--opacity-start': p.opacity,
                        '--duration': `${p.duration}s`,
                        background: isLaunching 
                          ? 'radial-gradient(circle, rgba(255,200,50,1) 0%, rgba(255,0,0,0) 70%)' 
                          : 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
                      }}
                    />
                  ))}
                </div>
                {/* Rocket Icon */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                  <RocketIcon isLaunching={isLaunching} isIdle={!isMobile && !isLaunching} />
                </div>
              </div>
            </div>

            {/* Launch Button Text */}
            <div className="relative w-full flex flex-col items-center justify-center gap-4">
              <div className="relative w-full h-0.5 bg-white/20" />
              <div className={cn(
                "absolute w-full h-0.5 bg-white transition-transform duration-700 ease-in-out",
                (isMobile && isOpen) ? "scale-x-100 delay-200" : "scale-x-0 group-hover:scale-x-100 group-hover:delay-200"
              )} />
              <span className={cn(
                "transition-opacity duration-300",
                isLaunching ? "opacity-0" : "opacity-100"
              )}>
                Back to Portfolio
              </span>
              <span className={cn(
                "absolute transition-opacity duration-300",
                isLaunching ? "opacity-100" : "opacity-0"
              )}>
                LAUNCHING...
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicSidebar;
