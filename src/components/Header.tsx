import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SmokePuff {
  id: number;
  left: number;
}

const Header = ({ activeSection }: { activeSection: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [smoke, setSmoke] = useState<SmokePuff[]>([]);
  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);
  const isScrolling = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      setIsScrolled(scrollY > 50); // Trigger earlier for the floating effect
      
      if (scrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      lastScrollY.current = scrollY;

      if (totalHeight > 0) {
        const progress = (scrollY / totalHeight) * 100;
        setScrollProgress(progress);

        if (isScrolled && progress > 0.1) {
          const offset = scrollDirection === 'down' ? -1.2 : 1.2;
          const newSmokePuff: SmokePuff = {
            id: Date.now() + Math.random(),
            left: progress + offset,
          };
          setSmoke(prevSmoke => {
            const newPuffs = [...prevSmoke, newSmokePuff];
            return newPuffs.slice(-15);
          });

          setTimeout(() => {
            setSmoke(prevSmoke => prevSmoke.filter(p => p.id !== newSmokePuff.id));
          }, 1200);
        }
      }

      if (isScrolling.current) {
        clearTimeout(isScrolling.current);
      }

      isScrolling.current = setTimeout(() => {
        setSmoke([]);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled, scrollDirection]);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
      { label: "Home", id: "home" },
      { label: "About", id: "about" },
      { label: "Projects", id: "projects" },
      { label: "Experience", id: "current-work" },
      { label: "Clubs", id: "clubs" },
  ];

  const rocketRotation = scrollDirection === "down" ? "rotate(45deg)" : "rotate(-135deg)";

  return (
    <>
      {/* Floating Glass Navbar */}
      <header
        className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out",
          isScrolled 
            ? "w-[90%] max-w-5xl rounded-full glass-panel px-8 py-3 border-white/10 bg-black/40" 
            : "w-full max-w-7xl px-6 py-6 bg-transparent border-none shadow-none"
        )}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => scrollToSection("home")}
            className={cn(
              "text-2xl font-bold transition-all duration-300 hover:text-primary tracking-tighter",
              isScrolled ? "text-white text-xl" : "text-white"
            )}
          >
            Aryan Sharma<span className="text-primary">.</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full hover:text-white group",
                  activeSection === item.id ? "text-white bg-white/10" : "text-white/60"
                )}
              >
                {item.label}
                {/* Subtle underline effect */}
                <span className={cn(
                  "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100",
                  activeSection === item.id && "opacity-100"
                )} />
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Rocket Progress Tracker - Fixed to bottom or top depending on preference, keeping existing logic */}
      <div
        className={cn(
          "fixed top-0 left-0 h-1 w-full z-50 pointer-events-none transition-opacity duration-300",
          isScrolled ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="relative w-full h-full">
          {/* Smoke Particles */}
          {smoke.map((puff) => (
            <div
              key={puff.id}
              className="absolute top-4 w-3 h-3 rounded-full -translate-y-1/2 -translate-x-1/2 animate-smoke-puff bg-white/30 blur-[2px]"
              style={{ left: `${puff.left}%` }}
            />
          ))}
          {/* Rocket Icon */}
          <div
            className="absolute top-4 -translate-y-1/2 -translate-x-1/2 transition-transform duration-100 will-change-transform"
            style={{ 
              left: `${scrollProgress}%`,
              transform: `translateX(-50%) ${rocketRotation}`
            }}
          >
            <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">🚀</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
