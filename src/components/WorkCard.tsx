import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkCardProps {
  id: string;
  title: string;
  role: string;
  image: string;
}

const WorkCard = ({ id, title, role, image }: WorkCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Card className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-64 sm:h-72 md:h-80">
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-30">
            <ChevronDown 
              className={cn(
                "h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300",
                isOpen && "rotate-180"
              )}
            />
          </div>
      {/* Full-bleed image with gradient overlay */}
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
      
          {/* Text overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 z-10">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg text-left">{title}</h3>
            <p className="text-sm sm:text-base text-white/90 drop-shadow-lg">{role}</p>
          </div>
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <Card className="p-6 bg-card border border-border">
          <p className="text-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default WorkCard;
