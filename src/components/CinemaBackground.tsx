import { useEffect, useRef, useState } from "react";
import heroVideo from "@/assets/hero-video.mp4"; // Ensure this is your RE-ENCODED version

export const CinemaBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;

    const renderLoop = () => {
      // 1. Calculate Global Scroll Progress (0.0 to 1.0)
      // We map the entire scrollable height of the page to the video duration
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      
      // Safety check to avoid division by zero
      if (totalHeight <= 0) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const rawProgress = Math.max(0, Math.min(scrollY / totalHeight, 1));

      // 2. The Physics: Smooth Damping (The "Weighty" Feel)
      // Instead of jumping instantly to the frame, we slide towards it.
      if (video.duration) {
        const targetTime = video.duration * rawProgress;
        const smoothFactor = 0.08; // Lower = Smoother/Heavier, Higher = Snappier
        
        // If the difference is significant, update time
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
          video.currentTime += (targetTime - video.currentTime) * smoothFactor;
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Start the engine
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoaded]);

  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-60" // Reduced opacity so text pops
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      
      {/* Cinematic Overlay: Darkens the video so white text is readable */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
    </div>
  );
};
