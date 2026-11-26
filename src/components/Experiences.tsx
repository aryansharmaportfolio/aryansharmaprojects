import ProjectCard from "./ProjectCard";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import MagneticTilt from "./motion/MagneticTilt";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";

interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  imageFit?: "cover" | "contain";
  fullWidth?: boolean;
}

const Experiences = () => {
  const experiences: Experience[] = [
    {
      id: "utari-composite-research",
      title: "UTARI Composite Research",
      description:
        "Undergraduate Research Assistant — Working under the mentorship of Dr. Lin and a PhD candidate, focusing on impact drop tower systematically crushing composite materials to ensure the next generation of aerospace materials is nothing short of indestructible.",
      image: "/utari-thumbnail.jpg",
      date: "Jan 2026 - May 2026",
      imageFit: "cover" as const,
      fullWidth: true,
    },
  ];

  return (
    <section
      id="experiences"
      className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <MaskedTextReveal>
            <TypewriterHeader
              text="Experiences"
              className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl"
            />
          </MaskedTextReveal>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl italic text-white px-2 sm:px-4 max-w-3xl mx-auto">
            A record of research and professional roles. Click on an experience
            to view a detailed overview of the work and its outcome.
          </p>
        </div>

        <StaggerContainer className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {experiences.map(({ fullWidth, ...card }) => (
            <StaggerItem key={card.id} className={fullWidth ? "sm:col-span-2" : ""}>
              <MagneticTilt intensity={5}>
                <ProjectCard {...card} />
              </MagneticTilt>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Experiences;
