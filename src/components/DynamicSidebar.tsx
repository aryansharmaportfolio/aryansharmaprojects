import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SmokePuff {
  id: number;
  x: number;
  y: number;
  scale: number;
}

interface DynamicSidebarProps {
  returnSection: string;
}

const DynamicSidebar = ({ returnSection }: DynamicSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLaunching, setIsLaunching] = useState(false);
  const [smoke, setSmoke] = useState<SmokePuff[]>([]);
  const navigate = useNavigate();
  const smokeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const addSmokePuff = (isLaunch = false) => {
    const newPuff: SmokePuff = {
      id: Date.now() + Math.random(),
      x: isLaunch ? 20 + Math.random() * 10 : 0,
      y: Math.random() * 10 - 5,
      scale: Math.random() * 0.5 + (isLaunch ? 1.2 : 0.8),
    };
    setSmoke(prev => [...prev.slice(-20), newPuff]);
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isLaunching) {
      smokeIntervalRef.current = setInterval(() => addSmokePuff(false), 150);
    }
  };

  const handleMouseLeave = () => {
    if (smokeIntervalRef.current) {
      clearInterval(smokeIntervalRef.current);
    }
  };

  const handleLaunch = () => {
    if (isLaunching) return;

    setIsLaunching(true);
    if (smokeIntervalRef.current) clearInterval(smokeIntervalRef.current);

    const launchSmokeInterval = setInterval(() => addSmokePuff(true), 40);

    setTimeout(() => {
      clearInterval(launchSmokeInterval);
      navigate("/", { state: { section: returnSection } });
    }, 800);
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
        <div
          onClick={isMobile ? toggleSidebar : undefined}
          className={cn(
            "absolute left-0 w-16 bg-black/60 backdrop-blur-md border-t-2 border-b-2 border-r-2 border-white/10 shadow-2xl flex items-center justify-center transition-all duration-500 ease-in-out cursor-pointer",
            !isMobile && "group-hover:opacity-0 group-hover:translate-x-[-100%]",
            isMobile ? "h-64 top-1/2 -translate-y-1/2 rounded-r-lg" : "h-full top-0"
          )}
        >
          <div className={cn("absolute inset-0 animate-pulse-slow bg-white/10", isMobile && "rounded-r-lg")} />
          <span className="[writing-mode:vertical-rl] transform rotate-180 text-white text-3xl font-black uppercase tracking-widest text-shadow-glow">
            Back to Portfolio
          </span>
        </div>

        <div
          className={cn(
            "fixed top-0 left-0 h-full w-96 flex items-center justify-center bg-black/80 backdrop-blur-xl border-r-2 border-white/10 transition-transform duration-500 ease-in-out pointer-events-none",
            isMobile
              ? (isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full")
              : "-translate-x-full group-hover:translate-x-0 group-hover:pointer-events-auto"
          )}
        >
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white hover:text-primary">
              <X size={32} />
            </button>
          )}

          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          <div
            onClick={handleLaunch}
            className="relative z-10 flex flex-col items-center gap-6 text-white font-semibold text-2xl tracking-wider transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="relative h-10 w-10 flex items-center justify-center">
              <span className={cn(
                "text-4xl",
                isLaunching ? "animate-rocket-launch" : "group-hover:animate-rocket-idle rotate-[-135deg]"
              )}>
                🚀
              </span>
              <div className="absolute top-1/2 left-1/2">
                {smoke.map(puff => (
                  <div
                    key={puff.id}
                    className="absolute w-6 h-6 rounded-full animate-smoke-puff"
                    style={{
                      transform: `translate(${puff.x}px, ${puff.y}px) scale(${puff.scale})`,
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)'
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute w-1/2 h-0.5 bg-white/20" />
              <div className={cn(
                "absolute w-full h-0.5 bg-white transition-transform duration-700 ease-in-out",
                (isMobile && isOpen) ? "scale-x-100 delay-200" : "scale-x-0 group-hover:scale-x-100 group-hover:delay-200"
              )} />
            </div>
            <span>Back to Portfolio</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicSidebar;
