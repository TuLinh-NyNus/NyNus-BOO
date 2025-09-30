'use client';

import { motion } from "framer-motion";

import { MockTutorial } from "@/lib/mockdata/courses/courses-types";
import { cn } from "@/lib/utils";

import { LessonItem } from "./lesson-item";

interface LessonsGridProps {
  lessons: MockTutorial[];
  className?: string;
}

/**
 * LessonsGrid Component
 * Hiển thị grid các bài học trong course card
 * Tương thích 100% với dự án cũ
 */
export function LessonsGrid({ lessons, className }: LessonsGridProps): JSX.Element {
  // Limit to 9 lessons for 3x3 grid
  const displayLessons = lessons.slice(0, 9);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header - Only show lesson count */}
      <div className="flex items-center justify-end">
        <span className="text-purple-200 text-sm">
          {displayLessons.length} bài giảng
        </span>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayLessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <LessonItem lesson={lesson} index={index + 1} />
          </motion.div>
        ))}
        
        {/* Fill empty slots if less than 9 lessons - only show one "Coming Soon" */}
        {displayLessons.length < 9 && (
          <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-white/30 text-sm">Sắp ra mắt</span>
          </div>
        )}
      </div>

      {/* View More Button */}
      {lessons.length > 9 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-4"
        >
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 text-white hover:bg-white/10 transition-all duration-300">
            📚 Xem thêm bài giảng
          </button>
        </motion.div>
      )}
    </div>
  );
}

/**
 * LessonsGridSkeleton Component
 * Loading state cho lessons grid
 */
export function LessonsGridSkeleton({ className, count = 9 }: { className?: string; count?: number }): JSX.Element {
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      {/* Header Skeleton - Only lesson count */}
      <div className="flex items-center justify-end">
        <div className="h-4 bg-white/10 rounded w-20" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="w-8 h-8 bg-white/10 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-white/10 rounded w-16" />
              <div className="h-5 bg-white/10 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
