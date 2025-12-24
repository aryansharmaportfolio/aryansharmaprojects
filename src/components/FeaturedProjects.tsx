import ProjectCard from "./ProjectCard";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import MagneticTilt from "./motion/MagneticTilt";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";

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
    <section id="projects" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <MaskedTextReveal>
            <TypewriterHeader text="Personal Projects" className="mb-4 sm:mb-6" />
          </MaskedTextReveal>
          <p className="text-base sm:text-lg md:text-xl italic text-white px-4">
            A showcase of hands-on projects. Click on a project to view a detailed overview of the design process and its outcome.
          </p>
        </div>

        <StaggerContainer className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {projects.map(project => (
            <StaggerItem key={project.id}>
              <MagneticTilt intensity={5}>
                <ProjectCard {...project} />
              </MagneticTilt>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
export default FeaturedProjects;
