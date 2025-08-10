"use client";

import { ChevronLeft, ChevronRight, Clock, Users, Star, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAnalytics } from "@/lib/analytics";
import { useState, useRef } from "react";

// Import mockdata and UI components
import { featuredCourses, getGradient, type FeaturedCourse } from "@/lib/mockdata";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollIndicator from "@/components/ui/scroll-indicator";

const CourseCard = ({ course }: { course: FeaturedCourse }) => {
  const gradient = getGradient(course.color);
  const analytics = useAnalytics();

  return (
    <Link
      href={`/courses/${course.id}`}
      className="block relative h-full backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={() => {
        analytics.courseClick(course.id, course.title, 'featured_courses_section');
      }}
    >
      {/* Background using semantic colors */}
      <div className="absolute inset-0 bg-card border border-border transition-colors duration-300"></div>

      <div className="relative">
        <div className="h-40 bg-muted relative overflow-hidden transition-colors duration-300">
          {/* Course Image */}
          <Image
            src={course.image}
            alt={course.title}
            width={400}
            height={160}
            priority={course.id === "1" || course.id === "2"} // Priority cho 2 courses đầu
            className="object-cover w-full h-full"
            onError={(e) => {
              // Fallback to gradient placeholder if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />

          {/* Fallback gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`}></div>

          {/* Fallback icon - only show if image fails */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-white">{course.rating}</span>
          </div>

          <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-white">{course.level}</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg text-card-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">{course.title}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 transition-colors duration-300">{course.description}</p>

          <div className="flex items-center text-xs text-muted-foreground mb-5 transition-colors duration-300">
            <div className="flex items-center mr-4">
              <Users className="h-3 w-3 mr-1" />
              <span>{course.students} học sinh</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{course.duration} giờ</span>
            </div>
          </div>

          <button
            className="w-full py-2.5 text-center rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevent outer Link click
              window.location.href = `/khoa-hoc/${course.id}`;
            }}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </Link>
  );
};

const FeaturedCourses = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isLoading] = useState(false); // Mock loading state
  const [error] = useState(null); // Mock error state

  const checkScrollable = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount;

      containerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // Kiểm tra lại sau khi cuộn
      setTimeout(checkScrollable, 300);
    }
  };

  return (
    <section id="featured-courses-section" className="py-24 relative min-h-screen" style={{ backgroundColor: '#1F1F47' }}>


      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 text-secondary backdrop-blur-sm mb-4 transition-colors duration-300">
              <BookOpen className="h-4 w-4 mr-2" /> Khóa học nổi bật
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground transition-colors duration-300">
              Học tập theo cấp độ
            </h2>
            <p className="text-muted-foreground max-w-xl transition-colors duration-300">
              Lựa chọn khóa học phù hợp với trình độ và mục tiêu của bạn từ lớp 9 đến lớp 12
            </p>
          </div>

          <div className="flex gap-2 mt-6 md:mt-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-3 rounded-full bg-card border border-border hover:bg-muted text-foreground transition-all disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Trước"
            >
              <ChevronLeft className="h-5 w-5 text-foreground transition-colors duration-300" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-3 rounded-full bg-card border border-border hover:bg-muted text-foreground transition-all disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Sau"
            >
              <ChevronRight className="h-5 w-5 text-foreground transition-colors duration-300" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[60%] md:auto-cols-[45%] lg:auto-cols-[30%] gap-5 overflow-x-auto pb-8 hide-scrollbar snap-x"
          onScroll={checkScrollable}
        >
          {isLoading ? (
            // Hiển thị skeleton khi đang tải dữ liệu - NyNus semantic colors
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="snap-start h-full">
                <div className="relative h-full backdrop-blur-sm rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-card border border-border dark:bg-slate-800/70 dark:border-slate-700/50 transition-colors duration-300"></div>
                  <div className="relative">
                    <Skeleton className="h-40 w-full bg-muted dark:bg-slate-700/50 transition-colors duration-300" />
                    <div className="p-5">
                      <Skeleton className="h-6 w-3/4 bg-muted dark:bg-slate-700/50 mb-2 transition-colors duration-300" />
                      <Skeleton className="h-4 w-full bg-muted dark:bg-slate-700/50 mb-2 transition-colors duration-300" />
                      <Skeleton className="h-4 w-2/3 bg-muted dark:bg-slate-700/50 mb-4 transition-colors duration-300" />
                      <Skeleton className="h-8 w-full bg-muted dark:bg-slate-700/50 mt-8 transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Hiển thị thông báo lỗi - NyNus semantic colors
            <div className="col-span-full text-center py-10">
              <p className="text-destructive dark:text-red-400 transition-colors duration-300">Không thể tải khóa học. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            // Hiển thị danh sách khóa học
            featuredCourses.map(course => (
              <div key={course.id} className="snap-start h-full">
                <CourseCard course={course} />
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href="/khoa-hoc"
            className="inline-flex items-center text-foreground font-medium px-6 py-3 rounded-full bg-card border border-border hover:bg-muted transition-all duration-200"
          >
            Xem tất cả khóa học <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator targetSectionId="faq-section" />
    </section>
  );
};

export default FeaturedCourses;
