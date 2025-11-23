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
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
      date: "Sep 2025 - Present",
    },
    {
      id: "aiaa",
      name: "UTA Design-Build-Fly Team",
      role: "Structures/Manufacturing",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
      date: "Oct 2025 - Present",
    },
    {
      id: "chs-aerospace",
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
      date: "Aug 2024 - May 2025",
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
              isExpanded={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default Clubs;
