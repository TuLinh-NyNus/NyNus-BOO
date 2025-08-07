'use client';

import { Clock, Play } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/display/badge";
import { MockTutorial } from "@/lib/mockdata/courses-types";
import { cn } from "@/lib/utils";

interface LessonItemProps {
  lesson: MockTutorial;
  index: number;
  className?: string;
}

/**
 * LessonItem Component
 * Hiển thị thông tin một bài học trong grid
 * Tương thích 100% với dự án cũ
 */
export function LessonItem({ lesson, index, className }: LessonItemProps): JSX.Element {
  return (
    <Link href={`/tutorials/${lesson.id}`} className="block group">
      <div className={cn(
        "relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10",
        "hover:bg-white/10 hover:border-white/20 transition-all duration-300",
        "hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20",
        "p-4 space-y-3 min-h-[140px] flex flex-col",
        className
      )}>
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Header with number and title on same line */}
        <div className="relative flex items-start gap-3">
          {/* Numbered Badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-sm flex-shrink-0">
            {index}
          </div>

          {/* Title and completion status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors">
                {lesson.title}
              </h3>

              {/* Completion Status */}
              {lesson.isCompleted && (
                <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0 mt-0.5" />
              )}
            </div>
          </div>

          {/* Play Button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="relative flex-1">
          <p className="text-xs text-purple-200/80 leading-relaxed line-clamp-2">
            {lesson.description}
          </p>
        </div>

        {/* Footer */}
        <div className="relative mt-auto space-y-2">
          {/* Duration */}
          <div className="flex items-center gap-1 text-xs text-purple-200/80">
            <Clock className="w-3 h-3" />
            <span>{lesson.duration}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {lesson.tags.slice(0, 2).map((tag, tagIndex) => (
              <Badge
                key={tagIndex}
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/10 text-xs px-2 py-0.5 h-auto"
              >
                {tag}
              </Badge>
            ))}
            {lesson.tags.length > 2 && (
              <Badge
                variant="outline"
                className="border-white/20 text-white/50 text-xs px-2 py-0.5 h-auto"
              >
                +{lesson.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </Link>
  );
}

/**
 * LessonItemSkeleton Component
 * Loading state cho lesson item
 */
export function LessonItemSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div className={cn(
      "bg-white/5 rounded-xl p-4 space-y-3 animate-pulse",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 bg-white/10 rounded-full" />
        <div className="w-3 h-3 bg-white/10 rounded-full" />
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
      
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-1/3" />
        <div className="flex gap-1">
          <div className="h-5 bg-white/10 rounded w-16" />
          <div className="h-5 bg-white/10 rounded w-12" />
        </div>
      </div>
    </div>
  );
}
