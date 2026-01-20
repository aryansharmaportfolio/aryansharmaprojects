import { useNavigate } from "react-router-dom";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";
import { Card } from "./ui/card";

const TeamProjects = () => {
  const navigate = useNavigate();

  const projects = [
    {
      id: "uta-dbf-2026",
      title: "UTA Design-Build-Fly (2026)",
      description: "Developed a manufacturing proposal suggesting a design of a separate propulsion battery compartment for rapid battery integration to meet both flight safety and mission speed requirements.",
      image: "/dbf-thumbnail.jpg",
      date: "OCT 2025 - JAN 2026",
    },
  ];

  const handleCardClick = (projectId: string) => {
    navigate(`/team-project/${projectId}`, { state: { from: "team-projects" } });
  };

  return (
    <section id="team-projects" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-black/0">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-6 sm:mb-10 md:mb-16">
          <MaskedTextReveal>
            <TypewriterHeader 
              text="Team Projects" 
              className="mb-3 sm:mb-4 md:mb-6 !text-xl sm:!text-2xl md:!text-3xl lg:!text-4xl" 
            />
          </MaskedTextReveal>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl italic text-white px-2 sm:px-4 max-w-3xl mx-auto leading-relaxed">
            A showcase of team-based projects. Click on a project to view a detailed overview of the design process and its outcome.
          </p>
        </div>

        <StaggerContainer className="grid gap-6 sm:gap-8">
          {projects.map((project) => (
            <StaggerItem key={project.id}>
              <Card
                className="relative overflow-hidden cursor-pointer group bg-card/80 backdrop-blur border-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-2xl"
                onClick={() => handleCardClick(project.id)}
              >
                {/* Glass morphic date badge - on top of card */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/20">
                    <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide">{project.date}</span>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                    {project.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl">
                    {project.description}
                  </p>
                </div>

                {/* Hover shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default TeamProjects;
