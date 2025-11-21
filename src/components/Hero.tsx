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

  // Scroll-based opacity calculations
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
        // This event fires when the video frame is actually ready to show
        onLoadedData={() => setIsVideoLoaded(true)} 
        className={cn(
          "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
          // While loading, opacity is 0. Once loaded, it uses the scroll-based opacity.
          isVideoLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          // We apply the scroll opacity via style to keep the transition class clean, 
          // but we ensure it's 0 if not loaded to prevent the "white flash"
          opacity: isVideoLoaded ? scrollOpacity : 0,
          transform: `scale(${videoScale})`,
          filter: "brightness(0.7)",
        }}
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background z-10" />

      {/* Text Container */}
      <div
        className="relative z-20 text-center"
        style={{ opacity: textOpacity }}
      >
        <h1 
          className={cn(
            "text-7xl md:text-8xl font-extrabold text-foreground tracking-tight pb-2 overflow-hidden whitespace-nowrap",
            // Logic: If video is loaded, apply the animation and border. 
            // If not, keep width 0 and border 0 so it's invisible.
            isVideoLoaded 
              ? "animate-typing border-r-8 border-r-foreground" 
              : "w-0 border-r-0"
          )}
        >
          Project Portfolio
        </h1>
      </div>
    </section>
  );
};

export default Hero;
