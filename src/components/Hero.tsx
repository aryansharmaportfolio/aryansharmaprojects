import { useRef, useEffect, useState } from "react";
import heroVideo from "@/assets/hero-video.mp4";
import { cn } from "@/lib/utils";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // State for visual styling (opacity, scale, clip)
  // We use state for these to ensure React re-renders the styles correctly
  const [progress, setProgress] = useState(0);

  // Refs for the physics loop to keep video scrubbing smooth without re-renders
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // 1. Force pause to take manual control of the playback
    video.pause();

    const updateProgress = () => {
      const scrollY = window.scrollY;
      const trackHeight = container.scrollHeight - window.innerHeight;
      
      // Calculate global scroll progress (0 to 1)
      const rawProgress = Math.min(Math.max(scrollY / trackHeight, 0), 1);
      
      setProgress(rawProgress);

      // Update the target time for the video based on scroll
      if (video.duration && !isNaN(video.duration)) {
        targetTimeRef.current = rawProgress * video.duration;
      }
    };

    const animate = () => {
      // 2. Physics Loop (The "Lerp")
      // This makes the video seek smoothly to the target time
      const lerpFactor = 0.1; // Lower = smoother/heavier, Higher = faster/snappier
      const diff = targetTimeRef.current - currentTimeRef.current;

      // Only seek if the difference is visible to save resources
      if (Math.abs(diff) > 0.001) {
        currentTimeRef.current += diff * lerpFactor;
        
        // Clamp time to ensure we don't seek past the video limits
        if (video.duration) {
             const safeTime = Math.max(0, Math.min(currentTimeRef.current, video.duration));
             video.currentTime = safeTime;
        }
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    // Listeners
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    // Start the physics loop
    rafIdRef.current = requestAnimationFrame(animate);

    // Initial call to set starting state
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isVideoLoaded]); // Re-bind if video load state changes

  // --- VISUAL EFFECTS CALCULATIONS ---

  // 1. Text Opacity: Fades out quickly in the first 15% of scroll
  const textOpacity = Math.max(0, 1 - progress * 7);

  // 2. Cinematic Zoom: Video slowly scales down as you scroll
  const scale = 1.1 - (progress * 0.1);

  // 3. THE "RISING TIDE" TRANSITION (The GTA VI Effect)
  // We want the transition to happen in the last 20% of the scroll.
  // This calculates a percentage (0 to 100) representing how much of the video is "eaten" by the next section.
  const transitionStart = 0.8; 
  const transitionProgress = Math.min(Math.max((progress - transitionStart) / (1 - transitionStart), 0), 1) * 100;

  return (
    // Height 800vh provides a nice long track for a 4-second video
    <div ref={containerRef} className="relative h-[800vh] bg-[#0a0a0a]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* VIDEO CONTAINER */}
        {/* We apply the clip-path here. It physically crops the container from the bottom up. */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            // inset(top right bottom left)
            // We increase the bottom value from 0% to 100% to make it look like it's sinking
            clipPath: `inset(0 0 ${transitionProgress}% 0)`,
            WebkitClipPath: `inset(0 0 ${transitionProgress}% 0)`, // For Safari support
            transform: `scale(${scale})`, // Apply the smooth zoom here
            transition: 'transform 0.1s linear' // Slight smoothing for the zoom
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous" // Helps with some CORS seeking issues
            onLoadedData={() => setIsVideoLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-1000",
              isVideoLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{
              filter: "brightness(0.8)", // Slight tint so text pops
            }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>

        {/* RISING BACKGROUND LAYER */}
        {/* This div matches the background color and slides up *behind* the clip-path 
            to ensure there are no visual glitches at the seam. */}
        <div 
          className="absolute inset-0 bg-[#0a0a0a] pointer-events-none z-0"
          style={{ 
            // It moves up in sync with the clip-path
            transform: `translateY(${100 - transitionProgress}%)`,
          }}
        />

        {/* TEXT LAYER */}
        {/* Stays fixed on top until it fades out */}
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
