import ProjectCard from "./ProjectCard";
import TypewriterHeader from "./TypewriterHeader";

// Import your custom images
// Note: It is generally better practice to avoid spaces in filenames (e.g. falcon-model.png), 
// but this will work as long as the filename matches exactly.
import falconThumbnail from "@/assets/Falcon Model Thumbnail.png";
import zoomerThumbnail from "@/assets/Zoomer Thumbnail.jpg";

const FeaturedProjects = () => {
  const projects = [
    {
      id: "falcon-9-model",
      title: "Falcon 9-Inspired 3D Model",
      description: "Created a multi-part 3D model of a rocket inspired by Falcon 9 using SolidWorks.",
      image: falconThumbnail, // Using the imported image variable
      date: "Mar 2025 - Apr 2025"
    }, 
    {
      id: "zoomer-rocket",
      title: 'Tripoli L1/L2 Certified Rocket ("Zoomer")',
      description: "Built a rocket from scratch that achieved both an L1 and L2 certification from Tripoli.",
      image: zoomerThumbnail, // Using the imported image variable
      date: "Sep 2025 - Nov 2025"
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
