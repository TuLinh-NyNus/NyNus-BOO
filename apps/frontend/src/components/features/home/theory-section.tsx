/**
 * Theory Section Component
 * Showcase theory content trên homepage với featured content và quick access
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Users, 
  Star,
  ChevronRight,
  GraduationCap,
  Calculator,
  Brain,
  Target
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ===== INTERFACES =====

interface TheoryChapter {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  readTime: number;
  studentsCount: number;
  rating: number;
  isPopular: boolean;
  href: string;
  icon: React.ReactNode;
  color: string;
}

interface TheoryStats {
  totalChapters: number;
  totalStudents: number;
  averageRating: number;
  completionRate: number;
}

// ===== MOCK DATA =====

const FEATURED_CHAPTERS: TheoryChapter[] = [
  {
    id: '1',
    title: 'Hàm số và Đồ thị',
    description: 'Khám phá thế giới hàm số với các khái niệm cơ bản và ứng dụng thực tế',
    grade: 'Lớp 10',
    subject: 'Đại số',
    readTime: 15,
    studentsCount: 1250,
    rating: 4.8,
    isPopular: true,
    href: '/theory/grade-10/functions',
    icon: <Calculator className="h-5 w-5" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '2',
    title: 'Phương trình Lượng giác',
    description: 'Nắm vững các phương pháp giải phương trình lượng giác cơ bản và nâng cao',
    grade: 'Lớp 11',
    subject: 'Lượng giác',
    readTime: 20,
    studentsCount: 980,
    rating: 4.7,
    isPopular: true,
    href: '/theory/grade-11/trigonometry',
    icon: <Brain className="h-5 w-5" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '3',
    title: 'Tích phân và Ứng dụng',
    description: 'Học cách tính tích phân và ứng dụng trong việc tính diện tích, thể tích',
    grade: 'Lớp 12',
    subject: 'Giải tích',
    readTime: 25,
    studentsCount: 750,
    rating: 4.9,
    isPopular: false,
    href: '/theory/grade-12/integration',
    icon: <Target className="h-5 w-5" />,
    color: 'from-green-500 to-emerald-500'
  }
];

const THEORY_STATS: TheoryStats = {
  totalChapters: 156,
  totalStudents: 3200,
  averageRating: 4.7,
  completionRate: 85
};

const QUICK_ACCESS_LINKS = [
  { title: 'Lớp 10', href: '/theory/grade-10', count: 18 },
  { title: 'Lớp 11', href: '/theory/grade-11', count: 0 },
  { title: 'Lớp 12', href: '/theory/grade-12', count: 0 }
];

// ===== UTILITY FUNCTIONS =====

/**
 * Format số lượng học viên
 */
function formatStudentCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/**
 * Format thời gian đọc
 */
function formatReadTime(minutes: number): string {
  return `${minutes} phút`;
}

// ===== MAIN COMPONENT =====

/**
 * Theory Section Component
 * Hiển thị featured theory content và quick access links
 */
export function TheorySection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              <BookOpen className="h-4 w-4 mr-2" />
              Thư viện Lý thuyết
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Khám phá{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lý thuyết Toán học
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Hệ thống lý thuyết toán học hoàn chỉnh với LaTeX rendering chất lượng cao, 
              giúp bạn nắm vững kiến thức từ cơ bản đến nâng cao.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{THEORY_STATS.totalChapters}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Chương lý thuyết</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatStudentCount(THEORY_STATS.totalStudents)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Học viên</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{THEORY_STATS.averageRating}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Đánh giá trung bình</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{THEORY_STATS.completionRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ hoàn thành</div>
            </div>
          </motion.div>
        </div>

        {/* Featured Chapters */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Chương nổi bật
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CHAPTERS.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Chapter Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${chapter.color} text-white`}>
                        {chapter.icon}
                      </div>
                      {chapter.isPopular && (
                        <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-200">
                          <Star className="h-3 w-3 mr-1" />
                          Phổ biến
                        </Badge>
                      )}
                    </div>

                    {/* Chapter Info */}
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                        {chapter.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {chapter.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {chapter.grade}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatReadTime(chapter.readTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {formatStudentCount(chapter.studentsCount)}
                        </span>
                      </div>
                    </div>

                    {/* Chapter Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {chapter.rating}
                        </span>
                      </div>
                      
                      <Link href={chapter.href}>
                        <Button variant="ghost" size="sm" className="group/btn">
                          Học ngay
                          <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Truy cập nhanh
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_ACCESS_LINKS.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={link.href}>
                  <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0">
                    <CardContent className="p-6 text-center">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {link.count} chương lý thuyết
                      </p>
                      <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium">Khám phá</span>
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link href="/theory">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              <BookOpen className="h-5 w-5 mr-2" />
              Khám phá toàn bộ thư viện
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default TheorySection;
