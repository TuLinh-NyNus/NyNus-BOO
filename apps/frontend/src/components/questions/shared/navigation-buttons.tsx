/**
 * Navigation Buttons Component
 * Enhanced navigation buttons cho question interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface NavigationButtonsProps {
  /** Show back button */
  showBack?: boolean;
  
  /** Show forward button */
  showForward?: boolean;
  
  /** Show home button */
  showHome?: boolean;
  
  /** Show refresh button */
  showRefresh?: boolean;
  
  /** Custom back URL */
  backUrl?: string;
  
  /** Custom forward URL */
  forwardUrl?: string;
  
  /** Custom home URL */
  homeUrl?: string;
  
  /** Back button label */
  backLabel?: string;
  
  /** Forward button label */
  forwardLabel?: string;
  
  /** Home button label */
  homeLabel?: string;
  
  /** Refresh button label */
  refreshLabel?: string;
  
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom back handler */
  onBack?: () => void;
  
  /** Custom forward handler */
  onForward?: () => void;
  
  /** Custom home handler */
  onHome?: () => void;
  
  /** Custom refresh handler */
  onRefresh?: () => void;
}

// ===== MAIN COMPONENT =====

/**
 * Navigation Buttons Component
 * Enhanced navigation với browser back/forward support
 * 
 * Features:
 * - Browser back/forward integration
 * - Custom navigation handlers
 * - Responsive design
 * - Keyboard accessibility
 * - Multiple layouts và variants
 */
export function NavigationButtons({
  showBack = true,
  showForward = false,
  showHome = false,
  showRefresh = false,
  backUrl,
  forwardUrl,
  homeUrl = '/',
  backLabel = 'Quay lại',
  forwardLabel = 'Tiếp theo',
  homeLabel = 'Trang chủ',
  refreshLabel = 'Làm mới',
  size = 'default',
  variant = 'outline',
  orientation = 'horizontal',
  className,
  onBack,
  onForward,
  onHome,
  onRefresh
}: NavigationButtonsProps) {
  const router = useRouter();

  // ===== HANDLERS =====

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleForward = () => {
    if (onForward) {
      onForward();
    } else if (forwardUrl) {
      router.push(forwardUrl);
    } else {
      router.forward();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push(homeUrl);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  // ===== COMPUTED VALUES =====

  const containerClasses = cn(
    'navigation-buttons flex gap-2',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    className
  );

  // ===== RENDER =====

  return (
    <div className={containerClasses}>
      {/* Back Button */}
      {showBack && (
        <Button
          variant={variant}
          size={size}
          onClick={handleBack}
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{backLabel}</span>
        </Button>
      )}

      {/* Home Button */}
      {showHome && (
        <Button
          variant={variant}
          size={size}
          onClick={handleHome}
          className="inline-flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">{homeLabel}</span>
        </Button>
      )}

      {/* Refresh Button */}
      {showRefresh && (
        <Button
          variant={variant}
          size={size}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">{refreshLabel}</span>
        </Button>
      )}

      {/* Forward Button */}
      {showForward && (
        <Button
          variant={variant}
          size={size}
          onClick={handleForward}
          className="inline-flex items-center gap-2"
        >
          <span className="hidden sm:inline">{forwardLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Simple Back Button
 * Chỉ có back button đơn giản
 */
export function SimpleBackButton(props: Omit<NavigationButtonsProps, 'showForward' | 'showHome' | 'showRefresh'>) {
  return (
    <NavigationButtons
      {...props}
      showBack={true}
      showForward={false}
      showHome={false}
      showRefresh={false}
    />
  );
}

/**
 * Full Navigation Buttons
 * Đầy đủ navigation buttons
 */
export function FullNavigationButtons(props: NavigationButtonsProps) {
  return (
    <NavigationButtons
      {...props}
      showBack={true}
      showHome={true}
      showRefresh={true}
    />
  );
}

/**
 * Compact Navigation Buttons
 * Compact version cho mobile
 */
export function CompactNavigationButtons(props: NavigationButtonsProps) {
  return (
    <NavigationButtons
      {...props}
      size="sm"
      variant="ghost"
      orientation="horizontal"
    />
  );
}

// ===== DEFAULT EXPORT =====

export default NavigationButtons;
