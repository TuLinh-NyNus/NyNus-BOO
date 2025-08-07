'use client';

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/form/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

interface TestimonialsProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

// Testimonials data với avatar placeholders
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    role: "Học sinh lớp 12",
    avatar: "/avatars/student-1.jpg",
    content: "Nhờ có NyNus mà em đã cải thiện được điểm Toán từ 6 lên 9. Các bài giảng rất dễ hiểu và có nhiều bài tập thực hành.",
    rating: 5
  },
  {
    id: 2,
    name: "Trần Văn Hùng",
    role: "Phụ huynh",
    avatar: "/avatars/parent-1.jpg",
    content: "Con tôi học trên NyNus được 6 tháng, tiến bộ rất rõ rệt. Giao diện thân thiện, nội dung chất lượng cao.",
    rating: 5
  },
  {
    id: 3,
    name: "Lê Thị Mai",
    role: "Học sinh lớp 10",
    avatar: "/avatars/student-2.jpg",
    content: "Em rất thích cách giảng dạy của các thầy cô trên NyNus. Học online mà vẫn cảm thấy như được học trực tiếp.",
    rating: 5
  },
  {
    id: 4,
    name: "Phạm Đức Nam",
    role: "Học sinh lớp 11",
    avatar: "/avatars/student-3.jpg",
    content: "Hệ thống bài tập trên NyNus rất phong phú, giúp em luyện tập và củng cố kiến thức hiệu quả.",
    rating: 5
  },
  {
    id: 5,
    name: "Hoàng Thị Lan",
    role: "Giáo viên",
    avatar: "/avatars/teacher-1.jpg",
    content: "Tôi thường giới thiệu NyNus cho học sinh của mình. Nội dung bài giảng rất chất lượng và phù hợp với chương trình học.",
    rating: 5
  }
];

/**
 * Testimonials Component
 * Hiển thị testimonials với carousel functionality
 * Tương thích 100% với dự án cũ + thêm carousel
 */
export function Testimonials({ 
  className, 
  autoPlay = true, 
  autoPlayInterval = 5000 
}: TestimonialsProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className={cn("relative py-16 sm:py-24", className)}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/20 to-slate-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
            Học viên nói gì về chúng tôi
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Những phản hồi tích cực từ cộng đồng học viên NyNus
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          className="mt-16 relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Buttons */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="rounded-full w-12 h-12 bg-white/90 dark:bg-slate-800/90 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="rounded-full w-12 h-12 bg-white/90 dark:bg-slate-800/90 border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg"
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
                  const testimonialIndex = (currentIndex + offset) % testimonials.length;
                  const testimonial = testimonials[testimonialIndex];
                  
                  return (
                    <div
                      key={testimonial.id}
                      className={cn(
                        "group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300",
                        offset > 0 && "hidden lg:block" // Hide on mobile for offset items
                      )}
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
                        <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                          &quot;{testimonial.content}&quot;
                        </blockquote>

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
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
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
 * Loading state cho testimonials
 */
export function TestimonialsSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <section className={cn("relative py-16 sm:py-24", className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/20 to-slate-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-pulse">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4 max-w-md mx-auto" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg max-w-2xl mx-auto" />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
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
