import WorkCard from "./WorkCard";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";

const CurrentWork = () => {
  const topRowWork = [
    {
      id: "work-1",
      title: "UTA AeroMavs IREC (2026)",
      role: "Manufacturing",
      image: "/irec-thumbnail.jpg",
      description: "Why settle for the speed limit when you can ignore gravity entirely? The AeroMavs '26 is a fiberglass fever dream born from late-night layups, precision drilling, and a healthy disregard for the sound barrier. Meticulously crafted for that one glorious moment of vertical chaos.",
    },
    {
      id: "work-2",
      title: "UTA Design-Build-Fly (2026)",
      role: "Structures/Manufacturing",
      image: "/dbf-thumbnail.jpg",
      description: "Most people see a skeleton of ribs and spars; we see a bird of prey waiting for its wings. Through 3D modeling and stress analysis, we are engineering an airframe that's as light as a feather yet as tough as a rock. With enough time and proper engineering, any pile of materials can be convinced it belongs in the clouds.",
    },
  ];

  const bottomWork = {
    id: "work-3",
    title: "UTARI Composite Research",
    role: "Undergraduate Research Assistant",
    image: "/utari-thumbnail.jpg",
    description: "Working under the mentorship of Dr. Lin and a PhD candidate, focusing on impact drop tower systematically crushing composite materials to ensure the next generation of aerospace materials is nothing short of indestructible.",
  };

  return (
    <section id="current-work" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-black/0">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <MaskedTextReveal>
            <TypewriterHeader text="Current & Ongoing Work" className="mb-4 sm:mb-6" />
          </MaskedTextReveal>
          <MaskedTextReveal delay={0.15}>
            <p className="text-base sm:text-lg md:text-xl italic text-white px-4">
              Continuously developing my technical abilities and practical knowledge by seeking hands-on experiences.
            </p>
          </MaskedTextReveal>
        </div>

        {/* Top row - two cards side by side with stagger */}
        <StaggerContainer className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {topRowWork.map((work) => (
            <StaggerItem key={work.id}>
              <WorkCard {...work} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom row - full width card */}
        <StaggerContainer className="mt-6 sm:mt-8">
          <StaggerItem>
            <WorkCard {...bottomWork} />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};
export default CurrentWork;
