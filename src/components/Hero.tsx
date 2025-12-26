import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react"; // Sleek rocket icon

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // STATE MANAGEMENT
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // New "Rockstar" click state
  const [scrollProgress, setScrollProgress] = useState(0);

  // CONFIGURATION
  const frameCount = 136; 
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number | null>(null);

  // 1. PRELOAD IMAGES
  useEffect(() => {
    let loadedCount = 0;
    const imageArray: HTMLImageElement[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // LAZY METHOD: ezgif-frame-001.jpg
      const fileName = `ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      img.src = `/hero-frames/${fileName}`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) setIsLoaded(true);
      };
      
      img.onerror = () => {
        loadedCount++; 
        if (loadedCount === frameCount) setIsLoaded(true);
      };

      imageArray.push(img);
    }
    imagesRef.current = imageArray;
  }, []);

  // 2. CANVAS RENDERING LOOP
  useEffect(() => {
    // Only run the canvas loop if we have started!
    if (!hasStarted) return; 

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollableDistance = container.scrollHeight - window.innerHeight;
      const rawProgress = window.scrollY / scrollableDistance;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      
      setScrollProgress(progress);

      if (imagesRef.current.length > 0) {
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(progress * (frameCount - 1))
        );

        const img = imagesRef.current[frameIndex];

        if (img && img.complete && img.naturalWidth > 0) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
          );
          
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          
          context.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    
    // Initial Render to prevent flicker
    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [hasStarted]); // Dependent on hasStarted

  // 3. VISUAL EFFECTS
  const textOpacity = Math.max(0, 1 - scrollProgress * 3);
  const scale = 1.1 - (scrollProgress * 0.1);
  const brightness = 0.7 + (scrollProgress * 0.3);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* --- ROCKSTAR INTRO OVERLAY --- */}
        {/* This div covers everything until the user clicks enter */}
        <div 
          className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000",
            hasStarted ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
            {/* The Logo Container */}
            <div className="relative flex flex-col items-center">
              {/* Rocket Logo */}
              <div className={cn(
                "relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-sm mb-8 transition-all duration-700",
                !isLoaded ? "animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.1)]" : "shadow-[0_0_50px_rgba(255,255,255,0.3)] scale-110"
              )}>
                <Rocket 
                  className={cn(
                    "w-10 h-10 text-white transition-transform duration-700",
                    isLoaded ? "rotate-45 translate-x-1 -translate-y-1" : "rotate-0"
                  )} 
                  strokeWidth={1.5}
                />
              </div>

              {/* Status Text */}
              <div className="h-8 flex items-center justify-center">
                {!isLoaded ? (
                  <p className="text-white/40 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
                    Loading Assets...
                  </p>
                ) : (
                  <button 
                    onClick={() => setHasStarted(true)}
                    className="group flex flex-col items-center gap-2 cursor-pointer transition-all duration-500 hover:scale-110"
                  >
                    <span className="text-white font-black text-2xl tracking-tighter">
                      ENTER PORTFOLIO
                    </span>
                    <span className="h-px w-0 bg-white group-hover:w-full transition-all duration-500" />
                  </button>
                )}
              </div>
            </div>
        </div>

        {/* --- MAIN CONTENT (Revealed after click) --- */}
        <div className={cn("relative w-full h-full transition-opacity duration-1000 delay-500", hasStarted ? "opacity-100" : "opacity-0")}>
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              style={{
                filter: `brightness(${brightness})`,
                transform: `scale(${scale})`,
              }}
            />

            <div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              style={{ opacity: textOpacity }}
            >
              <div className="text-center px-4">
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
                  PROJECT <br /> PORTFOLIO
                </h1>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
