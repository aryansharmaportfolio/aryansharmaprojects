import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4"; // Make sure your new converted file is named this!
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // We track progress from 0 to 1 for animations
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // 1. Force pause so the browser doesn't try to play it automatically.
    // We want the scrollbar to be the only thing "playing" the video.
    video.pause();

    let animationFrameId: number;

    const loop = () => {
      // 2. Calculate Scroll Progress
      const scrollY = window.scrollY;
      
      // The track is 400vh tall, but the meaningful scroll distance is (total - 1 screen)
      const trackHeight = container.scrollHeight - window.innerHeight;
      
      // Calculate progress (0 to 1) clamped strictly between 0 and 1
      const rawProgress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      
      setProgress(rawProgress);

      // 3. Video Physics (The "GTA 6" Scrubbing Logic)
      if (video.duration) {
        const targetTime = video.duration * rawProgress;
        const diff = targetTime - video.currentTime;
        
        // EDGE CASE SNAPPING:
        // If we are at the very start or end, force the video to that exact frame.
        // This ensures the rocket fully resets or fully completes its launch.
        if (rawProgress < 0.01) {
           video.currentTime = 0;
        } else if (rawProgress > 0.99) {
           video.currentTime = video.duration;
        } else {
            // STANDARD SCROLLING:
            // "0.2" is the friction/speed. 
            // 0.1 is "heavy/smooth", 0.2 is "snappy/responsive".
            // Since you have Keyframe Interval 1, we can use 0.2 safely.
            if (Math.abs(diff) > 0.001) {
              video.currentTime += diff * 0.2;
            }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    // Start the physics loop
    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isVideoLoaded]); 

  // Dynamic Styles
  // Text fades out quickly as you scroll down (0% -> 20%)
  const textOpacity = Math.max(0, 1 - progress * 5); 
  
  // Cinematic Zoom: Video zooms OUT slightly as you scroll down
  const scale = 1.1 - (progress * 0.1); 

  return (
    // THE TRACK: 400vh tall (4 screens worth of scrolling)
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      
      {/* THE STICKY WINDOW: Stays fixed in view while you scroll the track */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          onLoadedData={() => setIsVideoLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: "brightness(0.7)",
            transform: `scale(${scale})`,
            // IMPORTANT: No CSS transition on transform. 
            // We want the JS loop to handle the zoom perfectly in sync with the video.
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Gradient Overlay for better text readability */}
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
