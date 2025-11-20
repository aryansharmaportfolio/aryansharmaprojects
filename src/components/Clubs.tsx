import { useNavigate } from "react-router-dom";
import ClubCard from "./ClubCard";
import TypewriterHeader from "./TypewriterHeader";

interface Club {
  id: string;
  name: string;
  role: string;
  logo: string;
}

const Clubs = () => {
  const navigate = useNavigate();
  
  const clubs: Club[] = [
    {
      id: "aeromavs",
      name: "Aero Mavs",
      role: "Project Lead",
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
    },
    {
      id: "aiaa",
      name: "AIAA",
      role: "Design-Build-Fly Team",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
    },
    {
      id: "chs-aerospace",
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
    },
  ];
  
  return (
    <section id="clubs" className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <TypewriterHeader text="Clubs & Organizations" className="mb-6" />
          <p className="text-xl italic text-white">
            Actively contributing to aerospace and engineering communities through hands-on collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
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
