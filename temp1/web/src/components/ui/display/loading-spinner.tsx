/**
 * Loading Spinner Component với nhiều variants
 */

import { Loader2, Wifi, WifiOff } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'muted'
  className?: string
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const variantClasses = {
  default: 'text-gray-600',
  primary: 'text-blue-600',
  secondary: 'text-gray-400',
  muted: 'text-gray-300',
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps): JSX.Element {
  const spinner = (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )}
          data-testid="loading-spinner"
        />
        {text && (
          <p className={cn(
            'text-sm font-medium',
            variantClasses[variant]
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * Loading Skeleton cho forms
 */
export function FormLoadingSkeleton(): JSX.Element {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  )
}

/**
 * Loading Button Component
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButton({
  loading = false,
  loadingText = 'Đang xử lý...',
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps): JSX.Element {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-10 px-4 py-2',
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Network Status Indicator
 */
interface NetworkStatusProps {
  isOnline: boolean
  className?: string
  showText?: boolean
}

export function NetworkStatus({
  isOnline,
  className,
  showText = true
}: NetworkStatusProps): JSX.Element {
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      {showText && (
        <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
          {isOnline ? 'Đã kết nối' : 'Mất kết nối'}
        </span>
      )}
    </div>
  )
}

/**
 * Loading Overlay Component
 */
interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
  className?: string
}

export function LoadingOverlay({
  isVisible,
  text = 'Đang tải...',
  className
}: LoadingOverlayProps): JSX.Element | null {
  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner
          size="lg"
          text={text}
          variant="primary"
        />
      </div>
    </div>
  )
}
