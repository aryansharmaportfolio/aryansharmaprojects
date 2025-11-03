import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/hero-video.mp4";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const videoOpacity = Math.max(0, 1 - scrollY / 600);
  const videoScale = Math.max(0.8, 1 - scrollY / 3000);
  const textOpacity = Math.max(0, 1 - scrollY / 300);

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          opacity: videoOpacity,
          transform: `scale(${videoScale})`,
          filter: "brightness(0.7)",
        }}
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

      <div
        className="relative z-10 text-center"
        style={{ opacity: textOpacity }}
      >
        {/* --- MODIFIED THIS H1 --- */}
        {/* Changed border-r-4 to border-r-8 */}
        <h1 className="text-7xl md:text-8xl font-extrabold text-foreground tracking-tight 
                       animate-typing overflow-hidden whitespace-nowrap border-r-8 border-r-foreground">
          Project Portfolio
        </h1>
        {/* --- END MODIFICATION --- */}
      </div>
    </section>
  );
};

export default Hero;
