import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ClubCardProps {
  id: string;
  name: string;
  role: string;
  logo: string;
}

const ClubCard = ({ id, name, role, logo }: ClubCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/club/${id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 bg-card p-8"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-40 h-40 bg-background rounded-lg flex items-center justify-center p-4">
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold text-card-foreground mb-2">{name}</h3>
          <p className="text-card-foreground/70">{role}</p>
        </div>
      </div>
    </Card>
  );
};

export default ClubCard;
