import { useState } from "react";
import ClubCard from "./ClubCard";
import { X } from "lucide-react";

interface Club {
  id: string;
  name: string;
  role: string;
  logo: string;
  details: {
    achievements: string[];
    skills: string[];
  };
}

const Clubs = () => {
  const [expandedClub, setExpandedClub] = useState<string | null>(null);

  const clubs: Club[] = [
    {
      id: "aeromavs",
      name: "Aero Mavs",
      role: "Project Lead",
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
      details: {
        achievements: [
          "Led a team of 12 students in designing and building a competition-ready aircraft",
          "Coordinated with multiple sub-teams to ensure project milestones were met",
          "Presented technical design reviews to faculty and industry professionals"
        ],
        skills: ["Team Leadership", "Project Management", "Aircraft Design", "CAD Modeling", "Technical Communication"]
      }
    },
    {
      id: "aiaa",
      name: "AIAA",
      role: "Design-Build-Fly Team",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
      details: {
        achievements: [
          "Designed and fabricated custom aircraft components for competition",
          "Conducted aerodynamic analysis and performance testing",
          "Collaborated with team members on structural optimization"
        ],
        skills: ["Aerodynamics", "Structural Analysis", "Composite Materials", "Wind Tunnel Testing", "Flight Testing"]
      }
    },
    {
      id: "chs-aerospace",
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
      details: {
        achievements: [
          "Co-founded and grew the club to over 40 active members",
          "Organized workshops and guest speaker events with industry professionals",
          "Mentored students on aerospace fundamentals and career pathways"
        ],
        skills: ["Leadership", "Event Planning", "Public Speaking", "Mentorship", "Community Building"]
      }
    },
  ];

  const selectedClub = clubs.find(club => club.id === expandedClub);

  return (
    <section id="clubs" className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className={`text-center mb-16 transition-all duration-500 ${expandedClub ? 'opacity-0 -translate-y-4' : 'opacity-100 animate-fade-in'}`}>
          <h2 className="text-5xl font-bold text-foreground mb-4 border-b-4 border-primary inline-block pb-2">
            Clubs & Organizations
          </h2>
          <p className="text-xl text-muted-foreground mt-6 italic">
            Actively contributing to aerospace and engineering communities through collaboration and hands-on projects.
          </p>
        </div>

        <div className={`grid md:grid-cols-3 gap-8 transition-all duration-500 ${expandedClub ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
          {clubs.map((club) => (
            <ClubCard 
              key={club.id} 
              {...club} 
              onClick={() => setExpandedClub(club.id)}
              isExpanded={expandedClub === club.id}
            />
          ))}
        </div>

        {/* Expanded Club Detail View */}
        {expandedClub && selectedClub && (
          <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-fade-in">
            <div className="min-h-screen">
              {/* Banner */}
              <div 
                className="relative h-96 bg-cover bg-center animate-scale-in"
                style={{ backgroundImage: `url(${selectedClub.logo})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-12">
                  <h2 className="text-5xl font-bold text-foreground mb-2">{selectedClub.name}</h2>
                  <p className="text-2xl text-muted-foreground">{selectedClub.role}</p>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setExpandedClub(null)}
                  className="absolute top-8 right-8 bg-card/90 backdrop-blur-sm p-3 rounded-full hover:bg-card transition-all hover:scale-110"
                >
                  <X className="w-6 h-6 text-card-foreground" />
                </button>
              </div>

              {/* Detail Content */}
              <div className="container mx-auto max-w-7xl px-6 py-16 animate-slide-up">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* My Role & Achievements */}
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-6 border-l-4 border-primary pl-4">
                      My Role & Achievements
                    </h3>
                    <ul className="space-y-4">
                      {selectedClub.details.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-primary mr-3 mt-1">▸</span>
                          <span className="text-lg text-foreground/90">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* List of Skills */}
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-6 border-l-4 border-primary pl-4">
                      Skills Developed
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedClub.details.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-card text-card-foreground rounded-lg text-lg font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Clubs;
