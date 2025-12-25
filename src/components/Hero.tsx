import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Configuration
  const frameCount = 100; // Change this to match your total number of images
  const currentFrameRef = useRef(0);

  // 1. Preload Images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // Ensure the path matches where you put your images in the /public folder
      img.src = `/hero-frames/frame-${i.toString().padStart(3, '0')}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };
      loadedImages.push(img);
    }
  }, []);

  // 2. Main Draw Logic
  useEffect(() => {
    if (!isLoaded || images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const render = () => {
      const container = containerRef.current;
      if (!container || !context) return;

      const scrollY = window.scrollY;
      const maxScroll = container.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      
      setScrollProgress(progress);

      // Calculate current frame index
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(progress * frameCount)
      );

      if (images[frameIndex]) {
        // Draw image and handle "object-cover" logic manually
        const img = images[frameIndex];
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        const x = (canvasWidth - newWidth) / 2;
        const y = (canvasHeight - newHeight) / 2;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(img, x, y, newWidth, newHeight);
      }
    };

    // Responsive Canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    window.addEventListener("scroll", render, { passive: true });
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener("scroll", render);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isLoaded, images]);

  // UI Effects
  const textOpacity = Math.max(0, 1 - scrollProgress * 4);
  const scale = 1.1 - (scrollProgress * 0.1);
  const brightness = 0.7 + (scrollProgress * 0.3);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Loading Spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p className="animate-pulse font-mono tracking-widest">LOADING EXPERIENCE...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full block transition-opacity duration-1000",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
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
  );
};

export default Hero;
