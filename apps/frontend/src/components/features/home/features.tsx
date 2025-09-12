"use client";

import React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Calculator, Brain, Trophy, Video, TrendingUp as Progress, Users, ChevronRight, ChevronLeft, Info, TrendingUp, TrendingDown, Minus, CheckCircle, BookOpen, GraduationCap, Target, HelpCircle, MessageSquare, Bot, Library } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";

// Import mockdata
import { featuresData, type FeatureItem } from "@/lib/mockdata";
import { useAnalytics } from "@/lib/analytics";

// Embla Carousel (loop)
import useEmblaCarousel from 'embla-carousel-react';

import NeuralNetworkBackground from "@/components/ui/neural-network-background";

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
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg whitespace-nowrap z-10 transition-all duration-200">
          {content}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover rotate-45 transition-all duration-200"></div>
        </div>
      )}
    </div>
  );
};

// Icon mapping - Math-focused and semantic icons
const iconMap = {
  Calculator: Calculator,  // Luyện tập theo chương (toán học)
  Brain: Brain,           // AI gợi ý từng bước (trí tuệ nhân tạo)
  Trophy: Trophy,         // Thi thử miễn phí (thành tích)
  Video: Video,           // Học qua video bài giảng (nội dung)
  Progress: Progress,     // Theo dõi tiến độ học tập (tiến bộ)
  Users: Users,           // Tài nguyên cho giáo viên (cộng đồng)
  Info: Info,
  // New icons for additional features
  BookOpen: BookOpen,     // Lý thuyết (kiến thức)
  GraduationCap: GraduationCap, // Khóa học (học tập)
  Target: Target,         // Luyện đề (mục tiêu)
  HelpCircle: HelpCircle, // Câu hỏi (hỗ trợ)
  MessageSquare: MessageSquare, // Thảo luận (giao tiếp)
  Bot: Bot,              // Nhắn tin với AI (trí tuệ nhân tạo)
  Library: Library       // Thư viện (tài nguyên)
};

