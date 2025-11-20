import { useState } from "react";
import { Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import profilePicture from "@/assets/profile-picture.jpg";
import TypewriterHeader from "./TypewriterHeader";
import DegreeProgress from "./DegreeProgress"; // Import the new component

const AboutMe = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  
  const messages = [
    "I love aerospace 🚀", 
    "I hope you like my portfolio 🚀"
  ];

  const handleMouseLeave = () => {
    // Cycle to the next message when the mouse leaves, 
    // so it's ready for the next hover.
    setMessageIndex((prev) => (prev + 1) % messages.length);
  };

  return (
    <section id="about" className="py-24 px-6 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Profile */}
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            
            {/* Wrapper for Image and Speech Bubble */}
            <div 
              className="relative group cursor-pointer" 
              onMouseLeave={handleMouseLeave}
            >
              {/* Speech Bubble */}
              <div className="absolute -top-20 -right-10 z-50 pointer-events-none select-none">
                <div className="relative bg-white text-background px-5 py-3 rounded-2xl shadow-2xl 
                              transform scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 
                              transition-all duration-300 ease-out origin-bottom-left">
                  <p className="text-sm font-bold whitespace-nowrap text-black">
                    {messages[messageIndex]}
                  </p>
                  {/* Little triangle tail for the bubble */}
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white transform rotate-45"></div>
                </div>
              </div>

              {/* Profile Image */}
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-primary shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-105">
                <img src={profilePicture} alt="Aryan Sharma" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground">Aryan Sharma</h2>
            
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" asChild>
                <a href="mailto:aryansharmaus2021@gmail.com">
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              </Button>
              
              <Button variant="outline" className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" asChild>
                <a href="https://www.linkedin.com/in/aryan-in-aerospace/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>

          {/* Right Column - Bio */}
          <div className="space-y-6 animate-fade-in">
            <TypewriterHeader text="About Me" />
            
            {/* Inserted Progress Bar Here */}
            <div className="py-2">
              <DegreeProgress />
            </div>
            
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p className="text-white my-0">
                I'm a student majoring in <span className="font-semibold text-foreground">Aerospace Engineering</span> at the University of Texas at Arlington, passionate about turning complex theories into a tangible reality. My path is rooted in hands-on application, from analyzing flight dynamics on the Design-Build-Fly team to constructing high-powered rockets with UTA's AeroMavs. My dedication to aerospace took flight when I co-founded my high school's first aerospace club, growing it to over 115 members.
              </p>
              
              <p className="text-white">
                I continue to pursue that same drive for innovation and leadership, blending my technical skills with a commitment to teamwork and pushing the limits of what we can achieve in the sky.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutMe;
