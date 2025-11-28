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
        {/* Hero image - respects sidebar on left */}
        <div className="relative h-[600px] overflow-hidden ml-16">
          
          {/* --- CONDITIONAL RENDERING LOGIC --- */}
          {id === "falcon-9-model" ? (
            <div className="absolute inset-0 z-10">
              <FalconViewer />
            </div>
          ) : (
            <>
              <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-12">
                <h1 className="text-5xl font-bold text-foreground mb-2">{project.name}</h1>
                <p className="text-2xl text-white font-semibold my-[4px] py-[4px]">{project.description}</p>
              </div>
            </>
          )}
          {/* ----------------------------------- */}

        </div>

        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Summary */}
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-xl">
              {/* Decorative corner */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/30 rounded-tl-2xl" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Summary</h2>
              </div>
              
              <div className="space-y-4">
                {project.summary.map((item: string, index: number) => (
                  <div 
                    key={index} 
                    className="group flex gap-3 p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-foreground/90 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Technologies & Skills */}
            <div className="space-y-6">
              {/* Technologies Section */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/30 rounded-tr-2xl" />
                
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Technologies Used</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-gradient-to-br from-card to-background text-foreground rounded-xl text-sm font-medium border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/30 rounded-br-2xl" />
                
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Skills Developed</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300"
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