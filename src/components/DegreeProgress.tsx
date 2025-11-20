import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const DegreeProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Data derived from your chart: 100% - 73.3% remaining = 26.7% completed
  const TARGET_PERCENTAGE = 26.7; 

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setProgress(TARGET_PERCENTAGE);
      }, 200); // Slight delay before filling starts
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full mb-8 space-y-3">
      {/* Glass container for the bar */}
      <div className="h-12 w-full bg-black/40 backdrop-blur-md rounded-full border border-white/10 relative overflow-hidden shadow-inner">
        
        {/* The Fluid Fill Container */}
        <div 
          className="absolute top-0 left-0 h-full bg-primary/20 transition-all duration-[2000ms] ease-out border-r border-primary/50"
          style={{ width: `${progress}%` }}
        >
          {/* Wave 1 (Back) */}
          <div 
            className="absolute top-0 left-0 w-[200%] h-full opacity-40 animate-wave-slow"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50C200 50 200 10 400 10C600 10 600 50 800 50V100H0V50Z' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: '50% 100%',
              backgroundRepeat: 'repeat-x',
              transform: 'scaleY(0.5)'
            }}
          />
          
          {/* Wave 2 (Front) */}
          <div 
            className="absolute top-2 left-0 w-[200%] h-full opacity-60 animate-wave"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50C200 50 200 90 400 90C600 90 600 50 800 50V100H0V50Z' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: '50% 100%',
              backgroundRepeat: 'repeat-x',
              mixBlendMode: 'overlay'
            }}
          />
          
          {/* Solid fill gradient for the body of the liquid */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-primary/80" />
        </div>

        {/* Percentage Text inside the bar (Mixed Blend Mode for cool effect) */}
        <div className="absolute inset-0 flex items-center justify-end px-4 z-10 pointer-events-none">
          <span className={cn(
            "font-bold font-mono transition-opacity duration-500", 
            progress > 5 ? "opacity-100" : "opacity-0"
          )}>
             <Counter value={progress} />%
          </span>
        </div>
      </div>

      {/* Text Label Below */}
      <div className="flex justify-between items-center text-sm">
         <p className="text-white/60 italic">
           Degree Progress <span className="text-primary/50 text-xs ml-2">(Based on Credit Hours)</span>
         </p>
         <p className="text-white font-medium">
           I have completed <span className="text-primary font-bold"><Counter value={progress} />%</span> of my degree!
         </p>
      </div>
    </div>
  );
};

// Helper component to count the number up smoothly
const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds to count
    const steps = 60;
    const increment = value / steps;
    const stepTime = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toFixed(1)}</>;
};

export default DegreeProgress;
