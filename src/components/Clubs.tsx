import ClubCard from "./ClubCard";

const Clubs = () => {
  const clubs = [
    {
      id: "aeromavs",
      name: "Aero Mavs",
      role: "Project Lead",
      logo: "https://images.unsplash.com/photo-1581822261290-991b38693d1b?auto=format&fit=crop&w=300",
    },
    {
      id: "aiaa",
      name: "AIAA",
      role: "Design-Build-Fly Team",
      logo: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=300",
    },
    {
      id: "chs-aerospace",
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      logo: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=300",
    },
  ];

  return (
    <section id="clubs" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold text-foreground mb-4 border-b-4 border-primary inline-block pb-2">
            Clubs & Organizations
          </h2>
          <p className="text-xl text-muted-foreground mt-6 italic">
            Actively contributing to aerospace and engineering communities through collaboration and hands-on projects.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
          {clubs.map((club) => (
            <ClubCard key={club.id} {...club} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clubs;
