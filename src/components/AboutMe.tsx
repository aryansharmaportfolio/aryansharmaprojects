import { useState, useEffect, useRef } from "react";
import { Mail, Linkedin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import profilePicture from "@/assets/profile-picture.jpg";
import TypewriterHeader from "./TypewriterHeader";
import DegreeProgress from "./DegreeProgress";
import ResumeViewer from "./ResumeViewer";
import MaskedTextReveal from "./motion/MaskedTextReveal";
import { motion } from "framer-motion";

const AboutMe = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const messages = [
    "I hope you like my portfolio 🚀",
    "I ❤️ aerospace"
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered) {
            setHasTriggered(true);
            setTimeout(() => {
              setShowBubble(true);
              setIsPinging(true);
              setTimeout(() => setIsPinging(false), 600);
            }, 500);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered]);

  useEffect(() => {
    if (showBubble && currentMessage === 0) {
      const timer = setTimeout(() => {
        setShowBubble(false);
        setTimeout(() => {
          setCurrentMessage(1);
          setShowBubble(true);
          setIsPinging(true);
          setTimeout(() => setIsPinging(false), 600);
          setTimeout(() => setShowBubble(false), 2500);
        }, 400);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [showBubble, currentMessage]);

  return (
    <section ref={sectionRef} id="about" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Column - Profile */}
          <motion.div 
            className="flex flex-col items-center space-y-4 sm:space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            
            {/* Wrapper for Image and Speech Bubble */}
            <div className="relative">
              {/* Speech Bubble */}
              <div 
                onClick={() => setShowBubble(false)}
                className={`absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 z-50 cursor-pointer
                           transition-all duration-500 ease-out
                           ${showBubble 
                             ? 'opacity-100 translate-y-0 scale-100' 
                             : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}
              >
                <div className={`relative bg-white text-background px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl group hover:scale-105 transition-transform
                                ${isPinging ? 'animate-bounce' : ''}`}>
                  {isPinging && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-75" />
                  )}
                  
                  <div className="flex items-center gap-2">
                    <p className="relative text-xs sm:text-sm font-bold whitespace-nowrap text-black">
                      {messages[currentMessage]}
                    </p>
                    <X className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45" />
                </div>
              </div>

              {/* Profile Image */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary shadow-2xl relative z-10 transition-transform duration-300 hover:scale-105">
                <img src={profilePicture} alt="Aryan Sharma" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Aryan Sharma</h2>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" asChild>
                <a href="mailto:aryansharmaus2021@gmail.com">
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              </Button>
              
              <ResumeViewer />

              <Button variant="outline" className="gap-2 border-2 border-foreground text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" asChild>
                <a href="https://www.linkedin.com/in/aryan-in-aerospace/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </Button>
            </div>

            <DegreeProgress />
          </motion.div>

          {/* Right Column - Bio */}
          <div className="space-y-4 sm:space-y-6">
            <MaskedTextReveal>
              <TypewriterHeader text="About Me" />
            </MaskedTextReveal>
            
            <motion.div 
              className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p className="text-white my-0">
                I'm a student majoring in <span className="font-semibold text-foreground">Aerospace Engineering</span> at the University of Texas at Arlington, passionate about turning complex theories into a tangible reality. My path is rooted in hands-on application, from analyzing aircraft structural design on the Design-Build-Fly team to collaborating on the manufacture of the 2026 UTA IREC rocket with AeroMavs. My dedication to aerospace took flight when I co-founded my high school's first aerospace club, growing it to over 115 members.
              </p>
              
              <p className="text-white">
                I continue to pursue that same drive for innovation and leadership, blending my technical skills with a commitment to teamwork and pushing the limits of what we can achieve in the sky.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutMe;
