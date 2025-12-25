import { useRef, useEffect, useState } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  
  // Refs for animation loop
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // 1. Force pause initially
    video.pause();

    // 2. Main Logic to calculate progress & target time
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      
      // Calculate progress (0 to 1)
      const rawProgress = scrollY / trackHeight;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      
      // Update React State for visual effects (Scale/Opacity)
      setScrollProgress(progress);

      // Update Ref for Video Scrubbing (only if duration is valid)
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        targetTimeRef.current = progress * video.duration;
      }
    };

    // 3. Animation Loop (Lerping)
    const animate = () => {
      // Validate duration to prevent NaNs or Infinity
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        // Lerp factor - lower = smoother/heavier
        const lerpFactor = 0.1;
        const diff = targetTimeRef.current - currentTimeRef.current;
        
        if (Math.abs(diff) > 0.001) {
          currentTimeRef.current += diff * lerpFactor;
          // Clamp to safe range
          const safeTime = Math.max(0, Math.min(currentTimeRef.current, video.duration));
          video.currentTime = safeTime;
        }
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    // 4. Handle Video Load (Solves Race Condition)
    const onVideoReady = () => {
      if (!isVideoLoaded) {
        setIsVideoLoaded(true);
        // Ensure we calculate initial position correctly once loaded
        handleScroll();
      }
    };

    // Event Listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll); // Recalc on resize
    video.addEventListener('loadedmetadata', onVideoReady);
    video.addEventListener('canplay', onVideoReady);

    // CRITICAL FIX: Check if video is ALREADY ready (cached)
    if (video.readyState >= 1) {
      onVideoReady();
    }

    // Start Loop
    rafIdRef.current = requestAnimationFrame(animate);

    // Initial Sync
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      video.removeEventListener('loadedmetadata', onVideoReady);
      video.removeEventListener('canplay', onVideoReady);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []); // Dependencies empty to run once on mount

  // Visual effects calculated from state
  const textOpacity = Math.max(0, 1 - scrollProgress * 5);
  const scale = 1.1 - (scrollProgress * 0.1);
  const brightness = 0.7 + (Math.min(scrollProgress * 5, 1) * 0.3);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          webkit-playsinline="true" 
          preload="auto"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-700",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: `brightness(${brightness})`,
            transform: `scale(${scale})`,
          }}
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
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
