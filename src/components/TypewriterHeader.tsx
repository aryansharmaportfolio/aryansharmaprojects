import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TypewriterHeaderProps {
  text: string;
  className?: string;
}

const TypewriterHeader = ({ text, className }: TypewriterHeaderProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true); // Lock it so it doesn't re-type when scrolling up/down
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (isVisible && displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, 50); // Adjust typing speed here (lower is faster)

      return () => clearTimeout(timeout);
    }
  }, [isVisible, displayText, text]);

  return (
    <div ref={elementRef} className={cn("mb-12", className)}>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground inline-block">
        {displayText}
        <span className="animate-pulse text-primary ml-1">_</span>
      </h2>
      {/* Optional: Underline decoration that appears after typing */}
      <div 
        className={cn(
          "h-1 bg-primary mt-4 transition-all duration-1000 ease-out",
          isVisible && displayText === text ? "w-24 opacity-100" : "w-0 opacity-0"
        )} 
      />
    </div>
  );
};

export default TypewriterHeader;
