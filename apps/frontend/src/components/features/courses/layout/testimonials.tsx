'use client';

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote, Target, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/form/button";
import { cn } from "@/lib/utils";
import { coursesTestimonials } from "@/lib/mockdata/testimonials";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  achievement?: string;
  studyTime?: string;
  improvement?: string;
}

interface TestimonialsProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

/**
 * Testimonials Component
 * Hiển thị testimonials với carousel functionality và height 920px
 * Tương thích 100% với dự án cũ + thêm carousel và cải tiến
 */
export function Testimonials({ 
  className, 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: TestimonialsProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer để trigger animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('courses-testimonials-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coursesTestimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % coursesTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + coursesTestimonials.length) % coursesTestimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section 
      id="courses-testimonials-section"
      className={cn("h-[920px] relative overflow-hidden", className)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/20 to-slate-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 dark:text-white">
            Học viên nói gì về chúng tôi
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Những phản hồi tích cực từ cộng đồng học viên NyNus
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          className="relative flex-1 flex flex-col justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Buttons */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="rounded-full w-12 h-12 bg-white/90 dark:bg-slate-800/90 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:scale-105 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="rounded-full w-12 h-12 bg-white/90 dark:bg-slate-800/90 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:scale-105 transition-transform"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Testimonials Grid */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-8 lg:grid-cols-3"
              >
                {/* Show 3 testimonials at a time on desktop, 1 on mobile */}
                {Array.from({ length: 3 }).map((_, offset) => {
                  const testimonialIndex = (currentIndex + offset) % coursesTestimonials.length;
                  const testimonial: Testimonial = coursesTestimonials[testimonialIndex];
                  
                  return (
                    <motion.div
                      key={testimonial.id}
                      className={cn(
                        "group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                        offset > 0 && "hidden lg:block" // Hide on mobile for offset items
                      )}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Gradient border effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                      
                      <div className="relative">
                        {/* Quote icon */}
                        <div className="mb-4">
                          <Quote className="w-8 h-8 text-purple-500/30" />
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 text-yellow-500 fill-current"
                            />
                          ))}
                        </div>

                        {/* Content */}
                        <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
                          &quot;{testimonial.content}&quot;
                        </blockquote>

                        {/* Achievement Badge */}
                        {testimonial.achievement && (
                          <div className="flex items-center gap-2 mb-4 p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {testimonial.achievement}
                            </span>
                          </div>
                        )}

                        {/* Study Time & Improvement */}
                        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                          {testimonial.studyTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{testimonial.studyTime}</span>
                            </div>
                          )}
                          {testimonial.improvement && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{testimonial.improvement}</span>
                            </div>
                          )}
                        </div>

                        {/* Author */}
                        <div className="flex items-center">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            {/* Avatar placeholder with initials */}
                            <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                              {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold text-slate-800 dark:text-white">
                              {testimonial.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {testimonial.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {coursesTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300 hover:scale-125",
                  index === currentIndex
                    ? "bg-purple-500 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-purple-300 dark:hover:bg-purple-700"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * TestimonialsSkeleton Component
 * Loading state cho testimonials với height 920px
 */
export function TestimonialsSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <section className={cn("h-[920px] relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/20 to-slate-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="text-center animate-pulse mb-16">
          <div className="h-10 md:h-12 lg:h-14 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4 max-w-md mx-auto" />
          <div className="h-6 md:h-7 bg-gray-300 dark:bg-gray-700 rounded-lg max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 flex-1 flex flex-col justify-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg">
                <div className="flex mb-4 space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded" />
                  ))}
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6" />
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <div className="ml-4 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Export default for backward compatibility
export default Testimonials;
