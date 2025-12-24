import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MaskedTextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const MaskedTextReveal = ({ children, className = "", delay = 0 }: MaskedTextRevealProps) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ 
          clipPath: "inset(100% 0% 0% 0%)",
          y: 40,
          opacity: 0 
        }}
        whileInView={{ 
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          opacity: 1 
        }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MaskedTextReveal;
