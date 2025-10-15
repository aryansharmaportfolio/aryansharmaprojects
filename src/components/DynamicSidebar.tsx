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
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 left-0",
          "bg-card/80 backdrop-blur-sm shadow-lg rounded-r-md",
          "transition-opacity duration-300",
          "group-hover:opacity-0"
        )}
      >
        <div className="flex items-center justify-center h-full p-3">
          <span
            className="
              [writing-mode:vertical-rl] transform rotate-180 
              text-white font-semibold uppercase tracking-widest text-sm
            "
          >
            Portfolio
          </span>
        </div>
      </div>

      <div
        className={cn(
          "absolute top-0 left-0 h-full w-72",
          "flex items-center justify-center",
          "bg-gradient-to-r from-black via-black/90 to-transparent",
          "transition-transform duration-300 ease-in-out",
          "-translate-x-full group-hover:translate-x-0"
        )}
      >
        <div
          className="
            flex items-center gap-4 text-white
            font-semibold text-lg tracking-wider
            transition-opacity duration-300
            opacity-0 group-hover:opacity-100 group-hover:delay-150
          "
        >
          <ArrowLeft className="h-6 w-6" />
          <span>Back to Portfolio</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicSidebar;
