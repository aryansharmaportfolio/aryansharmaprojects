import WorkCard from "./WorkCard";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";

const CurrentWork = () => {
  const workItems = [
    {
      id: "work-1",
      title: "UTA AeroMavs IREC (2026)",
      role: "Manufacturing",
      image: "/irec-thumbnail.jpg",
      description: "Why settle for the speed limit when you can ignore gravity entirely? The AeroMavs '26 is a fiberglass fever dream born from late-night layups, precision drilling, and a healthy disregard for the sound barrier. Meticulously crafted for that one glorious moment of vertical chaos.",
    },
    {
      id: "work-2",
      title: "UTARI Composite Research",
      role: "Undergraduate Research Assistant",
      image: "/utari-thumbnail.jpg",
      description: "Working under the mentorship of Dr. Lin and a PhD candidate, focusing on impact drop tower systematically crushing composite materials to ensure the next generation of aerospace materials is nothing short of indestructible.",
    },
  ];

  return (
    <section id="current-work" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-black/0">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-6 sm:mb-10 md:mb-16">
          <MaskedTextReveal>
            <TypewriterHeader 
              text="Current & Ongoing Work" 
              className="mb-3 sm:mb-4 md:mb-6 !text-xl sm:!text-2xl md:!text-3xl lg:!text-4xl" 
            />
          </MaskedTextReveal>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl italic text-white px-2 sm:px-4 max-w-3xl mx-auto leading-relaxed">
            Continuously developing my technical abilities and practical knowledge by seeking hands-on experiences.
          </p>
        </div>

        {/* Two cards side by side */}
        <StaggerContainer className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {workItems.map((work) => (
            <StaggerItem key={work.id}>
              <WorkCard {...work} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
export default CurrentWork;
