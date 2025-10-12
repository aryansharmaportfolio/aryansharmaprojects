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
  const clubs: Club[] = [{
    id: "aeromavs",
    name: "Aero Mavs",
    role: "Project Lead",
    logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
    details: {
      achievements: ["Designing and modeling a fully assembled H-motor high-powered rocket in SolidWorks, validating architecture against stability and performance parameters simulated in OpenRocket.", "Performing a CFD analysis using SolidWorks Flow Simulation to determine key flight characteristics, such as drag force and aerodynamic stability, on the rocket's comprehensive 3D model before fabrication.", "3D printing ogive nose cone and laser-cutting individual parts for the precise construction of the wooden fin can assembly.", "Drilling mounting points and installing hardware to secure the recovery system and ensure structural integrity for launch."],
      skills: ["SolidWorks", "Computational Fluid Dynamics (CFD)", "MATLAB", "3D Printing"]
    }
  }, {
    id: "aiaa",
    name: "AIAA",
    role: "Design-Build-Fly Team",
    logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
    details: {
      achievements: ["Designed and fabricated custom aircraft components for competition", "Conducted aerodynamic analysis and performance testing", "Collaborated with team members on structural optimization"],
      skills: ["Aerodynamics", "Structural Analysis", "Composite Materials", "Wind Tunnel Testing", "Flight Testing"]
    }
  }, {
    id: "chs-aerospace",
    name: "Coppell High School Aerospace Club",
    role: "Co-Founder/Executive",
    logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
    details: {
      achievements: ["Co-founded and grew the school's first aerospace club to over 115 members, establishing it as the largest student organization in the school's history (est. 1965).", "Led the astronomy sub-department, coordinating monthly meetings and developing educational presentations.", "Co-developed and managed enrollment for over 115 members using a centralized Excel spreadsheet.", "Created a detailed assembly of a rocket in SolidWorks that resembles the Falcon 9, modeling the payload fairing, second stage, interstage, first stage booster body, grid fins, and engine cluster."],
      skills: ["SolidWorks", "Leadership", "Excel", "Teamwork", "Project Management", "Program Development", "Recruitment/Member Outreach"]
    }
  }];
  const selectedClub = clubs.find(club => club.id === expandedClub);
  return <section id="clubs" className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className={`text-center mb-16 transition-all duration-500 ${expandedClub ? 'opacity-0 -translate-y-4' : 'opacity-100 animate-fade-in'}`}>
          <h2 className="text-5xl font-bold text-foreground mb-6 border-b-4 border-primary inline-block pb-2">
            Clubs & Organizations
          </h2>
           <p className="text-xl italic text-white">
            Actively contributing to aerospace and engineering communities through hands-on collaboration.
          </p>
        </div>

        <div className={`grid md:grid-cols-3 gap-8 transition-all duration-500 ${expandedClub ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
          {clubs.map(club => <ClubCard key={club.id} {...club} onClick={() => setExpandedClub(club.id)} isExpanded={expandedClub === club.id} />)}
        </div>

        {/* Expanded Club Detail View */}
        {expandedClub && selectedClub && <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-fade-in">
            <div className="min-h-screen">
              {/* Banner */}
              <div className="relative h-96 bg-cover bg-center animate-scale-in" style={{
            backgroundImage: `url(${selectedClub.logo})`
          }}>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-12">
                  <h2 className="text-5xl font-bold text-foreground mb-2">{selectedClub.name}</h2>
                  <p className="text-2xl text-muted-foreground">{selectedClub.role}</p>
                </div>
                
                {/* Close Button */}
                <button onClick={() => setExpandedClub(null)} className="absolute top-8 right-8 bg-card/90 backdrop-blur-sm p-3 rounded-full hover:bg-card transition-all hover:scale-110">
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
                      {selectedClub.details.achievements.map((achievement, idx) => <li key={idx} className="flex items-start">
                          <span className="text-primary mr-3 mt-1">▸</span>
                          <span className="text-lg text-foreground/90">{achievement}</span>
                        </li>)}
                    </ul>
                  </div>

                  {/* List of Skills */}
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-6 border-l-4 border-primary pl-4">
                      Skills Developed
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedClub.details.skills.map((skill, idx) => <span key={idx} className="px-4 py-2 bg-card text-card-foreground rounded-lg text-lg font-medium">
                          {skill}
                        </span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}
      </div>
    </section>;
};
export default Clubs;
