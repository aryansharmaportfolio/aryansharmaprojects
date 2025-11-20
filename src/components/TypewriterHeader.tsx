import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Global set to track which headers have already animated in the current session.
// This persists during navigation (e.g., clicking a project and going back)
// but resets when you fully refresh the page (which is usually desired).
const animatedHeaders = new Set<string>();

interface TypewriterHeaderProps {
  text: string;
  className?: string;
}

const TypewriterHeader = ({ text, className }: TypewriterHeaderProps) => {
  // Check if this specific text has already been animated in this session
  const hasAlreadyAnimated = animatedHeaders.has(text);

  // If it has, start with the full text immediately. Otherwise, start empty.
  const [displayText, setDisplayText] = useState(hasAlreadyAnimated ? text : "");
  const [isVisible, setIsVisible] = useState(hasAlreadyAnimated);
  const [hasAnimated, setHasAnimated] = useState(hasAlreadyAnimated);
  const elementRef = useRef<HTMLDivElement>(null);

  // Target duration in milliseconds (0.8 seconds)
  const TARGET_DURATION = 800;

  useEffect(() => {
    // If we've already animated this session, don't set up the observer
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          animatedHeaders.add(text); // Mark this text as "seen" globally
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, text]);

  useEffect(() => {
    // Only run the typing loop if the text is visible AND not yet complete
    if (isVisible && displayText.length < text.length) {
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
