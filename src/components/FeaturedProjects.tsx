import ProjectCard from "./ProjectCard";
import TypewriterHeader from "./TypewriterHeader";

// TEMPORARILY COMMENTED OUT LOCAL IMPORTS
// import falconThumbnail from "@/assets/Falcon Model Thumbnail.png";
// import zoomerThumbnail from "@/assets/Zoomer Thumbnail.jpg";

const FeaturedProjects = () => {
  const projects = [
    {
      id: "falcon-9-model",
      title: "Falcon 9-Inspired 3D Model",
      description: "Created a multi-part 3D model of a rocket inspired by Falcon 9 using SolidWorks.",
      // USE ONLINE URL TEMPORARILY
      image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800",
      date: "Mar 2025 - Apr 2025",
      imageFit: "contain" as const 
    }, 
    {
      id: "zoomer-rocket",
      title: 'Tripoli L1/L2 Certified Rocket ("Zoomer")',
      description: "Built a rocket from scratch that achieved both an L1 and L2 certification from Tripoli.",
      // USE ONLINE URL TEMPORARILY
      image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800",
      date: "Sep 2025 - Nov 2025",
      imageFit: "cover" as const
    }
  ];

  return (
    <section id="projects" className="py-24 px-6 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <TypewriterHeader text="Featured Projects" className="mb-6" />
          <p className="text-xl italic text-white">
            A showcase of hands-on projects. Click on a project to view a detailed overview of the design process and its outcome.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          {projects.map(project => <ProjectCard key={project.id} {...project} />)}
        </div>
      </div>
    </section>
  );
};
export default FeaturedProjects;
