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
        {/* Sticky section header */}
        <div className="sticky top-20 z-30 mb-12 sm:mb-16">
          <div className="text-center backdrop-blur-md bg-background/60 py-6 rounded-2xl border border-border/20">
            <TypewriterHeader text="Clubs & Organizations" className="mb-2 sm:mb-4" />
            <p className="text-base sm:text-lg md:text-xl italic text-white/90 px-4 max-w-3xl mx-auto">
              Actively contributing to aerospace and engineering communities through hands-on collaboration.
            </p>
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
