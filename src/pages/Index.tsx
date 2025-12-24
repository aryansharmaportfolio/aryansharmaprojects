import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import AboutMe from "@/components/AboutMe";
import FeaturedProjects from "@/components/FeaturedProjects";
import CurrentWork from "@/components/CurrentWork";
import Clubs from "@/components/Clubs";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { CinemaBackground } from "@/components/CinemaBackground";

const Index = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');
  const [pageOpacity, setPageOpacity] = useState(location.state?.section ? 0 : 1);

  // 1. Handle Navigation Jumps
  useEffect(() => {
    if (location.state?.section) {
      const sectionId = location.state.section;
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
          setPageOpacity(1);
        } else {
          setPageOpacity(1);
        }
      }, 100);
    }
  }, [location]);

  // 2. Handle Active Section Highlighting
  useEffect(() => {
    const handleScrollHighlight = () => {
      const sections = document.querySelectorAll('section');
      let currentSectionId = 'home';
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          currentSectionId = section.id;
          break;
        }
      }
      if (activeSection !== currentSectionId) {
        setActiveSection(currentSectionId);
      }
    };
    window.addEventListener('scroll', handleScrollHighlight);
    return () => window.removeEventListener('scroll', handleScrollHighlight);
  }, [activeSection]);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/30">
      
      {/* --- THE ENGINE: Fixed Video Background --- */}
      <CinemaBackground />

      {/* --- THE CONTENT: Floating Layer --- */}
      <div 
        className="relative z-10 transition-opacity duration-700" 
        style={{ opacity: pageOpacity }}
      >
        <Header activeSection={activeSection} />

        {/* HERO TITLE: Inline here to float over the video */}
        <section id="home" className="h-screen flex items-center justify-center">
          <div className="text-center px-4 space-y-6">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mix-blend-overlay opacity-90 drop-shadow-2xl">
              ARYAN
            </h1>
            <div className="h-1 w-24 bg-white/50 mx-auto rounded-full" />
            <p className="text-xl md:text-2xl font-light tracking-[0.5em] uppercase text-white/80">
              Aerospace Engineer
            </p>
          </div>
        </section>

        {/* Spacer to force video playback before About Me */}
        <div className="h-[30vh]" />

        <AnimatedSection>
          <section id="about" className="py-24">
             {/* Note: We wrap components to ensure they float nicely */}
            <div className="container mx-auto">
              <AboutMe />
            </div>
          </section>
        </AnimatedSection>

        {/* Spacer */}
        <div className="h-[30vh]" />

        <AnimatedSection>
          <section id="projects" className="py-24">
            <div className="container mx-auto">
              <FeaturedProjects />
            </div>
          </section>
        </AnimatedSection>

        {/* Spacer */}
        <div className="h-[30vh]" />

        <AnimatedSection>
          <section id="current-work" className="py-24">
            <div className="container mx-auto">
              <CurrentWork />
            </div>
          </section>
        </AnimatedSection>

        {/* Spacer */}
        <div className="h-[30vh]" />

        <AnimatedSection>
          <section id="clubs" className="py-24">
            <div className="container mx-auto">
              <Clubs />
            </div>
          </section>
        </AnimatedSection>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
