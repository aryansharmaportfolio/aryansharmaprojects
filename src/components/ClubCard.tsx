import { useNavigate } from "react-router-dom";
import { ClubCard } from "./ClubCard";
import TypewriterHeader from "./TypewriterHeader";

// Updated interface to match the new ClubCardProps
interface ClubData {
  id: string;
  title: string;
  role: string;
  period: string;
  logo: string;
  description: string;
  skills: string[];
}

const Clubs = () => {
  const navigate = useNavigate();
  
  const clubs: ClubData[] = [
    {
      id: "aeromavs",
      title: "Aero Mavs",
      role: "Manufacturing",
      period: "Sep 2025 - Present",
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
      description: "Contributing to the manufacturing subsystem of high-powered rocketry projects. Hands-on experience with composite layups, precision machining, and structural assembly for competition-grade rockets.",
      skills: ["Manufacturing", "Composites", "Rocketry", "Precision Machining"]
    },
    {
      id: "aiaa",
      title: "UTA Design-Build-Fly Team",
      role: "Structures/Manufacturing",
      period: "Oct 2025 - Present",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
      description: "Member of the Structures and Manufacturing team for the AIAA Design/Build/Fly competition. Collaborating on the design and fabrication of a high-performance unmanned electric aircraft.",
      skills: ["Structural Design", "Aircraft Manufacturing", "SolidWorks", "Team Collaboration"]
    },
    {
      id: "chs-aerospace",
      title: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      period: "Aug 2024 - May 2025",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
      description: "Co-founded and led the high school aerospace club to foster student interest in aviation and space. Organized workshops, guest speaker events, and model rocket launches for over 50 members.",
      skills: ["Leadership", "Event Organization", "Public Speaking", "Mentorship"]
    },
  ];
  
  return (
    <section id="clubs" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
          <TypewriterHeader text="Clubs & Organizations" className="mb-4 sm:mb-6" />
          <p className="text-base sm:text-lg md:text-xl italic text-white px-4">
            Actively contributing to aerospace and engineering communities through hands-on collaboration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
          {clubs.map((club) => (
            <ClubCard
              key={club.id}
              {...club}
              onClick={() => navigate(`/club/${club.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default Clubs;
