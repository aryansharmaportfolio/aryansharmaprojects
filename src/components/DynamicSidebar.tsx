import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DynamicSidebarProps {
  returnSection: string;
}

const DynamicSidebar = ({ returnSection }: DynamicSidebarProps) => {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate("/", { state: { section: returnSection } });
  };

  return (
    <div
      onClick={handleNavigateBack}
      className="fixed top-0 left-0 h-full group z-50 cursor-pointer"
    >
      {/* Peeking Tab */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 left-0",
          "h-64 w-12 bg-black/50 backdrop-blur-md",
          "border-t-2 border-b-2 border-r-2 border-white/10 rounded-r-lg shadow-2xl",
          "flex items-center justify-center",
          "transition-all duration-500 ease-in-out",
          "group-hover:opacity-0 group-hover:translate-x-[-100%]"
        )}
      >
        <div className="absolute inset-0 animate-pulse-slow bg-white/5 rounded-r-lg" />
        <span
          className="
            [writing-mode:vertical-rl] transform rotate-180
            text-white text-xl font-bold uppercase tracking-[0.3em]
            transition-all duration-300
            text-shadow-glow
          "
        >
          Portfolio
        </span>
      </div>

      {/* Expanded Panel */}
      <div
        className={cn(
          "absolute top-0 left-0 h-full w-96",
          "flex items-center justify-center",
          "bg-black/80 backdrop-blur-xl border-r-2 border-white/10",
          "transition-transform duration-500 ease-in-out",
          "-translate-x-full group-hover:translate-x-0"
        )}
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div
          className="
            relative z-10 flex flex-col items-center gap-6 text-white
            font-semibold text-2xl tracking-wider
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100 group-hover:delay-200
            hover:scale-105
          "
        >
          <ArrowLeft className="h-10 w-10" />
          <div className="relative w-full flex items-center justify-center">
            <div className="absolute w-1/2 h-0.5 bg-white/20" />
            <div className="absolute w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out delay-200" />
          </div>
          <span>Back to Portfolio</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicSidebar;
