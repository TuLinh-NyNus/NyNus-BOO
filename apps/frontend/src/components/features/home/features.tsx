"use client";

import React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Trophy, Search, Video, Bot, ChevronRight, Info, TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useRef } from "react";

// Import mockdata
import { featuresData, type FeatureItem } from "@/lib/mockdata";
import ScrollIndicator from "@/components/ui/scroll-indicator";

interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
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

const FeatureCard = ({ feature, index, delay = 0 }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setShowDetails(!showDetails);
        break;
      case 'Escape':
        setShowDetails(false);
        break;
    }
  }, [showDetails]);

  // Enhanced color schemes for each feature card
  const colorSchemes = [
    { 
      bg: 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-purple-500/10', 
      icon: 'text-blue-400', 
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/15',
      hoverGlow: 'shadow-blue-500/25'
    },
    { 
      bg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-teal-500/10', 
      icon: 'text-emerald-400', 
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15',
      hoverGlow: 'shadow-emerald-500/25'
    },
    { 
      bg: 'bg-gradient-to-br from-pink-500/10 via-pink-400/5 to-rose-500/10', 
      icon: 'text-pink-400', 
      border: 'border-pink-500/20',
      iconBg: 'bg-pink-500/15',
      hoverGlow: 'shadow-pink-500/25'
    },
    { 
      bg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10', 
      icon: 'text-amber-400', 
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15',
      hoverGlow: 'shadow-amber-500/25'
    }
  ];

  const scheme = colorSchemes[index % 4];

  // Get icon component
  const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
  const iconElement = IconComponent ? <IconComponent className="h-6 w-6" /> : null;

  // Get trend icon for stats
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-emerald-400" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-400" />;
      case 'stable': return <Minus className="h-3 w-3 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative p-6 rounded-2xl transition-all duration-300 group cursor-pointer ${scheme.bg} ${scheme.border} border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent`}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={shouldReduceMotion ? {} : { 
        y: -12, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Tính năng ${feature.title}. Nhấn Enter để xem chi tiết.`}
      aria-expanded={showDetails}
      aria-describedby={`feature-${feature.id}-description`}
    >
      {/* Enhanced hover glow effect */}
      <AnimatePresence>
        {isHovered && !shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 rounded-2xl shadow-2xl ${scheme.hoverGlow}`}
            style={{ filter: 'blur(20px)', zIndex: -1 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Enhanced icon container with stats */}
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className={`p-3 ${scheme.iconBg} rounded-xl backdrop-blur-sm transition-all duration-300`}
            whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
          >
            <div className={`${scheme.icon} transition-colors duration-300`}>
              {iconElement}
            </div>
          </motion.div>

          {/* Stats display */}
          {feature.stats && (
            <motion.div 
              className="text-right"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              <div className="flex items-center gap-1 justify-end mb-1">
                <span className={`text-lg font-bold ${scheme.icon}`}>
                  {feature.stats.value}
                </span>
                {getTrendIcon(feature.stats.trend)}
              </div>
              <p className="text-xs text-white/60">{feature.stats.label}</p>
            </motion.div>
          )}
        </div>

        {/* Enhanced typography with accessibility */}
        <h3 
          className="text-xl font-semibold mb-2 text-white group-hover:text-white/90 transition-colors duration-300 leading-tight"
          id={`feature-${feature.id}-title`}
        >
          {feature.title}
        </h3>
        
        <p 
          className="text-white/70 mb-4 transition-colors duration-300 leading-relaxed text-sm"
          id={`feature-${feature.id}-description`}
        >
          {feature.description}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-4">
          {feature.highlights.map((highlight, idx) => (
            <motion.span
              key={idx}
              className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded-full backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.3 + idx * 0.1 }}
            >
              {highlight}
            </motion.span>
          ))}
        </div>

        {/* Enhanced CTA */}
        <div className="flex items-center justify-between">
          <Tooltip content={feature.detailedDescription}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-white/60 hover:text-white/80 transition-colors duration-300"
            >
              Chi tiết
            </button>
          </Tooltip>

          <Link 
            href={feature.cta.href}
            className={`inline-flex items-center text-sm font-medium ${scheme.icon} hover:${scheme.icon}/80 transition-all duration-300 group/link px-3 py-1 rounded-full bg-white/5 hover:bg-white/10`}
          >
            {feature.cta.text}
            <motion.div
              className="ml-1"
              whileHover={shouldReduceMotion ? {} : { x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ChevronRight className="h-3 w-3" />
            </motion.div>
          </Link>
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <h4 className="text-sm font-medium text-white/90 mb-2">Lợi ích chính:</h4>
              <ul className="space-y-1">
                {feature.benefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-center gap-2 text-xs text-white/70"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Features = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="features-section" className="py-20 lg:py-32 relative min-h-screen bg-[#1F1F47] overflow-hidden">
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F47] via-[#252560] to-[#1F1F47] opacity-50"></div>
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="container px-4 mx-auto relative z-10 max-w-7xl">
        {/* Enhanced header section */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced badge */}
          <motion.div 
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm mb-6 transition-all duration-300"
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          >
            <Info className="h-4 w-4 mr-2 text-blue-400" /> 
            <span className="font-medium">{featuresData.badge.text}</span>
          </motion.div>

          {/* Enhanced title with better gradient */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
            {featuresData.title}
          </h2>
          
          {/* Enhanced subtitle */}
          <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {featuresData.subtitle}
          </p>
        </motion.div>

        {/* Enhanced responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {featuresData.features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              delay={shouldReduceMotion ? 0 : index * 0.1 + 0.2}
            />
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          className="flex justify-center mt-16"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link
            href={featuresData.ctaButton.href}
            className="group relative px-8 py-4 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 text-white backdrop-blur-sm transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            
            <span className="relative z-10 font-medium">{featuresData.ctaButton.text}</span>
            <motion.span
              className="relative z-10"
              animate={shouldReduceMotion ? {} : { x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop", repeatDelay: 1 }}
            >
              <ChevronRight className="h-4 w-4 group-hover:text-blue-400 transition-colors duration-300" />
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="hidden lg:block absolute bottom-12 left-12 w-32 h-32 border-4 border-blue-500/10 rounded-full animate-pulse"></div>
      <div className="hidden lg:block absolute top-20 right-16 w-16 h-16 border-2 border-purple-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="hidden lg:block absolute bottom-32 right-32 w-8 h-8 border border-pink-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Scroll indicator */}
      <ScrollIndicator targetSectionId="ai-learning-section" />
    </section>
  );
};

export default Features;
