import { useState, useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
}

const AnimatedSection = ({ children }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // This is the fix: it now tracks if the section is on screen or not
        setIsVisible(entries[0].isIntersecting);
      },
      {
        // This threshold makes the animation trigger when the section is 50% in view
        threshold: 0.5,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-in-out ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-90 translate-y-20"
      }`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
