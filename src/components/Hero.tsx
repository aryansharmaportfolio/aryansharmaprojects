import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBackground})`,
          filter: "brightness(0.7)",
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

      <div className="relative z-10 text-center animate-fade-in">
        <h1 className="text-7xl md:text-8xl font-extrabold text-foreground tracking-tight">
          Project Portfolio
        </h1>
      </div>
    </section>
  );
};

export default Hero;
