import { useParams } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect } from "react";
import { Award, Target, Sparkles } from "lucide-react";

const ClubDetail = () => {
  const { id } = useParams();
  
  // Initialize opacity to 0 for the fade-in effect
  const [opacity, setOpacity] = useState(0);

  // Trigger the transition to opacity 1 after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const clubData: Record<string, any> = {
    aeromavs: {
      name: "Aero Mavs",
      role: "Manufacturing",
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
      achievements: [
        "Designing and modeling a fully assembled H-motor high-powered rocket in SolidWorks, validating architecture against stability and performance parameters simulated in OpenRocket.",
        "Performing a CFD analysis using SolidWorks Flow Simulation to determine key flight characteristics, such as drag force and aerodynamic stability, on the rocket's comprehensive 3D model before fabrication.",
        "3D printing ogive nose cone and laser-cutting individual parts for the precise construction of the wooden fin can assembly.",
        "Drilling mounting points and installing hardware to secure the recovery system and ensure structural integrity for launch.",
      ],
    },
    aiaa: {
      name: "UTA Design-Build-Fly Team",
      role: "Structures/Manufacturing",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
      achievements: [
        "Designed and fabricated custom aircraft components for competition",
        "Conducted aerodynamic analysis and performance testing",
        "Collaborated with team members on structural optimization",
      ],
    },
    "chs-aerospace": {
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
      achievements: [
        "Co-founded and grew the school's first aerospace club to over 115 members, establishing it as the largest student organization in the school's history (est. 1965).",
        "Led the astronomy sub-department, coordinating monthly meetings and developing educational presentations.",
        "Co-developed and managed a centralized Excel spreadsheet to track member enrollment, event logistics, and communications.",
        "Designed and modeled a detailed rocket prototype, including the payload fairing, second stage, interstage, first stage booster body, grid fins, and engine cluster in SolidWorks, inspired by Falcon 9, to showcase to students.",
      ],
    },
  };
  const club = clubData[id || ""];

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Club not found</p>
      </div>
    );
  }

  return (
    <>
      <DynamicSidebar returnSection="clubs" />
      <div 
        className="min-h-screen bg-background transition-opacity duration-700 ease-in-out"
        style={{ opacity }}
      >
        {/* Hero image - respects sidebar on left */}
        <div className="relative h-[450px] md:h-[500px] overflow-hidden ml-16">
          <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          
          {/* Floating accent elements */}
          <div className="absolute top-8 right-8 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Team Experience</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2 tracking-tight">{club.name}</h1>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <p className="text-xl md:text-2xl text-white font-semibold">{club.role}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-5xl">
          {/* Main Content Card */}
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-10 shadow-xl">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/30 rounded-br-2xl" />
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">My Role & Achievements</h2>
                <p className="text-muted-foreground text-sm">Key contributions and accomplishments</p>
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-6">
              {club.achievements.map((achievement: string, index: number) => (
                <div 
                  key={index} 
                  className="group flex gap-4 p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClubDetail;