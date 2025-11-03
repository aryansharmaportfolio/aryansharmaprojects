import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import DynamicSidebar from "./DynamicSidebar";

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
    <>
      <DynamicSidebar returnSection="projects" />
      <Card
        onClick={handleClick}
        className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-80"
      >
      {/* Full-bleed image with gradient overlay */}
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Simple black overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
      </div>
      
      {/* Text overlay at bottom (MODIFIED to add new text on hover) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end overflow-hidden">
        {/* --- MODIFIED: "Click to learn" text (big, bold, and static) --- */}
        <p className="text-2xl font-bold text-white text-left opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 group-hover:mb-2 transition-all duration-300 ease-in-out">
          Click to learn more about
        </p>

        {/* ORIGINAL: Title and Description (now with transitions) */}
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-left transition-all duration-300 ease-in-out">{title}</h3>
        <p className="text-white/90 drop-shadow-lg text-left transition-all duration-300 ease-in-out">{description}</p>
      </div>
    </Card>
    </>
  );
};

export default ProjectCard;
