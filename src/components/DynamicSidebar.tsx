import { useState, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DynamicSidebarProps {
  returnSection: string;
}

const DynamicSidebar = ({ returnSection }: DynamicSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNavigateBack = () => {
    navigate("/", { state: { section: returnSection } });
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          className={cn(
            "fixed inset-0 bg-black/50 z-40 transition-opacity",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />
      )}

      <div
        onClick={isMobile ? undefined : handleNavigateBack}
        className={cn(
          "fixed top-0 left-0 h-full group z-50",
          !isMobile && "cursor-pointer"
        )}
      >
        <div
          onClick={isMobile ? toggleSidebar : undefined}
          className={cn(
            "absolute left-0",
            "w-16 bg-black/60 backdrop-blur-md",
            "border-t-2 border-b-2 border-r-2 border-white/10 shadow-2xl",
            "flex items-center justify-center",
            "transition-all duration-500 ease-in-out",
            !isMobile && "group-hover:opacity-0 group-hover:translate-x-[-100%]",
            isMobile
              ? "h-64 top-1/2 -translate-y-1/2 rounded-r-lg"
              : "h-full top-0"
          )}
        >
          <div className={cn(
              "absolute inset-0 animate-pulse-slow bg-white/10",
               isMobile && "rounded-r-lg"
          )} />
          <span
            className="
              [writing-mode:vertical-rl] transform rotate-180
              text-white text-3xl font-black uppercase tracking-[0.4em]
              text-shadow-glow
            "
          >
            Portfolio
          </span>
        </div>

        <div
          className={cn(
            "fixed top-0 left-0 h-full w-96",
            "flex items-center justify-center",
            "bg-black/80 backdrop-blur-xl border-r-2 border-white/10",
            "transition-transform duration-500 ease-in-out",
            isMobile
              ? (isOpen ? "translate-x-0" : "-translate-x-full")
              : "-translate-x-full group-hover:translate-x-0"
          )}
        >
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-primary"
            >
              <X size={32} />
            </button>
          )}

          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          <div
            onClick={isMobile ? handleNavigateBack : undefined}
            className="
              relative z-10 flex flex-col items-center gap-6 text-white
              font-semibold text-2xl tracking-wider
              transition-all duration-300
              hover:scale-105 cursor-pointer
            "
          >
            <ArrowLeft className="h-10 w-10" />
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute w-1/2 h-0.5 bg-white/20" />
              <div className={cn(
                  "absolute w-full h-0.5 bg-white transition-transform duration-700 ease-in-out",
                  isMobile
                    ? (isOpen && "scale-x-100 delay-200")
                    : "scale-x-0 group-hover:scale-x-100 group-hover:delay-200"
                )}
              />
            </div>
            <span>Back to Portfolio</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicSidebar;
