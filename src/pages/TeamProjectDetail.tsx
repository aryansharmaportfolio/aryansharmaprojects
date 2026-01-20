import { useParams, useLocation } from "react-router-dom";
import DynamicSidebar from "@/components/DynamicSidebar";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar } from "lucide-react";
import MagneticTilt from "@/components/motion/MagneticTilt";
import ImageViewer from "@/components/ImageViewer";

const TeamProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const returnSection = location.state?.from || "team-projects";

  const [opacity, setOpacity] = useState(0);

  // Scroll hooks for Parallax Effect (like ClubDetail)
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  useEffect(() => {
    setTimeout(() => setOpacity(1), 100);
  }, []);

  // Project data
  const projectData: Record<string, {
    name: string;
    description: string;
    heroImage: string;
    date: string;
    images: { src: string; alt: string; badge?: string }[];
  }> = {
    "uta-dbf-2026": {
      name: "UTA Design-Build-Fly (2026)",
      description: "Developed a manufacturing proposal suggesting a design of a separate propulsion battery compartment for rapid battery integration to meet both flight safety and mission speed requirements.",
      heroImage: "/dbf-thumbnail.jpg",
      date: "October 2025 - January 2026",
      images: [
        { src: "/dbf2026-images/manufacturing-proposal.png", alt: "Manufacturing Proposal", badge: "Manufacturing Proposal" },
        { src: "/dbf2026-images/proposal-sketch.jpg", alt: "Proposal Sketch", badge: "Proposal Sketch" },
      ],
    },
  };

  const project = projectData[id || ""];

  if (!project) {
    return (
      <>
        <DynamicSidebar returnSection={returnSection} />
        <div className="min-h-screen bg-background flex items-center justify-center ml-10 sm:ml-12 md:ml-14 lg:ml-16">
          <p className="text-xl text-muted-foreground">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <DynamicSidebar returnSection={returnSection} />
      <div 
        className="min-h-screen bg-background transition-opacity duration-700 ease-in-out" 
        style={{ opacity }}
      >
        {/* Hero Image with scroll zoom */}
        <div className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden ml-12 sm:ml-14 md:ml-16">
          <motion.img
            src={project.heroImage}
            alt={project.name}
            className="w-full h-full object-cover"
            style={{ scale: heroScale }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          
          {/* Glass morphic date badge - top left */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/20">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80" />
              <span className="text-xs sm:text-sm font-medium text-white/90">{project.date}</span>
            </div>
          </div>

          {/* Floating accent elements - hidden on mobile */}
          <div className="hidden sm:block absolute top-8 right-8 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
          <div className="hidden sm:block absolute bottom-20 right-20 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
        </div>

        {/* Project Info */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl -mt-24 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
            {project.name}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl">
            {project.description}
          </p>

          {/* Images Section */}
          {project.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {project.images.map((image, index) => (
                <MagneticTilt key={index} className="relative group">
                  <ImageViewer 
                    src={image.src} 
                    alt={image.alt}
                    trigger={
                      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-xl cursor-zoom-in">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Glass morphic badge on image - top left */}
                        {image.badge && (
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/20">
                            <span className="text-xs sm:text-sm font-medium text-white/90">{image.badge}</span>
                          </div>
                        )}
                      </div>
                    }
                  />
                </MagneticTilt>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamProjectDetail;
