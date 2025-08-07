'use client';

import { 
  Shield, 
  QrCode, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle,
  Smartphone,
  Download,
  RefreshCw
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Separator } from "@/components/ui/display/separator";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/utils/logger';

/**
 * Two-Factor Authentication Setup Component
 * 
 * Component này cung cấp:
 * - Setup 2FA với QR code
 * - Hiển thị backup codes
 * - Enable/disable 2FA
 * - Regenerate backup codes
 * - 2FA status management
 */

interface TwoFactorSetupProps {
  userId: string;
}

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorStatus {
  enabled: boolean;
  enabledAt?: Date;
  remainingBackupCodes: number;
}

function TwoFactorSetup({ userId }: TwoFactorSetupProps): JSX.Element {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');
  const [copiedCodes, setCopiedCodes] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load 2FA status
  useEffect(() => {
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải trạng thái 2FA');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể khởi tạo setup 2FA');
      }

      const data = await response.json();
      setSetupData(data);
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ totpCode }),
      });

      if (!response.ok) {
        throw new Error('Mã xác thực không chính xác');
      }

      toast({
        title: 'Thành công',
        description: '2FA đã được kích hoạt thành công',
      });

      setStep('status');
      setTotpCode('');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/2fa/disable', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ totpCode }),
      });

      if (!response.ok) {
        throw new Error('Mã xác thực không chính xác');
      }

      toast({
        title: 'Thành công',
        description: '2FA đã được tắt',
      });

      setTotpCode('');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ totpCode }),
      });

      if (!response.ok) {
        throw new Error('Mã xác thực không chính xác');
      }

      const data = await response.json();
      
      toast({
        title: 'Thành công',
        description: 'Backup codes đã được tạo mới',
      });

      // Show new backup codes
      setSetupData(prev => prev ? { ...prev, backupCodes: data.backupCodes } : null);
      setTotpCode('');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCodes(prev => new Set([...prev, text]));
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(text);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;

    const content = `NyNus 2FA Backup Codes\n\nLưu trữ các mã này ở nơi an toàn. Mỗi mã chỉ có thể sử dụng một lần.\n\n${setupData.backupCodes.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nynus-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xác thực hai yếu tố (2FA)</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Xác thực hai yếu tố (2FA)
          </CardTitle>
          <CardDescription>
            Tăng cường bảo mật tài khoản với xác thực hai yếu tố
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status View */}
          {step === 'status' && status && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Trạng thái 2FA</h3>
                  <p className="text-sm text-muted-foreground">
                    {status.enabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                  </p>
                </div>
                <Badge variant={status.enabled ? 'default' : 'secondary'}>
                  {status.enabled ? 'Đã bật' : 'Đã tắt'}
                </Badge>
              </div>

              {status.enabled && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Backup codes còn lại: {status.remainingBackupCodes}
                  </p>
                  {status.enabledAt && (
                    <p className="text-sm text-muted-foreground">
                      Kích hoạt lúc: {new Date(status.enabledAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                {!status.enabled ? (
                  <Button onClick={startSetup} disabled={loading}>
                    <Shield className="h-4 w-4 mr-2" />
                    Kích hoạt 2FA
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="disable-totp">Nhập mã TOTP để tắt 2FA</Label>
                      <div className="flex gap-2">
                        <Input
                          id="disable-totp"
                          type="text"
                          placeholder="123456"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value)}
                          maxLength={6}
                        />
                        <Button 
                          variant="destructive" 
                          onClick={disable2FA} 
                          disabled={loading || totpCode.length !== 6}
                        >
                          Tắt 2FA
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {status.enabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="regen-totp">Tạo lại backup codes</Label>
                    <div className="flex gap-2">
                      <Input
                        id="regen-totp"
                        type="text"
                        placeholder="123456"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        maxLength={6}
                      />
                      <Button 
                        variant="outline" 
                        onClick={regenerateBackupCodes} 
                        disabled={loading || totpCode.length !== 6}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tạo lại
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Setup View */}
          {step === 'setup' && setupData && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-medium mb-2">Bước 1: Quét mã QR</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sử dụng ứng dụng authenticator để quét mã QR này
                </p>
                <div className="flex justify-center">
                  <img 
                    src={setupData.qrCodeUrl} 
                    alt="QR Code for 2FA setup"
                    className="border rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hoặc nhập secret key thủ công:</Label>
                <div className="flex gap-2">
                  <Input value={setupData.secret} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupData.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Bước 2: Lưu backup codes</h3>
                <p className="text-sm text-muted-foreground">
                  Lưu trữ các mã này ở nơi an toàn. Chúng có thể được sử dụng để truy cập tài khoản khi bạn mất thiết bị.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <code className="flex-1 text-sm">{code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(code)}
                      >
                        {copiedCodes.has(code) ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <Button variant="outline" onClick={downloadBackupCodes} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống backup codes
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="verify-totp">Bước 3: Xác thực</Label>
                <p className="text-sm text-muted-foreground">
                  Nhập mã 6 chữ số từ ứng dụng authenticator
                </p>
                <div className="flex gap-2">
                  <Input
                    id="verify-totp"
                    type="text"
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button 
                    onClick={enable2FA} 
                    disabled={loading || totpCode.length !== 6}
                  >
                    Kích hoạt 2FA
                  </Button>
                </div>
              </div>

              <Button variant="outline" onClick={() => setStep('status')}>
                Hủy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for lazy loading
export default TwoFactorSetup;
