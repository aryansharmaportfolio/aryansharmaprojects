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
  const isSnapping = useRef(false);

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
        const snapLine = 96; // Corresponds to scroll-padding-top (6rem)
        
        let closestSection: HTMLElement | null = null;
        let smallestDistance = Infinity;

        sections.forEach(section => {
          const rect = section.getBoundingClientRect();

          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const distance = Math.abs(rect.top - snapLine);
            if (distance < smallestDistance) {
              smallestDistance = distance;
              closestSection = section;
            }
          }
        });

        if (closestSection && smallestDistance > 5 && smallestDistance < window.innerHeight / 3) {
          isSnapping.current = true;
          closestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
