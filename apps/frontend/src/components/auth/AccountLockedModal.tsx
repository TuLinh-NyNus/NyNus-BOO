import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Clock, AlertTriangle, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LockReason = 'max_attempts' | 'suspicious_activity' | 'admin_action' | 'security_violation';

interface AccountLockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: LockReason;
  lockUntil?: Date;
  attemptCount?: number;
  onContactSupport?: () => void;
  onTryAgainLater?: () => void;
  className?: string;
}

const lockReasonConfig: Record<LockReason, {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  showTimer: boolean;
  canRetry: boolean;
}> = {
  max_attempts: {
    title: 'Tài khoản tạm thời bị khóa',
    description: 'Bạn đã nhập sai mật khẩu quá nhiều lần. Tài khoản sẽ được mở khóa tự động sau một khoảng thời gian.',
    icon: Lock,
    iconColor: 'text-orange-600',
    showTimer: true,
    canRetry: true,
  },
  suspicious_activity: {
    title: 'Phát hiện hoạt động đáng ngờ',
    description: 'Chúng tôi phát hiện hoạt động bất thường từ tài khoản của bạn. Tài khoản đã được tạm khóa để bảo mật.',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    showTimer: false,
    canRetry: false,
  },
  admin_action: {
    title: 'Tài khoản bị khóa bởi quản trị viên',
    description: 'Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ để biết thêm thông tin.',
    icon: Lock,
    iconColor: 'text-red-600',
    showTimer: false,
    canRetry: false,
  },
  security_violation: {
    title: 'Vi phạm chính sách bảo mật',
    description: 'Tài khoản bị khóa do vi phạm chính sách bảo mật của hệ thống. Vui lòng liên hệ bộ phận hỗ trợ.',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    showTimer: false,
    canRetry: false,
  },
};

export function AccountLockedModal({
  open,
  onOpenChange,
  reason,
  lockUntil,
  attemptCount,
  onContactSupport,
  onTryAgainLater,
  className,
}: AccountLockedModalProps) {
  const config = lockReasonConfig[reason];
  const Icon = config.icon;

  const formatTimeRemaining = (until: Date) => {
    const now = new Date();
    const diff = until.getTime() - now.getTime();
    
    if (diff <= 0) return 'Đã hết hạn khóa';
    
    const minutes = Math.ceil(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} phút`;
    
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return `${hours} giờ`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)} hideCloseButton>
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon className={cn('h-8 w-8', config.iconColor)} />
          </div>
          <DialogTitle className="text-xl font-bold">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lock details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {attemptCount && reason === 'max_attempts' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Số lần thử:</span>
                <span className="font-semibold text-red-600">{attemptCount} lần</span>
              </div>
            )}
            
            {config.showTimer && lockUntil && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Khóa đến:
                </span>
                <span className="font-semibold text-orange-600">
                  {formatTimeRemaining(lockUntil)}
                </span>
              </div>
            )}
          </div>

          {/* Help information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Bạn có thể:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              {config.canRetry && (
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Đợi hết thời gian khóa và thử lại</span>
                </li>
              )}
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Sử dụng tính năng &quot;Quên mật khẩu&quot; để đặt lại</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Liên hệ bộ phận hỗ trợ nếu cần trợ giúp</span>
              </li>
            </ul>
          </div>

          {/* Contact information */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                <span>support@nynus.vn</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>1900-XXX-XXX</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:space-x-2">
          {onContactSupport && (
            <Button variant="outline" onClick={onContactSupport}>
              Liên hệ hỗ trợ
            </Button>
          )}
          
          {config.canRetry && onTryAgainLater ? (
            <Button onClick={onTryAgainLater}>
              Thử lại sau
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              Đã hiểu
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Preset components for common lock scenarios
export function MaxAttemptsLockedModal({
  open,
  onOpenChange,
  lockUntil,
  attemptCount = 5,
  ...props
}: Omit<AccountLockedModalProps, 'reason'>) {
  return (
    <AccountLockedModal
      open={open}
      onOpenChange={onOpenChange}
      reason="max_attempts"
      lockUntil={lockUntil}
      attemptCount={attemptCount}
      {...props}
    />
  );
}

export function SuspiciousActivityModal({
  open,
  onOpenChange,
  ...props
}: Omit<AccountLockedModalProps, 'reason'>) {
  return (
    <AccountLockedModal
      open={open}
      onOpenChange={onOpenChange}
      reason="suspicious_activity"
      {...props}
    />
  );
}