import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const WorkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const workData: Record<string, any> = {
    "work-1": {
      title: "Research Assistant - Aerodynamics Lab",
      role: "Research Assistant",
      image: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=1200",
      skills: [
        "Wind Tunnel Operations",
        "Data Acquisition Systems",
        "MATLAB Analysis",
        "Technical Documentation",
        "Experimental Design",
      ],
      achievements: [
        "Conducting airfoil performance testing in subsonic wind tunnel",
        "Developed automated data processing pipeline reducing analysis time by 60%",
        "Contributing to research paper on boundary layer transition",
        "Mentoring 3 undergraduate students in lab procedures",
      ],
    },
    "work-2": {
      title: "Propulsion Systems Intern",
      role: "Engineering Intern",
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200",
      skills: [
        "Rocket Engine Testing",
        "Thermodynamics Analysis",
        "CAD Modeling",
        "Test Stand Operations",
        "Safety Compliance",
      ],
      achievements: [
        "Assisted in static fire tests of liquid rocket engines",
        "Created 3D models and technical drawings for test fixtures",
        "Implemented safety protocols that reduced incident reports by 40%",
        "Analyzed combustion data to optimize fuel mixture ratios",
      ],
    },
    "work-3": {
      title: "Flight Dynamics Analysis",
      role: "Student Researcher",
      image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=1200",
      skills: [
        "MATLAB/Simulink",
        "Flight Simulation",
        "Control Systems",
        "Technical Writing",
        "Presentation Skills",
      ],
      achievements: [
        "Developing 6-DOF flight simulation model for small aircraft",
        "Validated model against real flight test data with 95% accuracy",
        "Presented findings at departmental research symposium",
        "Created comprehensive user manual for simulation software",
      ],
    },
  };

  const work = workData[id || ""];

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Work experience not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <Button
          onClick={() => navigate("/", { state: { section: "current-work" } })}
          variant="ghost"
          className="mb-8 gap-2 hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Portfolio
        </Button>

        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-foreground">{work.title}</h1>
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <img
                src={work.image}
                alt={work.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-b-2 border-primary pb-2">
                List of Skills
              </h2>
              <ul className="space-y-3">
                {work.skills.map((skill: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-lg text-muted-foreground"
                  >
                    <span className="text-primary mt-1">▸</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-b-2 border-primary pb-2">
                My Role & Achievements
              </h2>
              <ul className="space-y-3">
                {work.achievements.map((achievement: string, index: number) => (
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

export default WorkDetail;
