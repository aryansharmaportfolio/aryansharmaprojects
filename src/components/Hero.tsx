import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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
      videoRef.current.playbackRate = 0.6; // Slightly slower for cinematic feel
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const videoScale = Math.max(1, 1 + scrollY / 2000); // Subtle zoom IN on scroll
  const textOpacity = Math.max(0, 1 - scrollY / 400);
  const textTranslate = scrollY * 0.5;

  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
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
            filter: "brightness(0.6) contrast(1.1)", // Cinematic grading
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
      </div>

      {/* Hero Content */}
      <div
        className="relative z-20 flex flex-col items-center text-center px-4 max-w-5xl mx-auto"
        style={{ 
          opacity: textOpacity,
          transform: `translateY(${textTranslate}px)`
        }}
      >
        <h1 
          className={cn(
            "text-7xl md:text-9xl font-black text-white tracking-tighter mb-4 transition-all duration-1000 ease-out",
            isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 text-shadow-glow">Portfolio</span>
        </h1>
        
        <p 
          className={cn(
            "text-xl md:text-2xl text-white/80 font-light tracking-wide max-w-2xl transition-all duration-1000 delay-300 ease-out",
            isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          Exploring the frontiers of Aerospace Engineering & Design
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-70">
        <ChevronDown className="w-10 h-10 text-white/50" />
      </div>
    </section>
  );
};

export default Hero;
