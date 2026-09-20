import WorkCard from "./WorkCard";
import TypewriterHeader from "./TypewriterHeader";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import StaggerContainer, { StaggerItem } from "./motion/StaggerContainer";

const CurrentWork = () => {
  const workItems = [
    {
      id: "work-safran",
      title: "Safran Electronics & Defense, Avionics",
      role: "Mechanical Engineer Intern",
      image: "/safran-thumbnail.jpg",
      description: "Contributing to the design and development of avionics enclosures and mechanical systems for defense-grade aerospace electronics, gaining hands-on experience with industry-standard CAD tools and manufacturing processes.",
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
