"use client";

import { motion } from "framer-motion";
import { Trophy, Search, Video, Bot, ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Import mockdata
import { featuresData } from "@/lib/mockdata";
import ScrollIndicator from "@/components/ui/scroll-indicator";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg whitespace-nowrap z-10 transition-colors duration-300">
          {content}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover rotate-45 transition-colors duration-300"></div>
        </div>
      )}
    </div>
  );
};

// Icon mapping
const iconMap = {
  Trophy: Trophy,
  Search: Search,
  Video: Video,
  Bot: Bot,
  Info: Info
};

const FeatureCard = ({ icon, title, description, delay = 0 }: Omit<FeatureCardProps, 'color'>) => {
  return (
    <motion.div
      className="relative p-6 rounded-2xl transition-all duration-200 group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
    >
      {/* Clean background using NyNus semantic colors */}
      <div className="absolute inset-0 bg-background border border-border/30 rounded-2xl shadow-sm transition-colors duration-300"></div>

      <div className="relative z-10">
        <div className="p-3 bg-primary/15 rounded-xl w-fit mb-4 backdrop-blur-sm transition-colors duration-300">
          {icon}
        </div>

        <h3 className="text-xl font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-muted-foreground mb-4 transition-colors duration-300">{description}</p>

        <Tooltip content="Khám phá tính năng này">
          <Link href="#" className="inline-flex items-center text-sm font-medium text-secondary hover:underline">
            Tìm hiểu thêm <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </Tooltip>
      </div>
    </motion.div>
  );
};

const Features = () => {

  return (
    <section id="features-section" className="py-20 relative min-h-screen" style={{ backgroundColor: '#1F1F47' }}>


      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-secondary backdrop-blur-sm mb-4 transition-colors duration-300">
            <Info className="h-4 w-4 mr-2" /> {featuresData.badge.text}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">
            {featuresData.title}
          </h2>
          <p className="text-muted-foreground text-lg transition-colors duration-300">
            {featuresData.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuresData.features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
            // Map semantic colors based on feature index for consistency
            const getIconColor = (index: number) => {
              const colors = [
                'text-primary dark:text-blue-400',      // Trophy - primary gold
                'text-secondary dark:text-blue-400',    // Search - secondary terracotta
                'text-accent dark:text-purple-400',     // Video - accent pink
                'text-primary dark:text-pink-400'       // Bot - primary gold
              ];
              return colors[index % colors.length] || 'text-primary dark:text-blue-400';
            };

            const iconElement = IconComponent ? (
              <IconComponent className={`h-6 w-6 ${getIconColor(index)} transition-colors duration-300`} />
            ) : null;

            return (
              <FeatureCard
                key={feature.id}
                icon={iconElement}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1 + 0.1}
              />
            );
          })}
        </div>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link
            href={featuresData.ctaButton.href}
            className="group px-8 py-4 rounded-full bg-muted border border-border hover:bg-muted/80 hover:border-border/80 text-foreground dark:bg-slate-800/70 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:text-white transition-all duration-200 flex items-center gap-2"
          >
            <span>{featuresData.ctaButton.text}</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
            >
              <ChevronRight className="h-4 w-4 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors duration-300" />
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Decorative circles using NyNus semantic colors */}
      <div className="hidden lg:block absolute bottom-0 left-12 w-24 h-24 border-4 border-primary/20 dark:border-blue-500/20 rounded-full transition-colors duration-300"></div>
      <div className="hidden lg:block absolute top-12 right-12 w-12 h-12 border-2 border-secondary/20 dark:border-purple-500/20 rounded-full transition-colors duration-300"></div>

      {/* Scroll indicator */}
      <ScrollIndicator targetSectionId="ai-learning-section" />
    </section>
  );
};

export default Features;
