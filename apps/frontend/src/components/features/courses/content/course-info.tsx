'use client';

import { Star, Play, FileText, Video } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/form/button";
import { Progress } from "@/components/ui/display/progress";
import { Badge } from "@/components/ui/display/badge";
import { MockCourse } from "@/lib/mockdata/courses/courses-types";
import { cn } from "@/lib/utils";

interface CourseInfoProps {
  course: MockCourse;
  className?: string;
}

/**
 * CourseInfo Component
 * Hiển thị thông tin chi tiết khóa học trong course card
 * Tương thích 100% với dự án cũ
 */
export function CourseInfo({ course, className }: CourseInfoProps): JSX.Element {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Course Title */}
      <div className="space-y-2">
        <h1 className="text-xl lg:text-2xl font-bold text-white leading-tight">
          {course.title}
        </h1>
        <p className="text-sm text-purple-200 leading-relaxed line-clamp-3">
          {course.description}
        </p>
      </div>

      {/* Course Metadata */}
      <div className="space-y-3">
        {/* Free Lessons Count */}
        <div className="flex items-center gap-2 text-sm text-white">
          <FileText className="w-4 h-4" />
          <span>{course.totalLessons} bài học</span>
        </div>

        {/* Content Types */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-white">
            <Video className="w-4 h-4" />
            <span>Video, PDF, files</span>
          </div>
          {course.featured && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
              PRO
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-200">Tiến độ</span>
          <span className="text-white font-medium">{course.progress}%</span>
        </div>
        <Progress value={course.progress} className="h-2 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${course.progress}%` }}
          />
        </Progress>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{course.students.toLocaleString()}</div>
          <div className="text-xs text-purple-200">học sinh</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{course.duration}</div>
          <div className="text-xs text-purple-200">thời lượng</div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < Math.floor(course.rating) 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-400"
            )}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-white">{course.rating}</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link href={course.href} className="block">
          <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
            <Play className="w-4 h-4 mr-2" />
            Bắt đầu học
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          className="w-full border-white/30 text-white hover:bg-white/10 hover:border-white/50"
        >
          Xem chi tiết
        </Button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {course.tags.slice(0, 3).map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className="border-white/30 text-white/80 hover:bg-white/10 text-xs"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * CourseInfoSkeleton Component
 * Loading state cho course info
 */
export function CourseInfoSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      <div className="space-y-2">
        <div className="h-6 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-2 bg-white/10 rounded w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-8 bg-white/10 rounded" />
        <div className="h-8 bg-white/10 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-10 bg-white/10 rounded" />
        <div className="h-10 bg-white/10 rounded" />
      </div>
    </div>
  );
}
