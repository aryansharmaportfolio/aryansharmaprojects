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

  // Target duration in milliseconds (0.8 seconds)
  const TARGET_DURATION = 800;

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
      // Calculate speed dynamically: Total Duration / Total Characters
      // Example: "About Me" (8 chars) -> 800/8 = 100ms per char
      // Example: "Clubs & Organizations" (21 chars) -> 800/21 = ~38ms per char
      const typingSpeed = TARGET_DURATION / text.length;

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
