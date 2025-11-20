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
    <div ref={containerRef} className="flex flex-col items-center text-center mt-8 animate-fade-in">
       {/* Label */}
       <span className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-2">
         BS Aerospace Engineering
       </span>
       
       {/* Big Percentage Number */}
       <div className="relative flex items-baseline justify-center my-1">
         <span className="text-6xl md:text-7xl font-black text-white tracking-tighter text-shadow-glow transition-all duration-500 hover:scale-110 cursor-default">
           <Counter value={progress} />%
         </span>
       </div>
       
       {/* Context text */}
       <span className="text-white/80 text-sm font-medium">
         Degree Completed
       </span>
    </div>
  );
};

const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    const timer = setInterval(() => {
      start += 0.1;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 10); // Speed of counting
    
    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toFixed(1)}</>;
};

export default DegreeProgress;
