'use client';

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Unified Theme Toggle Props
 * Consolidates all theme toggle variants into one component
 */
interface UnifiedThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  showLabel?: boolean;
  labelPosition?: 'left' | 'right';
  iconType?: 'radix' | 'lucide';
}

/**
 * Unified Theme Toggle Component
 * 
 * Features:
 * - Uses next-themes as single source of truth
 * - Supports multiple sizes and variants
 * - Smooth animations with framer-motion
 * - Proper hydration handling
 * - Accessibility compliant
 */
export function UnifiedThemeToggle({
  className,
  size = 'md',
  variant = 'default',
  showLabel = false,
  labelPosition = 'right',
  iconType = 'lucide'
}: UnifiedThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Get button classes based on props
   */
  const getButtonClasses = () => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-md',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ];

    const sizeClasses = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg'
    };

    const variantClasses = {
      default: [
        'bg-muted text-muted-foreground',
        'hover:bg-muted/80 hover:text-foreground',
        'border border-border'
      ],
      outline: [
        'bg-transparent text-foreground',
        'hover:bg-accent hover:text-accent-foreground',
        'border border-input'
      ],
      ghost: [
        'bg-transparent text-foreground/80',
        'hover:bg-accent hover:text-accent-foreground'
      ],
      icon: [
        'bg-transparent text-foreground/80',
        'hover:bg-muted hover:text-foreground'
      ]
    };

    return cn(baseClasses, sizeClasses[size], variantClasses[variant], className);
  };

  /**
   * Render icon based on theme and type
   */
  const renderIcon = () => {
    const iconClasses = cn(
      'transition-transform duration-200',
      size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
    );

    if (iconType === 'radix') {
      return (
        <>
          <motion.div
            initial={false}
            animate={{
              scale: theme === "dark" ? 0 : 1,
              opacity: theme === "dark" ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              scale: theme === "dark" ? 1 : 0,
              opacity: theme === "dark" ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </motion.div>
        </>
      );
    }

    // Lucide icons with animation
    return (
      <>
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 0 : 1,
            opacity: theme === "dark" ? 0 : 1,
            rotate: theme === "dark" ? 90 : 0
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className={iconClasses} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            opacity: theme === "dark" ? 1 : 0,
            rotate: theme === "dark" ? 0 : -90
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className={iconClasses} />
        </motion.div>
      </>
    );
  };

  /**
   * Render label
   */
  const renderLabel = () => {
    if (!showLabel || !mounted) return null;
    
    const label = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    
    return (
      <span className="text-sm font-medium text-foreground">
        {label}
      </span>
    );
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn(
        'inline-flex items-center justify-center rounded-md',
        size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
      )}>
        <div className="animate-pulse bg-muted rounded-full h-4 w-4" />
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // With label
  if (showLabel) {
    return (
      <div className={cn(
        "flex items-center gap-2",
        labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
      )}>
        <button
          type="button"
          onClick={toggleTheme}
          className={getButtonClasses()}
          aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
          data-theme-toggle
        >
          <div className="relative">
            {renderIcon()}
          </div>
        </button>
        {renderLabel()}
      </div>
    );
  }

  // Without label
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={getButtonClasses()}
      aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
      data-theme-toggle
    >
      <div className="relative">
        {renderIcon()}
      </div>
    </button>
  );
}

/**
 * Legacy compatibility exports
 * These will be deprecated in future versions
 */
export const ThemeToggle = UnifiedThemeToggle;
export const ThemeSwitch = (props: Omit<UnifiedThemeToggleProps, 'iconType'>) => (
  <UnifiedThemeToggle {...props} iconType="radix" />
);
