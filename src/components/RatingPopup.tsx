import { useState, useEffect } from "react";
import { X, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const RatingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    // 1. CHECK: Has the user already interacted with this?
    const alreadySeen = localStorage.getItem("portfolio_rated");
    
    if (alreadySeen) {
      // If yes, do not show the popup at all
      return;
    }

    // If no, start the timer to show it
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    
    // 2. SAVE: Mark as seen so it doesn't show again (even if they just closed it)
    localStorage.setItem("portfolio_rated", "true");

    // Wait for animation to finish before unmounting
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  };

  const handleRate = (score: number) => {
    setSelectedRating(score);
    setHasRated(true);
    
    // 3. SAVE: Mark as rated immediately
    localStorage.setItem("portfolio_rated", "true");
    
    // Show success message for 3 seconds, then fade out
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
      // Entry animation (only when not closing)
      !isClosing && "animate-fade-in-up opacity-100 translate-y-0",
      // Exit animation
      isClosing && "opacity-0 translate-y-10 pointer-events-none",
      // Disable pointer events after rating while showing success message
      hasRated && !isClosing && "pointer-events-auto" 
    )}>
      {/* Glassmorphism Card Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-xl w-[280px]">
        
        {/* Close Button */}
        {!hasRated && (
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            aria-label="Close rating popup"
          >
            <X size={14} />
          </button>
        )}

        {!hasRated ? (
          <div className="space-y-4 text-center">
            <div>
              <h3 className="font-bold text-white text-lg tracking-wide">
                Rate this portfolio
              </h3>
              <p className="text-xs text-white mt-1 font-medium">
                How was your flight? <span className="inline-block animate-bounce">🚀</span>
              </p>
            </div>
            
            {/* Interactive Rocket Rating Icons */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => {
                const isHighlighted = hoveredRating !== null 
                  ? score <= hoveredRating 
                  : (selectedRating !== null && score <= selectedRating);
                
                return (
                  <button
                    key={score}
                    onMouseEnter={() => setHoveredRating(score)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => handleRate(score)}
                    className="group relative focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95 w-10 h-10 flex items-center justify-center"
                  >
                    {/* Rocket Icon - Rotated to point upwards (-45deg) */}
                    <Rocket
                      className={cn(
                        "w-full h-full transition-all duration-300 transform -rotate-45",
                        isHighlighted
                          ? "fill-primary text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.8)]" 
                          : "text-white/30 group-hover:text-white/60"
                      )}
                      strokeWidth={1.5}
                    />
                    
                    {/* Number: Bigger, bolder, white, and centered on the rocket body */}
                    <span className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-1",
                      "text-xs font-black text-white select-none transition-all duration-300",
                      isHighlighted 
                        ? "scale-110 drop-shadow-md" 
                        : "opacity-80 group-hover:opacity-100"
                    )}>
                      {score}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center py-4 space-y-3 animate-fade-in">
            <div className="text-5xl animate-bounce">🎉</div>
            <div>
              <h3 className="font-bold text-white text-xl">Message Received!</h3>
              <p className="text-white/80 text-sm">Thanks for the feedback.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingPopup;
