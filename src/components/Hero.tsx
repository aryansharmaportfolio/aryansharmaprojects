import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // STATE
  const [isLoaded, setIsLoaded] = useState(false);
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
      const fileName = `ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      img.src = `/hero-frames/${fileName}`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) setTimeout(() => setIsLoaded(true), 500);
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
    if (!isLoaded) return;

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

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded]);

  // 3. DYNAMIC VISUAL EFFECTS
  const textOpacity = Math.max(0, 1 - scrollProgress * 4); // Text fades out fast
  const scale = 1.1 - (scrollProgress * 0.1); // Video scales down slightly
  
  // --- THE GTA 6 TRANSITION LOGIC ---
  // We want the mask to start appearing at 80% scroll and be fully closed at 100%
  // clip-path: circle(radius at center)
  // At 0.8 progress -> radius = 0% (invisible)
  // At 1.0 progress -> radius = 150% (fully covers screen)
  const maskTriggerStart = 0.8;
  const maskProgress = Math.max(0, (scrollProgress - maskTriggerStart) / (1 - maskTriggerStart));
  const maskRadius = maskProgress * 150; // Expands to 150% of screen

  return (
    <div className="relative w-full">
      {/* SCROLL SPACER */}
      <div ref={containerRef} className="h-[350vh] w-full pointer-events-none" />

      {/* FIXED CONTAINER */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
        
        {/* Loading Overlay */}
        <div 
          className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-1000",
            isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
            <div className="relative flex flex-col items-center">
              <div className="relative flex items-center justify-center w-24 h-24 mb-8">
                 <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
                 <div className="relative flex items-center justify-center w-full h-full rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-sm">
                    <Rocket className="w-10 h-10 text-white animate-pulse" strokeWidth={1.5} />
                 </div>
              </div>
              <p className="text-white/40 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
                Loading Assets...
              </p>
            </div>
        </div>

        {/* Main Content */}
        <div className={cn("relative w-full h-full transition-opacity duration-1000", isLoaded ? "opacity-100" : "opacity-0")}>
            <canvas
              ref={canvasRef}
              className="w-full h-full block object-cover"
              style={{
                transform: `scale(${scale})`,
              }}
            />

            {/* Title Text */}
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

            {/* --- THE MASK OVERLAY (The seamless transition) --- */}
            {/* This div sits ON TOP of the canvas. 
                Its clip-path starts at 0% (invisible) and expands to cover the screen. 
                It MUST match the background color of the next section (#0a0a0a).
            */}
            <div 
              className="absolute inset-0 z-30 pointer-events-none bg-[#0a0a0a]"
              style={{
                // "circle(0% at 50% 50%)" means a tiny dot in the center.
                // We want to REVEAL the darkness, so we simply draw the darkness on top.
                clipPath: `circle(${maskRadius}% at 50% 50%)`,
                transition: 'clip-path 0.1s linear' // Smooth out frame jitters
              }}
            />
        </div>
      </div>
    </div>
  );
};

export default Hero;
