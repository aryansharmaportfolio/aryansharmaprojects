import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

interface SmokePuff {
  id: number;
  left: number;
}

const Header = ({ activeSection }: { activeSection: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  // Controls the gradient fade opacity of the header background
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [smoke, setSmoke] = useState<SmokePuff[]>([]);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isScrolling = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const vh = window.innerHeight;

      // --- UPDATED OPACITY LOGIC ---
      // The Hero section is roughly 300vh. The video plays during the first ~200vh.
      // We keep the header transparent until 1.5vh (1.5x viewport height).
      // Then we fade it in over the next 0.7vh so it's fully opaque by ~2.2vh
      // (where the text content typically starts overlapping).
      const startFade = vh * 1.5;
      const fadeLength = vh * 0.7; 
      
      const opacity = Math.max(0, Math.min((scrollY - startFade) / fadeLength, 1));
      setHeaderOpacity(opacity);

      // We still track "isScrolled" for the smoke animation to work immediately,
      // even if the background is transparent.
      setIsScrolled(scrollY > 10);
      
      if (scrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      lastScrollY.current = scrollY;

      if (totalHeight > 0) {
        const progress = (scrollY / totalHeight) * 100;
        setScrollProgress(progress);

        // Smoke logic (using scrollY directly instead of state to avoid stale closure)
        if (scrollY > 10 && progress > 0.1) {
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
  }, [scrollDirection]); // Removed isScrolled dependency to prevent excessive re-runs

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMobileMenuOpen(false);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
      { label: "Home", id: "home" },
      { label: "About Me", id: "about" },
      { label: "Projects", id: "projects" },
      { label: "Current Work", id: "current-work" },
      { label: "Clubs", id: "clubs" },
  ];

  const rocketRotation = scrollDirection === "down" 
    ? "rotate(45deg)" 
    : "rotate(-135deg)";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        // Dynamic background color matching the site's dark grey (0 0% 17% is approx #2b2b2b)
        backgroundColor: `hsla(0, 0%, 17%, ${headerOpacity})`,
        backdropFilter: headerOpacity > 0.8 ? 'blur(8px)' : 'none',
        // Border also fades in with opacity
        borderBottom: `1px solid rgba(255, 255, 255, ${headerOpacity * 0.05})`,
        // Hide pointer events when transparent so it doesn't block clicks on the video
        pointerEvents: headerOpacity === 0 ? 'none' : 'auto' 
      }}
    >
      {/* Wrapper to restore pointer events for the actual buttons/content even if background is transparent */}
      <div className="pointer-events-auto container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <button
          onClick={() => scrollToSection("home")}
          className="text-lg sm:text-xl md:text-2xl font-bold text-white hover:text-primary transition-colors"
        >
          Aryan Sharma
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-8">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "text-sm lg:text-base text-white/80 font-medium transition-all duration-200 hover:text-white hover:font-bold hover:scale-105",
                (activeSection === item.id || (item.id === 'home' && !activeSection)) && "font-bold text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-[#2b2b2b]/98 backdrop-blur-lg border-t border-white/10 transition-all duration-300 overflow-hidden pointer-events-auto",
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "text-left py-3 px-4 rounded-lg text-white font-medium transition-all duration-200",
                (activeSection === item.id || (item.id === 'home' && !activeSection)) 
                  ? "bg-white/10 font-bold" 
                  : "hover:bg-white/5"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Smoke Progress Bar */}
      <div
        className={`absolute bottom-0 left-0 h-px w-full transition-opacity duration-300 pointer-events-none ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative h-full w-full">
          {smoke.map((puff) => (
            <div
              key={puff.id}
              className="absolute top-0 w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2 animate-[fadeOut_1.2s_ease-out_forwards]"
              style={{ 
                left: `${puff.left}%`,
                background: 'radial-gradient(circle, rgba(150, 150, 150, 0.4) 0%, rgba(150, 150, 150, 0) 70%)'
              }}
            />
          ))}
          <div
            className="absolute top-0 -translate-y-1/2 -translate-x-1/2"
            style={{ 
              left: `${scrollProgress}%`,
            }}
          >
            <span 
              className="text-2xl transition-transform duration-200"
              style={{ 
                display: "inline-block",
                transform: rocketRotation,
              }}
            >
              🚀
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
