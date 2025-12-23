import { useNavigate } from "react-router-dom";
import ClubCard from "./ClubCard";
import TypewriterHeader from "./TypewriterHeader";

interface Club {
  id: string;
  name: string;
  role: string;
  logo: string;
  date: string;
}

const Clubs = () => {
  const navigate = useNavigate();
  
  const clubs: Club[] = [
    {
      id: "aeromavs",
      name: "Aero Mavs",
      role: "Manufacturing",
      logo: "/aeromavs-logo-thumbnail.png",
      date: "Sep 2025 - Present",
    },
    {
      id: "aiaa",
      name: "UTA Design-Build-Fly Team",
      role: "Structures/Manufacturing",
      logo: "/dbf-logo-thumbnail.png",
      date: "Oct 2025 - Present",
    },
    {
      id: "chs-aerospace",
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "/chs-logo.png",
      date: "Aug 2024 - May 2025",
    },
  ];
  
  return (
    <section id="clubs" className="py-24 sm:py-32 md:py-40 px-4 sm:px-6 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.02)_0%,_transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section header with 3D depth effect */}
        <div className="mb-16 sm:mb-20 perspective-1000">
          <div 
            className="text-center py-8 relative transform-gpu hover:scale-[1.02] transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-background/80 via-background/60 to-transparent rounded-3xl border border-primary/10 shadow-2xl shadow-primary/5" />
            <div className="relative z-10">
              <TypewriterHeader text="Clubs & Organizations" className="mb-2 sm:mb-4" />
              <p className="text-base sm:text-lg md:text-xl italic text-foreground/80 px-4 max-w-3xl mx-auto">
                Actively contributing to aerospace and engineering communities through hands-on collaboration.
              </p>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/10 blur-2xl rounded-full" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {clubs.map((club) => (
            <ClubCard
              key={club.id}
              {...club}
              onClick={() => navigate(`/club/${club.id}`)}
              isExpanded={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default Clubs;
