'use client';

import { motion } from "framer-motion";

import { MockCourse, MockTutorial } from "@/lib/mockdata/courses-types";
import { cn } from "@/lib/utils";

import { CourseInfo } from "../content/course-info";
import { LessonsGrid } from "../content/lessons-grid";

interface CourseCardProps {
  course: MockCourse;
  lessons: MockTutorial[];
  className?: string;
  index?: number;
}

/**
 * CourseCard Component
 * Card hiển thị thông tin khóa học với layout 30%-70%
 * Tương thích 100% với dự án cũ
 */
export function CourseCard({ course, lessons, className, index = 0 }: CourseCardProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-3xl backdrop-blur-sm",
        "hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300",
        className
      )}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/5 to-transparent pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative p-6 lg:p-8">
        {/* Desktop Layout: 30% - 70% */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Course Info - Left Side (30% on desktop) with darker background */}
          <div className="lg:w-[30%] flex-shrink-0 rounded-2xl p-6 bg-gradient-to-br from-card/60 to-muted/80 backdrop-blur-sm transition-all duration-300">
            <CourseInfo course={course} />
          </div>

          {/* Lessons Grid - Right Side (70% on desktop) */}
          <div className="lg:w-[70%] flex-grow">
            <LessonsGrid lessons={lessons} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * CourseCardSkeleton Component
 * Loading state cho course card
 */
export function CourseCardSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl bg-card/40 backdrop-blur-sm border border-border animate-pulse",
      className
    )}>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Course Info Skeleton */}
          <div className="lg:w-[30%] flex-shrink-0 space-y-4">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-6 bg-muted/20 rounded w-3/4" />
              <div className="h-4 bg-muted/20 rounded w-full" />
              <div className="h-4 bg-muted/20 rounded w-2/3" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/20 rounded w-1/2" />
              <div className="h-2 bg-muted/20 rounded w-full" />
            </div>
          </div>
          
          {/* Lessons Grid Skeleton */}
          <div className="lg:w-[70%] flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-muted/10 rounded-xl p-4 space-y-2">
                  <div className="w-8 h-8 bg-muted/20 rounded-full" />
                  <div className="h-4 bg-muted/20 rounded w-3/4" />
                  <div className="h-3 bg-muted/20 rounded w-full" />
                  <div className="h-3 bg-muted/20 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
