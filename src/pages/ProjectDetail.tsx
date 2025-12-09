import { useParams, useLocation } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect } from "react";
import FalconViewer from "@/components/FalconViewer";
import { FileText, Wrench, Sparkles, Code } from "lucide-react";

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
      summary: [
        "Designed a detailed scale model of the Falcon 9 launch vehicle, focusing on accuracy and printability.",
        "Utilized advanced SolidWorks features including lofting and shelling to create complex aerodynamic surfaces.",
        "Engineered the assembly to be modular, allowing for the separation of stages and payload fairing.",
        "Prepared detailed technical drawings and renders to visualize the final assembly."
      ],
      technologies: ["SolidWorks", "CAD Modeling", "3D Printing"],
      skills: ["Engineering Design", "Prototyping", "Technical Documentation", "Problem Solving"]
    },
    "zoomer-rocket": {
      name: 'Tripoli L1/L2 Certified Rocket ("Zoomer")',
      description: "Built a rocket from scratch that achieved both an L1 and L2 certification from Tripoli.",
      logo: "/zoomer-thumbnail.png",
      summary: [
        "Constructed a scratch-built high-power rocket designed to withstand significant aerodynamic forces.",
        "Successfully planned and executed a Level 1 certification flight, demonstrating stable flight dynamics.",
        "Upgraded avionics and recovery systems to dual-deployment configuration for Level 2 certification.",
        "Analyzed flight data post-launch to verify altitude predictions and descent rates."
      ],
      technologies: ["High-Power Rocketry", "Composite Fabrication", "Avionics"],
      skills: ["Risk Assessment", "Flight Safety", "Data Analysis", "Project Management"]
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
        {/* Hero image - respects sidebar on left, responsive margin */}
        <div className="relative h-[350px] sm:h-[450px] md:h-[600px] overflow-hidden ml-12 sm:ml-14 md:ml-16">
          
          {/* --- CONDITIONAL RENDERING LOGIC --- */}
          {id === "falcon-9-model" ? (
            <div className="absolute inset-0 z-10">
              <FalconViewer />
            </div>
          ) : (
            <>
              <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-2">{project.name}</h1>
                <p className="text-base sm:text-xl md:text-2xl text-white font-semibold my-1 sm:my-[4px] py-1 sm:py-[4px]">{project.description}</p>
              </div>
            </>
          )}
          {/* ----------------------------------- */}

        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column - Summary */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground border-l-4 border-primary pl-2 sm:pl-3">Summary</h2>
              </div>
              
              <ul className="space-y-3 sm:space-y-4">
                {project.summary.map((item: string, index: number) => (
                  <li 
                    key={index} 
                    className="flex gap-2 sm:gap-3 text-foreground/90 leading-relaxed"
                  >
                    <span className="text-primary mt-1 sm:mt-1.5">▸</span>
                    <span className="text-sm sm:text-base md:text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Technologies & Skills */}
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              {/* Technologies Section */}
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground border-l-4 border-primary pl-2 sm:pl-3">Technologies Used</h2>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                {project.technologies.map((tech: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black rounded-full text-xs sm:text-sm font-medium border border-border hover:border-primary/50 transition-all duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Code className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground border-l-4 border-primary pl-2 sm:pl-3">Skills Used</h2>
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                {project.skills.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black rounded-full text-xs sm:text-sm font-medium border border-border hover:border-primary/50 transition-all duration-300"
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
    </>
  );
};

export default ProjectDetail;