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
      className="fixed top-0 left-0 h-full w-72 group z-50 cursor-pointer"
    >
      <div
        className={cn(
          "absolute top-0 left-0 h-full w-full",
          "flex items-center justify-center",
          "bg-gradient-to-r from-black via-black/80 to-transparent",
          "transition-transform duration-300 ease-in-out",
          "-translate-x-[calc(100%-2rem)] group-hover:translate-x-0"
        )}
      >
        <div
          className="
            flex items-center gap-4 text-white
            font-semibold text-lg tracking-wider
            transition-all duration-300
            opacity-0 group-hover:opacity-100 group-hover:delay-100
            hover:scale-105
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
