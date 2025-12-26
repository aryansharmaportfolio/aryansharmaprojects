import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // --- CONFIGURATION ---
  const frameCount = 136; // Exact number of frames you have
  
  // Store images in a ref to avoid re-renders during scrolling
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const requestRef = useRef<number | null>(null);

  // 1. PRELOAD IMAGES
  useEffect(() => {
    let loadedCount = 0;
    const imageArray: HTMLImageElement[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      
      // --- LAZY METHOD FILENAME ---
      // Matches "ezgif-frame-001.jpg"
      const fileName = `ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      img.src = `/hero-frames/${fileName}`;
      
      img.onload = () => {
        loadedCount++;
        // We consider it "ready" when all frames are loaded
        if (loadedCount === frameCount) {
          setIsLoaded(true);
        }
      };
      
      // Handle errors (skip missing frames so app doesn't crash)
      img.onerror = () => {
        console.error(`Failed to load: ${fileName}`);
        loadedCount++; 
        if (loadedCount === frameCount) setIsLoaded(true);
      };

      imageArray.push(img);
    }
    imagesRef.current = imageArray;
  }, []);

  // 2. CANVAS RENDERING LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      // Calculate how far down we have scrolled (0.0 to 1.0)
      const scrollableDistance = container.scrollHeight - window.innerHeight;
      const rawProgress = window.scrollY / scrollableDistance;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      
      setScrollProgress(progress);

      if (isLoaded && imagesRef.current.length > 0) {
        // Calculate which exact frame index to show
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(progress * (frameCount - 1))
        );

        const img = imagesRef.current[frameIndex];

        if (img && img.complete && img.naturalWidth > 0) {
          // --- MANUAL "OBJECT-COVER" LOGIC ---
          // This makes the canvas image stretch perfectly like a background video
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
          );
          
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          
          context.drawImage(
            img,
            x,
            y,
            img.width * scale,
            img.height * scale
          );
        }
      }
      
      requestRef.current = requestAnimationFrame(render);
    };

    // Start the loop
    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded]);

  // 3. VISUAL EFFECTS (Text & Scale)
  const textOpacity = Math.max(0, 1 - scrollProgress * 3); // Fades out early
  const scale = 1.1 - (scrollProgress * 0.1); // 1.1x -> 1.0x
  const brightness = 0.7 + (scrollProgress * 0.3); // 0.7 -> 1.0

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* LOADING SCREEN */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
            <div className="flex flex-col items-center gap-4">
              {/* Simple spinner using Tailwind */}
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div className="text-white font-mono text-sm tracking-widest animate-pulse">
                LOADING ASSETS...
              </div>
            </div>
          </div>
        )}

        {/* THE CANVAS */}
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full block transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: `brightness(${brightness})`,
            transform: `scale(${scale})`,
          }}
        />

        {/* OVERLAY TEXT */}
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
  );
};

export default Hero;
