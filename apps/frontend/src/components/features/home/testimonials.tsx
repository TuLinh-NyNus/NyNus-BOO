"use client";

import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Clock, Users, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';

// Import mockdata và components
import { testimonialsData, testimonialsStats, videoTestimonials } from "@/lib/mockdata/testimonials";
import { TestimonialAvatar, VideoTestimonial, VideoModal } from "@/components/ui/display";
import { ScrollIndicators } from "@/components/ui/navigation/scroll-indicators";
import ScrollIndicator from "@/components/ui/scroll-indicator";

// Component chính
const Testimonials = () => {
     const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
   const [selectedVideo, setSelectedVideo] = useState<{
     id: number;
     name: string;
     videoUrl: string;
   } | null>(null);
   const [isVisible, setIsVisible] = useState(false);
   const [currentVideoSlide, setCurrentVideoSlide] = useState(0);

  // Embla for video section
  const [emblaVideoRef, emblaVideoApi] = useEmblaCarousel({ loop: true, align: 'center' });
  useEffect(() => {
    if (!emblaVideoApi) return;
    const onSelect = () => setCurrentVideoSlide(emblaVideoApi.selectedScrollSnap());
    onSelect();
    emblaVideoApi.on('select', onSelect);
    emblaVideoApi.on('reInit', onSelect);
  }, [emblaVideoApi]);

  // (removed) testimonialsScrollHook - not used

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

    const element = document.getElementById('testimonials-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Embla cho text testimonials (logic giống Features)
  const [emblaTextRef, emblaTextApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  useEffect(() => {
    if (!emblaTextApi) return;
    const onSelect = () => setCurrentTextIndex(emblaTextApi.selectedScrollSnap());
    onSelect();
    emblaTextApi.on('select', onSelect);
    emblaTextApi.on('reInit', onSelect);
  }, [emblaTextApi]);

  const scrollToLeft = useCallback(() => emblaTextApi?.scrollPrev(), [emblaTextApi]);
  const scrollToRight = useCallback(() => emblaTextApi?.scrollNext(), [emblaTextApi]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        emblaTextApi?.scrollPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        emblaTextApi?.scrollNext();
        break;
      case 'Home':
        e.preventDefault();
        emblaTextApi?.scrollTo(0);
        break;
      case 'End':
        e.preventDefault();
        emblaTextApi?.scrollTo(testimonialsData.length - 1);
        break;
    }
  }, [emblaTextApi]);

  



  const handleVideoPlay = (videoData: { id: number; name: string; videoUrl: string }) => {
    setSelectedVideo(videoData);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  return (
    <section 
      id="testimonials-section"
      className="min-h-screen bg-background relative"
    >
      <div className="container mx-auto px-4 max-w-7xl py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          {/* New badge */}
          <motion.div
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-emerald-500/15 border border-gradient-to-r from-blue-400/40 via-purple-400/40 to-emerald-400/40 text-blue-300 backdrop-blur-sm mb-8 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group w-fit mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: `linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(16, 185, 129, 0.15) 100%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`
            }}
          >
            <div className="absolute inset-0 opacity-30">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(147, 197, 253, 0.4) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px, 30px 30px',
                  animation: 'float-subtle 8s ease-in-out infinite'
                }}
              />
            </div>

            <div className="relative z-10 mr-3">
              <div className="relative">
                <Users className="h-5 w-5 text-blue-300" />
                <div className="absolute inset-0 h-5 w-5 bg-blue-300 rounded-full opacity-20 blur-sm"></div>
              </div>
            </div>
            <span className="font-semibold text-blue-300 text-base tracking-wide relative z-10">
              Cảm nhận học viên
            </span>
            <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Học viên nói gì về{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              NyNus
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Hơn {testimonialsStats.totalStudents.toLocaleString()} học viên đã trải nghiệm và đạt được kết quả tích cực với NyNus
          </p>
        </motion.div>

        {/* Video Testimonials Section - Hàng 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Tâm sự từ học viên
            </h3>
            <p className="text-muted-foreground text-base">
              Lắng nghe trực tiếp từ học viên về trải nghiệm học tập với NyNus
            </p>
          </div>

          <div className="relative">

            <div
              ref={emblaVideoRef}
              className="overflow-hidden px-2"
              role="region"
              aria-label="Video testimonials - carousel"
            >
              <div className="flex justify-center gap-6 pb-6 pt-2 pr-4 sm:pr-6">
                {videoTestimonials.map((video, index) => (
                  <div key={video.id} className="flex-none w-[340px] h-[440px]">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                      className="relative z-0 hover:z-20"
                    >
                      <VideoTestimonial
                        {...video}
                        className="w-[340px] h-[440px] flex flex-col"
                        onPlay={handleVideoPlay}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicators */}
            <motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ScrollIndicators
                totalItems={videoTestimonials.length}
                currentIndex={currentVideoSlide}
                visibleItems={1}
                variant="minimal"
                color="primary"
                className=""
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Text Testimonials Section - Hàng 2 - Infinite Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Chia sẻ từ học viên
            </h3>
            <p className="text-muted-foreground text-base">
              Những câu chuyện thành công và kết quả học tập ấn tượng
            </p>
          </div>

          {/* Infinite horizontal scroll layout cho testimonials */}
          <div className="relative overflow-visible pl-8 pr-8">
            {/* Floating scroll buttons */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-30 pointer-events-auto testimonial-nav-left hidden md:block">
              <button
                onClick={scrollToLeft}
                className="group p-3 rounded-full bg-white/10 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/40 opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none backdrop-blur-sm"
                aria-label="Cuộn testimonials sang trái"
                type="button"
              >
                <ChevronLeft className="h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-x-0.5" />
              </button>
            </div>

            <div className="absolute -right-1 top-1/2 -translate-y-1/2 z-30 pointer-events-auto testimonial-nav-right hidden md:block">
              <button
                onClick={scrollToRight}
                className="group p-3 rounded-full bg-white/10 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/40 opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none backdrop-blur-sm"
                aria-label="Cuộn testimonials sang phải"
                type="button"
              >
                <ChevronRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Embla viewport/track giống Features */}
            <div 
              ref={emblaTextRef}
              className="overflow-hidden px-2"
              role="region"
              aria-label="Text testimonials - carousel"
              aria-live="polite"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <div className="flex gap-4 sm:gap-6 pb-8 pt-8 pr-4 sm:pr-6">
               {testimonialsData.map((testimonial, index) => (
                 <div
                   key={`${testimonial.id}-${index}`}
                   className="flex-none w-[82%] sm:w-[58%] md:w-[43%] lg:w-[32%] xl:w-[calc(25%-12px)]"
                 >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="group relative z-0 hover:z-50 p-2"
                  >
                    <div className="bg-card border border-border rounded-2xl p-5 h-[440px] hover:shadow-xl transition-all duration-300 hover:border-primary/20 relative overflow-visible hover:-translate-y-1 hover:scale-105 transform-gpu flex flex-col justify-between" style={{ transformOrigin: 'center center' }}>
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Header Section - Fixed height */}
                        <div className="flex-shrink-0">
                          <Quote className="h-8 w-8 text-primary/30 mb-4" aria-hidden="true" />
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                            ))}
                          </div>
                        </div>

                        {/* Content Section - Flex grow with fixed heights */}
                        <div className="flex-grow flex flex-col justify-between">
                          {/* Content text with improved overflow handling */}
                          <blockquote className="text-muted-foreground leading-relaxed text-sm line-clamp-7 h-[140px] mb-4 overflow-hidden">
                            &ldquo;{testimonial.content}&rdquo;
                          </blockquote>

                          {/* Achievement Badge - Always reserve space */}
                          <div className="h-[40px] mb-4 flex items-center">
                            {testimonial.achievement ? (
                              <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg w-[238px]">
                                <span className="text-sm font-medium text-success">
                                  {testimonial.achievement}
                                </span>
                              </div>
                            ) : (
                              <div className="h-[40px] w-[238px]"></div>
                            )}
                          </div>

                          {/* Study Time & Improvement - Fixed height */}
                          <div className="h-[20px] mb-4 flex items-center">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                          </div>
                        </div>

                        {/* Footer Section - Fixed height */}
                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-4">
                            <TestimonialAvatar
                              src={testimonial.avatar}
                              alt={`Avatar của ${testimonial.name}`}
                              name={testimonial.name}
                              size="md"
                              showBorder={true}
                            />
                            <div>
                              <div className="font-semibold text-foreground">
                                {testimonial.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {testimonial.role}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {testimonial.school}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
               ))}
              </div>
            </div>

            {/* Scroll indicators */}
            <motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ScrollIndicators
                totalItems={testimonialsData.length}
                currentIndex={Math.max(0, Math.min(currentTextIndex, testimonialsData.length - 1))}
                visibleItems={1}
                variant="minimal"
                color="primary"
                className=""
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Section - Hàng 3 - Sử dụng Grid Layout 4 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Thống kê ấn tượng
            </h3>
            <p className="text-muted-foreground text-base">
              Những con số chứng minh hiệu quả học tập với NyNus
            </p>
          </div>

          {/* Grid Layout 4 columns cho stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-300 mb-2 group-hover:text-gray-200 transition-colors">
                {testimonialsStats.totalStudents.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-sm md:text-base flex items-center justify-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                Học viên tin tưởng
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-300 mb-2 group-hover:text-gray-200 transition-colors">
                {testimonialsStats.averageRating}/5
              </div>
              <div className="text-gray-400 text-sm md:text-base flex items-center justify-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Đánh giá trung bình
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-300 mb-2 group-hover:text-gray-200 transition-colors">
                {testimonialsStats.improvementRate}%
              </div>
              <div className="text-gray-400 text-sm md:text-base flex items-center justify-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                Cải thiện điểm số
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-300 mb-2 group-hover:text-gray-200 transition-colors">
                {testimonialsStats.totalStudyTime}
              </div>
              <div className="text-gray-400 text-sm md:text-base flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                Tổng thời gian học
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="relative h-20 flex items-center justify-center">
        <ScrollIndicator targetSectionId="faq-section" />
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        videoData={selectedVideo}
      />
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
        }

        /* Navigation arrows styling */
        .testimonial-nav-left button,
        .testimonial-nav-right button {
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          opacity: 0.6;
          pointer-events: auto;
        }

        .testimonial-nav-left button:hover,
        .testimonial-nav-right button:hover {
          opacity: 1;
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
          background-color: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .testimonial-nav-left button:focus-visible,
        .testimonial-nav-right button:focus-visible {
          opacity: 1;
          outline: none;
          ring: 2px;
          ring-color: white;
          ring-offset: 2px;
          ring-offset-color: var(--background);
        }

        .testimonial-nav-left button:active,
        .testimonial-nav-right button:active {
          transform: scale(0.95);
        }

         

         /* Card hover effects */
         .group:hover {
           z-index: 50;
         }

         /* Hide scrollbar */
         .scrollbar-hide {
           -ms-overflow-style: none;
           scrollbar-width: none;
         }
         
         .scrollbar-hide::-webkit-scrollbar {
           display: none;
         }

         /* Text overflow handling */
         .line-clamp-7 {
           display: -webkit-box;
           -webkit-line-clamp: 7;
           -webkit-box-orient: vertical;
           overflow: hidden;
           text-overflow: ellipsis;
         }

         /* Responsive adjustments */
         @media (max-width: 768px) {
           .testimonial-nav-left,
           .testimonial-nav-right {
             display: none;
           }
         }

         @media (max-width: 480px) {
           .testimonial-nav-left,
           .testimonial-nav-right {
             display: none;
           }
         }
      `}</style>
    </section>
  );
};

export default Testimonials;
