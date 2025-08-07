'use client';

import { motion } from "framer-motion";
import { BookOpen, Calculator, Beaker, Globe, Palette, Music } from "lucide-react";

import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  courseCount: number;
  color: string;
  bgColor: string;
}

interface CategoriesProps {
  className?: string;
}

// Categories data
const categories: Category[] = [
  {
    id: 'math',
    name: 'Toán học',
    description: 'Từ cơ bản đến nâng cao, phù hợp mọi cấp độ',
    icon: Calculator,
    courseCount: 24,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'literature',
    name: 'Ngữ văn',
    description: 'Phát triển kỹ năng đọc hiểu và viết',
    icon: BookOpen,
    courseCount: 18,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'science',
    name: 'Khoa học',
    description: 'Vật lý, Hóa học, Sinh học',
    icon: Beaker,
    courseCount: 32,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'english',
    name: 'Tiếng Anh',
    description: 'Giao tiếp và luyện thi quốc tế',
    icon: Globe,
    courseCount: 15,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    id: 'art',
    name: 'Nghệ thuật',
    description: 'Âm nhạc, Mỹ thuật, Thiết kế',
    icon: Palette,
    courseCount: 12,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20'
  },
  {
    id: 'music',
    name: 'Âm nhạc',
    description: 'Lý thuyết và thực hành nhạc cụ',
    icon: Music,
    courseCount: 8,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  }
];

/**
 * Categories Component - Fixed Version
 * Hiển thị danh mục khóa học với card layout
 * Không có background riêng để tránh dải đen
 */
export function Categories({ className }: CategoriesProps): JSX.Element {
  return (
    <section className={cn("relative py-16 sm:py-24", className)}>
      {/* No background - using parent unified background */}
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
            Danh mục khóa học
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Khám phá các lĩnh vực học tập đa dạng
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-slate-700/50"
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 ${category.bgColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl`} />
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${category.bgColor} transition-all duration-300 group-hover:scale-110`}>
                    <IconComponent className={`w-8 h-8 ${category.color}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className={`text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-300 group-hover:${category.color.replace('dark:', '')}`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {category.description}
                  </p>
                  
                  {/* Course count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.courseCount} khóa học
                    </span>
                    <div className={`w-2 h-2 rounded-full ${category.color.includes('blue') ? 'bg-blue-500' : 
                      category.color.includes('green') ? 'bg-green-500' :
                      category.color.includes('purple') ? 'bg-purple-500' :
                      category.color.includes('orange') ? 'bg-orange-500' :
                      category.color.includes('pink') ? 'bg-pink-500' : 'bg-indigo-500'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                </div>

                {/* Hover shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * CategoriesSkeleton Component
 * Loading state cho categories
 */
export function CategoriesSkeleton({ className }: { className?: string }): JSX.Element {
  return (
    <section className={cn("relative py-16 sm:py-24", className)}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-pulse">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4 max-w-md mx-auto" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg max-w-2xl mx-auto" />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50">
                <div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-6" />
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20" />
                  <div className="h-2 w-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Export default for backward compatibility
export default Categories;
