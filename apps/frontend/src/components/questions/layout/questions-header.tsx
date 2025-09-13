/**
 * Questions Header Component
 * Header với breadcrumbs cho questions section theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { ReactNode } from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

import { PageContainer } from './page-container';
import { QuestionsBreadcrumb } from '../shared/breadcrumb/questions-breadcrumb';
import { BreadcrumbItem } from '@/lib/question-paths';

// ===== TYPES =====

/**
 * Questions Header Props Interface
 * Props cho QuestionsHeader component
 */
interface QuestionsHeaderProps {
  className?: string;
  title?: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  showSearchBar?: boolean;
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonLabel?: string;
  actions?: ReactNode;
  variant?: 'default' | 'minimal' | 'featured';
  size?: 'sm' | 'md' | 'lg';
}

// ===== MAIN COMPONENT =====

/**
 * Questions Header Component
 * Header component với breadcrumbs, title, và optional actions
 * 
 * Features:
 * - Responsive breadcrumb navigation
 * - Optional search bar placeholder
 * - Back button support
 * - Custom actions support
 * - Multiple variants (default, minimal, featured)
 * - Consistent spacing và typography
 */
export function QuestionsHeader({
  className,
  title,
  description,
  breadcrumbItems,
  showBreadcrumbs = true,
  showSearchBar = false,
  showBackButton = false,
  backButtonHref,
  backButtonLabel = 'Quay lại',
  actions,
  variant = 'default',
  size = 'md'
}: QuestionsHeaderProps) {
  /**
   * Get header classes
   * Generate CSS classes cho header
   */
  const getHeaderClasses = () => {
    const baseClasses = [
      'questions-header',
      'bg-background',
      'transition-all duration-300 ease-in-out'
    ];

    const variantClasses = {
      default: 'py-4 sm:py-6',
      minimal: 'py-3 sm:py-4',
      featured: 'py-6 sm:py-8 bg-gradient-to-r from-primary/5 to-secondary/5'
    };

    return cn(baseClasses, variantClasses[variant], className);
  };

  /**
   * Get title classes
   * Generate CSS classes cho title
   */
  const getTitleClasses = () => {
    const sizeClasses = {
      sm: 'text-xl sm:text-2xl',
      md: 'text-2xl sm:text-3xl',
      lg: 'text-3xl sm:text-4xl'
    };

    return cn(
      'font-bold text-foreground mb-2',
      sizeClasses[size]
    );
  };

  /**
   * Render breadcrumbs section
   * Render breadcrumb navigation
   */
  const renderBreadcrumbs = () => {
    if (!showBreadcrumbs) return null;

    return (
      <div className="breadcrumbs-section mb-4">
        <QuestionsBreadcrumb
          items={breadcrumbItems}
          showHome={true}
          showIcons={true}
          maxItems={5}
          separator="chevron"
          size="md"
        />
      </div>
    );
  };

  /**
   * Render back button
   * Render back navigation button
   */
  const renderBackButton = () => {
    if (!showBackButton || !backButtonHref) return null;

    return (
      <div className="back-button-section mb-4">
        <a
          href={backButtonHref}
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backButtonLabel}
        </a>
      </div>
    );
  };

  /**
   * Render title section
   * Render title và description
   */
  const renderTitleSection = () => {
    if (!title && !description) return null;

    return (
      <div className="title-section">
        {title && (
          <h1 className={getTitleClasses()}>
            {title}
          </h1>
        )}
        {description && (
          <p className="text-lg text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </div>
    );
  };

  /**
   * Render search bar placeholder
   * Render search bar (future implementation)
   */
  const renderSearchBar = () => {
    if (!showSearchBar) return null;

    return (
      <div className="search-section mt-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            disabled
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            disabled
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tính năng tìm kiếm sẽ được triển khai trong phiên bản tiếp theo
        </p>
      </div>
    );
  };

  /**
   * Render actions section
   * Render custom actions
   */
  const renderActions = () => {
    if (!actions) return null;

    return (
      <div className="actions-section">
        {actions}
      </div>
    );
  };

  return (
    <header className={getHeaderClasses()}>
      <PageContainer size="xl" padding="none" className="px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Back Button */}
        {renderBackButton()}

        {/* Main Header Content */}
        <div className="flex items-start justify-between">
          {/* Left Section: Title & Description */}
          <div className="flex-1 min-w-0">
            {renderTitleSection()}
            {renderSearchBar()}
          </div>

          {/* Right Section: Actions */}
          {actions && (
            <div className="flex-shrink-0 ml-6">
              {renderActions()}
            </div>
          )}
        </div>
      </PageContainer>
    </header>
  );
}

// ===== SPECIALIZED HEADERS =====

/**
 * Minimal Questions Header
 * Minimal version với chỉ breadcrumbs
 */
export function MinimalQuestionsHeader(props: Omit<QuestionsHeaderProps, 'variant'>) {
  return (
    <QuestionsHeader
      {...props}
      variant="minimal"
      showSearchBar={false}
      size="sm"
    />
  );
}

/**
 * Featured Questions Header
 * Featured version với gradient background
 */
export function FeaturedQuestionsHeader(props: Omit<QuestionsHeaderProps, 'variant'>) {
  return (
    <QuestionsHeader
      {...props}
      variant="featured"
      size="lg"
    />
  );
}

/**
 * Search Questions Header
 * Header với search bar enabled
 */
export function SearchQuestionsHeader(props: Omit<QuestionsHeaderProps, 'showSearchBar'>) {
  return (
    <QuestionsHeader
      {...props}
      showSearchBar={true}
    />
  );
}

// ===== HEADER UTILITIES =====

/**
 * Questions Header Configuration
 * Configuration object cho header behavior
 */
export const QUESTIONS_HEADER_CONFIG = {
  variants: {
    default: {
      padding: 'py-4 sm:py-6',
      background: 'bg-background'
    },
    minimal: {
      padding: 'py-3 sm:py-4',
      background: 'bg-background'
    },
    featured: {
      padding: 'py-6 sm:py-8',
      background: 'bg-gradient-to-r from-primary/5 to-secondary/5'
    }
  },
  
  sizes: {
    sm: {
      title: 'text-xl sm:text-2xl',
      description: 'text-base'
    },
    md: {
      title: 'text-2xl sm:text-3xl',
      description: 'text-lg'
    },
    lg: {
      title: 'text-3xl sm:text-4xl',
      description: 'text-xl'
    }
  },
  
  defaults: {
    variant: 'default' as const,
    size: 'md' as const,
    showBreadcrumbs: true,
    showSearchBar: false,
    showBackButton: false
  }
} as const;

// ===== TYPE EXPORTS =====

/**
 * Header Variant Type
 * Union type của header variants
 */
export type HeaderVariant = 'default' | 'minimal' | 'featured';

/**
 * Header Size Type
 * Union type của header sizes
 */
export type HeaderSize = 'sm' | 'md' | 'lg';
