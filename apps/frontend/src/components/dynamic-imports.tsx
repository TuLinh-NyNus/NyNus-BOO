/**
 * Centralized Dynamic Imports
 * Better code splitting và progressive loading
 */

import dynamic from 'next/dynamic';
import { ComponentType, useState, useEffect } from 'react';

// Loading components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  </div>
);

const _LoadingCard = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
  </div>
);

// 🔥 Heavy components - load chỉ khi cần
export const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => ({ default: mod.Editor })),
  {
    loading: LoadingSpinner,
    ssr: false // Editor should only load on client
  }
);

export const Chart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  {
    loading: LoadingSkeleton,
    ssr: false
  }
);



// 🔥 Home page components với progressive loading
export const HeroSection = dynamic(
  () => import('@/components/features/home/hero'),
  {
    loading: () => <div className="h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg" />,
    ssr: true // Critical content - should be SSR'd
  }
);

export const FeaturedCourses = dynamic(
  () => import('@/components/features/home/featured-courses'),
  {
    loading: LoadingSkeleton,
    ssr: false // Load after hero
  }
);

export const Testimonials = dynamic(
  () => import('@/components/features/home/testimonials'),
  {
    loading: LoadingSkeleton,
    ssr: false
  }
);

export const FAQ = dynamic(
  () => import('@/components/features/home/faq'),
  {
    loading: LoadingSkeleton,
    ssr: false
  }
);

export const ProgressScrollIndicator = dynamic(
  () => import('@/components/features/home/progress-scroll-indicator'),
  {
    loading: () => null,
    ssr: false
  }
);

// 🔥 Question components - disabled until components exist
// export const QuestionViewer = dynamic(
//   () => import('@/components/student/question-viewer'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// 🔥 Course components - disabled until components exist
// export const CourseViewer = dynamic(
//   () => import('@/components/courses/course-viewer'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// 🔥 Modal components - disabled until components exist
// export const ModalManager = dynamic(
//   () => import('@/components/modals/modal-manager'),
//   { loading: () => null, ssr: false }
// );

// 🔥 Theory components - disabled until components exist
// export const TheoryViewer = dynamic(
//   () => import('@/components/student/theory/student-theory-viewer'),
//   { loading: LoadingSkeleton, ssr: true }
// );

// 🔥 Utility function cho conditional loading
export function loadComponentWhen<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  condition: () => boolean,
  fallback?: ComponentType<T>
) {
  if (!condition()) {
    return fallback || (() => null);
  }
  
  return dynamic(importFn, {
    loading: LoadingSpinner,
    ssr: false
  });
}

// 🔥 Progressive loading hook
export function useProgressiveLoad<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  delay: number = 100
) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldLoad) {
    return null;
  }

  return dynamic(importFn, {
    loading: LoadingSpinner,
    ssr: false
  });
}

// 🔥 Intersection Observer based loading
export function loadComponentOnVisible<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: IntersectionObserverInit
) {
  return dynamic(() => {
    return new Promise<{ default: ComponentType<T> }>((resolve) => {
      // Create placeholder element
      const placeholder = document.createElement('div');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            importFn().then(resolve);
          }
        });
      }, options);

      observer.observe(placeholder);
      
      // Return placeholder component
      resolve({
        default: (() => <div ref={(ref) => {
          if (ref) observer.observe(ref);
        }} />) as ComponentType<T>
      });
    });
  }, {
    loading: LoadingSkeleton,
    ssr: false
  });
}

// 🔥 Bundle splitting utilities
export const createLazyBundle = <T extends Record<string, unknown>>(
  components: Record<string, () => Promise<{ default: ComponentType<T> }>>
) => {
  const lazyComponents: Record<string, ComponentType<T>> = {};
  
  Object.keys(components).forEach(key => {
    lazyComponents[key] = dynamic(components[key], {
      loading: LoadingSpinner,
      ssr: false
    });
  });
  
  return lazyComponents;
};

