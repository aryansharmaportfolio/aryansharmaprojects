import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface ClubCardProps {
  id: string;
  name: string;
  role: string;
  date: string;
  description: string;
  image: string;
  index: number;
}

const ClubCard = ({ id, name, role, date, description, image, index }: ClubCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Link to={`/clubs/${id}`} className="group relative block h-full w-full overflow-hidden rounded-3xl bg-neutral-900 border border-white/10">
        
        {/* UPDATED: Glassmorphic Date Badge to match Project/3D Cards */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/90 text-xs font-medium shadow-lg transition-transform duration-300 group-hover:scale-105">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>{date}</span>
        </div>

        <div className="aspect-[4/3] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/10 transition-colors duration-500" />
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 z-20">
          <div className="transform transition-transform duration-500 group-hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              {name}
              <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-400" />
            </h3>
            <p className="text-blue-200/80 text-sm font-medium mb-2">{role}</p>
            <p className="text-white/60 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ClubCard;
