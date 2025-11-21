import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const RatingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    // Delay the popup by 4 seconds to simulate a natural interaction timing
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleRate = (score: number) => {
    setSelectedRating(score);
    setHasRated(true);
    
    // Automatically close the popup 3 seconds after rating
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-8 right-8 z-50 animate-fade-in-up transition-all duration-500 ease-out",
      hasRated && "pointer-events-none"
    )}>
      {/* Glassmorphism Card Container - Made smaller (w-[300px]) and tighter padding (p-5) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-xl w-[300px]">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          aria-label="Close rating popup"
        >
          <X size={14} />
        </button>

        {!hasRated ? (
          <div className="space-y-4 text-center">
            <div>
              <h3 className="font-bold text-white text-lg tracking-wide">
                Rate this portfolio
              </h3>
              {/* Made text white as requested */}
              <p className="text-xs text-white mt-1 font-medium">
                How was your flight? <span className="inline-block animate-bounce">🚀</span>
              </p>
            </div>
            
            {/* Interactive Rating Circles - Redesigned for maximum impressiveness */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => {
                // Calculate if this specific star is active based on hover state
                const isActive = hoveredRating !== null ? score <= hoveredRating : false;
                
                return (
                  <button
                    key={score}
                    onMouseEnter={() => setHoveredRating(score)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => handleRate(score)}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                      // Use a spring-like bezier curve for a bouncy feel
                      "ease-[cubic-bezier(0.34,1.56,0.64,1)]", 
                      "focus:outline-none",
                      isActive
                        ? "bg-gradient-to-br from-primary via-primary/80 to-accent text-white shadow-[0_0_20px_rgba(var(--primary),0.6)] scale-110 -translate-y-1"
                        : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/20 hover:text-white hover:scale-125 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:border-primary/30"
                    )}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center py-2 space-y-2 animate-fade-in">
            <div className="text-4xl animate-bounce">🎉</div>
            <div>
              <h3 className="font-bold text-white text-lg">Message Received!</h3>
              <p className="text-white/70 text-xs">Thanks for the feedback.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingPopup;
