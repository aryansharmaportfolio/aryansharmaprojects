import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    setIsMounted(true);

    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const videoScale = Math.max(0.8, 1 - scrollY / 3000);
  const textOpacity = Math.max(0, 1 - scrollY / 400);
  // Parallax: content slides up faster than scroll
  const parallaxOffset = scrollY * 0.3;

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background Video with Scanline Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={cn(
            "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            transform: `scale(${videoScale})`,
            filter: "brightness(0.6)",
          }}
        >
          <source src={heroVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Scanline Overlay for tech aesthetic */}
        <div className="absolute inset-0 pointer-events-none scanline-overlay" />
        
        {/* Subtle glow vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background))_100%)] opacity-40" />
      </div>

      {/* Gradient fade to next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />

      {/* Text Container with parallax */}
      <div
        className="relative z-20 text-center px-4"
        style={{ 
          opacity: textOpacity,
          transform: `translateY(${parallaxOffset}px)`,
        }}
      >
        <h1 
          className={cn(
            "text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight pb-2 transition-all duration-1000 ease-out drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]",
            isMounted
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-8"
          )}
        >
          Project Portfolio
        </h1>
        
        {/* Scroll indicator */}
        <div 
          className={cn(
            "mt-12 transition-all duration-1000 delay-500",
            isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="animate-bounce">
            <svg 
              className="w-6 h-6 mx-auto text-foreground/60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
