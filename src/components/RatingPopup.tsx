import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const RatingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
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
      {/* Glassmorphism Card Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur-xl w-[340px]">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          aria-label="Close rating popup"
        >
          <X size={16} />
        </button>

        {!hasRated ? (
          <div className="space-y-5 text-center">
            <div>
              <h3 className="font-bold text-white text-lg tracking-wide">
                Rate this portfolio
              </h3>
              <p className="text-xs text-white/60 mt-1">
                How was your flight? <span className="inline-block animate-bounce">🚀</span>
              </p>
            </div>
            
            {/* Interactive Rating Circles */}
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onMouseEnter={() => setHoveredRating(score)}
                  onMouseLeave={() => setHoveredRating(null)}
                  onClick={() => handleRate(score)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ease-out",
                    "hover:scale-110 active:scale-95",
                    // Logic for highlighting: highlight if this circle is <= the hovered one
                    (hoveredRating !== null ? score <= hoveredRating : false)
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.6)]"
                      : "border-white/10 text-white/40 hover:border-primary/50 hover:text-white"
                  )}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center py-2 space-y-3 animate-fade-in">
            <div className="text-4xl animate-pulse">🎉</div>
            <div>
              <h3 className="font-bold text-white text-xl">Message Received!</h3>
              <p className="text-white/70 text-sm mt-1">Thanks for the feedback.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingPopup;
