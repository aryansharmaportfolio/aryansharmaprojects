import { Card } from "@/components/ui/card";

interface ClubCardProps {
  id: string;
  name: string;
  role: string;
  logo: string;
  date: string; // Added prop
  onClick: () => void;
  isExpanded: boolean;
}

const ClubCard = ({
  name,
  role,
  logo,
  date,
  onClick,
  isExpanded
}: ClubCardProps) => {
  return (
    <Card 
      onClick={onClick} 
      className={`group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-80 ${isExpanded ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
    >
      {/* Full-bleed image with gradient overlay */}
      <div className="absolute inset-0">
        <img src={logo} alt={name} className="w-full h-full object-cover" />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Simple black overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
      </div>
      
      {/* Date Display - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
        <p className="text-sm font-bold text-white drop-shadow-lg text-right">
          {date}
        </p>
      </div>
      
      {/* Text overlay at bottom (MODIFIED to add new text on hover) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end overflow-hidden pointer-events-none">
        {/* --- MODIFIED: "Click to learn" text (big, bold, and static) --- */}
        <p className="text-2xl font-bold text-white text-left opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 group-hover:mb-2 transition-all duration-300 ease-in-out">
          Click to learn more about
        </p>

        {/* ORIGINAL: Title and Description (now with transitions) */}
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-left transition-all duration-300 ease-in-out pr-16">{name}</h3>
        <p className="text-white/90 drop-shadow-lg text-left transition-all duration-300 ease-in-out">{role}</p>
      </div>
    </Card>
  );
};
export default ClubCard;
