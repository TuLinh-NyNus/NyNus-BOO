"use client";

import { motion } from "framer-motion";
import { Mouse } from "lucide-react";

interface ScrollIndicatorProps {
  targetSectionId?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ScrollIndicator = ({ targetSectionId, className = "", style }: ScrollIndicatorProps) => {
  const scrollToNextSection = () => {
    if (targetSectionId) {
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Scroll to next section automatically
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <motion.button
      className={`absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer min-h-[48px] min-w-[48px] justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1F47] focus-visible:outline-none rounded-lg ${className}`}
      style={{ bottom: '40px', ...style }}
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      onClick={scrollToNextSection}
      aria-label="Cuộn xuống phần tiếp theo"
      type="button"
    >
      <Mouse className="h-8 w-8 text-white/80 hover:text-white transition-colors" />
    </motion.button>
  );
};

export default ScrollIndicator;
