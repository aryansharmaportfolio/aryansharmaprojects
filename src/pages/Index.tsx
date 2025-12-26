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

  // --- Scroll & Navigation Logic (Same as before) ---
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
    // FORCE CONSISTENT BACKGROUND COLOR: bg-[#0a0a0a]
    <div 
      className="min-h-screen transition-opacity duration-700 ease-in-out bg-[#0a0a0a]" 
      style={{ opacity: pageOpacity }}
    >
      <Header activeSection={activeSection} />
      
      {/* 1. HERO SECTION (Fixed Background) */}
      <Hero />

      {/* 2. CONTENT SECTIONS 
          We use z-10 to ensure this sits logically 'after' the hero interaction.
          The background must match the Hero's mask overlay exactly.
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
