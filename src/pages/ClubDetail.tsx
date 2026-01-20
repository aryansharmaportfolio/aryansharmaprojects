import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useEffect } from "react";

// MOCK DATA - Ensure this matches your actual data source or imports
const clubsData = [
  {
    id: "aeromavs",
    name: "AeroMavs",
    role: "Propulsion Lead",
    date: "Aug 2023 - Present",
    description: "Leading the propulsion team for the university's high-powered rocketry club.",
    image: "/aeromavs-logo-thumbnail.png", 
    heroImage: "/aeromavs-logo-thumbnail.png",
    fullDescription: "Detailed description for AeroMavs...",
    technologies: ["Solid Motors", "Aerodynamics", "Simulation", "CAD"],
    links: { website: "https://aeromavs.com" }
  },
  {
    id: "dbf",
    name: "Design Build Fly",
    role: "Aerodynamics Lead",
    date: "Aug 2023 - Present",
    description: "Designing and manufacturing UAVs for the annual AIAA competition.",
    image: "/dbf-thumbnail.jpg",
    heroImage: "/dbf-thumbnail.jpg",
    fullDescription: "Detailed description for DBF...",
    technologies: ["CFD", "Composites", "RC Electronics", "SolidWorks"],
    links: { website: "https://uta-dbf.com" }
  }
];

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const club = clubsData.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!club) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Club not found</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black z-10" />
        <img
          src={club.heroImage}
          alt={club.name}
          className="h-full w-full object-cover"
        />
        
        <div className="absolute top-0 left-0 p-6 z-20">
          <Link to="/">
            <Button variant="outline" size="icon" className="rounded-full bg-black/20 backdrop-blur-md border-white/10 hover:bg-white/10 text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* --- DATE REMOVED FROM HERE --- */}
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{club.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-lg text-white/80">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  {club.role}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-invert max-w-none"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">About the Club</h2>
              <p className="text-white/70 leading-relaxed text-lg">
                {club.fullDescription}
              </p>
            </motion.section>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-400" />
                Key Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {club.technologies?.map((tech) => (
                  <Badge key={tech} variant="secondary" className="bg-white/10 hover:bg-white/20 text-blue-200 border-none">
                    {tech}
                  </Badge>
                ))}
              </div>
            </motion.div>
            
            {club.links?.website && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <a href={club.links.website} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full gap-2" variant="secondary">
                    Visit Website
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
