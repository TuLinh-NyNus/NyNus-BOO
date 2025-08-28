/**
 * Page Container Component
 * Responsive container cho questions pages theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

/**
 * Page Container Props Interface
 * Props cho PageContainer component
 */
interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
  as?: 'div' | 'section' | 'main' | 'article';
  id?: string;
}

/**
 * Container Size Configuration
 * Configuration cho container sizes
 */
const CONTAINER_SIZES = {
  sm: 'max-w-2xl',      // 672px
  md: 'max-w-4xl',      // 896px  
  lg: 'max-w-6xl',      // 1152px
  xl: 'max-w-7xl',      // 1280px
  full: 'max-w-full'    // 100%
} as const;

/**
 * Container Padding Configuration
 * Configuration cho container padding
 */
const CONTAINER_PADDING = {
  none: '',
  sm: 'px-4 py-4 sm:px-6 sm:py-6',
  md: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
  lg: 'px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12'
} as const;

// ===== MAIN COMPONENT =====

/**
 * Page Container Component
 * Responsive container với consistent spacing và max-width constraints
 *
 * Features:
 * - Mobile-first responsive design
 * - Configurable max-width sizes
 * - Consistent padding system
 * - Semantic HTML support
 * - Accessibility optimized
 */
export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({
    children,
    className,
    size = 'lg',
    padding = 'md',
    centered = true,
    as: Component = 'div',
    id,
    ...props
  }, ref) => {
    /**
     * Get container classes
     * Generate CSS classes cho container
     */
    const getContainerClasses = () => {
      const baseClasses = [
        'w-full',
        CONTAINER_SIZES[size],
        CONTAINER_PADDING[padding]
      ];

      // Add centering if enabled
      if (centered) {
        baseClasses.push('mx-auto');
      }

      // Add responsive behavior
      baseClasses.push(
        'transition-all duration-300 ease-in-out'
      );

      return cn(baseClasses, className);
    };

    return (
      <Component
        ref={ref}
        id={id}
        className={getContainerClasses()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

PageContainer.displayName = 'PageContainer';

// ===== SPECIALIZED CONTAINERS =====

/**
 * Content Container
 * Container cho main content areas
 */
export function ContentContainer({
  children,
  className,
  ...props
}: Omit<PageContainerProps, 'as'>) {
  return (
    <PageContainer
      as="main"
      size="lg"
      padding="md"
      className={cn('min-h-screen-content', className)}
      {...props}
    >
      {children}
    </PageContainer>
  );
}

/**
 * Section Container
 * Container cho page sections
 */
export function SectionContainer({
  children,
  className,
  ...props
}: Omit<PageContainerProps, 'as'>) {
  return (
    <PageContainer
      as="section"
      size="xl"
      padding="lg"
      className={cn('section-container', className)}
      {...props}
    >
      {children}
    </PageContainer>
  );
}

/**
 * Article Container
 * Container cho article content
 */
export function ArticleContainer({
  children,
  className,
  ...props
}: Omit<PageContainerProps, 'as'>) {
  return (
    <PageContainer
      as="article"
      size="md"
      padding="lg"
      className={cn('prose prose-lg max-w-none', className)}
      {...props}
    >
      {children}
    </PageContainer>
  );
}

/**
 * Header Container
 * Container cho header sections
 */
export function HeaderContainer({
  children,
  className,
  ...props
}: Omit<PageContainerProps, 'as'>) {
  return (
    <PageContainer
      as="div"
      size="xl"
      padding="md"
      className={cn('header-container', className)}
      {...props}
    >
      {children}
    </PageContainer>
  );
}

// ===== RESPONSIVE UTILITIES =====

/**
 * Responsive Container Hook
 * Hook để handle responsive container behavior
 */
export function useResponsiveContainer() {
  // This could be expanded với window size detection
  // For now, return static configuration
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    containerSize: 'lg' as const,
    padding: 'md' as const
  };
}

// ===== CONTAINER CONFIGURATION =====

/**
 * Container Configuration
 * Configuration object cho container behavior
 */
export const CONTAINER_CONFIG = {
  sizes: CONTAINER_SIZES,
  padding: CONTAINER_PADDING,
  
  // Responsive breakpoints (matching Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Default configurations
  defaults: {
    size: 'lg',
    padding: 'md',
    centered: true,
    as: 'div'
  }
} as const;

// ===== TYPE EXPORTS =====

/**
 * Container Size Type
 * Union type của container sizes
 */
export type ContainerSize = keyof typeof CONTAINER_SIZES;

/**
 * Container Padding Type
 * Union type của container padding options
 */
export type ContainerPadding = keyof typeof CONTAINER_PADDING;

/**
 * Container Configuration Type
 * Type cho container configuration
 */
export type ContainerConfig = typeof CONTAINER_CONFIG;
