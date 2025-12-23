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
        {/* Section header with 3D depth effect */}
        <div className="mb-16 sm:mb-20 perspective-1000">
          <div 
            className="text-center py-8 relative transform-gpu hover:scale-[1.02] transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-b from-background/80 via-background/60 to-transparent rounded-3xl border border-primary/10 shadow-2xl shadow-primary/5" />
            <div className="relative z-10">
              <TypewriterHeader text="Personal Projects" className="mb-2 sm:mb-4" />
              <p className="text-base sm:text-lg md:text-xl italic text-foreground/80 px-4 max-w-3xl mx-auto">
                A showcase of hands-on projects. Click on a project to view a detailed overview of the design process and its outcome.
              </p>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/10 blur-2xl rounded-full" />
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
