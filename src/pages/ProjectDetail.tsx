import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const projectData: Record<string, any> = {
    "project-1": {
      title: "Rocket Propulsion System",
      image: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=1200",
      skills: [
        "Solid Propellant Chemistry",
        "Combustion Analysis",
        "Thrust Vector Control",
        "Safety Protocols",
        "CAD Design (SolidWorks)",
      ],
      achievements: [
        "Successfully designed and tested a high-powered rocket motor achieving 500N thrust",
        "Optimized fuel mixture for 15% efficiency improvement",
        "Led a team of 8 engineers through full development cycle",
        "Presented findings at regional aerospace conference",
      ],
    },
    "project-2": {
      title: "UAV Flight Dynamics",
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200",
      skills: [
        "Flight Control Systems",
        "MATLAB/Simulink",
        "PID Controller Design",
        "Sensor Integration",
        "Autonomous Navigation",
      ],
      achievements: [
        "Developed stable autonomous flight controller for fixed-wing UAV",
        "Reduced oscillation by 40% through advanced PID tuning",
        "Integrated GPS and IMU for precise navigation",
        "Completed 50+ successful test flights",
      ],
    },
    "project-3": {
      title: "Aerodynamic Optimization",
      image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=1200",
      skills: [
        "Computational Fluid Dynamics",
        "ANSYS Fluent",
        "Wind Tunnel Testing",
        "Data Analysis",
        "Optimization Algorithms",
      ],
      achievements: [
        "Reduced drag coefficient by 22% through iterative design",
        "Validated CFD results with wind tunnel experiments",
        "Generated comprehensive technical report",
        "Applied findings to Design-Build-Fly competition aircraft",
      ],
    },
  };

  const project = projectData[id || ""];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-slide-up">
      <div className="container mx-auto px-6 py-12">
        <Button
          onClick={() => navigate("/#projects")}
          variant="ghost"
          className="mb-8 gap-2 hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Portfolio
        </Button>

        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-foreground">{project.title}</h1>
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <img
                src={project.image}
                alt={project.title}
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
                {project.skills.map((skill: string, index: number) => (
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
                {project.achievements.map((achievement: string, index: number) => (
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

export default ProjectDetail;
