import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DynamicSidebar from "@/components/DynamicSidebar";

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const clubData: Record<string, any> = {
    aeromavs: {
      name: "Aero Mavs",
      role: "Project Lead",
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
      achievements: [
        "Designing and modeling a fully assembled H-motor high-powered rocket in SolidWorks, validating architecture against stability and performance parameters simulated in OpenRocket.",
        "Performing a CFD analysis using SolidWorks Flow Simulation to determine key flight characteristics, such as drag force and aerodynamic stability, on the rocket's comprehensive 3D model before fabrication.",
        "3D printing ogive nose cone and laser-cutting individual parts for the precise construction of the wooden fin can assembly.",
        "Drilling mounting points and installing hardware to secure the recovery system and ensure structural integrity for launch.",
      ],
      skills: ["SolidWorks", "Computational Fluid Dynamics (CFD)", "MATLAB", "3D Printing"],
    },
    aiaa: {
      name: "AIAA",
      role: "Design-Build-Fly Team",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
      achievements: [
        "Designed and fabricated custom aircraft components for competition",
        "Conducted aerodynamic analysis and performance testing",
        "Collaborated with team members on structural optimization",
      ],
      skills: ["Aerodynamics", "Structural Analysis", "Composite Materials", "Wind Tunnel Testing", "Flight Testing"],
    },
    "chs-aerospace": {
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
      achievements: [
        "Co-founded and grew the school's first aerospace club to over 115 members, establishing it as the largest student organization in the school's history (est. 1965).",
        "Led the astronomy sub-department, coordinating monthly meetings and developing educational presentations.",
        "Co-developed and managed a centralized Excel spreadsheet to track member enrollment, event logistics, and communications.",
        "Designed and modeled a detailed rocket prototype, including the payload fairing, second stage, interstage, first stage booster body, grid fins, and engine cluster. in SolidWorks, inspired by Falcon 9, to showcase to students.",
      ],
      skills: ["SolidWorks", "Leadership", "Excel", "Teamwork", "Project Management", "Program Development", "Recruitment/Member Outreach"],
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12">
          <Button
            onClick={() => navigate("/", { state: { section: "clubs" } })}
            variant="ghost"
            className="mb-8 gap-2 hover:bg-secondary relative z-10"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Portfolio
          </Button>

          <div className="relative h-96 bg-cover bg-center mb-12 rounded-xl overflow-hidden">
            <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <h1 className="text-5xl font-bold text-foreground mb-2">{club.name}</h1>
              <p className="text-2xl text-white font-semibold my-[4px] py-[4px]">{club.role}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-4">
                My Role & Achievements
              </h2>
              <ul className="space-y-4">
                {club.achievements.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 mt-1 text-white">▸</span>
                    <span className="text-lg text-white">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-4">
                Skills Developed
              </h2>
              <div className="flex flex-wrap gap-3">
                {club.skills.map((skill: string, index: number) => (
                  <span key={index} className="px-4 py-2 bg-card text-card-foreground rounded-lg text-lg font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClubDetail;
