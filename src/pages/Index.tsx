// src/pages/Index.tsx

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// CHANGE THIS IMPORT:
import TelemetryHeader from "@/components/TelemetryHeader"; 
import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import FeaturedProjects from "@/components/FeaturedProjects";
import CurrentWork from "@/components/CurrentWork";
import Clubs from "@/components/Clubs";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

const Index = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');
  const [pageOpacity, setPageOpacity] = useState(location.state?.section ? 0 : 1);

  // ... (Keep your Scroll Logic useEffects exactly the same) ...
  useEffect(() => {
    if (location.state?.section) {
      const sectionId = location.state.section;
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const originalScrollBehavior = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = 'auto';
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setPageOpacity(1);
              setTimeout(() => {
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
              }, 500);
            });
          });
        } else { setPageOpacity(1); }
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const handleScrollHighlight = () => {
      const sections = document.querySelectorAll('section');
      let currentSectionId = '';
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          currentSectionId = section.id;
          break;
        }
      }
      if (activeSection !== currentSectionId) setActiveSection(currentSectionId);
    };
    window.addEventListener('scroll', handleScrollHighlight);
    handleScrollHighlight(); 
    return () => window.removeEventListener('scroll', handleScrollHighlight);
  }, [activeSection]);

  return (
    <div 
      className="min-h-screen transition-opacity duration-700 ease-in-out bg-background text-foreground overflow-x-hidden" 
      style={{ opacity: pageOpacity }}
    >
      {/* NEW HEADER */}
      <TelemetryHeader activeSection={activeSection} />
      
      <Hero />

      <div className="relative z-10 w-full flex flex-col">
        <div className="-mt-[100vh] w-full min-h-[100vh] flex flex-col justify-end pointer-events-none">
            <div className="w-full pb-10 pt-40 px-4 md:px-8 pointer-events-auto">
              <AnimatedSection>
                <AboutMe />
              </AnimatedSection>
            </div>
        </div>

        <div className="bg-background w-full pb-20">
            <AnimatedSection>
              <FeaturedProjects />
            </AnimatedSection>
            
            <AnimatedSection>
              <CurrentWork />
            </AnimatedSection>
            
            <AnimatedSection>
              <Clubs />
            </AnimatedSection>
            
            <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
