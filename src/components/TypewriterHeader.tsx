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
  const [showCursor, setShowCursor] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
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
      }, 50); // Typing speed

      return () => clearTimeout(timeout);
    } else if (isVisible && displayText.length === text.length) {
      // Text is fully typed. Wait for ~2.5 seconds (approx 2 blinks) then hide cursor.
      const timeout = setTimeout(() => {
        setShowCursor(false);
      }, 2500);
      
      return () => clearTimeout(timeout);
    }
  }, [isVisible, displayText, text]);

  return (
    <div ref={elementRef} className={cn("inline-block", className)}>
      <h2 className="text-5xl font-bold text-foreground border-b-4 border-primary pb-2">
        {displayText}
        <span className={cn("animate-pulse text-primary", !showCursor && "hidden")}>_</span>
      </h2>
    </div>
  );
};

export default TypewriterHeader;
