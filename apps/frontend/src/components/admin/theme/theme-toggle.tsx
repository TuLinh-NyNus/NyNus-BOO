/**
 * Theme Toggle Component
 * Component để chuyển đổi giữa light và dark theme trong admin interface
 */

'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Theme Toggle Props
 */
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * Theme Toggle Component
 * 
 * Features:
 * - Toggle between light and dark themes
 * - Persists theme preference in localStorage
 * - Smooth transitions
 * - Accessible with keyboard navigation
 * - Multiple sizes and variants
 */
export function ThemeToggle({ 
  className, 
  size = 'md', 
  variant = 'default' 
}: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Check initial theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(shouldBeDark);
    
    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  /**
   * Toggle theme
   */
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Update document classes
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  /**
   * Get button classes based on props
   */
  const getButtonClasses = () => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-md',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ];

    const sizeClasses = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg'
    };

    const variantClasses = {
      default: [
        'border border-transparent',
        'hover:bg-opacity-80',
        'focus:ring-primary'
      ],
      outline: [
        'border',
        'hover:bg-opacity-10',
        'focus:ring-primary'
      ],
      ghost: [
        'border-transparent',
        'hover:bg-opacity-10',
        'focus:ring-primary'
      ]
    };

    return cn(baseClasses, sizeClasses[size], variantClasses[variant], className);
  };

  /**
   * Get button inline styles for CSS variables
   */
  const getButtonStyles = (): React.CSSProperties => {
    if (variant === 'outline') {
      return {
        borderColor: 'var(--color-border)',
        color: 'var(--color-foreground)',
        backgroundColor: 'transparent'
      };
    }

    if (variant === 'ghost') {
      return {
        color: 'white',
        backgroundColor: 'transparent'
      };
    }

    // Default variant
    return {
      backgroundColor: 'var(--color-muted)',
      color: 'var(--color-muted-foreground)',
      borderColor: 'var(--color-border)'
    };
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn('inline-flex items-center justify-center rounded-md', 
        size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
      )}>
        <div className="animate-pulse bg-gray-200 rounded-full h-4 w-4" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={getButtonClasses()}
      style={getButtonStyles()}
      aria-label={isDark ? 'Chuyển sang light mode' : 'Chuyển sang dark mode'}
      title={isDark ? 'Chuyển sang light mode' : 'Chuyển sang dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </button>
  );
}

/**
 * Theme Toggle with Label
 * Variant có label text
 */
interface ThemeToggleWithLabelProps extends ThemeToggleProps {
  showLabel?: boolean;
  labelPosition?: 'left' | 'right';
}

export function ThemeToggleWithLabel({ 
  showLabel = true, 
  labelPosition = 'right',
  ...props 
}: ThemeToggleWithLabelProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));
  }, []);

  if (!mounted) return null;

  const label = isDark ? 'Dark Mode' : 'Light Mode';

  return (
    <div className="flex items-center space-x-2">
      {showLabel && labelPosition === 'left' && (
        <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
          {label}
        </span>
      )}
      
      <ThemeToggle {...props} />
      
      {showLabel && labelPosition === 'right' && (
        <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
