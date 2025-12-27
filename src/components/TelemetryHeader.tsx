import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
// ADDED "Rocket" to the imports below
import { Menu, X, Crosshair, Activity, Zap, Rocket } from "lucide-react";
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";

// --- TYPES & INTERFACES ---
interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
  life: number; // 0 to 1
}

interface NavItem {
  label: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", id: "home" },
  { label: "About Me", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Current Work", id: "current-work" },
  { label: "Clubs", id: "clubs" },
];

// --- UTILITY: MAGNETIC BUTTON COMPONENT ---
// A button that physically pulls towards your cursor
const MagneticButton = ({ children, onClick, active, className }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 }); // Magnetic strength
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const { x, y } = position;
  return (
    <motion.button
      ref={ref}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      onClick={onClick}
      className={cn("relative z-10", className)}
    >
      {children}
    </motion.button>
  );
};

// --- MAIN COMPONENT ---
const TelemetryHeader = ({ activeSection }: { activeSection: string }) => {
  // 1. SCROLL PHYSICS
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // 2. STATE
  const [headerState, setHeaderState] = useState<"transparent" | "glass">("transparent");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState<string>("");
  const [particles, setParticles] = useState<SmokeParticle[]>([]);
  const [isHoveringNav, setIsHoveringNav] = useState<string | null>(null);

  // 3. REFS
  const containerRef = useRef<HTMLElement>(null);
  const requestRef = useRef<number>();
  const lastScrollY = useRef(0);

  // --- LOGIC: HEADER TRANSITION ---
  // We calculate opacity based on Viewport Height.
  // The fade happens ONLY after 2.2 viewport heights (approx 2200px)
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const updateHeaderVisuals = () => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        
        // Threshold: Start fading at 2.2vh, finish at 2.8vh
        const startFade = vh * 2.2;
        const endFade = vh * 2.8;
        
        let newOpacity = 0;
        if (y > startFade) {
            newOpacity = Math.min((y - startFade) / (endFade - startFade), 1);
        }
        
        setOpacity(newOpacity);
        setHeaderState(newOpacity > 0.1 ? "glass" : "transparent");

        // Update Time string (UTC style)
        const now = new Date();
        setTime(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')} UTC`);
    };

    window.addEventListener("scroll", updateHeaderVisuals);
    const interval = setInterval(updateHeaderVisuals, 1000); // Time update
    return () => {
        window.removeEventListener("scroll", updateHeaderVisuals);
        clearInterval(interval);
    };
  }, []);

  // --- LOGIC: ROCKET & SMOKE PARTICLE SYSTEM ---
  useEffect(() => {
    const updateParticles = () => {
      const currentScroll = window.scrollY;
      const velocity = currentScroll - lastScrollY.current;
      lastScrollY.current = currentScroll;
      
      // Calculate Rocket Position (0% to 100% across screen)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(currentScroll / docHeight, 0), 1);
      
      // Spawn new particles if moving
      if (Math.abs(velocity) > 1) {
        const newParticle: SmokeParticle = {
          id: Math.random(),
          x: progress * window.innerWidth, // Rocket X position
          y: 64, // Just below header (approx 4rem)
          size: Math.random() * 4 + 2,
          rotation: Math.random() * 360,
          velocity: { 
            x: (Math.random() - 0.5) * 2, // Random spread
            y: Math.random() * 2 + 1 // Falling down slightly
          },
          life: 1.0
        };
        
        setParticles(prev => [...prev, newParticle].slice(-50)); // Limit to 50 particles
      }

      // Update existing particles
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x - (velocity * 0.05) + p.velocity.x, // Drag effect
        y: p.y + p.velocity.y,
        life: p.life - 0.02,
        size: p.size * 1.05 // Expand over time
      })).filter(p => p.life > 0));

      requestRef.current = requestAnimationFrame(updateParticles);
    };

    requestRef.current = requestAnimationFrame(updateParticles);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header
        ref={containerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none"
        style={{
            height: '80px', // Fixed height for hit area
        }}
    >
        {/* --- DYNAMIC BACKGROUND PANEL --- */}
        <div 
            className="absolute inset-0 w-full h-full border-b border-white/5 transition-all duration-700 ease-out"
            style={{
                backgroundColor: `hsla(0, 0%, 17%, ${opacity * 0.95})`, // The #2b2b2b color
                backdropFilter: `blur(${opacity * 12}px)`,
                transform: `translateY(${opacity === 0 ? '-100%' : '0%'})`, // Slides down when active
                opacity: opacity
            }}
        />

        {/* --- MAIN CONTENT CONTAINER --- */}
        <div className="relative z-50 container mx-auto px-4 h-full flex items-center justify-between pointer-events-auto">
            
            {/* 1. LEFT: IDENTITY & STATUS */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => scrollToSection('home')}
                    className="group flex flex-col items-start"
                >
                    <h1 className="text-xl font-bold text-white tracking-tighter group-hover:text-primary transition-colors">
                        ARYAN SHARMA
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Sys.Online
                    </div>
                </button>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-8 bg-white/10" />

                {/* Telemetry Data (Desktop) */}
                <div className="hidden md:flex flex-col gap-0.5 font-mono text-[10px] text-white/40">
                    <div className="flex items-center gap-2">
                         <Crosshair size={10} /> 
                         <span>COORD: {Math.round(window.scrollY)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Activity size={10} />
                         <span>VEL: {Math.round(smoothVelocity.get())}</span>
                    </div>
                </div>
            </div>

            {/* 2. CENTER: DYNAMIC ISLAND NAVIGATION (Desktop) */}
            <nav className="hidden md:flex items-center p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeSection === item.id || (item.id === 'home' && !activeSection);
                    return (
                        <MagneticButton
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            {/* Hover/Active Background */}
                            {(isActive || isHoveringNav === item.id) && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className={cn(
                                        "absolute inset-0 rounded-full",
                                        isActive ? "bg-white" : "bg-white/10"
                                    )}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            
                            <span className={cn(
                                "relative z-10 transition-colors duration-200",
                                isActive ? "text-black font-bold" : "text-white hover:text-white"
                            )}>
                                {item.label}
                            </span>
                        </MagneticButton>
                    );
                })}
            </nav>

            {/* 3. RIGHT: UTILS & TIME */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end font-mono text-[10px] text-white/40">
                    <span className="flex items-center gap-1">
                        <Zap size={10} className="text-yellow-500" />
                        PWR: 100%
                    </span>
                    <span>{time}</span>
                </div>

                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </div>

        {/* --- ROCKET TRACKER (THE BOTTOM LINE) --- */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
             {/* The Rocket Icon moving across the screen */}
             <motion.div 
                className="absolute top-1/2 -translate-y-1/2 will-change-transform z-20"
                style={{ 
                    left: `${(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` 
                }}
             >
                 {/* Rocket Graphic */}
                 <div className="relative -translate-x-1/2 group cursor-grab active:cursor-grabbing">
                    <div className="relative z-10 p-1.5 bg-[#2b2b2b] border border-white/20 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                         <Rocket 
                            size={14} 
                            className="text-white transform rotate-45"
                         />
                    </div>
                    {/* Glow */}
                    <div className="absolute inset-0 bg-primary/50 blur-md rounded-full animate-pulse" />
                 </div>
             </motion.div>

             {/* The Progress Fill Line */}
             <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/50 to-white"
                style={{ 
                    width: `${(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` 
                }}
             />
        </div>

        {/* --- SMOKE PARTICLE CANVAS (RENDERED AS DOM NODES FOR EASE) --- */}
        <div className="absolute top-0 left-0 w-full h-[200px] pointer-events-none overflow-hidden">
             <AnimatePresence>
                 {particles.map((p) => (
                     <motion.div
                        key={p.id}
                        initial={{ opacity: 0.5, scale: 0 }}
                        animate={{ opacity: 0, scale: p.life * 2 }} // Fade out
                        exit={{ opacity: 0 }}
                        className="absolute rounded-full bg-white/20 blur-sm"
                        style={{
                            left: p.x,
                            top: 80 + (1 - p.life) * 50, // Fall down
                            width: p.size,
                            height: p.size,
                        }}
                     />
                 ))}
             </AnimatePresence>
        </div>

        {/* --- MOBILE MENU --- */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-[#1a1a1a] border-b border-white/10 overflow-hidden pointer-events-auto"
                >
                    <nav className="flex flex-col p-4 gap-2">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all",
                                    activeSection === item.id ? "bg-white text-black" : "text-white/70 hover:bg-white/5"
                                )}
                            >
                                <div className={cn("w-1.5 h-1.5 rounded-full", activeSection === item.id ? "bg-black" : "bg-white/20")} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    </header>
  );
};

export default TelemetryHeader;
