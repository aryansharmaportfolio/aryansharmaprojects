import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // We track progress from 0 to 1
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let animationFrameId: number;

    const handleScroll = () => {
      // 1. Calculate how far we are down the "track"
      // The track is 400vh tall, but the sticky window is 100vh.
      // So meaningful scroll distance is: totalHeight - windowHeight
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      
      // Calculate progress (0 to 1) clamped between 0 and 1
      const rawProgress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      
      setProgress(rawProgress);

      // 2. Smoothly interpolate video time ("The Physics")
      // If we just set currentTime = target, it jitters.
      // We use a "lerp" (linear interpolation) to make it drift to the target.
      if (video.duration) {
        const targetTime = video.duration * rawProgress;
        const diff = targetTime - video.currentTime;
        
        // "0.1" is the friction. Lower = heavier/smoother, Higher = snappier
        if (Math.abs(diff) > 0.05) {
          video.currentTime += diff * 0.1;
        }
      }
    };

    // Use a loop for smoother visual updates than just the scroll event
    const loop = () => {
      handleScroll();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isVideoLoaded]); // Re-run if video load state changes

  // Dynamic Styles based on progress
  // 1. Text fades out quickly (0% -> 20%)
  const textOpacity = Math.max(0, 1 - progress * 5); 
  
  // 2. "Cinematic Zoom" - video slightly zooms out as you scroll, like GTA 6 intro
  const scale = 1.1 - (progress * 0.1); 

  return (
    // THE TRACK: This div is 400vh tall (4 screens worth of scrolling)
    // The user has to scroll through ALL of this to get to the next section.
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      
      {/* THE STICKY WINDOW: Stays fixed in view while you scroll the track */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: "brightness(0.7)",
            transform: `scale(${scale})`, // Apply the cinematic zoom
            transition: "transform 0.1s linear" // Smooth out the zoom updates
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90 pointer-events-none" />

        {/* Text Layer - Fades out as you start scrolling */}
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
