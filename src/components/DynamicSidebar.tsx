import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      className="fixed top-0 left-0 h-full w-24 group flex items-center justify-center z-40"
      onClick={handleNavigateBack}
    >
      <div 
        className="
          absolute top-1/2 -translate-y-1/2 left-0 
          h-48 w-16 bg-card/80 backdrop-blur-md 
          rounded-r-lg shadow-lg cursor-pointer
          flex items-center justify-end
          transition-all duration-300 ease-in-out
          -translate-x-full group-hover:translate-x-0
        "
      >
        <div className="flex flex-col items-center text-white space-y-2 -mr-1">
          <ArrowLeft className="h-6 w-6 transform -rotate-45" />
          <span className="[writing-mode:vertical-rl] font-semibold tracking-wider uppercase text-sm">
            Portfolio
          </span>
        </div>
      </div>
    </div>
  );
};

export default DynamicSidebar;
