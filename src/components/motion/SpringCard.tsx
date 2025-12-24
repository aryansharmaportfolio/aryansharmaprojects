import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SpringCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

const SpringCard = ({ children, index = 0, className = "" }: SpringCardProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay: index * 0.1,
      }}
    >
      {children}
    </motion.div>
  );
};

export default SpringCard;
