import { Card } from "@/components/ui/card";
interface ClubCardProps {
  id: string;
  name: string;
  role: string;
  logo: string;
  onClick: () => void;
  isExpanded: boolean;
}
const ClubCard = ({
  name,
  role,
  logo,
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
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-left">{name}</h3>
        <p className="text-white/90 drop-shadow-lg">{role}</p>
      </div>
    </Card>
  );
};
export default ClubCard;
