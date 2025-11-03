import WorkCard from "./WorkCard";

const CurrentWork = () => {
  const currentWork = [
    {
      id: "work-1",
      title: "Research Assistant - Aerodynamics Lab",
      role: "Research Assistant",
      image: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=800",
    },
    {
      id: "work-2",
      title: "Propulsion Systems Intern",
      role: "Engineering Intern",
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800",
    },
  ];

  return (
    <section id="current-work" className="py-24 px-6 bg-black/0">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold text-foreground mb-6 border-b-4 border-primary inline-block pb-2">
            Current & Ongoing Work
          </h2>
          <p className="text-xl italic text-white">
            Continuously developing my technical abilities and practical knowledge by seeking hands-on experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          {currentWork.map((work) => (
            <WorkCard key={work.id} {...work} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default CurrentWork;
