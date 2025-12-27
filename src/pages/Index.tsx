import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
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
        } else {
          setPageOpacity(1);
        }
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
      if (activeSection !== currentSectionId) {
        setActiveSection(currentSectionId);
      }
    };
    window.addEventListener('scroll', handleScrollHighlight);
    handleScrollHighlight(); 
    return () => window.removeEventListener('scroll', handleScrollHighlight);
  }, [activeSection]);

  return (
    // Global background set to dark grey via tailwind variable
    <div 
      className="min-h-screen transition-opacity duration-700 ease-in-out bg-background text-foreground overflow-x-hidden" 
      style={{ opacity: pageOpacity }}
    >
      <Header activeSection={activeSection} />
      
      {/* 1. FIXED VIDEO LAYER */}
      <Hero />

      {/* 2. SCROLLING CONTENT LAYER (z-10) */}
      <div className="relative z-10 w-full flex flex-col">
        
        {/* A. PARALLAX GRADIENT ZONE (100vh tall)
            - Uses 'from-background' to match your global dark grey.
        */}
        <div className="-mt-[100vh] w-full min-h-[100vh] bg-gradient-to-t from-background via-background/90 to-transparent flex flex-col justify-end">
            <div className="w-full pb-10 pt-40 px-4 md:px-8">
              <AnimatedSection>
                <AboutMe />
              </AnimatedSection>
            </div>
        </div>

        {/* B. SOLID CONTENT ZONE */}
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
