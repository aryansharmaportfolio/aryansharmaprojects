import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const handleSmartScroll = () => {
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

        if (closestSection && smallestDistance < window.innerHeight / 2.5) {
          closestSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
