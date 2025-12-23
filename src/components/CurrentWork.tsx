import WorkCard from "./WorkCard";
import TypewriterHeader from "./TypewriterHeader";

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
    <section id="current-work" className="py-24 sm:py-32 md:py-40 px-4 sm:px-6 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.03)_0%,_transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Sticky section header */}
        <div className="sticky top-20 z-30 mb-12 sm:mb-16">
          <div className="text-center backdrop-blur-md bg-background/60 py-6 rounded-2xl border border-border/20">
            <TypewriterHeader text="Current & Ongoing Work" className="mb-2 sm:mb-4" />
            <p className="text-base sm:text-lg md:text-xl italic text-white/90 px-4 max-w-3xl mx-auto">
              Continuously developing my technical abilities and practical knowledge by seeking hands-on experiences.
            </p>
          </div>
        </div>

        {/* Top row - two cards side by side */}
        <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
          {topRowWork.map((work) => (
            <WorkCard key={work.id} {...work} />
          ))}
        </div>

        {/* Bottom row - full width card */}
        <div className="mt-8 sm:mt-10">
          <WorkCard {...bottomWork} />
        </div>
      </div>
    </section>
  );
};
export default CurrentWork;
