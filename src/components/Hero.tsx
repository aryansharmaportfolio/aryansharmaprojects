import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // State for opacity calculations
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsMounted(true);

    let animationFrameId: number;

    const updateVideoPos = () => {
      // 1. Get current scroll position
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      if (videoRef.current && videoRef.current.duration) {
        // 2. Calculate target time based on scroll
        // Lower number = faster video playback relative to scroll
        // Higher number = requires more scrolling to advance video
        const playbackSpeed = 500; 
        const targetTime = currentScroll / playbackSpeed;

        // 3. Smooth "Lerp" (Linear Interpolation) for that "heavy" GTA feel
        // The 0.1 factor controls the "weight". Lower (e.g. 0.05) is smoother/slower, Higher (e.g. 0.2) is snappier.
        const currentTime = videoRef.current.currentTime;
        
        if (Math.abs(currentTime - targetTime) > 0.01) {
             videoRef.current.currentTime += (targetTime - currentTime) * 0.1;
        }
      }

      // 4. Keep the loop running
      animationFrameId = requestAnimationFrame(updateVideoPos);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(updateVideoPos);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Calculate opacity - Text fades faster than video to let the user enjoy the clip
  const textOpacity = Math.max(0, 1 - scrollY / 300);
  const videoOpacity = Math.max(0, 1 - scrollY / 1200); // Extended visibility

  return (
    <>
      {/* Fixed Video Background */}
      <div 
        className="fixed inset-0 w-full h-screen z-0"
        style={{ opacity: isVideoLoaded ? videoOpacity : 0 }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: "brightness(0.7)",
          }}
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
      </div>

      {/* Hero Content Section */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center z-10"
      >
        <div
          className="relative z-20 text-center px-4"
          style={{ opacity: textOpacity }}
        >
          <h1 
            className={cn(
              "text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight pb-2 transition-all duration-1000 ease-out",
              isMounted
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-8"
            )}
          >
            Project Portfolio
          </h1>
        </div>
      </section>
    </>
  );
};

export default Hero;
