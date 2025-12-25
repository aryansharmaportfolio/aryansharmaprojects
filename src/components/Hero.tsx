import { useRef, useEffect, useState } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Physics State
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // 1. VIDEO PHYSICS (Unchanged - this part works well)
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.pause();

    const updateTargetTime = () => {
      if (!video.duration || isNaN(video.duration)) return;
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      targetTimeRef.current = progress * video.duration;
    };

    const animate = () => {
      if (!video.duration || isNaN(video.duration)) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }
      // Lerp factor for smooth scrubbing
      const lerpFactor = 0.08;
      const diff = targetTimeRef.current - currentTimeRef.current;
      
      if (Math.abs(diff) > 0.001) {
        currentTimeRef.current += diff * lerpFactor;
        currentTimeRef.current = Math.max(0, Math.min(currentTimeRef.current, video.duration));
        video.currentTime = currentTimeRef.current;
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    const handleScroll = () => updateTargetTime();
    const handleVideoLoad = () => {
      setIsVideoLoaded(true);
      updateTargetTime();
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

  const textOpacity = Math.max(0, 1 - scrollProgress * 5);
  const scale = 1.1 - (scrollProgress * 0.1);
  
  // NOTE: I removed the "brightness" darkening. 
  // We want the video to stay clear until the dark grey section eats it.

  // --- THE "GTA 6" RISING TIDE CALCULATION ---
  // We want the dark grey color to start rising when user is 50% scrolled.
  // By 98% scrolled, the screen should be fully dark grey.
  const gradientStart = 0.5;
  const gradientEnd = 0.98;
  
  // Normalize progress to 0 -> 100% within that specific window
  const rawFill = (scrollProgress - gradientStart) / (gradientEnd - gradientStart);
  const fillPercent = Math.min(Math.max(rawFill, 0), 1) * 100;

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* VIDEO */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          className={cn(
            "w-full h-full object-cover",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            transform: `scale(${scale})`,
            // Removed filter brightness so it's not "muddy"
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* THE REAL GTA 6 EFFECT:
           Instead of opacity, we animate the gradient stops.
           - "transparent 0%" -> Top of screen
           - "transparent X%" -> The "waterline" moving up
           - "#0a0a0a Y%" -> The solid dark grey filling the bottom
        */}
        <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
                background: `linear-gradient(to top, #0a0a0a ${fillPercent}%, transparent ${fillPercent + 30}%)`
            }}
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
