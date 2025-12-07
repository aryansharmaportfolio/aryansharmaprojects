import WorkCard from "./WorkCard";
import TypewriterHeader from "./TypewriterHeader";

const CurrentWork = () => {
  const topRowWork = [
    {
      id: "work-1",
      title: "UTA AeroMavs IREC (2026)",
      role: "Manufacturing",
      image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800",
    },
    {
      id: "work-2",
      title: "UTA Design-Build-Fly (2026)",
      role: "Structures/Manufacturing",
      image: "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=800",
    },
  ];

  const bottomWork = {
    id: "work-3",
    title: "UTARI Composite Research",
    role: "Undergraduate Research Assistant",
    image: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
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
