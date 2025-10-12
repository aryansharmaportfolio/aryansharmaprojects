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
    navigate(`/project/${id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 bg-card"
    >
      <div className="aspect-video bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-card-foreground mb-2">{title}</h3>
        <p className="text-card-foreground/70">{description}</p>
      </div>
    </Card>
  );
};

export default ProjectCard;
