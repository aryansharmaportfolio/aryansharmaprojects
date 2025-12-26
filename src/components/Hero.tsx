import { useRef, useEffect, useState, useCallback } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Refs for smooth lerping animation
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const videoDurationRef = useRef(0);

  // Calculate target time from scroll position
  const updateTargetTime = useCallback(() => {
    const container = containerRef.current;
    if (!container || !videoDurationRef.current) return;
    
    const scrollY = window.scrollY;
    const trackHeight = container.scrollHeight - window.innerHeight;
    
    // Calculate progress (0 to 1)
    const progress = Math.max(0, Math.min(scrollY / trackHeight, 1));
    
    // Map progress to video duration
    targetTimeRef.current = progress * videoDurationRef.current;
    setScrollProgress(progress);
  }, []);

  // Animation loop with lerp for smooth scrubbing
  const animate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoDurationRef.current) {
      rafIdRef.current = requestAnimationFrame(animate);
      return;
    }

    // Lerp factor - 0.08 gives that "weight" feel
    const lerpFactor = 0.08;
    const diff = targetTimeRef.current - currentTimeRef.current;
    
    // Only update if difference is significant
    if (Math.abs(diff) > 0.0001) {
      currentTimeRef.current += diff * lerpFactor;
      
      // Clamp to valid range
      currentTimeRef.current = Math.max(0, Math.min(currentTimeRef.current, videoDurationRef.current));
      
      // Set the video time - this is where the magic happens
      try {
        video.currentTime = currentTimeRef.current;
      } catch (e) {
        // Video might not be ready yet
      }
    }

    rafIdRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Critical: Prevent the video from playing on its own
    video.pause();
    
    // Handler when video metadata is loaded
    const handleLoadedMetadata = () => {
      videoDurationRef.current = video.duration;
      video.pause();
      video.currentTime = 0;
      currentTimeRef.current = 0;
      targetTimeRef.current = 0;
      updateTargetTime();
    };

    // Handler when video can play through
    const handleCanPlayThrough = () => {
      setIsVideoReady(true);
      video.pause();
    };

    // Prevent any attempts to play
    const handlePlay = () => {
      video.pause();
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('play', handlePlay);
    
    // Force load the video
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('play', handlePlay);
    };
  }, [updateTargetTime]);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      updateTargetTime();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    updateTargetTime();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateTargetTime]);

  // Start animation loop
  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [animate]);

  // Visual effects calculated from scroll progress
  const textOpacity = Math.max(0, 1 - scrollProgress * 5);
  const scale = 1.1 - (scrollProgress * 0.1);
  
  // Dynamic brightness - starts at 0.7, goes to 1.0 as text fades
  const brightness = 0.7 + (Math.min(scrollProgress * 5, 1) * 0.3);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isVideoReady ? "opacity-100" : "opacity-0"
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
