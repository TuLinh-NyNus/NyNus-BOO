"use client";

import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

// Import components đã tách
import CourseCardSkeleton from "./course-card/course-card-skeleton";
import { homepageFeaturedCourses, type FeaturedCourse } from "@/lib/mockdata";

// Type definitions
type Palette = {
  star: string;
  starFill: string;
  levelBg: string;
  levelBorder: string;
  levelText: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  hoverShadow: string;
};

// Color theme helpers for per-card accents
function getPalette(color?: string) {
  const palette = {
    orange: {
      star: "text-amber-300",
      starFill: "fill-amber-300",
      levelBg: "bg-amber-500/15",
      levelBorder: "border-amber-400/30",
      levelText: "text-amber-300",
      chipBg: "bg-amber-400/15",
      chipBorder: "border-amber-400/25",
      chipText: "text-amber-200",
      hoverShadow: "hover:shadow-amber-300/20"
    },
    green: {
      star: "text-emerald-300",
      starFill: "fill-emerald-300",
      levelBg: "bg-emerald-500/15",
      levelBorder: "border-emerald-400/30",
      levelText: "text-emerald-300",
      chipBg: "bg-emerald-400/15",
      chipBorder: "border-emerald-400/25",
      chipText: "text-emerald-200",
      hoverShadow: "hover:shadow-emerald-300/20"
    },
    indigo: {
      star: "text-indigo-300",
      starFill: "fill-indigo-300",
      levelBg: "bg-indigo-500/15",
      levelBorder: "border-indigo-400/30",
      levelText: "text-indigo-300",
      chipBg: "bg-indigo-400/15",
      chipBorder: "border-indigo-400/25",
      chipText: "text-indigo-200",
      hoverShadow: "hover:shadow-indigo-300/20"
    },
    purple: {
      star: "text-purple-300",
      starFill: "fill-purple-300",
      levelBg: "bg-purple-500/15",
      levelBorder: "border-purple-400/30",
      levelText: "text-purple-300",
      chipBg: "bg-purple-400/15",
      chipBorder: "border-purple-400/25",
      chipText: "text-purple-200",
      hoverShadow: "hover:shadow-purple-300/20"
    },
    blue: {
      star: "text-blue-300",
      starFill: "fill-blue-300",
      levelBg: "bg-blue-500/15",
      levelBorder: "border-blue-400/30",
      levelText: "text-blue-300",
      chipBg: "bg-blue-400/15",
      chipBorder: "border-blue-400/25",
      chipText: "text-blue-200",
      hoverShadow: "hover:shadow-blue-300/20"
    }
  } as const;
  return (palette as Record<string, Palette>)[color || "blue"] || palette.blue;
}

function getChipPalette(color?: string) {
  switch (color) {
    case "amber":
      return { bg: "bg-amber-400/15", border: "border-amber-400/25", text: "text-amber-300" };
    case "emerald":
      return { bg: "bg-emerald-400/15", border: "border-emerald-400/25", text: "text-emerald-300" };
    case "indigo":
      return { bg: "bg-indigo-400/15", border: "border-indigo-400/25", text: "text-indigo-300" };
    case "purple":
      return { bg: "bg-purple-400/15", border: "border-purple-400/25", text: "text-purple-300" };
    default:
      return { bg: "bg-white/10", border: "border-white/20", text: "text-foreground/95" };
  }
}

