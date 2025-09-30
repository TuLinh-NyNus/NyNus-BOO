'use client';

import { motion } from "framer-motion";
import { Clock, Users, Star, BookOpen, Play, FileText, Video } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/form/button";
import { Progress } from "@/components/ui/display/progress";
import { MockCourse } from "@/lib/mockdata/courses/courses-types";
import { cn } from "@/lib/utils";

interface FeaturedCourseCardProps {
  course: MockCourse;
  className?: string;
  showProgress?: boolean;
}

/**
 * FeaturedCourseCard Component
 * Card đặc biệt cho khóa học nổi bật với styling premium
 * Tương thích 100% với dự án cũ
 */
export function FeaturedCourseCard({ course, className, showProgress = true }: FeaturedCourseCardProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-muted to-card border border-border shadow-2xl",
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-5" />
      
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/5 to-transparent" />

      {/* Content */}
      <div className="relative p-8">
        {/* Course image/icon */}
        <div className="mb-6">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Course title */}
        <h3 className="text-2xl font-bold text-foreground mb-3 leading-tight">
          {course.title}
        </h3>

        {/* Course description */}
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-3">
          {course.description}
        </p>

        {/* Course stats */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-muted-foreground text-sm">
            <FileText className="w-4 h-4 mr-2" />
            <span>{course.totalLessons} bài học</span>
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <Video className="w-4 h-4 mr-2" />
            <span>Video, PDF, files</span>
            {course.featured && (
              <span className="ml-auto bg-accent/20 text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                PRO
              </span>
            )}
          </div>
        </div>

        {/* Progress section */}
        {showProgress && course.progress > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Tiến độ</span>
              <span className="text-foreground text-sm font-medium">{course.progress}%</span>
            </div>
            <Progress 
              value={course.progress} 
              className="h-2 bg-muted"
            />
          </div>
        )}

        {/* Course metadata */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Users className="w-4 h-4 mr-1" />
            </div>
            <div className="text-foreground text-sm font-medium">{course.students.toLocaleString()}</div>
            <div className="text-muted-foreground text-xs">học sinh</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Clock className="w-4 h-4 mr-1" />
            </div>
            <div className="text-foreground text-sm font-medium">{course.duration}</div>
            <div className="text-muted-foreground text-xs">thời lượng</div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(course.rating)
                    ? 'text-badge-warning fill-current'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
            <span className="text-foreground text-sm font-medium ml-2">
              {course.rating}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link href={course.href} className="block">
            <Button className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent/25">
              <Play className="w-4 h-4 mr-2" />
              {course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border py-3 rounded-xl transition-all duration-300"
          >
            Xem chi tiết
          </Button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {course.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
    </motion.div>
  );
}

/**
 * CompactFeaturedCourseCard Component
 * Phiên bản compact cho không gian nhỏ
 */
export function CompactFeaturedCourseCard({ course, className }: Omit<FeaturedCourseCardProps, 'showProgress'>): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted border border-border shadow-xl",
        className
      )}
    >
      <div className="relative p-6">
        {/* Course icon */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-foreground line-clamp-1">
              {course.title}
            </h4>
            <p className="text-muted-foreground text-sm">{course.instructor}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
            <span>{course.rating}</span>
          </div>
        </div>

        {/* Action button */}
        <Link href={course.href}>
          <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg">
            Xem khóa học
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

/**
 * FeaturedCourseCardSkeleton Component
 * Loading state cho featured course card
 */
export function FeaturedCourseCardSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl bg-slate-800/50 border border-slate-700/50",
      className
    )}>
      <div className="p-8">
        {/* Icon skeleton */}
        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 animate-pulse mb-6" />
        
        {/* Title skeleton */}
        <div className="h-8 bg-slate-700/50 rounded mb-3 animate-pulse" />
        <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-6 animate-pulse" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-slate-700/40 rounded animate-pulse" />
          <div className="h-4 bg-slate-700/40 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-slate-700/40 rounded w-4/6 animate-pulse" />
        </div>
        
        {/* Stats skeleton */}
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-slate-700/40 rounded w-32 animate-pulse" />
          <div className="h-4 bg-slate-700/40 rounded w-28 animate-pulse" />
        </div>
        
        {/* Progress skeleton */}
        <div className="mb-6">
          <div className="h-2 bg-slate-700/40 rounded animate-pulse" />
        </div>
        
        {/* Metadata skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="h-4 bg-slate-700/40 rounded w-12 mx-auto mb-1 animate-pulse" />
            <div className="h-3 bg-slate-700/30 rounded w-16 mx-auto animate-pulse" />
          </div>
          <div className="text-center">
            <div className="h-4 bg-slate-700/40 rounded w-12 mx-auto mb-1 animate-pulse" />
            <div className="h-3 bg-slate-700/30 rounded w-16 mx-auto animate-pulse" />
          </div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="space-y-3">
          <div className="h-12 bg-slate-700/40 rounded-xl animate-pulse" />
          <div className="h-12 bg-slate-700/30 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
