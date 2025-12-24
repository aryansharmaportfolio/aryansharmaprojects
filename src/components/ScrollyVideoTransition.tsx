import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollyVideoProps {
  src: string;
  className?: string;
  overlayText?: string;
}

const ScrollyVideoTransition = ({ src, className, overlayText }: ScrollyVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let lastScrollY = window.scrollY;
    let targetRate = 0;
    let currentRate = 0;
    let animationFrameId: number;

    const updatePlayback = () => {
      // 1. Calculate how fast the user is scrolling (Velocity)
      const currentScrollY = window.scrollY;
      const scrollSpeed = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // 2. Determine if the video is currently in the viewport
      const rect = container.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        // Sensitivity: Divide scrollSpeed by 20 to get reasonable playback rates (e.g. 0.5x to 4.0x)
        // We clamp it so it doesn't go crazy fast.
        const velocity = Math.min(Math.max(scrollSpeed / 10, -5), 5);
        
        // If scrolling down, play forward. If scrolling up, we can reverse (if supported) or just pause.
        // Note: Negative playbackRate is not supported in all browsers, so we often focus on forward flow.
        targetRate = Math.max(0, velocity); 
      } else {
        targetRate = 0;
      }

      // 3. Smooth "Inertia" - Don't change speed instantly, slide towards it
      // This creates that "heavy" fluid feel.
      currentRate += (targetRate - currentRate) * 0.1;

      // 4. Apply to video
      if (Math.abs(currentRate) > 0.01) {
        video.playbackRate = currentRate;
        video.play().catch(() => {}); // Ignore play-interruption errors
      } else {
        video.pause();
      }

      animationFrameId = requestAnimationFrame(updatePlayback);
    };

    animationFrameId = requestAnimationFrame(updatePlayback);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    // Height 150vh: Gives enough room to scroll "through" the video clip
    <div ref={containerRef} className={cn("relative h-[150vh] bg-black", className)}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
        
        {/* Optional text that appears over the video */}
        {overlayText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-widest uppercase drop-shadow-xl">
              {overlayText}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollyVideoTransition;