const FeatureCard = ({ feature, index: _index, delay = 0 }: FeatureCardProps) => {
  const [_isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const analytics = useAnalytics();

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setShowDetails(!showDetails);
        // Track keyboard interaction
        analytics.featureClick(feature.title, 'features_section_keyboard');
        break;
      case 'Escape':
        setShowDetails(false);
        break;
    }
  }, [showDetails, analytics, feature.title]);

  // Semantic color schemes based on feature purpose
  const semanticColorSchemes = {
    // Học tập/Kiến thức - Xanh dương (Blue)
    learning: {
      bg: 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-indigo-500/10',
      icon: 'text-blue-400',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/15'
    },
    // AI/Hỗ trợ thông minh - Tím (Purple)
    ai: {
      bg: 'bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-violet-500/10',
      icon: 'text-purple-400',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/15'
    },
    // Đánh giá/Thi cử - Lục (Green)
    assessment: {
      bg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-teal-500/10',
      icon: 'text-emerald-400',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15'
    },
    // Theo dõi/Tiến bộ - Hổ phách (Amber)
    progress: {
      bg: 'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10',
      icon: 'text-amber-400',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15'
    },
    // Nội dung/Video - Hồng (Pink)
    content: {
      bg: 'bg-gradient-to-br from-pink-500/10 via-pink-400/5 to-rose-500/10',
      icon: 'text-pink-400',
      border: 'border-pink-500/20',
      iconBg: 'bg-pink-500/15'
    },
    // Giáo viên/Quản lý - Xanh lam (Cyan)
    teacher: {
      bg: 'bg-gradient-to-br from-cyan-500/10 via-cyan-400/5 to-sky-500/10',
      icon: 'text-cyan-400',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/15'
    }
  };

  // Map feature to semantic color based on purpose
  const getSemanticScheme = (featureId: number) => {
    switch (featureId) {
      case 1: return semanticColorSchemes.learning;    // Luyện tập theo chương
      case 2: return semanticColorSchemes.ai;          // AI gợi ý từng bước
      case 3: return semanticColorSchemes.assessment;  // Thi thử miễn phí
      case 4: return semanticColorSchemes.content;     // Học qua video bài giảng
      case 5: return semanticColorSchemes.progress;    // Theo dõi tiến độ học tập
      case 6: return semanticColorSchemes.teacher;     // Tài nguyên cho giáo viên
      // New features
      case 7: return semanticColorSchemes.learning;    // Lý thuyết
      case 8: return semanticColorSchemes.learning;    // Khóa học
      case 9: return semanticColorSchemes.assessment;  // Luyện đề
      case 10: return semanticColorSchemes.content;    // Câu hỏi
      case 11: return semanticColorSchemes.teacher;    // Thảo luận
      case 12: return semanticColorSchemes.ai;         // Nhắn tin với AI
      case 13: return semanticColorSchemes.content;    // Thư viện
      default: return semanticColorSchemes.learning;
    }
  };

  const scheme = getSemanticScheme(feature.id);

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
      className={`relative p-4 sm:p-6 rounded-2xl transition-all duration-300 group cursor-pointer h-full min-h-[400px] flex flex-col ${scheme.bg} ${scheme.border} border focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1F47]`}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3, delay }}
      whileHover={shouldReduceMotion ? {} : {
        y: -2,
        scale: 1.03,
        transition: { duration: 0.1 }
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


      <div className="relative z-10 flex flex-col h-full">
        {/* Enhanced icon container with stats */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <motion.div 
            className={`p-3 ${scheme.iconBg} rounded-xl transition-all duration-300`}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
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
              <p className="text-xs text-foreground/80">{feature.stats.label}</p>
            </motion.div>
          )}
        </div>

        {/* Content area with flex-grow */}
        <div className="flex-grow">
          {/* Enhanced typography with accessibility */}
          <h3
            className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground group-hover:text-foreground/95 transition-colors duration-300 leading-tight"
            id={`feature-${feature.id}-title`}
          >
            {feature.title}
          </h3>

          <p
            className="text-foreground/90 mb-4 sm:mb-5 transition-colors duration-300 leading-relaxed text-sm sm:text-base"
            id={`feature-${feature.id}-description`}
          >
            {feature.description}
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
            {feature.highlights.map((highlight, idx) => (
              <motion.span
                key={idx}
                className="px-2 py-1 text-xs bg-muted/50 text-foreground/95 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
              >
                {highlight}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Enhanced CTA */}
        <div className="flex items-center justify-between">
          <Tooltip content={feature.detailedDescription}>
            <button
              onClick={() => {
                setShowDetails(!showDetails);
                // Track details expansion
                analytics.trackEvent('feature_details_toggle', {
                  feature_name: feature.title,
                  action: !showDetails ? 'expand' : 'collapse',
                  location: 'features_section',
                  category: 'feature_engagement'
                });
              }}
              className="text-xs text-foreground/80 hover:text-foreground/95 underline underline-offset-4 decoration-1 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 p-2 rounded-lg"
            >
              Chi tiết
            </button>
          </Tooltip>

          <Link
            href={feature.cta.href}
            className={`inline-flex items-center text-sm font-medium ${scheme.icon} hover:${scheme.icon}/80 transition-all duration-300 group/link px-4 py-3 min-h-[44px] rounded-full bg-muted/50 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none`}
            aria-label={`${feature.cta.text} - ${feature.title}`}
            onClick={() => {
              // Track feature CTA click
              analytics.trackEvent('feature_cta_click', {
                feature_name: feature.title,
                cta_text: feature.cta.text,
                destination: feature.cta.href,
                location: 'features_section',
                category: 'feature_engagement'
              });
            }}
          >
            {feature.cta.text}
            <motion.div
              className="ml-1"
              whileHover={shouldReduceMotion ? {} : { x: 2 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
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
              className="mt-4 pt-4 border-t border-border"
            >
              <h4 className="text-sm font-medium text-foreground/95 mb-2">Lợi ích chính:</h4>
              <ul className="space-y-1">
                {feature.benefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-center gap-2 text-xs text-foreground/85"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
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
  const analytics = useAnalytics();
  const [_isScrolling, _setIsScrolling] = useState(false);

  // Track section view on mount
  React.useEffect(() => {
    analytics.trackEvent('features_section_view', {
      location: 'features_section',
      category: 'page_engagement',
      total_features: featuresData.features.length
    });
  }, [analytics]);

  // Embla setup (loop)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [_selectedIndex, _setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    _setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, _setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Keyboard navigation cho Embla viewport
  const handleScrollKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        emblaApi?.scrollPrev();
        analytics.trackEvent('features_scroll_keyboard', {
          direction: 'left',
          method: 'keyboard',
          location: 'features_section',
          category: 'navigation'
        });
        break;
      case 'ArrowRight':
        e.preventDefault();
        emblaApi?.scrollNext();
        analytics.trackEvent('features_scroll_keyboard', {
          direction: 'right',
          method: 'keyboard',
          location: 'features_section',
          category: 'navigation'
        });
        break;
      case 'Home':
        e.preventDefault();
        emblaApi?.scrollTo(0);
        analytics.trackEvent('features_scroll_keyboard', {
          direction: 'home',
          method: 'keyboard',
          location: 'features_section',
          category: 'navigation'
        });
        break;
      case 'End':
        e.preventDefault();
        emblaApi?.scrollTo(featuresData.features.length - 1);
        analytics.trackEvent('features_scroll_keyboard', {
          direction: 'end',
          method: 'keyboard',
          location: 'features_section',
          category: 'navigation'
        });
        break;
    }
  }, [emblaApi, analytics]);

  return (
    <section
      id="features-section"
      className="py-20 lg:py-32 relative min-h-screen bg-background overflow-hidden"
      aria-labelledby="features-title"
      role="main"
    >
      {/* Neural Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-muted opacity-40"></div>
      <NeuralNetworkBackground
        className="opacity-45"
        nodeCount={150}
        maxConnections={4}
        animationSpeed={0.12}
        nodeOpacity={0.75}
        lineOpacity={0.3}
      />

      <div className="container px-4 mx-auto relative z-10 max-w-7xl">
        {/* Enhanced header section */}
        <div className="mb-20">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-8"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
          >
            {/* Enhanced badge */}
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-muted/50 border border-border text-foreground/90 mb-6 transition-all duration-300"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            >
              <Info className="h-4 w-4 mr-2 text-blue-400" />
              <span className="font-medium">{featuresData.badge.text}</span>
            </motion.div>

            {/* Enhanced title with better gradient */}
            <h2
              id="features-title"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-relaxed py-2"
            >
              {featuresData.title}
            </h2>

            {/* Enhanced subtitle */}
            <p className="text-foreground/95 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              {featuresData.subtitle}
            </p>
          </motion.div>


        </div>

        {/* All devices: Horizontal scroll */}
        <div className="mb-16">
          {/* Scroll container với peek effect */}
          <div className="relative pt-2">


            {/* Floating scroll buttons */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={() => {
                  emblaApi?.scrollPrev();
                  analytics.trackEvent('features_scroll_floating', {
                    direction: 'left',
                    method: 'floating_button',
                    location: 'features_section',
                    category: 'navigation'
                  });
                }}
                className={`group p-3 rounded-full bg-muted/50 border border-border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none hover:bg-muted hover:border-border opacity-80 hover:opacity-100`}
                aria-label="Cuộn sang trái"
                type="button"
              >
                <ChevronLeft className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:-translate-x-0.5" />
              </button>
            </div>

            <div className="absolute -right-8 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={() => {
                  emblaApi?.scrollNext();
                  analytics.trackEvent('features_scroll_floating', {
                    direction: 'right',
                    method: 'floating_button',
                    location: 'features_section',
                    category: 'navigation'
                  });
                }}
                className={`group p-3 rounded-full bg-muted/50 border border-border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none hover:bg-muted hover:border-border opacity-80 hover:opacity-100`}
                aria-label="Cuộn sang phải"
                type="button"
              >
                <ChevronRight className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>

            <div
              ref={emblaRef}
              className="overflow-hidden px-4"
              role="region"
              aria-label="Danh sách tính năng - carousel"
              aria-live="polite"
              tabIndex={0}
              onKeyDown={handleScrollKeyDown}
            >
              <div className="flex gap-4 sm:gap-6 pb-8 pt-2 pr-4 sm:pr-6">
                {featuresData.features.map((feature, index) => (
                  <div
                    key={`${feature.id}-${index}`}
                    className="flex-none w-[82%] sm:w-[58%] md:w-[43%] lg:w-[32%] xl:w-[calc(25%-12px)]"
                  >
                    <FeatureCard
                      feature={feature}
                      index={index}
                      delay={shouldReduceMotion ? 0 : 0.05}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicators */}
          <motion.div
            className="flex justify-center mt-6"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
          </motion.div>
        </div>

      </div>

    </section>
  );
};

export default Features;
