import { useParams } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect } from "react";
import { Award, Target, Calendar } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const ClubDetail = () => {
  const { id } = useParams();
  
  // Initialize opacity to 0 for the fade-in effect
  const [opacity, setOpacity] = useState(0);

  // Scroll hooks for Parallax Effect
  const { scrollY } = useScroll();
  // Scales from 1 (100%) to 1.1 (110%) as you scroll 500px down
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  // Trigger the transition to opacity 1 after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const clubData: Record<string, any> = {
    aeromavs: {
      name: "Aero Mavs",
      role: "Solid Rocketry Project Manager",
      date: "Sep 2025 - Present",
      logo: "/aeromavs-logo-thumbnail.png",
      achievements: [
        "Performing composite material layups, such as mid-body sections, using wet layup techniques with epoxy resin and Mylar sheets for a smooth surface finish."
      ],
    },
    aiaa: {
      name: "UTA Design-Build-Fly Team",
      role: "Structures/Manufacturing",
      date: "Oct 2025 - Present",
      logo: "/dbf-logo-thumbnail.png",
      achievements: [
        "Developing a manufacturing proposal suggesting a design of a separate propulsion battery compartment for rapid battery integration to meet both flight safety and mission speed requirements."
      ],
    },
    "chs-aerospace": {
      name: "Coppell High School Aerospace Club",
      role: "Co-Founder/Executive",
      date: "Aug 2024 - May 2025",
      logo: "/chs-inside.jpg",
      achievements: [
        "Co-founded and grew the school's first aerospace club to over 115 members, establishing it as the largest student organization in the school's history (est. 1965).",
        "Led the astronomy sub-department, coordinating monthly meetings and developing educational presentations.",
        "Co-developed and managed a centralized Excel spreadsheet to track member enrollment, event logistics, and communications.",
        "Designed and modeled a detailed rocket prototype, including the payload fairing, second stage, interstage, first stage booster body, grid fins, and engine cluster in SolidWorks, inspired by Falcon 9, to showcase to students.",
      ],
    },
  };
  const club = clubData[id || ""];

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Club not found</p>
      </div>
    );
  }

  return (
    <>
      <DynamicSidebar returnSection="clubs" />
      <div 
        className="min-h-screen bg-background transition-opacity duration-700 ease-in-out"
        style={{ opacity }}
      >
        {/* Hero image - respects sidebar on left, responsive margin */}
        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden ml-12 sm:ml-14 md:ml-16">
          {/* Parallax Image using framer-motion */}
          <motion.img 
            src={club.logo} 
            alt={club.name} 
            className="w-full h-full object-cover"
            style={{ scale: heroScale }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          
          {/* Floating accent elements - hidden on mobile */}
          <div className="hidden sm:block absolute top-8 right-8 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
          <div className="hidden sm:block absolute bottom-20 right-20 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground mb-1 sm:mb-2 tracking-tight">{club.name}</h1>
            
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {/* Role */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <p className="text-base sm:text-xl md:text-2xl text-white font-semibold">{club.role}</p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <p className="text-sm sm:text-lg md:text-xl text-white/90 font-medium">{club.date}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
            <div className="p-1.5 sm:p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <Award className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground border-l-4 border-primary pl-2 sm:pl-3">My Role & Achievements</h2>
          </div>

          {/* Achievements List */}
          <ul className="space-y-3 sm:space-y-5">
            {club.achievements.map((achievement: string, index: number) => (
              <li 
                key={index} 
                className="flex gap-2 sm:gap-4 text-foreground/90 leading-relaxed"
              >
                <span className="text-primary mt-0.5 sm:mt-1">▸</span>
                <p className="text-sm sm:text-base md:text-lg">{achievement}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ClubDetail;
