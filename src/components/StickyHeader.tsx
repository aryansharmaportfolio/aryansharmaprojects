import { cn } from "@/lib/utils";
import TypewriterHeader from "./TypewriterHeader";

interface StickyHeaderProps {
  text: string;
  subtitle?: string;
  className?: string;
}

const StickyHeader = ({ text, subtitle, className }: StickyHeaderProps) => {
  return (
    <div className={cn("sticky top-20 z-30 py-6 sm:py-8", className)}>
      <div className="text-center backdrop-blur-md bg-background/60 py-6 sm:py-8 rounded-2xl border border-border/20">
        <TypewriterHeader text={text} className="mb-2 sm:mb-4" />
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl italic text-white/90 px-4 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StickyHeader;
