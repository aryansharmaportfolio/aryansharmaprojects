import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // ADDED: Import useLocation
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import FeaturedProjects from "@/components/FeaturedProjects";
import CurrentWork from "@/components/CurrentWork";
import Clubs from "@/components/Clubs";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

const Index = () => {
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isSnapping = useRef(false);
  const location = useLocation(); // ADDED: Get location object

  // ADDED: New useEffect to handle scrolling to a section based on navigation state
  useEffect(() => {
    if (location.state?.section) {
      const element = document.getElementById(location.state.section);
      if (element) {
        element.scrollIntoView({ block: 'center' });
        // Clear the state to prevent scrolling on refresh
        window.history.replaceState({}, document.title)
      }
    }
  }, [location.state]);


  useEffect(() => {
    const handleSmartScroll = () => {
      if (isSnapping.current) {
        return;
      }

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        const sections = Array.from(document.querySelectorAll('section'));
        const viewportCenter = window.innerHeight / 2;
        
        let closestSection: HTMLElement | null = null;
        let smallestDistance = Infinity;

        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const sectionCenter = rect.top + rect.height / 2;
          const distance = Math.abs(viewportCenter - sectionCenter);

          if (distance < smallestDistance) {
            smallestDistance = distance;
            closestSection = section;
          }
        });

        if (closestSection && smallestDistance > 5 && smallestDistance < window.innerHeight / 2.5) {
          isSnapping.current = true;
          closestSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

          setTimeout(() => {
            isSnapping.current = false;
          }, 1000);
        }
      }, 150);
    };

    window.addEventListener('scroll', handleSmartScroll);
    return () => window.removeEventListener('scroll', handleSmartScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
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
    </div>
  );
};

export default Index;
