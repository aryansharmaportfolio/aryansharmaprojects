import { useRef, useEffect, useState } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Animation Refs
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Force basic video settings for scrubbing
    video.pause();
    video.muted = true;
    video.currentTime = 0;

    const updateTimes = () => {
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      
      setScrollProgress(progress);

      if (video.duration && isFinite(video.duration)) {
        targetTimeRef.current = progress * video.duration;
      }
    };

    const renderLoop = () => {
      if (video.duration && isFinite(video.duration)) {
        // Higher lerp (0.2) for production to overcome browser "seek" lag
        const lerpFactor = 0.2;
        const diff = targetTimeRef.current - currentTimeRef.current;

        if (Math.abs(diff) > 0.001) {
          currentTimeRef.current += diff * lerpFactor;
          
          // Clamp and Apply
          const nextTime = Math.max(0, Math.min(currentTimeRef.current, video.duration));
          
          // PRODUCTION FIX: Fast-seek
          // Setting currentTime can be expensive; ensure we don't spam if already there
          if (Math.abs(video.currentTime - nextTime) > 0.01) {
             video.currentTime = nextTime;
          }
        }
      }
      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    const handleReady = () => {
      if (!isLoaded) {
        setIsLoaded(true);
        updateTimes();
      }
    };

    // Listeners
    window.addEventListener("scroll", updateTimes, { passive: true });
    window.addEventListener("resize", updateTimes);
    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("canplaythrough", handleReady);

    // CRITICAL: Manual trigger if video is already ready in production
    if (video.readyState >= 2) {
      handleReady();
    }

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("scroll", updateTimes);
      window.removeEventListener("resize", updateTimes);
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("canplaythrough", handleReady);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isLoaded]);

  // Visual calculations
  const textOpacity = Math.max(0, 1 - scrollProgress * 4);
  const scale = 1.1 - (scrollProgress * 0.1);
  const brightness = 0.7 + (scrollProgress * 0.3);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: `brightness(${brightness})`,
            transform: `scale(${scale})`,
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

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
