import ProjectCard from "./ProjectCard";

const FeaturedProjects = () => {
  const projects = [
    {
      id: "project-1",
      title: "Rocket Propulsion System",
      description: "Design and testing of high-powered rocket engines",
      image: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
    },
    {
      id: "project-2",
      title: "UAV Flight Dynamics",
      description: "Analysis of unmanned aerial vehicle control systems",
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
    },
    {
      id: "project-3",
      title: "Aerodynamic Optimization",
      description: "CFD simulation and wind tunnel testing",
      image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800",
    },
  ];

  return (
    <section id="projects" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold text-foreground mb-4 border-b-4 border-primary inline-block pb-2">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground mt-6 italic">
            A showcase of hands-on projects. Click on a project to view a detailed overview of the design process and its outcome.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
