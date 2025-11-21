import { useState } from "react";
import { Mail, Linkedin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import profilePicture from "@/assets/profile-picture.jpg";
import TypewriterHeader from "./TypewriterHeader";
import DegreeProgress from "./DegreeProgress";

const AboutMe = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = ["I love aerospace 🚀", "Welcome to my world 🌌", "Let's build something 🛠️"];

  const handleMouseLeave = () => {
    setMessageIndex((prev) => (prev + 1) % messages.length);
  };

  return (
    <section id="about" className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Profile Image (4 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center animate-fade-up">
            <div 
              className="relative group cursor-pointer" 
              onMouseLeave={handleMouseLeave}
            >
              {/* Speech Bubble */}
              <div className="absolute -top-16 -right-12 z-50 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform translate-y-2 group-hover:translate-y-0">
                <div className="glass-panel bg-white/90 text-black px-4 py-2 rounded-xl shadow-2xl text-sm font-bold whitespace-nowrap relative">
                  {messages[messageIndex]}
                  <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white/90 transform rotate-45"></div>
                </div>
              </div>

              {/* Profile Image with Glow Ring */}
              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full p-1 bg-gradient-to-br from-white/20 to-white/0 backdrop-blur-sm">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-black/50 shadow-2xl relative z-10">
                  <img 
                    src={profilePicture} 
                    alt="Aryan Sharma" 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 grayscale hover:grayscale-0" 
                  />
                </div>
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse-slow" />
              </div>
            </div>
            
            <div className="mt-8 w-full max-w-xs">
               <DegreeProgress />
            </div>
          </div>

          {/* Right Column - Bio (8 cols) */}
          <div className="lg:col-span-7 space-y-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="glass-panel p-8 md:p-10 rounded-3xl bg-white/5 border-white/5">
              <TypewriterHeader text="About Me" className="mb-6" />
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed font-light">
                <p>
                  I'm a student majoring in <span className="text-white font-semibold">Aerospace Engineering</span> at the University of Texas at Arlington, passionate about turning complex theories into a tangible reality. 
                </p>
                <p>
                  My path is rooted in hands-on application, from analyzing flight dynamics on the <span className="text-white">Design-Build-Fly team</span> to constructing high-powered rockets with <span className="text-white">UTA's AeroMavs</span>. My dedication to aerospace took flight when I co-founded my high school's first aerospace club, growing it to over 115 members.
                </p>
                <p>
                  I continue to pursue that same drive for innovation and leadership, blending my technical skills with a commitment to teamwork and pushing the limits of what we can achieve in the sky.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/10">
                <Button variant="outline" className="rounded-full px-6 h-12 bg-transparent border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300" asChild>
                  <a href="mailto:aryansharmaus2021@gmail.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Me
                  </a>
                </Button>
                
                <Button variant="outline" className="rounded-full px-6 h-12 bg-transparent border-white/20 text-white hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white transition-all duration-300" asChild>
                  <a href="https://www.linkedin.com/in/aryan-in-aerospace/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>

                <Button variant="default" className="rounded-full px-6 h-12 bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 ml-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutMe;
