import { useState, useEffect } from "react";
import { X, Rocket } from "lucide-react";
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
      {/* Glassmorphism Card Container - Tighter width (280px) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-xl w-[280px]">
        
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
              {/* Subtext is now explicitly white */}
              <p className="text-xs text-white mt-1 font-medium">
                How was your flight? <span className="inline-block animate-bounce">🚀</span>
              </p>
            </div>
            
            {/* Interactive Rocket Rating Icons */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => {
                // Highlight rockets up to the hovered one, or the selected one if not hovering
                const isHighlighted = hoveredRating !== null 
                  ? score <= hoveredRating 
                  : (selectedRating !== null && score <= selectedRating);
                
                return (
                  <button
                    key={score}
                    onMouseEnter={() => setHoveredRating(score)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => handleRate(score)}
                    className="group focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
                  >
                    <Rocket
                      className={cn(
                        "w-8 h-8 transition-all duration-300",
                        isHighlighted
                          ? "fill-primary text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.6)]" 
                          : "text-white/20 group-hover:text-white/50"
                      )}
                      strokeWidth={1.5}
                    />
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
