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
import RatingPopup from "@/components/RatingPopup";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');
  
  // Initialize opacity: 0 if we have a target section (to hide the jump), 1 otherwise
  const [pageOpacity, setPageOpacity] = useState(location.state?.section ? 0 : 1);

  useEffect(() => {
    if (location.state?.section) {
      const sectionId = location.state.section;

      // Small timeout to ensure the DOM elements are fully mounted and height is calculated
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          // 1. Temporarily disable global CSS smooth scrolling to force an instant jump
          const originalScrollBehavior = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = 'auto';

          // 2. Instant jump to section
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
          
          // 3. Trigger fade in animation
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setPageOpacity(1);
              
              // 4. Restore smooth scrolling ONLY (Do not clear state)
              setTimeout(() => {
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
              }, 500);
            });
          });
        } else {
          // Fallback
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
        // If the section is roughly in the middle of the screen
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
    handleScrollHighlight(); // Run once on mount
    return () => window.removeEventListener('scroll', handleScrollHighlight);
  }, [activeSection]);

  return (
    <div 
      className="min-h-screen transition-opacity duration-700 ease-in-out" 
      style={{ opacity: pageOpacity }}
    >
      <Header activeSection={activeSection} />
      <Hero />
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
      
      {/* Added Rating Popup here to float above other content */}
      <RatingPopup />
    </div>
  );
};

export default Index;
