import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4"; 
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // 1. Force pause to take manual control
    video.pause();

    let animationFrameId: number;

    const loop = () => {
      // 2. Calculate Scroll Progress
      const scrollY = window.scrollY;
      // We use a much taller track now (800vh), so we subtract 1 window height to get the scrollable area
      const trackHeight = container.scrollHeight - window.innerHeight;
      
      // Get percentage (0 to 1)
      const rawProgress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      
      setProgress(rawProgress);

      // 3. Video Physics
      if (video.duration && !isNaN(video.duration)) {
        const targetTime = video.duration * rawProgress;
        const diff = targetTime - video.currentTime;
        
        // EDGE CASE SNAPPING
        // If we are at the very start (top) or very end (bottom), force exact time
        if (rawProgress < 0.005) {
           video.currentTime = 0;
        } else if (rawProgress > 0.995) {
           video.currentTime = video.duration; // Forces the END of the video (4s)
        } else {
            // STANDARD SCROLLING
            // Increased speed from 0.1 to 0.33 so it keeps up with you better
            if (Math.abs(diff) > 0.01) {
              video.currentTime += diff * 0.33;
            }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isVideoLoaded]); 

  // Styles
  const textOpacity = Math.max(0, 1 - progress * 5); 
  const scale = 1.1 - (progress * 0.1); 

  return (
    // CHANGE 1: Increased height from 400vh to 800vh
    // This makes the scroll "longer", forcing the full video to play out over more scrolling.
    <div ref={containerRef} className="relative h-[800vh] bg-black">
      
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto" // Important for loading duration data
          autoPlay={false}
          onLoadedData={() => setIsVideoLoaded(true)}
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
