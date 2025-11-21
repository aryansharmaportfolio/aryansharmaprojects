import { useParams, useLocation } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect } from "react";

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const returnSection = location.state?.from || 'projects';

  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, 50); 
    return () => clearTimeout(timer);
  }, []);

  const projectData: Record<string, any> = {
    "falcon-9-model": {
      name: "Falcon 9-Inspired 3D Model",
      description: "Created a multi-part 3D model of a rocket inspired by Falcon 9 using SolidWorks.",
      logo: "/falcon-thumbnail.png", 
      achievements: [
        "Designed a detailed scale model of the Falcon 9 launch vehicle, focusing on accuracy and printability.",
        "Utilized advanced SolidWorks features including lofting and shelling to create complex aerodynamic surfaces.",
        "Engineered the assembly to be modular, allowing for the separation of stages and payload fairing.",
        "Prepared detailed technical drawings and renders to visualize the final assembly."
      ],
      skills: ["SolidWorks", "CAD Modeling", "3D Printing", "Engineering Design", "Prototyping"]
    },
    "zoomer-rocket": {
      name: 'Tripoli L1/L2 Certified Rocket ("Zoomer")',
      description: "Built a rocket from scratch that achieved both an L1 and L2 certification from Tripoli.",
      // UPDATED: Matches your new renamed file
      logo: "/zoomer-thumbnail.jpg",
      achievements: [
        "Constructed a scratch-built high-power rocket designed to withstand significant aerodynamic forces.",
        "Successfully planned and executed a Level 1 certification flight, demonstrating stable flight dynamics.",
        "Upgraded avionics and recovery systems to dual-deployment configuration for Level 2 certification.",
        "Analyzed flight data post-launch to verify altitude predictions and descent rates."
      ],
      skills: ["High-Power Rocketry", "Composite Fabrication", "Avionics", "Risk Assessment", "Flight Safety"]
    },
  };

  const project = projectData[id || ""];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Project not found.</p>
      </div>
    );
  }

  return (
    <>
      <DynamicSidebar returnSection={returnSection} />
      <div 
        className="min-h-screen bg-background transition-opacity duration-700 ease-in-out"
        style={{ opacity }}
      >
        <div className="container mx-auto px-6 py-12">
          <div className="relative h-96 bg-cover bg-center mb-12 rounded-xl overflow-hidden mt-16">
            <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12">
              <h1 className="text-5xl font-bold text-foreground mb-2">{project.name}</h1>
              <p className="text-2xl text-white font-semibold my-[4px] py-[4px]">{project.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-4">
                Key Achievements
              </h2>
              <ul className="space-y-4">
                {project.achievements.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 mt-1 text-white">▸</span>
                    <span className="text-lg text-white">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-4">
                Technologies Used
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.skills.map((skill: string, index: number) => (
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

export default ProjectDetail;
