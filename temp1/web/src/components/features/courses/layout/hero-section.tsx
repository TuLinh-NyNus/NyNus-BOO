'use client';

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

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
            Toán học THPT
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
            và lộ trình rõ ràng cho lớp 10, 11, 12
          </motion.p>




        </div>
      </div>
    </section>
  );
}

// Simplified version for smaller spaces
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
      </div>
    </section>
  );
}
