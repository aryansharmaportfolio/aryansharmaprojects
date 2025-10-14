import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import FeaturedProjects from "@/components/FeaturedProjects";
import CurrentWork from "@/components/CurrentWork";
import Clubs from "@/components/Clubs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen animate-fade-in">
      <Header />
      <main>
        <Hero />
        <AboutMe />
        <FeaturedProjects />
        <Clubs />
        <CurrentWork />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
