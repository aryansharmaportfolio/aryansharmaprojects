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
import ScrollyVideoTransition from "@/components/ScrollyVideoTransition";

// Import your video assets here
// Currently reusing heroVideo, but you should import specific transition clips
import heroVideo from "@/assets/hero-video.mp4"; 

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');
  
  // Initialize opacity: 0 if we have a target section (to hide the jump), 1 otherwise
  const [pageOpacity, setPageOpacity] = useState(location.state?.section ? 0 : 1);

  // 1. Handle Scroll Jumps from Navigation
  useEffect(() => {
    if (location.state?.section) {
      const sectionId = location.state.section;

      // Small timeout to ensure the DOM elements are fully mounted
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

  // 2. Handle Active Section Highlighting
  useEffect(() => {
    const handleScrollHighlight = () => {
      // We look for 'section' tags to identify content blocks
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
      className="min-h-screen bg-black transition-opacity duration-700 ease-in-out" 
      style={{ opacity: pageOpacity }}
    >
      <Header activeSection={activeSection} />
      
      {/* --- HERO SECTION --- */}
      <Hero />

      {/* --- TRANSITION 1: JOURNEY --- */}
      <ScrollyVideoTransition 
        src={heroVideo} 
        overlayText="The Journey" 
      />

      {/* --- ABOUT ME SECTION --- */}
      <div className="relative z-10 bg-background shadow-2xl">
        <AnimatedSection>
          <AboutMe />
        </AnimatedSection>
      </div>

      {/* --- TRANSITION 2: BUILDING --- */}
      <ScrollyVideoTransition 
        src={heroVideo} 
        overlayText="Building Dreams" 
      />

      {/* --- PROJECTS SECTION --- */}
      <div className="relative z-10 bg-background shadow-2xl">
        <AnimatedSection>
          <FeaturedProjects />
        </AnimatedSection>
      </div>

      {/* --- TRANSITION 3: WORK --- */}
      <ScrollyVideoTransition 
        src={heroVideo} 
        overlayText="Engineering Reality" 
      />

      {/* --- CURRENT WORK SECTION --- */}
      <div className="relative z-10 bg-background shadow-2xl">
        <AnimatedSection>
          <CurrentWork />
        </AnimatedSection>
      </div>

      {/* --- TRANSITION 4: COMMUNITY --- */}
      <ScrollyVideoTransition 
        src={heroVideo} 
        overlayText="Community Leadership" 
      />

      {/* --- CLUBS SECTION --- */}
      <div className="relative z-10 bg-background shadow-2xl">
        <AnimatedSection>
          <Clubs />
        </AnimatedSection>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