// Local CourseCard to avoid module resolution issues
const CourseCard = ({ course }: { course: FeaturedCourse }) => {
  const theme = getPalette((course as FeaturedCourse & { color?: string }).color);
  return (
    <div className={`relative h-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl ${theme.hoverShadow}`}>
      <div className="relative h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 bg-black/5" />
        <div className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-full ${theme.levelBg} ${theme.levelBorder} ${theme.levelText} backdrop-blur-sm border`}>
          {course.level}
        </div>
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 ${theme.star} text-xs font-medium`}>
          {/* simple star */}
          <svg viewBox="0 0 24 24" width="14" height="14" className={theme.starFill}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          {course.rating || 0}
        </div>
      </div>
      <div className="p-5 flex flex-col h-full">
        <h3 className="text-foreground font-semibold text-base leading-tight mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-foreground/80 text-sm leading-relaxed mb-3 line-clamp-3">{course.description}</p>
        {course.topics && course.topics.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {course.topics.slice(0, 3).map((topic, idx) => {
              const chip = getChipPalette(topic.badgeColor);
              return (
                <span
                  key={`${course.id}-topic-${idx}`}
                  className={`px-2 py-1 rounded-md border text-[10px] font-medium ${chip.text} ${chip.bg} ${chip.border} hover:bg-white/12 transition-colors`}
                >
                  {topic.label}
                </span>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-4 text-xs text-foreground/80 mb-4">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-white/60" />
            <span>{course.students ? course.students.toLocaleString() : '0'} học viên</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-white/60" />
            <span>{course.duration || 0} giờ</span>
          </div>
        </div>
        <div className="mt-auto">
          <Link href={`/courses/${course.id}`} className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted border border-border text-foreground text-sm font-medium transition-colors">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeaturedCourses = () => {
  const [isLoading] = useState(false); // Mock loading state
  const [error] = useState(null); // Mock error state

  return (
    <section id="featured-courses-section" className="py-20 relative min-h-screen bg-background">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400 to-blue-600 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container px-4 mx-auto relative z-10 pt-10">
        {/* Centered Header Section (synced with Features) */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          {/* Enhanced Badge (new style) */}
          <motion.div
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-emerald-500/15 border border-gradient-to-r from-blue-400/40 via-purple-400/40 to-emerald-400/40 text-blue-300 backdrop-blur-sm mb-6 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: `linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(16, 185, 129, 0.15) 100%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`
            }}
          >
            {/* Background pattern */}
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

            {/* Icon with glow */}
            <div className="relative z-10 mr-2">
              <div className="relative">
                <BookOpen className="h-5 w-5 text-blue-300" />
                <div className="absolute inset-0 h-5 w-5 bg-blue-300 rounded-full opacity-20 blur-sm"></div>
              </div>
            </div>

            <span className="font-semibold text-blue-300 text-base tracking-wide relative z-10">
              Khóa học nổi bật
            </span>

            {/* Border glow */}
            <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {/* Shine */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
          </motion.div>
          
          {/* Title (synced with Features) */}
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-relaxed py-2"
          >
            Học tập theo cấp độ
          </h2>
          
          {/* Subtitle (synced with Features) */}
          <p className="text-foreground/95 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Lựa chọn khóa học phù hợp với trình độ và mục tiêu của bạn từ lớp 9 đến lớp 12
          </p>
        </div>

        {/* Enhanced Grid Layout - 4 cards với kích thước lớn hơn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {isLoading ? (
            // Enhanced Skeleton Loading - Chỉ 4 skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="h-full">
                <CourseCardSkeleton />
              </div>
            ))
          ) : error ? (
            // Enhanced Error State
            <div className="col-span-full text-center py-16">
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-red-400 text-lg font-medium">
                  Không thể tải khóa học. Vui lòng thử lại sau.
                </p>
              </div>
            </div>
          ) : (
            // Enhanced Course List - Chỉ 4 courses
            homepageFeaturedCourses.slice(0, 4).map((course: FeaturedCourse) => (
              <div key={course.id} className="h-full">
                <CourseCard course={course} />
              </div>
            ))
          )}
        </div>

        {/* Enhanced Call to Action */}
        <div className="flex justify-center mt-10">
          <Link
            href="/courses"
            className="group inline-flex items-center text-white font-semibold px-8 py-4 rounded-2xl bg-gradient-to-r from-white/20 via-white/15 to-white/10 backdrop-blur-md border border-white/30 hover:from-white/30 hover:via-white/25 hover:to-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/25"
          >
            <span className="mr-3">Xem tất cả khóa học</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>


      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
        }
      `}</style>
    </section>
  );
};

export default FeaturedCourses;
