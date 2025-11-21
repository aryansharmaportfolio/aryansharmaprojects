import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  // New optional prop to control how the image fits
  imageFit?: "cover" | "contain";
}

const ProjectCard = ({ 
  id, 
  title, 
  description, 
  image, 
  date, 
  imageFit = "cover" // Default to cover (zoom to fill)
}: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${id}`, { state: { from: 'projects' } });
  };

  return (
    <Card
      onClick={handleClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-72 border-0 bg-neutral-900"
    >
      {/* Full-bleed image container */}
      <div className="absolute inset-0 bg-neutral-900">
        <img 
          src={image} 
          alt={title} 
          className={cn(
            "w-full h-full transition-transform duration-700 group-hover:scale-105",
            // Dynamic class based on the prop
            imageFit === "contain" 
              ? "object-contain p-2" // 'contain' shows whole image. Added padding so it doesn't touch edges.
              : "object-cover object-center" // 'cover' fills the space (good for photos)
          )}
        />
        
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>

      {/* Date Display */}
      <div className="absolute top-4 left-4 z-30 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
          <p className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-md">
            {date}
          </p>
        </div>
      </div>
      
      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end overflow-hidden pointer-events-none">
        <p className="text-sm font-bold text-primary/90 text-left opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out mb-1">
          Click to explore →
        </p>

        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-left transition-all duration-300 ease-in-out group-hover:text-primary/90">{title}</h3>
        <p className="text-white/80 drop-shadow-md text-left text-sm line-clamp-2">{description}</p>
      </div>
    </Card>
  );
};

export default ProjectCard;
