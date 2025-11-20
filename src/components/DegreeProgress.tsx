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
      { threshold: 0.1 } // Trigger as soon as it peeks into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Add a small delay for dramatic effect
      const timer = setTimeout(() => {
        setProgress(TARGET_PERCENTAGE);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto py-12 relative z-20">
      
      {/* Top Labels */}
      <div className="flex justify-between items-end mb-3 px-2">
        <div className="flex flex-col">
           <span className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Current Status</span>
           <span className="text-white text-sm font-medium mt-1">
             I have completed <span className="text-white font-bold border-b border-white/30 pb-0.5"><Counter value={progress} />%</span> of my degree
           </span>
        </div>
        <span className="text-3xl font-black text-white tracking-tighter">
          <Counter value={progress} />%
        </span>
      </div>

      {/* The Bar Container */}
      <div className="h-16 w-full bg-zinc-900/80 border border-zinc-800 rounded-full relative overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        
        {/* Background Grid Lines for "Scientific/Engineering" feel */}
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(90deg, transparent 98%, #555 98%)', 
               backgroundSize: '10% 100%' 
             }} 
        />

        {/* The Fluid Fill */}
        <div 
          className="absolute top-1 bottom-1 left-1 rounded-full bg-white transition-all duration-[2500ms] ease-out overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Liquid Texture Layer 1 (Fast) */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] animate-flow" />
          
          {/* Liquid Texture Layer 2 (Slow & Reversed - creates interference pattern) */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" 
               style={{ backgroundPosition: 'center', transform: 'scaleX(-1)' }} 
          />

          {/* The "Waving" Leading Edge Highlight */}
          <div className="absolute top-0 right-0 w-[40px] h-full bg-gradient-to-l from-white via-zinc-200 to-transparent opacity-50 blur-sm" />
          
          {/* Shimmer/Reflection on the liquid surface */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full" />
        </div>
        
        {/* Target Marker Line (Optional - marks the goal or 100%) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-px h-8 bg-zinc-700" />
        <div className="absolute right-4 top-10 text-[10px] text-zinc-600 font-mono">100%</div>
      </div>
      
      {/* Bottom Label */}
      <div className="flex justify-start mt-2 px-2">
        <span className="text-zinc-600 text-[10px] uppercase tracking-widest">
          Bachelor of Science in Aerospace Engineering
        </span>
      </div>
    </div>
  );
};

// Helper component for the number counting animation
const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 2500; // match bar duration
    const incrementTime = (duration / end) * 10;

    const timer = setInterval(() => {
      start += 0.1;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 10); // Updates frequently for smoothness

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toFixed(1)}</>;
};

export default DegreeProgress;
