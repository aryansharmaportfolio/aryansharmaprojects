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

  // --- Scroll Logic ---
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
    <div 
      className="min-h-screen transition-opacity duration-700 ease-in-out bg-[#0a0a0a] text-white overflow-x-hidden" 
      style={{ opacity: pageOpacity }}
    >
      <Header activeSection={activeSection} />
      
      {/* 1. FIXED HERO BACKGROUND */}
      <Hero />

      {/* 2. DYNAMIC CONTENT LAYER (z-10) 
          This entire block slides OVER the fixed hero video.
      */}
      <div className="relative z-10 w-full flex flex-col">
        
        {/* A. THE TRANSITION ZONE (100vh tall)
            - This creates the "Dynamic Fade" effect.
            - It starts transparent at the top and becomes solid #0a0a0a at the bottom.
            - We place 'AboutMe' INSIDE this zone so it appears *during* the fade.
            - -mt-[100vh] pulls this entire block up to overlap the end of the Hero spacer.
        */}
        <div className="-mt-[100vh] w-full min-h-[100vh] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent flex flex-col justify-end">
            
            {/* This padding ensures the content doesn't sit at the very top (transparent part).
              It pushes AboutMe to the 'darker' part of the gradient. 
            */}
            <div className="w-full pb-10 pt-40 px-4 md:px-8">
              <AnimatedSection>
                <AboutMe />
              </AnimatedSection>
            </div>

        </div>

        {/* B. SOLID CONTENT BACKGROUND (#0a0a0a) 
            The gradient seamlessly flows into this solid block.
            All subsequent sections live here.
        */}
        <div className="bg-[#0a0a0a] w-full pb-20">
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
