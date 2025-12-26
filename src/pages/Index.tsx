import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');
  
  // Initialize opacity: 0 if we have a target section (to hide the jump), 1 otherwise
  const [pageOpacity, setPageOpacity] = useState(location.state?.section ? 0 : 1);

  // Handle Hash/State Navigation (Preserved from your original code)
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

  // Logic to update the active section in the header based on scroll position
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
      className="min-h-screen transition-opacity duration-700 ease-in-out bg-black" 
      style={{ opacity: pageOpacity }}
    >
      <Header activeSection={activeSection} />
      
      {/* 1. THE HERO SECTION
        Contains the Fixed Canvas (z-0) and the Scroll Spacer.
        It sits at the "bottom" of the stack visually.
      */}
      <Hero />

      {/* 2. THE CONTENT CURTAIN (z-10)
        This wrapper contains all the other sections.
        Crucially, it has a background color (darkish grey) and a higher z-index.
        As you scroll past the Hero's spacer, this div slides UP over the fixed Hero canvas.
      */}
      <div className="relative z-10 bg-[#0a0a0a]">
        <AnimatedSection>
          <AboutMe />
        </AnimatedSection>
        
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
  );
};

export default Index;
