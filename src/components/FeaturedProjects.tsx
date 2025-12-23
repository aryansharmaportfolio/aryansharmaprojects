import ProjectCard from "./ProjectCard";
import TypewriterHeader from "./TypewriterHeader";

const FeaturedProjects = () => {
  const projects = [
    {
      id: "falcon-9-model",
      title: "Falcon 9-Inspired 3D Model",
      description: "Created a multi-part 3D model of a rocket inspired by Falcon 9 using SolidWorks.",
      image: "/falcon-thumbnail.jpg", 
      date: "Mar 2025 - Apr 2025",
      imageFit: "cover" as const 
    }, 
    {
      id: "zoomer-rocket",
      title: 'Tripoli L1/L2 Certified Rocket ("Zoomer")',
      description: "Built a rocket from scratch that achieved both an L1 and L2 certification from Tripoli.",
      image: "/zoomer-thumbnail.jpg",
      date: "Sep 2025 - Nov 2025",
      imageFit: "cover" as const
    }
  ];

  return (
    <section id="projects" className="py-24 sm:py-32 md:py-40 px-4 sm:px-6 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--primary)/0.03)_0%,_transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Sticky section header */}
        <div className="sticky top-20 z-30 mb-12 sm:mb-16">
          <div className="text-center backdrop-blur-md bg-background/60 py-6 rounded-2xl border border-border/20">
            <TypewriterHeader text="Personal Projects" className="mb-2 sm:mb-4" />
            <p className="text-base sm:text-lg md:text-xl italic text-white/90 px-4 max-w-3xl mx-auto">
              A showcase of hands-on projects. Click on a project to view a detailed overview of the design process and its outcome.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
          {projects.map(project => <ProjectCard key={project.id} {...project} />)}
        </div>
      </div>
    </section>
  );
};
export default FeaturedProjects;
