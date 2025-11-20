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
    <div ref={containerRef} className="flex flex-col items-center text-center mt-6 space-y-2 animate-fade-in">
       {/* Changed text-zinc-500 to text-white and text-xs to text-sm */}
       <span className="text-white text-sm uppercase tracking-widest font-semibold">
         BS Aerospace Engineering
       </span>
       <span className="text-white text-lg font-medium">
         Completed <span className="text-primary font-bold border-b border-primary/30"><Counter value={progress} />%</span> of degree
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
    }, 10);
    
    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toFixed(1)}</>;
};

export default DegreeProgress;
