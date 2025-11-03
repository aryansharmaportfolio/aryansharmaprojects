import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
}

const ProjectCard = ({ id, title, description, image }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${id}`, { state: { from: 'projects' } });
  };

  return (
    <Card
      onClick={handleClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-80"
    >
      {/* Full-bleed image with gradient overlay */}
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* --- SHINE EFFECT REMOVED --- */}
        {/* <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div> */}
      </div>

      {/* --- ADDED: Black fade-in overlay with text --- */}
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
        <p className="text-lg font-semibold text-white px-4 text-center">
          Click to learn more
        </p>
      </div>
      
      {/* Text overlay at bottom (MODIFIED to fade out) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-left">{title}</h3>
        <p className="text-white/90 drop-shadow-lg">{description}</p>
      </div>
    </Card>
  );
};

export default ProjectCard;
