import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const clubData: Record<string, any> = {
    aeromavs: {
      name: "AeroMavs",
      role: "Project Lead",
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=400",
      description: "UTA's premier rocketry organization focused on high-powered rocket design and competition.",
      responsibilities: [
        "Lead project planning and execution for rocket builds",
        "Coordinate team of 15+ members across multiple subsystems",
        "Manage budget and procurement of materials",
        "Ensure compliance with NAR safety regulations",
        "Organize launch events and competitions",
      ],
      achievements: [
        "Successfully launched 3 high-powered rockets",
        "Achieved Level 2 certification flights",
        "Won Best Design Award at regional competition",
        "Grew team membership by 40%",
      ],
    },
    aiaa: {
      name: "AIAA",
      role: "Design-Build-Fly Team",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=400",
      description: "American Institute of Aeronautics and Astronautics student chapter competing in the Design-Build-Fly competition.",
      responsibilities: [
        "Design and analyze aircraft structures",
        "Perform aerodynamic calculations and CFD analysis",
        "Prototype and test aircraft components",
        "Collaborate with electrical and propulsion teams",
        "Document design process and results",
      ],
      achievements: [
        "Designed competition aircraft meeting all requirements",
        "Achieved successful flight demonstrations",
        "Optimized wing design for maximum efficiency",
        "Contributed to team's top 20 national placement",
      ],
    },
    "chs-aerospace": {
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=400",
      description: "Founded the first aerospace-focused club at Coppell High School to inspire the next generation of aerospace engineers.",
      responsibilities: [
        "Co-founded and established club structure",
        "Recruited and mentored 115+ student members",
        "Organized weekly meetings and workshops",
        "Coordinated field trips to aerospace facilities",
        "Managed club budget and fundraising initiatives",
      ],
      achievements: [
        "Grew club from 0 to 115+ members in two years",
        "Hosted guest speakers from NASA and aerospace industry",
        "Organized successful model rocket competition",
        "Established partnerships with local aerospace companies",
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
    <div className="min-h-screen bg-background animate-slide-up">
      <div className="container mx-auto px-6 py-12">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-8 gap-2 hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Portfolio
        </Button>

        <div className="space-y-12">
          <div className="flex items-center gap-8">
            <div className="w-40 h-40 bg-card rounded-xl flex items-center justify-center p-4 shadow-xl">
              <img
                src={club.logo}
                alt={club.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-foreground">{club.name}</h1>
              <p className="text-2xl text-primary font-semibold">{club.role}</p>
            </div>
          </div>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {club.description}
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-b-2 border-primary pb-2">
                Responsibilities
              </h2>
              <ul className="space-y-3">
                {club.responsibilities.map((responsibility: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-lg text-muted-foreground"
                  >
                    <span className="text-primary mt-1">▸</span>
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-b-2 border-primary pb-2">
                Key Achievements
              </h2>
              <ul className="space-y-3">
                {club.achievements.map((achievement: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-lg text-muted-foreground"
                  >
                    <span className="text-primary mt-1">▸</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
