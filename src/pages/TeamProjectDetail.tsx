import { useParams, useLocation } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect } from "react";

const TeamProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const returnSection = location.state?.from || "team-projects";

  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  // Project data
  const projectData: Record<string, {
    name: string;
    description: string;
    heroImage: string;
  }> = {
    "uta-dbf-2026": {
      name: "UTA Design-Build-Fly (2026)",
      description: "Developed a manufacturing proposal suggesting a design of a separate propulsion battery compartment for rapid battery integration to meet both flight safety and mission speed requirements.",
      heroImage: "/dbf-thumbnail.jpg",
    },
  };

  const project = projectData[id || ""];

  if (!project) {
    return (
      <>
        <DynamicSidebar returnSection={returnSection} />
        <div className="min-h-screen bg-background flex items-center justify-center ml-10 sm:ml-12 md:ml-14 lg:ml-16">
          <p className="text-xl text-muted-foreground">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <DynamicSidebar returnSection={returnSection} />
      <div 
        className="min-h-screen bg-background transition-opacity duration-700 ease-in-out" 
        style={{ opacity }}
      >
        {/* Hero Image */}
        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden ml-10 sm:ml-12 md:ml-14 lg:ml-16">
          <img
            src={project.heroImage}
            alt={project.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Project Info */}
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-6xl ml-10 sm:ml-12 md:ml-14 lg:ml-16 -mt-24 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
            {project.name}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl">
            {project.description}
          </p>

          {/* Content placeholder - more content to be added later */}
          <div className="py-12">
            {/* Future content will go here */}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamProjectDetail;
