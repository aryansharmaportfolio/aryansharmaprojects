import { useRef, useEffect, useState } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Store current video time for lerping
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // 1. SCROLLYTELLING PHYSICS LOOP
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.pause(); // We control playback manually

    const updateTargetTime = () => {
      if (!video.duration || isNaN(video.duration)) return;
      
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      
      // Calculate progress (0 to 1)
      const progress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      
      // Map progress to video duration
      targetTimeRef.current = progress * video.duration;
    };

    const animate = () => {
      if (!video.duration || isNaN(video.duration)) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }

      // Lerp factor: 0.08 is smooth/heavy
      const lerpFactor = 0.08;
      const diff = targetTimeRef.current - currentTimeRef.current;
      
      if (Math.abs(diff) > 0.001) {
        currentTimeRef.current += diff * lerpFactor;
        // Clamp to valid range
        currentTimeRef.current = Math.max(0, Math.min(currentTimeRef.current, video.duration));
        video.currentTime = currentTimeRef.current;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      updateTargetTime();
    };

    const handleVideoLoad = () => {
      setIsVideoLoaded(true);
      updateTargetTime();
      // Initialize time immediately to avoid jump
      currentTimeRef.current = targetTimeRef.current;
      if (video.duration) video.currentTime = currentTimeRef.current;
    };

    video.addEventListener('loadedmetadata', handleVideoLoad);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    rafIdRef.current = requestAnimationFrame(animate);
    updateTargetTime();

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoad);
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // 2. VISUAL EFFECTS STATE
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- STYLE CALCULATIONS ---

  // Text fades out quickly (0% -> 20%)
  const textOpacity = Math.max(0, 1 - scrollProgress * 5);
  
  // Cinematic Zoom: Video zooms out slowly
  const scale = 1.1 - (scrollProgress * 0.1);

  // Brightness: Starts dark (0.7), brightens as text leaves, then stays consistent
  const brightness = 0.7 + (Math.min(scrollProgress * 5, 1) * 0.3);

  // EXIT FADE: The "Curtain" Effect
  // Starts fading to black at 85% scroll, fully black at 100%
  // This ensures the boundary between this section and the next is invisible.
  const exitOpacity = Math.max(0, (scrollProgress - 0.85) * 6.66);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* VIDEO LAYER */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: `brightness(${brightness})`,
            transform: `scale(${scale})`,
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* 1. PERMANENT SHADOW: Bottom gradient to blend floor/edges at all times */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* 2. EXIT CURTAIN: Fades to solid black at the end of scroll */}
        <div 
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: exitOpacity }}
        />

        {/* TEXT LAYER */}
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
