import { useState } from "react";
import { Card } from "@/components/ui/card";

interface WorkCardProps {
  id: string;
  title: string;
  role: string;
  image: string;
  description?: string;
}

const WorkCard = ({ id, title, role, image, description = "Contributing to cutting-edge aerospace research and development, gaining hands-on experience with industry-standard tools and methodologies while collaborating with experienced professionals." }: WorkCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-64 sm:h-72 md:h-80 border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full-bleed image with gradient overlay */}
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Darker overlay on hover */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
      
      {/* Text overlay at bottom - slides up to reveal description */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden">
        {/* Sliding content container */}
        <div 
          className={`p-4 sm:p-5 md:p-6 transition-all duration-500 ease-out transform ${
            isHovered ? '-translate-y-0' : 'translate-y-0'
          }`}
        >
          {/* Title & Role */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg text-left">{title}</h3>
          <p className={`text-sm sm:text-base text-white/90 drop-shadow-lg font-medium transition-all duration-300 ${isHovered ? 'mb-3' : ''}`}>{role}</p>
          
          {/* Description - slides up on hover */}
          <div 
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-3 border-t border-white/20">
              <p className="text-sm text-white/80 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Gradient bar indicator at bottom */}
        <div 
          className={`h-1 bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-500 ${
            isHovered ? 'w-full' : 'w-0'
          }`}
        />
      </div>

      {/* Corner accent */}
      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-primary transition-all duration-300 ${
        isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-50'
      }`} />
    </Card>
  );
};

export default WorkCard;