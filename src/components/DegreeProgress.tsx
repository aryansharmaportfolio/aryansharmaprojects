import { useEffect, useState, useRef } from "react";

const DegreeProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // The specific percentage you requested
  const TARGET_PERCENTAGE = 26.7; 

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    // Outer container holds the space in the grid
    <div ref={containerRef} className="relative z-20 h-[450px] w-24 flex items-center justify-center">
      
      {/* ROTATION WRAPPER:
         We rotate this -90deg. 
         Because we use Flexbox inside, the text and bar will never overlap.
         Width here becomes the visual Height on screen.
      */}
      <div className="w-[400px] flex flex-col gap-4 items-center justify-center transform -rotate-90 origin-center">
        
        {/* "Top" Label (Visually on the left/top depending on head tilt) */}
        <div className="flex flex-col items-center transform rotate-180">
           <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">Current Status</span>
           <div className="text-white text-xs font-medium mt-0.5">
             Completed <span className="text-white font-bold border-b border-white/30"><Counter value={progress} />%</span>
           </div>
        </div>

        {/* THE BAR: Made thinner (h-3) */}
        <div className="h-3 w-full bg-zinc-900/80 border border-zinc-800 rounded-full relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
          
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20" 
               style={{ 
                 backgroundImage: 'linear-gradient(90deg, transparent 98%, #555 98%)', 
                 backgroundSize: '10% 100%' 
               }} 
          />

          {/* Fluid Fill */}
          <div 
            className="absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-white transition-all duration-[2500ms] ease-out overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] animate-flow" />
            <div className="absolute top-0 right-0 w-[20px] h-full bg-gradient-to-l from-white via-zinc-200 to-transparent opacity-50 blur-sm" />
          </div>
          
          {/* 100% Marker Line */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-px h-full bg-zinc-700/50" />
        </div>
        
        {/* "Bottom" Label */}
        <div className="flex justify-center transform rotate-180">
          <span className="text-zinc-600 text-[9px] uppercase tracking-widest whitespace-nowrap">
            BS Aerospace Engineering
          </span>
        </div>

      </div>
    </div>
  );
};

const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 2500;
    const timer = setInterval(() => {
      start += 0.1;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toFixed(1)}</>;
};

export default DegreeProgress;
