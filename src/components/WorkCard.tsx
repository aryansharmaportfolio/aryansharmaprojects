import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface WorkCardProps {
  id: string;
  title: string;
  role: string;
  image: string;
}

const WorkCard = ({ id, title, role, image }: WorkCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/work/${id}`, { state: { from: 'current-work' } });
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
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
      
      {/* Text overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-left">{title}</h3>
        <p className="text-white/90 drop-shadow-lg">{role}</p>
      </div>
    </Card>
  );
};

export default WorkCard;
