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

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Force pause - we control playback manually
    video.pause();

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

      // Lerp factor - lower = smoother/heavier, higher = snappier
      const lerpFactor = 0.08;
      
      // Calculate the difference
      const diff = targetTimeRef.current - currentTimeRef.current;
      
      // Only update if difference is significant enough
      if (Math.abs(diff) > 0.001) {
        // Apply lerp - smooth interpolation
        currentTimeRef.current += diff * lerpFactor;
        
        // Clamp to valid range
        currentTimeRef.current = Math.max(0, Math.min(currentTimeRef.current, video.duration));
        
        // Update video time
        video.currentTime = currentTimeRef.current;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    // Handle scroll events
    const handleScroll = () => {
      updateTargetTime();
    };

    // Initialize on video load
    const handleVideoLoad = () => {
      setIsVideoLoaded(true);
      updateTargetTime();
      currentTimeRef.current = targetTimeRef.current;
      if (video.duration) {
        video.currentTime = currentTimeRef.current;
      }
    };

    video.addEventListener('loadedmetadata', handleVideoLoad);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start animation loop
    rafIdRef.current = requestAnimationFrame(animate);

    // Initial calculation
    updateTargetTime();

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoad);
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Calculate visual effects based on scroll
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

  // Visual effects
  const textOpacity = Math.max(0, 1 - scrollProgress * 5);
  const scale = 1.1 - (scrollProgress * 0.1);

  return (
    <div ref={containerRef} className="relative h-[800vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
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
            filter: "brightness(0.7)",
            transform: `scale(${scale})`,
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90 pointer-events-none" />

        <div
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          <div className="text-center px-4">
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
              PROJECT <br /> PORTFOLIO
            </h1>
            <p className="text-white/80 text-xl font-light tracking-widest uppercase animate-pulse">
              Scroll to Explore
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
