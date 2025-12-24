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

  // Calculate opacity based on scroll - fades out as user scrolls
  const textOpacity = Math.max(0, 1 - scrollY / 400);
  const videoOpacity = Math.max(0, 1 - scrollY / 800);

  return (
    <>
      {/* Fixed Video Background - stays in place during scroll */}
      <div 
        className="fixed inset-0 w-full h-screen z-0"
        style={{ opacity: isVideoLoaded ? videoOpacity : 0 }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
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

      {/* Hero Section - scrolls normally but has transparent background */}
      <section
        id="home"
        className="relative h-screen flex items-center justify-center z-10"
      >
        {/* Text Container */}
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
