/**
 * Enhanced Toast System với retry actions và better UX
 */

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui'
import { toast as baseToast, ToasterToast } from '@/hooks/use-toast'

export interface EnhancedToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  persistent?: boolean
}

/**
 * Enhanced toast function với better UX
 */
export function enhancedToast({
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
  dismissible = true,
  persistent = false,
}: EnhancedToastOptions): { id: string; dismiss: () => void; update: (props: ToasterToast) => void } {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getVariant = () => {
    switch (variant) {
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return baseToast({
    title: title as any,
    description,
    variant: getVariant(),
    duration: persistent ? Infinity : duration,
    action: action ? (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="h-8 px-3"
        >
          {action.label}
        </Button>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}} // Toast will auto-dismiss
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    ) : dismissible ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {}} // Toast will auto-dismiss
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    ) : undefined,
  })
}

/**
 * Predefined toast functions
 */
export const toastSuccess = (title: string, description?: string, options?: Partial<EnhancedToastOptions>) =>
  enhancedToast({ title, description, variant: 'success', ...options })

export const toastError = (title: string, description?: string, options?: Partial<EnhancedToastOptions>) =>
  enhancedToast({ title, description, variant: 'error', ...options })

export const toastWarning = (title: string, description?: string, options?: Partial<EnhancedToastOptions>) =>
  enhancedToast({ title, description, variant: 'warning', ...options })

export const toastInfo = (title: string, description?: string, options?: Partial<EnhancedToastOptions>) =>
  enhancedToast({ title, description, variant: 'info', ...options })

/**
 * Auth-specific toast functions
 */
export const authToast = {
  loginSuccess: (username?: string): void => {
    toastSuccess(
      'Đăng nhập thành công!',
      username ? `Chào mừng ${username} quay trở lại NyNus.` : 'Chào mừng bạn quay trở lại NyNus.'
    );
  },

  loginError: (message: string, canRetry = false, onRetry?: () => void): void => {
    toastError(
      'Đăng nhập thất bại',
      message,
      canRetry && onRetry ? {
        action: {
          label: 'Thử lại',
          onClick: onRetry,
        },
        duration: 8000,
      } : undefined
    );
  },

  registerSuccess: (): void => {
    toastSuccess(
      'Đăng ký thành công!',
      'Vui lòng kiểm tra email để xác thực tài khoản.',
      { duration: 8000 }
    );
  },

  registerError: (message: string): void => {
    toastError('Đăng ký thất bại', message);
  },

  logoutSuccess: (): void => {
    toastInfo('Đăng xuất thành công', 'Hẹn gặp lại bạn!');
  },

  sessionExpired: (onLogin?: () => void): void => {
    toastWarning(
      'Phiên đăng nhập hết hạn',
      'Vui lòng đăng nhập lại để tiếp tục.',
      onLogin ? {
        action: {
          label: 'Đăng nhập',
          onClick: onLogin,
        },
        persistent: true,
      } : { duration: 8000 }
    );
  },

  networkError: (onRetry?: () => void): void => {
    toastError(
      'Lỗi kết nối mạng',
      'Vui lòng kiểm tra kết nối internet và thử lại.',
      onRetry ? {
        action: {
          label: 'Thử lại',
          onClick: onRetry,
        },
        duration: 8000,
      } : undefined
    );
  },

  rateLimitExceeded: (retryAfter?: number): void => {
    toastWarning(
      'Quá nhiều lần thử',
      retryAfter
        ? `Vui lòng thử lại sau ${retryAfter} giây.`
        : 'Vui lòng thử lại sau vài phút.',
      { duration: 10000 }
    );
  },

  serverError: (onRetry?: () => void): void => {
    toastError(
      'Lỗi máy chủ',
      'Có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.',
      onRetry ? {
        action: {
          label: 'Thử lại',
          onClick: onRetry,
        },
        duration: 8000,
      } : undefined
    );
  },

  passwordResetSent: (email: string): void => {
    toastSuccess(
      'Email đặt lại mật khẩu đã được gửi',
      `Vui lòng kiểm tra hộp thư của ${email}`,
      { duration: 8000 }
    );
  },

  passwordResetSuccess: (): void => {
    toastSuccess(
      'Đặt lại mật khẩu thành công',
      'Bạn có thể đăng nhập với mật khẩu mới.'
    );
  },

  emailVerificationSent: (email: string): void => {
    toastInfo(
      'Email xác thực đã được gửi',
      `Vui lòng kiểm tra hộp thư của ${email}`,
      { duration: 8000 }
    );
  },

  emailVerified: (): void => {
    toastSuccess(
      'Email đã được xác thực',
      'Tài khoản của bạn đã được kích hoạt thành công.'
    );
  },
}

/**
 * Network status toast
 */
export const networkToast = {
  offline: (): void => {
    toastWarning(
      'Mất kết nối internet',
      'Một số tính năng có thể không hoạt động.',
      { persistent: true }
    );
  },

  online: (): void => {
    toastSuccess(
      'Đã kết nối lại',
      'Kết nối internet đã được khôi phục.',
      { duration: 3000 }
    );
  },
}

/**
 * Progress toast for long operations
 */
export const progressToast = {
  start: (message: string): void => {
    toastInfo(message, undefined, { persistent: true, dismissible: false });
  },

  update: (message: string, progress?: number): void => {
    toastInfo(
      message,
      progress ? `${Math.round(progress)}% hoàn thành` : undefined,
      { persistent: true, dismissible: false }
    );
  },

  complete: (message: string): void => {
    toastSuccess(message, undefined, { duration: 3000 });
  },

  error: (message: string, onRetry?: () => void): void => {
    toastError(
      'Thao tác thất bại',
      message,
      onRetry ? {
        action: {
          label: 'Thử lại',
          onClick: onRetry,
        },
      } : undefined
    );
  },
}
