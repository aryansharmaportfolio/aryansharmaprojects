import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

const ProjectCard = ({ id, title, description, image, date }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${id}`, { state: { from: 'projects' } });
  };

  return (
    <Card
      onClick={handleClick}
      // CHANGED: Changed 'h-80' to 'h-72' for a better landscape aspect ratio.
      // You can also try 'aspect-video' and 'h-auto' if you want a perfect 16:9 ratio.
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-72 border-0 bg-neutral-900"
    >
      {/* Full-bleed image with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={title} 
          // KEY CHANGE HERE:
          // 'object-cover' crops the image to fill the card (standard).
          // 'object-contain' would show the whole image with black bars (no cropping).
          // 'object-center' ensures the center of the image is the focal point.
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Dark gradient for text readability - made slightly stronger for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>

      {/* Date Display - Top Left Glass Badge */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
          <p className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
            {date}
          </p>
        </div>
      </div>
      
      {/* Text overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end overflow-hidden pointer-events-none">
        {/* Click to learn text */}
        <p className="text-sm font-bold text-primary/90 text-left opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out mb-1">
          Click to explore →
        </p>

        {/* Title and Description */}
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-left transition-all duration-300 ease-in-out group-hover:text-primary/90">{title}</h3>
        <p className="text-white/80 drop-shadow-md text-left text-sm line-clamp-2">{description}</p>
      </div>
    </Card>
  );
};

export default ProjectCard;
