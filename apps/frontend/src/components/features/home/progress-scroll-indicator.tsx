'use client';

import { useState, useEffect } from 'react';

interface ProgressScrollIndicatorProps {
  progress?: number;
  className?: string;
}

export default function ProgressScrollIndicator({ 
  progress, 
  className = "" 
}: ProgressScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Kiểm tra scroll position để hiển thị/ẩn component và tính progress
  useEffect(() => {
    const handleScroll = () => {
      // Toggle visibility
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = totalHeight > 0 ? (window.pageYOffset / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(currentProgress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use provided progress or calculated scroll progress
  const displayProgress = progress ?? Math.round(scrollProgress);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Tính toán stroke-dasharray cho progress circle
  const radius = 18; // Radius cho vòng tròn xung quanh
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;



  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-8 md:bottom-16 right-8 z-50 ${className}`}>
      {/* Progress Circle - Outer ring */}
      <div className="relative w-13 h-13">
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 40 40"
        >
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="rgba(100, 70, 203, 0.2)"
            strokeWidth="2"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6446CB" />
              <stop offset="100%" stopColor="#E97D84" />
            </linearGradient>
          </defs>
        </svg>

        {/* Button - Centered perfectly */}
        <button
          onClick={scrollToTop}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group relative w-9 h-9 bg-gradient-to-br from-[#6446CB] to-[#E97D84] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-300"
          aria-label="Scroll to top"
        >
          {/* Arrow Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white transform group-hover:translate-y-[-1px] transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={4}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6446CB] to-[#E97D84] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
        </button>
      </div>
    </div>
  );
}
