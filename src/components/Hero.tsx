import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollOpacity = Math.max(0, 1 - scrollY / 600);
  const videoScale = Math.max(0.8, 1 - scrollY / 3000);
  const textOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        // Triggers the fade-in for both video and text once data is ready
        onLoadedData={() => setIsVideoLoaded(true)}
        className={cn(
          "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
          isVideoLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          opacity: isVideoLoaded ? scrollOpacity : 0,
          transform: `scale(${videoScale})`,
          filter: "brightness(0.7)",
        }}
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background z-10" />

      {/* Text Container */}
      <div
        className="relative z-20 text-center"
        style={{ opacity: textOpacity }}
      >
        {/* MODIFIED H1:
           - Removed 'animate-typing', 'border-r', 'w-0', etc.
           - Added 'transition-all duration-1000' for smooth fade.
           - Added a subtle 'translate-y-8' -> 'translate-y-0' movement for a creative "pop in" effect.
        */}
        <h1 
          className={cn(
            "text-7xl md:text-8xl font-extrabold text-foreground tracking-tight pb-2 transition-all duration-1000 ease-out",
            isVideoLoaded 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-8"
          )}
        >
          Project Portfolio
        </h1>
      </div>
    </section>
  );
};

export default Hero;
