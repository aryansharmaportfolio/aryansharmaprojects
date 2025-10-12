const CurrentWork = () => {
  return <section id="current-work" className="py-24 px-6 bg-black/0">
      <div className="container mx-auto max-w-6xl text-center animate-fade-in">
  {/* The mb-6 class on the title now controls all the spacing */}
  <h2 className="text-5xl font-bold text-foreground mb-6 border-b-4 border-primary inline-block pb-2">
    Current & Ongoing Work
  </h2>
  {/* All margin classes have been removed from the paragraph */}
  <p className="text-xl italic text-white">
    Continuously developing my technical abilities and practical knowledge by seeking hands-on experiences.
  </p>
</div>
      </div>
    </section>;
};
export default CurrentWork;
