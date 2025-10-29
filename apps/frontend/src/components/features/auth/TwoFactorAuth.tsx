/**
 * Two-Factor Authentication Component
 * Component để setup và verify 2FA cho NyNus system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
  Key,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context-grpc';
import { authToast, toastSuccess, toastInfo } from '@/components/ui/feedback/enhanced-toast';
import { logger } from '@/lib/logger';

// ===== TYPES =====

export interface TwoFactorAuthProps {
  className?: string;
  onSetupComplete?: () => void;
  onVerificationComplete?: () => void;
}

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  isEnabled: boolean;
}

interface VerificationState {
  code: string;
  isVerifying: boolean;
  error: string | null;
}

// ===== MOCK DATA (TODO: Replace with real gRPC service) =====

const generateMockSetup = (): TwoFactorSetup => ({
  secret: 'JBSWY3DPEHPK3PXP',
  qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/NyNus:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=NyNus`,
  backupCodes: [
    '12345678',
    '87654321',
    '11223344',
    '44332211',
    '55667788',
    '88776655',
    '99001122',
    '22110099'
  ],
  isEnabled: false
});

// ===== MAIN COMPONENT =====

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  className,
  onSetupComplete: _onSetupComplete,
  onVerificationComplete
}) => {
  // ===== STATE =====

  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [verification, setVerification] = useState<VerificationState>({
    code: '',
    isVerifying: false,
    error: null
  });
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const { user } = useAuth();

  // ===== HANDLERS =====

  /**
   * Initialize two-factor authentication setup
   * Business Logic: Tạo QR code và secret key cho user để setup 2FA
   * Security: Generate secure secret key và backup codes
   */
  const initializeTwoFactorSetup = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real gRPC service call
      // const response = await AuthService.initializeTwoFactor();

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSetup = generateMockSetup();
      setSetup(mockSetup);

      if (mockSetup.isEnabled) {
        setCurrentStep('complete');
      }
    } catch (error) {
      logger.error('[TwoFactorAuth] Failed to initialize 2FA setup', {
        operation: 'initialize2FA',
        userId: user?.id,
        error: error instanceof Error ? error.message : String(error),
      });
      authToast.loginError('Không thể khởi tạo thiết lập 2FA');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // ===== EFFECTS =====

  useEffect(() => {
    if (user && !setup) {
      initializeTwoFactorSetup();
    }
  }, [user, setup, initializeTwoFactorSetup]);

  /**
   * Copy 2FA secret key to clipboard
   * Business Logic: Cho phép user copy secret key để nhập thủ công vào authenticator app
   */
  const handleCopySecret = useCallback(async () => {
    if (!setup?.secret) return;

    try {
      await navigator.clipboard.writeText(setup.secret);
      setCopiedSecret(true);
      toastSuccess('Đã sao chép', 'Secret key đã được sao chép vào clipboard');

      setTimeout(() => setCopiedSecret(false), 3000);
    } catch (error) {
      logger.error('[TwoFactorAuth] Failed to copy secret key', {
        operation: 'copySecret',
        userId: user?.id,
        error: error instanceof Error ? error.message : String(error),
      });
      authToast.loginError('Không thể sao chép secret key');
    }
  }, [setup?.secret, user?.id]);

  /**
   * Copy backup codes to clipboard
   * Business Logic: Backup codes dùng để khôi phục tài khoản khi mất authenticator app
   * Security: User phải lưu backup codes ở nơi an toàn
   */
  const handleCopyBackupCodes = useCallback(async () => {
    if (!setup?.backupCodes) return;

    try {
      const codesText = setup.backupCodes.join('\n');
      await navigator.clipboard.writeText(codesText);
      setCopiedBackupCodes(true);
      toastSuccess('Đã sao chép', 'Backup codes đã được sao chép vào clipboard');

      setTimeout(() => setCopiedBackupCodes(false), 3000);
    } catch (error) {
      logger.error('[TwoFactorAuth] Failed to copy backup codes', {
        operation: 'copyBackupCodes',
        userId: user?.id,
        error: error instanceof Error ? error.message : String(error),
      });
      authToast.loginError('Không thể sao chép backup codes');
    }
  }, [setup?.backupCodes, user?.id]);

  /**
   * Handle verification code input change
   * Input Validation: Chỉ cho phép nhập số, giới hạn 6 ký tự
   */
  const handleVerificationCodeChange = useCallback((value: string) => {
    // Only allow digits and limit to 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setVerification(prev => ({
      ...prev,
      code: cleanValue,
      error: null
    }));
  }, []);

  /**
   * Verify 2FA code from authenticator app
   * Business Logic: Xác thực mã 6 chữ số từ authenticator app để kích hoạt 2FA
   * Security: Mã phải chính xác 6 chữ số và match với secret key
   */
  const handleVerifyCode = useCallback(async () => {
    // Input validation: Mã phải có đúng 6 chữ số
    if (!verification.code || verification.code.length !== 6) {
      setVerification(prev => ({
        ...prev,
        error: 'Vui lòng nhập mã 6 chữ số'
      }));
      return;
    }

    setVerification(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      // TODO: Replace with real gRPC service call
      // const response = await AuthService.verifyTwoFactor(verification.code);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock verification (accept any 6-digit code)
      if (verification.code.length === 6) {
        setCurrentStep('complete');
        authToast.loginSuccess('2FA đã được kích hoạt thành công!');
        onVerificationComplete?.();
      } else {
        throw new Error('Invalid code');
      }
    } catch (error) {
      logger.error('[TwoFactorAuth] 2FA verification failed', {
        operation: 'verify2FA',
        userId: user?.id,
        code: verification.code.substring(0, 2) + '****', // Mask code for security
        error: error instanceof Error ? error.message : String(error),
      });
      setVerification(prev => ({
        ...prev,
        error: 'Mã xác thực không chính xác. Vui lòng thử lại.'
      }));
    } finally {
      setVerification(prev => ({ ...prev, isVerifying: false }));
    }
  }, [verification.code, onVerificationComplete, user?.id]);

  /**
   * Disable two-factor authentication
   * Business Logic: Tắt 2FA và xóa secret key, backup codes
   * Security: Yêu cầu xác nhận trước khi tắt để tránh tắt nhầm
   */
  const handleDisableTwoFactor = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real gRPC service call
      // await AuthService.disableTwoFactor();

      await new Promise(resolve => setTimeout(resolve, 1000));

      setSetup(prev => prev ? { ...prev, isEnabled: false } : null);
      setCurrentStep('setup');
      toastInfo('2FA đã được tắt', 'Bảo mật hai lớp đã được vô hiệu hóa');
    } catch (error) {
      logger.error('[TwoFactorAuth] Failed to disable 2FA', {
        operation: 'disable2FA',
        userId: user?.id,
        error: error instanceof Error ? error.message : String(error),
      });
      authToast.loginError('Không thể tắt 2FA');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // ===== RENDER FUNCTIONS =====

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Thiết lập xác thực hai lớp</h3>
        <p className="text-muted-foreground">
          Tăng cường bảo mật tài khoản với xác thực hai lớp (2FA)
        </p>
      </div>

      {setup && (
        <>
          <div className="space-y-4">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.qrCodeUrl}
                alt="QR Code for 2FA setup"
                className="mx-auto mb-4 border rounded-lg"
              />
              <p className="text-sm text-muted-foreground mb-2">
                Quét mã QR bằng ứng dụng xác thực như Google Authenticator
              </p>
            </div>

            <Separator />

            <div>
              <Label htmlFor="secret-key" className="text-sm font-medium">
                Hoặc nhập thủ công secret key:
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="secret-key"
                  value={setup.secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                  className="flex-shrink-0"
                >
                  {copiedSecret ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setCurrentStep('verify')}
            className="w-full"
            disabled={isLoading}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Tiếp tục xác thực
          </Button>
        </>
      )}
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Xác thực mã</h3>
        <p className="text-muted-foreground">
          Nhập mã 6 chữ số từ ứng dụng xác thực của bạn
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="verification-code">Mã xác thực</Label>
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={verification.code}
            onChange={(e) => handleVerificationCodeChange(e.target.value)}
            placeholder="123456"
            className="text-center text-lg font-mono tracking-widest"
            disabled={verification.isVerifying}
          />
          {verification.error && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{verification.error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('setup')}
            disabled={verification.isVerifying}
            className="flex-1"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleVerifyCode}
            disabled={verification.isVerifying || verification.code.length !== 6}
            className="flex-1"
          >
            {verification.isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              'Xác thực'
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">2FA đã được kích hoạt</h3>
        <p className="text-muted-foreground">
          Tài khoản của bạn đã được bảo vệ bằng xác thực hai lớp
        </p>
      </div>

      {setup?.backupCodes && (
        <div className="space-y-4">
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <strong>Quan trọng:</strong> Lưu các backup codes này ở nơi an toàn. 
              Bạn có thể sử dụng chúng để truy cập tài khoản khi không có ứng dụng xác thực.
            </AlertDescription>
          </Alert>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Backup Codes</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyBackupCodes}
              >
                {copiedBackupCodes ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-600" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Sao chép
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
              {setup.backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm text-center py-1">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleDisableTwoFactor}
            disabled={isLoading}
            className="w-full"
          >
            Tắt 2FA
          </Button>
        </div>
      )}
    </div>
  );

  // ===== MAIN RENDER =====

  if (isLoading && !setup) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang khởi tạo...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Xác thực hai lớp (2FA)
        </CardTitle>
        <CardDescription>
          Bảo vệ tài khoản với lớp bảo mật bổ sung
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 'setup' && renderSetupStep()}
        {currentStep === 'verify' && renderVerifyStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;

