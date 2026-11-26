import ExperienceCard from "./ExperienceCard";
import { experiences } from "@/lib/experiences";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";

const Experiences = () => {
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
          <p className="text-sm sm:text-base md:text-lg lg:text-xl italic text-foreground px-2 sm:px-4 max-w-3xl mx-auto">
            A record of research and professional roles. Click on an experience
            to view a detailed overview of the work and its outcome.
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {experiences.map((experience) => (
            <StaggerItem key={experience.id}>
              <ExperienceCard {...experience} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Experiences;
