'use client';

import { motion } from "framer-motion";
import { Clock, Play, CheckCircle } from "lucide-react";
import Link from "next/link";

import { MockTutorial } from "@/lib/mockdata/courses/courses-types";
import { cn } from "@/lib/utils";

interface TutorialCardProps {
  tutorial: MockTutorial;
  index?: number;
  className?: string;
}

/**
 * TutorialCard Component
 * Card hiển thị thông tin tutorial/bài hướng dẫn
 * Tương thích 100% với dự án cũ
 */
export function TutorialCard({ tutorial, index = 0, className }: TutorialCardProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn("group relative", className)}
    >
      <Link href={`/tutorials/${tutorial.id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-white/10 dark:bg-slate-800/30 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 transition-all duration-300 hover:bg-white/20 dark:hover:bg-slate-800/50 hover:border-white/30 dark:hover:border-slate-600/50 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-slate-700/20 dark:to-transparent rounded-2xl" />
          
          {/* Number badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white font-bold text-sm shadow-lg">
              {tutorial.number}
            </div>
          </div>

          {/* Completion status */}
          {tutorial.isCompleted && (
            <div className="absolute top-4 right-4 z-10">
              <CheckCircle className="w-6 h-6 text-green-400 fill-current" />
            </div>
          )}

          {/* Content */}
          <div className="relative p-6 pt-16">
            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
              {tutorial.title}
            </h3>

            {/* Description */}
            <p className="text-slate-300 dark:text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
              {tutorial.description}
            </p>

            {/* Footer with duration and play button */}
            <div className="flex items-center justify-between">
              {/* Duration */}
              <div className="flex items-center text-slate-400 dark:text-slate-500 text-sm">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>{tutorial.duration}</span>
              </div>

              {/* Play button */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 group-hover:text-purple-300 transition-all duration-300">
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Tags */}
            {tutorial.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tutorial.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    {tag}
                  </span>
                ))}
                {tutorial.tags.length > 2 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
                    +{tutorial.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * TutorialGrid Component
 * Grid container cho tutorials
 */
interface TutorialGridProps {
  tutorials: MockTutorial[];
  className?: string;
  variant?: 'default' | 'compact';
}

export function TutorialGrid({ tutorials, className, variant = 'default' }: TutorialGridProps): JSX.Element {
  const gridClasses = variant === 'compact'
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

  return (
    <div className={cn(gridClasses, className)}>
      {tutorials.map((tutorial, index) => (
        <TutorialCard
          key={tutorial.id}
          tutorial={tutorial}
          index={index}
        />
      ))}
    </div>
  );
}

/**
 * TutorialCardSkeleton Component
 * Loading state cho tutorial card
 */
export function TutorialCardSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-white/10 dark:bg-slate-800/30 backdrop-blur-sm border border-white/20 dark:border-slate-700/50", className)}>
      <div className="p-6 pt-16">
        {/* Number badge skeleton */}
        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 dark:bg-slate-700/50 animate-pulse" />
        
        {/* Title skeleton */}
        <div className="h-6 bg-white/20 dark:bg-slate-700/50 rounded mb-3 animate-pulse" />
        <div className="h-6 bg-white/20 dark:bg-slate-700/50 rounded w-3/4 mb-4 animate-pulse" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-white/15 dark:bg-slate-700/40 rounded animate-pulse" />
          <div className="h-4 bg-white/15 dark:bg-slate-700/40 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-white/15 dark:bg-slate-700/40 rounded w-4/6 animate-pulse" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/15 dark:bg-slate-700/40 rounded w-16 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-white/15 dark:bg-slate-700/40 animate-pulse" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-1.5 mt-3">
          <div className="h-6 bg-white/15 dark:bg-slate-700/40 rounded-full w-12 animate-pulse" />
          <div className="h-6 bg-white/15 dark:bg-slate-700/40 rounded-full w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * TutorialGridSkeleton Component
 * Loading state cho tutorial grid
 */
export function TutorialGridSkeleton({ 
  count = 9, 
  className, 
  variant = 'default' 
}: { 
  count?: number; 
  className?: string; 
  variant?: 'default' | 'compact' 
}): JSX.Element {
  const gridClasses = variant === 'compact'
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

  return (
    <div className={cn(gridClasses, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <TutorialCardSkeleton key={index} />
      ))}
    </div>
  );
}
