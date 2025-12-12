import WorkCard from "./WorkCard";
import TypewriterHeader from "./TypewriterHeader";

const CurrentWork = () => {
  const topRowWork = [
    {
      id: "work-1",
      title: "UTA AeroMavs IREC (2026)",
      role: "Manufacturing",
      // Updated to point to the file in your public folder
      image: "/irec-thumbnail.jpg",
    },
    {
      id: "work-2",
      title: "UTA Design-Build-Fly (2026)",
      role: "Structures/Manufacturing",
      // Updated to point to the file in your public folder
      image: "/dbf-thumbnail.jpg",
    },
  ];

  const bottomWork = {
    id: "work-3",
    title: "UTARI Composite Research",
    role: "Undergraduate Research Assistant",
    // Updated to point to the file in your public folder
    image: "/utari-thumbnail.jpg",
  };

  return (
    <section id="current-work" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-black/0">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
          <TypewriterHeader text="Current & Ongoing Work" className="mb-4 sm:mb-6" />
          <p className="text-base sm:text-lg md:text-xl italic text-white px-4">
            Continuously developing my technical abilities and practical knowledge by seeking hands-on experiences.
          </p>
        </div>

        {/* Top row - two cards side by side */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 animate-fade-in">
          {topRowWork.map((work) => (
            <WorkCard key={work.id} {...work} />
          ))}
        </div>

        {/* Bottom row - full width card */}
        <div className="mt-6 sm:mt-8 animate-fade-in">
          <WorkCard {...bottomWork} />
        </div>
      </div>
    </section>
  );
};
export default CurrentWork;
