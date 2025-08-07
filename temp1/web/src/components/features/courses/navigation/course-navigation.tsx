'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  PenTool, 
  MessageSquare, 
  BarChart3, 
  Star,
  FileText,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CourseNavigationProps {
  className?: string;
}

const navigationItems = [
  {
    label: 'Tổng quan',
    href: '',
    icon: Home,
    description: 'Thông tin khóa học'
  },
  {
    label: 'Học tập',
    href: '/lessons',
    icon: BookOpen,
    description: 'Bài học và video'
  },
  {
    label: 'Tài liệu',
    href: '/materials',
    icon: FileText,
    description: 'Tài liệu tham khảo'
  },
  {
    label: 'Bài tập',
    href: '/exercises',
    icon: PenTool,
    description: 'Bài tập và kiểm tra'
  },
  {
    label: 'Thảo luận',
    href: '/discussions',
    icon: MessageSquare,
    description: 'Diễn đàn thảo luận'
  },
  {
    label: 'Tiến độ',
    href: '/progress',
    icon: BarChart3,
    description: 'Theo dõi tiến độ'
  }
];

export function CourseNavigation({ className }: CourseNavigationProps): JSX.Element | null {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  if (!slug) return null;

  const baseUrl = `/courses/${slug}`;
  const currentPath = pathname.replace(baseUrl, '') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 mb-8",
        className
      )}
    >
      <div className="flex flex-wrap gap-2">
        {navigationItems.map((item) => {
          const href = `${baseUrl}${item.href}`;
          const isActive = currentPath === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  "flex items-center gap-2 h-auto py-3 px-4 text-sm transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Mobile dropdown version for smaller screens */}
      <div className="md:hidden mt-4">
        <div className="text-xs text-slate-400 mb-2">
          Điều hướng khóa học
        </div>
        <div className="grid grid-cols-2 gap-2">
          {navigationItems.map((item) => {
            const href = `${baseUrl}${item.href}`;
            const isActive = currentPath === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={href}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 text-center",
                    isActive 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                      : "bg-slate-700/30 text-slate-300 hover:bg-slate-700/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Breadcrumb component for better navigation context
export function CourseBreadcrumb({ className }: { className?: string }): JSX.Element | null {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  if (!slug) return null;

  const baseUrl = `/courses/${slug}`;
  const currentPath = pathname.replace(baseUrl, '') || '';
  
  const currentItem = navigationItems.find(item => item.href === currentPath);
  const currentLabel = currentItem?.label || 'Tổng quan';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("flex items-center gap-2 text-sm text-slate-400 mb-4", className)}
    >
      <Link href="/courses" className="hover:text-white transition-colors">
        Khóa học
      </Link>
      <span>/</span>
      <Link href={baseUrl} className="hover:text-white transition-colors">
        {slug}
      </Link>
      {currentPath && (
        <>
          <span>/</span>
          <span className="text-white font-medium">{currentLabel}</span>
        </>
      )}
    </motion.div>
  );
}
