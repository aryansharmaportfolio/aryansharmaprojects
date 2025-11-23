import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

interface SmokePuff {
  id: number;
  left: number;
}

const Header = ({ activeSection }: { activeSection: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <button
          onClick={() => scrollToSection("home")}
          className="text-lg sm:text-xl md:text-2xl font-bold text-foreground hover:text-primary transition-colors"
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
                "text-sm lg:text-base text-foreground font-medium transition-all duration-200 hover:text-white hover:font-bold hover:scale-105",
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
          className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg border-t border-border transition-all duration-300 overflow-hidden",
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "text-left py-3 px-4 rounded-lg text-foreground font-medium transition-all duration-200",
                (activeSection === item.id || (item.id === 'home' && !activeSection)) 
                  ? "bg-primary/20 font-bold text-white" 
                  : "hover:bg-muted/50"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div
        className={`absolute bottom-0 left-0 h-px w-full transition-opacity duration-300 ${
          isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
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
