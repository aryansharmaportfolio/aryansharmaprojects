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

    if (sectionRef.current) observer.observe(sectionRef.current);
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
    // PURE TRANSPARENT - Background handled by Index.tsx gradient
    // Removed all bg- and backdrop- classes
    <section ref={sectionRef} id="about" className="w-full">
      <div className="container mx-auto max-w-6xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Profile */}
          <motion.div 
            className="flex flex-col items-center space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="relative">
              {/* Bubble */}
              <div 
                onClick={() => setShowBubble(false)}
                className={`absolute -top-20 left-1/2 -translate-x-1/2 z-50 cursor-pointer transition-all duration-500 ease-out
                           ${showBubble ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}
              >
                <div className={`relative bg-white text-black px-5 py-3 rounded-2xl shadow-2xl group hover:scale-105 transition-transform ${isPinging ? 'animate-bounce' : ''}`}>
                  <div className="flex items-center gap-2">
                    <p className="relative text-sm font-bold whitespace-nowrap">{messages[currentMessage]}</p>
                    <X className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45" />
                </div>
              </div>

              {/* Image */}
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-300">
                <img src={profilePicture} alt="Aryan Sharma" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white">Aryan Sharma</h2>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white hover:text-black transition-all" asChild>
                <a href="mailto:aryansharmaus2021@gmail.com">
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              </Button>
              <ResumeViewer />
              <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white hover:text-black transition-all" asChild>
                <a href="https://www.linkedin.com/in/aryan-in-aerospace/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              </Button>
            </div>
            <DegreeProgress />
          </motion.div>

          {/* Right Column - Bio */}
          <div className="space-y-6">
            <MaskedTextReveal>
              <TypewriterHeader text="About Me" />
            </MaskedTextReveal>
            
            <motion.div 
              className="space-y-4 text-lg text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p>
                I'm a student majoring in <span className="font-semibold text-white">Aerospace Engineering</span> at the University of Texas at Arlington...
              </p>
              <p>
                I continue to pursue that same drive for innovation...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutMe;
