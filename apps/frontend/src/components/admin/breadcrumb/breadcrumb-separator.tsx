/**
 * Breadcrumb Separator Component
 * Separator component cho breadcrumb items
 */

'use client';

import React, { ReactNode } from 'react';
import { ChevronRight, Slash, ArrowRight, Minus } from 'lucide-react';
import { BreadcrumbSeparatorProps } from '@/types/admin/breadcrumb';
import { cn } from '@/lib/utils';

/**
 * Breadcrumb Separator Component
 * Component để render separator giữa breadcrumb items
 */
export function BreadcrumbSeparator({
  className,
  children
}: BreadcrumbSeparatorProps) {
  const defaultClasses = 'flex items-center justify-center text-gray-400 mx-1';
  
  return (
    <span 
      className={cn(defaultClasses, className)}
      aria-hidden="true"
      role="presentation"
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </span>
  );
}

/**
 * Chevron Separator
 * Separator với chevron icon (default)
 */
export function ChevronSeparator({ className }: { className?: string }) {
  return (
    <BreadcrumbSeparator className={className}>
      <ChevronRight className="h-4 w-4" />
    </BreadcrumbSeparator>
  );
}

/**
 * Slash Separator
 * Separator với slash icon
 */
export function SlashSeparator({ className }: { className?: string }) {
  return (
    <BreadcrumbSeparator className={className}>
      <Slash className="h-4 w-4" />
    </BreadcrumbSeparator>
  );
}

/**
 * Arrow Separator
 * Separator với arrow icon
 */
export function ArrowSeparator({ className }: { className?: string }) {
  return (
    <BreadcrumbSeparator className={className}>
      <ArrowRight className="h-4 w-4" />
    </BreadcrumbSeparator>
  );
}

/**
 * Text Separator
 * Separator với text
 */
export function TextSeparator({ 
  text = '/', 
  className 
}: { 
  text?: string; 
  className?: string; 
}) {
  return (
    <BreadcrumbSeparator className={className}>
      <span className="text-sm font-medium">{text}</span>
    </BreadcrumbSeparator>
  );
}

/**
 * Dot Separator
 * Separator với dot
 */
export function DotSeparator({ className }: { className?: string }) {
  return (
    <BreadcrumbSeparator className={className}>
      <span className="text-lg leading-none">•</span>
    </BreadcrumbSeparator>
  );
}

/**
 * Dash Separator
 * Separator với dash
 */
export function DashSeparator({ className }: { className?: string }) {
  return (
    <BreadcrumbSeparator className={className}>
      <Minus className="h-4 w-4" />
    </BreadcrumbSeparator>
  );
}

/**
 * Custom Icon Separator
 * Separator với custom icon
 */
export function CustomIconSeparator({ 
  icon, 
  className 
}: { 
  icon: ReactNode; 
  className?: string; 
}) {
  return (
    <BreadcrumbSeparator className={className}>
      {icon}
    </BreadcrumbSeparator>
  );
}

/**
 * Animated Separator
 * Separator với animation
 */
export function AnimatedSeparator({ 
  className,
  children 
}: { 
  className?: string;
  children?: ReactNode;
}) {
  return (
    <BreadcrumbSeparator 
      className={cn(
        'transition-all duration-200 hover:text-gray-600 hover:scale-110',
        className
      )}
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </BreadcrumbSeparator>
  );
}

/**
 * Separator Variants
 * Object chứa các separator variants
 */
export const SeparatorVariants = {
  chevron: ChevronSeparator,
  slash: SlashSeparator,
  arrow: ArrowSeparator,
  text: TextSeparator,
  dot: DotSeparator,
  dash: DashSeparator,
  animated: AnimatedSeparator,
  custom: CustomIconSeparator
} as const;

/**
 * Get Separator Component
 * Function để lấy separator component theo type
 */
export function getSeparatorComponent(
  type: keyof typeof SeparatorVariants = 'chevron',
  props?: Record<string, unknown>
) {
  // Handle different component types explicitly
  switch (type) {
    case 'chevron':
      return <ChevronSeparator {...(props as { className?: string })} />;
    case 'slash':
      return <SlashSeparator {...(props as { className?: string })} />;
    case 'arrow':
      return <ArrowSeparator {...(props as { className?: string })} />;
    case 'text':
      return <TextSeparator {...(props as { text?: string; className?: string })} />;
    case 'dot':
      return <DotSeparator {...(props as { className?: string })} />;
    case 'dash':
      return <DashSeparator {...(props as { className?: string })} />;
    case 'animated':
      return <AnimatedSeparator {...(props as { className?: string; children?: ReactNode })} />;
    case 'custom':
      return <CustomIconSeparator icon={<ChevronRight className="h-4 w-4" />} {...(props as { className?: string })} />;
    default:
      return <ChevronSeparator {...(props as { className?: string })} />;
  }
}

/**
 * Responsive Separator
 * Separator thay đổi theo screen size
 */
export function ResponsiveSeparator({ 
  mobileVariant = 'chevron',
  desktopVariant = 'chevron',
  className 
}: {
  mobileVariant?: keyof typeof SeparatorVariants;
  desktopVariant?: keyof typeof SeparatorVariants;
  className?: string;
}) {
  return (
    <span className={className}>
      {/* Mobile separator */}
      <span className="sm:hidden">
        {getSeparatorComponent(mobileVariant)}
      </span>
      
      {/* Desktop separator */}
      <span className="hidden sm:inline">
        {getSeparatorComponent(desktopVariant)}
      </span>
    </span>
  );
}

/**
 * Conditional Separator
 * Separator hiển thị theo điều kiện
 */
export function ConditionalSeparator({
  show = true,
  fallback,
  className,
  children
}: {
  show?: boolean;
  fallback?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  if (!show) {
    return fallback ? <span className={className}>{fallback}</span> : null;
  }

  return (
    <BreadcrumbSeparator className={className}>
      {children}
    </BreadcrumbSeparator>
  );
}
