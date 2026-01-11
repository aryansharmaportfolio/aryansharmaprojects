import { useNavigate } from "react-router-dom";
import ClubCard from "./ClubCard";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";

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
      role: "Solid Rocketry Project Manager",
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
    <section id="clubs" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <MaskedTextReveal>
            {/* Explicit mobile sizing for visibility */}
            <TypewriterHeader 
              text="Clubs & Organizations" 
              className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl" 
            />
          </MaskedTextReveal>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl italic text-white px-2 sm:px-4 max-w-3xl mx-auto">
            Actively contributing to aerospace and engineering communities through hands-on collaboration.
          </p>
        </div>

        <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {clubs.map((club) => (
            <StaggerItem key={club.id}>
              <ClubCard
                {...club}
                onClick={() => navigate(`/club/${club.id}`)}
                isExpanded={false}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
export default Clubs;
