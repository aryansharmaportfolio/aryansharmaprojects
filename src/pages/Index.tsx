import { useEffect, useRef, useState } from "react";
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
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isSnapping = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    if (location.state?.section) {
      requestAnimationFrame(() => {
        const element = document.getElementById(location.state.section);
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
          navigate(location.pathname, { replace: true, state: {} });
        }
      });
    }
  }, [location, navigate]);

  useEffect(() => {
    const handleSmartScroll = () => {
      if (isSnapping.current || location.state?.section) return;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
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
          setTimeout(() => { isSnapping.current = false; }, 1000);
        }
      }, 150);
    };
    window.addEventListener('scroll', handleSmartScroll);
    return () => window.removeEventListener('scroll', handleSmartScroll);
  }, [location.state]);

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
    <div className="min-h-screen">
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
    </div>
  );
};

export default Index;
