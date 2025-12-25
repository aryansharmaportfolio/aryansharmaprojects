import { useRef, useEffect, useState } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Physics State
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // 1. VIDEO PHYSICS ENGINE (Unchanged - Keeps your smooth scrubbing)
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.pause();

    const updateTargetTime = () => {
      if (!video.duration || isNaN(video.duration)) return;
      
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      
      targetTimeRef.current = progress * video.duration;
    };

    const animate = () => {
      if (!video.duration || isNaN(video.duration)) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const lerpFactor = 0.08;
      const diff = targetTimeRef.current - currentTimeRef.current;
      
      if (Math.abs(diff) > 0.001) {
        currentTimeRef.current += diff * lerpFactor;
        currentTimeRef.current = Math.max(0, Math.min(currentTimeRef.current, video.duration));
        video.currentTime = currentTimeRef.current;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    const handleScroll = () => updateTargetTime();

    const handleVideoLoad = () => {
      setIsVideoLoaded(true);
      updateTargetTime();
      currentTimeRef.current = targetTimeRef.current;
      if (video.duration) video.currentTime = currentTimeRef.current;
    };

    video.addEventListener('loadedmetadata', handleVideoLoad);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    rafIdRef.current = requestAnimationFrame(animate);
    updateTargetTime();

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoad);
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // 2. VISUAL EFFECTS STATE
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- NEW VISUAL CALCULATIONS ---

  const textOpacity = Math.max(0, 1 - scrollProgress * 5);
  const scale = 1.1 - (scrollProgress * 0.1);
  const brightness = 0.7 + (Math.min(scrollProgress * 5, 1) * 0.3);

  // THE "FILL UP" EFFECT
  // We want the black background to start rising when the user is 40% down.
  // It finishes filling the screen when the user is 95% down.
  // result: A value from 0 to 100 representing the gradient stop position.
  const fillStart = 0.4;
  const fillEnd = 0.95;
  const fillRatio = Math.max(0, (scrollProgress - fillStart) / (fillEnd - fillStart));
  const gradientPercent = fillRatio * 100;

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* VIDEO LAYER */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          autoPlay={false}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            filter: `brightness(${brightness})`,
            transform: `scale(${scale})`,
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* 1. PERMANENT BASE SHADOW (Subtle footer gradient) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* 2. THE RISING BLACK FILL (The GTA 6 Effect) */}
        {/* We animate the gradient stops directly. 
            'transparent ${gradientPercent}%' -> The top part of the gradient.
            'black ${gradientPercent - 20}%' -> The solid black part rising from below.
         */}
        <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
                background: `linear-gradient(to top, black ${Math.max(0, gradientPercent - 20)}%, transparent ${gradientPercent + 20}%)`
            }}
        />

        {/* TEXT LAYER */}
        <div
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          <div className="text-center px-4">
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
              PROJECT <br /> PORTFOLIO
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
