"use client";

import React, { useRef, useEffect, useState, useCallback, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface InfiniteHorizontalScrollProps {
  children: ReactNode;
  className?: string;
  cardWidth?: number;
  gap?: number;
  speed?: number;
  _showScrollbar?: boolean;
}

export const InfiniteHorizontalScroll: React.FC<InfiniteHorizontalScrollProps> = ({
  children,
  className = "",
  cardWidth = 320,
  gap = 16,
  speed = 0.5,
  _showScrollbar = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Calculate dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current) {
        const container = containerRef.current;
        const content = contentRef.current;
        
        setContainerWidth(container.offsetWidth);
        setContentWidth(content.scrollWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (shouldReduceMotion || isHovered || !containerRef.current) return;

    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (!containerRef.current) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setScrollPosition(prev => {
        const newPosition = prev + (speed * deltaTime);
        
        // Reset position when reaching the end to create infinite effect
        if (newPosition >= contentWidth - containerWidth) {
          return 0;
        }
        
        return newPosition;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [speed, contentWidth, containerWidth, isHovered, shouldReduceMotion]);

  // Apply scroll position
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translateX(-${scrollPosition}px)`;
    }
  }, [scrollPosition]);

  // Handle manual scroll
  const handleScroll = useCallback((e: React.WheelEvent) => {
    if (shouldReduceMotion) return;
    
    e.preventDefault();
    setScrollPosition(prev => {
      const newPosition = prev + (e.deltaY * 2);
      
      // Handle infinite scroll boundaries
      if (newPosition < 0) {
        return contentWidth - containerWidth;
      } else if (newPosition >= contentWidth - containerWidth) {
        return 0;
      }
      
      return newPosition;
    });
  }, [contentWidth, containerWidth, shouldReduceMotion]);

  // Handle touch scroll for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchStartScroll, setTouchStartScroll] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchStartScroll(scrollPosition);
  }, [scrollPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (shouldReduceMotion) return;
    
    const touchDelta = touchStart - e.touches[0].clientX;
    const newPosition = touchStartScroll + touchDelta;
    
    setScrollPosition(Math.max(0, Math.min(newPosition, contentWidth - containerWidth)));
  }, [touchStart, touchStartScroll, contentWidth, containerWidth, shouldReduceMotion]);

  const handleTouchEnd = useCallback(() => {
    // Snap to nearest card position
    const cardTotalWidth = cardWidth + gap;
    const snappedPosition = Math.round(scrollPosition / cardTotalWidth) * cardTotalWidth;
    setScrollPosition(Math.max(0, Math.min(snappedPosition, contentWidth - containerWidth)));
  }, [scrollPosition, cardWidth, gap, contentWidth, containerWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onWheel={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        ref={contentRef}
        className="flex gap-4"
        style={{
          width: 'max-content',
          transform: `translateX(-${scrollPosition}px)`,
          transition: shouldReduceMotion ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {children}
      </motion.div>
      
      {/* Gradient fade effects */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#1F1F47] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#1F1F47] to-transparent pointer-events-none z-10" />
    </div>
  );
};

// Enhanced card component with hover effects
interface ScrollCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const ScrollCard: React.FC<ScrollCardProps> = ({
  children,
  className = "",
  delay = 0
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex-none ${className}`}
      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay }}
      whileHover={shouldReduceMotion ? {} : {
        scale: 1.05,
        y: -8,
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }
      }}
      style={{
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {children}
    </motion.div>
  );
};

// Navigation controls
interface ScrollNavigationProps {
  onScrollLeft: () => void;
  onScrollRight: () => void;
  className?: string;
}

export const ScrollNavigation: React.FC<ScrollNavigationProps> = ({
  onScrollLeft,
  onScrollRight,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        onClick={onScrollLeft}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Cuộn sang trái"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>
      
      <motion.button
        onClick={onScrollRight}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Cuộn sang phải"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </div>
  );
};
