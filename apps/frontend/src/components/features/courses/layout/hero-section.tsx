'use client';

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Award } from "lucide-react";

import { Button } from "@/components/ui/form/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

/**
 * HeroSection Component
 * Hero section chính cho courses page
 * Tương thích 100% với dự án cũ
 */
export function HeroSection({ className }: HeroSectionProps): JSX.Element {
  return (
    <section className={cn(
      "relative overflow-hidden py-12 sm:py-16 lg:py-20 xl:py-24",
      className
    )}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4 sm:px-0"
          >
            TOÁN HỌC
            <br className="hidden sm:block" />
            <span className="sm:block">
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                từ cơ bản đến nâng cao
              </span>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
          >
            Học Toán hiệu quả với phương pháp giảng dạy hiện đại, bài tập phong phú
            và lộ trình rõ ràng cho học sinh phổ thông từ lớp 6 đến lớp 12
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Bắt đầu học ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              Xem demo khóa học
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                <BookOpen className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">100+</div>
              <div className="text-purple-200 text-sm sm:text-base">Bài học chất lượng</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                <Users className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">0+</div>
              <div className="text-purple-200 text-sm sm:text-base">Học sinh tin tưởng</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                <Award className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">0%</div>
              <div className="text-purple-200 text-sm sm:text-base">Tỷ lệ đậu THPT QG</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * CompactHeroSection Component
 * Phiên bản compact cho không gian nhỏ
 */
export function CompactHeroSection({ className }: HeroSectionProps): JSX.Element {
  return (
    <section className={cn(
      "relative overflow-hidden py-12",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-4"
        >
          Khám phá hướng dẫn
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-purple-100 mb-6"
        >
          Bài hướng dẫn chi tiết từ cơ bản đến nâng cao
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            Xem tất cả
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * HeroSectionSkeleton Component
 * Loading state cho hero section
 */
export function HeroSectionSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <section className={cn(
      "relative overflow-hidden py-12 sm:py-16 lg:py-20 xl:py-24",
      className
    )}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-pulse">
          {/* Title skeleton */}
          <div className="h-12 sm:h-16 lg:h-20 bg-white/10 rounded-lg mb-6 max-w-4xl mx-auto" />
          
          {/* Description skeleton */}
          <div className="space-y-3 mb-8 max-w-3xl mx-auto">
            <div className="h-6 bg-white/10 rounded" />
            <div className="h-6 bg-white/10 rounded w-3/4 mx-auto" />
          </div>

          {/* Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="h-14 w-48 bg-white/10 rounded-xl" />
            <div className="h-14 w-48 bg-white/10 rounded-xl" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10" />
                <div className="h-8 bg-white/10 rounded mb-2 w-20 mx-auto" />
                <div className="h-4 bg-white/10 rounded w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
