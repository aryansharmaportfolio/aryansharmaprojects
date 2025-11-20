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

  // The total time (in ms) the typing animation should take
  const ANIMATION_DURATION = 500; // 0.5 seconds

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
      // Calculate speed per character: Total Duration / Character Count
      // Longer text = faster typing; Shorter text = slower typing
      const typingSpeed = ANIMATION_DURATION / text.length;

      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, displayText, text]);

  return (
    <div ref={elementRef} className={cn("inline-block", className)}>
      <h2 className="text-5xl font-bold text-foreground border-b-4 border-primary pb-2">
        {displayText}
        <span className="animate-pulse text-primary">_</span>
      </h2>
    </div>
  );
};

export default TypewriterHeader;
