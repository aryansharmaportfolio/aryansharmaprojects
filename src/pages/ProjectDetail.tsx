import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DynamicSidebar from "@/components/DynamicSidebar";

const ProjectDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const returnSection = location.state?.from || 'featured-projects';

  const projectData: Record<string, any> = {
    "sentinel-vision": {
      name: "Sentinel Vision",
      description: "AI-powered aerial surveillance for wildfire detection.",
      logo: "https://images.unsplash.com/photo-1562300554-4896011316b1?auto=format&fit=crop&w=800",
      achievements: [
        "Developed a deep learning model to analyze aerial imagery in real-time.",
        "Integrated GPS data to pinpoint wildfire locations with high accuracy.",
        "Designed a cloud-based alert system for emergency responders."
      ],
      skills: ["Python", "TensorFlow", "Computer Vision", "AWS", "GIS"]
    },
    "orbital-mechanics-simulator": {
      name: "Orbital Mechanics Simulator",
      description: "A web-based tool for simulating satellite orbits.",
      logo: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800",
      achievements: [
        "Implemented n-body physics simulations using JavaScript.",
        "Created an interactive 3D visualization with Three.js.",
        "Allowed users to define custom orbital parameters and celestial bodies."
      ],
      skills: ["JavaScript", "Three.js", "Physics Engine", "React", "HTML Canvas"]
    },
  };

  const project = projectData[id || ""];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Project not found. Note: Preview may not show dynamic content.</p>
      </div>
    );
  }

  return (
    <>
      <DynamicSidebar returnSection={returnSection} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12">
          <Button 
            onClick={() => navigate("/", { state: { section: returnSection } })} 
            variant="ghost" 
            className="mb-8 gap-2 hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Portfolio
          </Button>

          <div className="relative h-96 bg-cover bg-center mb-12 rounded-xl overflow-hidden">
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

const ProjectDetail = () => {
    return (
        <Router>
            <Routes>
                <Route path="/project/:id" element={<ProjectDetailContent />} />
                <Route path="*" element={<ProjectDetailContent />} />
            </Routes>
        </Router>
    );
};

export default ProjectDetail;
