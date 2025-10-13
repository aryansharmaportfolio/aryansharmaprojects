import { useState, useEffect, useRef } from "react";

interface SmokePuff {
  id: number;
  left: number;
}

const Header = () => {
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
          const offset = scrollDirection === 'down' ? -1.5 : 1.5;
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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const rocketRotation = scrollDirection === "down" 
    ? "rotate(-45deg)" 
    : "rotate(135deg)";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => scrollToSection("home")}
          className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
        >
          Aryan Sharma
        </button>
        <nav className="flex gap-8">
          {[
            { label: "Home", id: "home" },
            { label: "About Me", id: "about" },
            { label: "Projects", id: "projects" },
            { label: "Current Work", id: "current-work" },
            { label: "Clubs", id: "clubs" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-foreground hover:text-primary transition-colors font-medium"
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
            className="absolute top-0 -translate-x-1/2 transition-transform duration-200"
            style={{ 
              left: `${scrollProgress}%`,
              transform: `${rocketRotation} translateY(-50%)`
            }}
          >
            <span 
              className="text-2xl" 
              style={{ 
                display: "inline-block",
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
