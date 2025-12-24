import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
    // Trigger text animation immediately upon component mount
    setIsMounted(true);

    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        // Video fades in only when it is actually ready to play
        onLoadedData={() => setIsVideoLoaded(true)}
        className={cn(
          "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
          isVideoLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          // Opacity is now fixed to 1 once loaded, removing the scroll fade effect
          opacity: isVideoLoaded ? 1 : 0,
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

        {/* Bouncing Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isMounted ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-xs sm:text-sm text-foreground/70 uppercase tracking-widest font-medium">
              Scroll
            </span>
            <div className="relative">
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-foreground/80" />
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-foreground/40 absolute top-2 left-0" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
