'use client';

import { Shield, Key, AlertTriangle, CheckCircle, Eye, EyeOff, RefreshCw, Lock } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Progress,
  Switch
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/lib/api/admin-users.service';

interface PasswordSecurityManagerProps {
  user: AdminUser;
}

interface SecurityAudit {
  id: string;
  type: 'PASSWORD_WEAK' | 'LOGIN_SUSPICIOUS' | 'ACCOUNT_LOCKED' | 'PERMISSION_CHANGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
}

const mockSecurityAudits: SecurityAudit[] = [
  {
    id: '1',
    type: 'PASSWORD_WEAK',
    severity: 'MEDIUM',
    message: 'Mật khẩu không đủ mạnh theo chính sách bảo mật',
    timestamp: '2024-06-15T10:30:00Z',
    resolved: false,
  },
  {
    id: '2',
    type: 'LOGIN_SUSPICIOUS',
    severity: 'HIGH',
    message: 'Đăng nhập từ địa chỉ IP lạ: 192.168.1.100',
    timestamp: '2024-06-14T22:15:00Z',
    resolved: true,
  },
];

const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90,
  preventReuse: 5,
};

const severityColors = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function PasswordSecurityManager({ user }: PasswordSecurityManagerProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(user.forcePasswordChange || false);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(defaultPasswordPolicy);
  const [securityAudits] = useState<SecurityAudit[]>(mockSecurityAudits);
  const [resetDialog, setResetDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < passwordPolicy.minLength) {
      errors.push(`Tối thiểu ${passwordPolicy.minLength} ký tự`);
    }
    if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Phải có ít nhất 1 chữ hoa');
    }
    if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Phải có ít nhất 1 chữ thường');
    }
    if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Phải có ít nhất 1 số');
    }
    if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Phải có ít nhất 1 ký tự đặc biệt');
    }

    return errors;
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    if (password.length >= 16) score += 10;

    return Math.min(score, 100);
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score < 30) return { label: 'Rất yếu', color: 'text-red-600' };
    if (score < 50) return { label: 'Yếu', color: 'text-orange-600' };
    if (score < 70) return { label: 'Trung bình', color: 'text-yellow-600' };
    if (score < 90) return { label: 'Mạnh', color: 'text-green-600' };
    return { label: 'Rất mạnh', color: 'text-green-700' };
  };

  const handlePasswordReset = async () => {
    const errors = validatePassword(newPassword);

    if (errors.length > 0) {
      toast({
        title: 'Mật khẩu không hợp lệ',
        description: errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Thành công',
        description: 'Đã đặt lại mật khẩu cho người dùng',
      });

      setNewPassword('');
      setConfirmPassword('');
      setResetDialog(false);

    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đặt lại mật khẩu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForcePasswordChange = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Thành công',
        description: forcePasswordChange
          ? 'Người dùng sẽ phải đổi mật khẩu khi đăng nhập lần tiếp theo'
          : 'Đã hủy yêu cầu đổi mật khẩu bắt buộc',
      });

    } catch (error) {
      console.error('Error updating force password change:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật cài đặt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one character from each required type
    password += 'A'; // uppercase
    password += 'a'; // lowercase
    password += '1'; // number
    password += '!'; // special char

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);
  const passwordErrors = validatePassword(newPassword);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quản lý mật khẩu & bảo mật
          </CardTitle>
          <CardDescription>
            Cài đặt bảo mật và quản lý mật khẩu cho {user.firstName} {user.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="space-y-4">
            <TabsList>
              <TabsTrigger value="password">Mật khẩu</TabsTrigger>
              <TabsTrigger value="policy">Chính sách</TabsTrigger>
              <TabsTrigger value="audit">Kiểm tra bảo mật</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-6">
              {/* Current Password Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Trạng thái mật khẩu hiện tại</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Key className="h-8 w-8 text-blue-600" />
                        <div>
                          <div className="font-medium">Lần đổi cuối</div>
                          <div className="text-sm text-muted-foreground">
                            {user.updatedAt ? formatDate(user.updatedAt) : 'Chưa rõ'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Lock className="h-8 w-8 text-orange-600" />
                        <div>
                          <div className="font-medium">Bắt buộc đổi mật khẩu</div>
                          <div className="text-sm text-muted-foreground">
                            {forcePasswordChange ? 'Có' : 'Không'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Force Password Change */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cài đặt bảo mật</h3>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="forcePasswordChange">Bắt buộc đổi mật khẩu</Label>
                    <p className="text-sm text-muted-foreground">
                      Người dùng sẽ phải đổi mật khẩu khi đăng nhập lần tiếp theo
                    </p>
                  </div>
                  <Switch
                    id="forcePasswordChange"
                    checked={forcePasswordChange}
                    onCheckedChange={(checked) => {
                      setForcePasswordChange(checked);
                      handleForcePasswordChange();
                    }}
                  />
                </div>
              </div>

              {/* Password Reset */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Đặt lại mật khẩu</h3>

                <Button onClick={() => setResetDialog(true)} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Đặt lại mật khẩu
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="policy" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Chính sách mật khẩu</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">Độ dài tối thiểu</Label>
                    <Input
                      id="minLength"
                      type="number"
                      min="6"
                      max="32"
                      value={passwordPolicy.minLength}
                      onChange={(e) => setPasswordPolicy(prev => ({
                        ...prev,
                        minLength: parseInt(e.target.value) || 8
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAge">Thời hạn mật khẩu (ngày)</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      min="30"
                      max="365"
                      value={passwordPolicy.maxAge}
                      onChange={(e) => setPasswordPolicy(prev => ({
                        ...prev,
                        maxAge: parseInt(e.target.value) || 90
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Yêu cầu ký tự</Label>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">Chữ hoa (A-Z)</Label>
                      <Switch
                        id="requireUppercase"
                        checked={passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({
                          ...prev,
                          requireUppercase: checked
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireLowercase">Chữ thường (a-z)</Label>
                      <Switch
                        id="requireLowercase"
                        checked={passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({
                          ...prev,
                          requireLowercase: checked
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">Số (0-9)</Label>
                      <Switch
                        id="requireNumbers"
                        checked={passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({
                          ...prev,
                          requireNumbers: checked
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">Ký tự đặc biệt (!@#$...)</Label>
                      <Switch
                        id="requireSpecialChars"
                        checked={passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({
                          ...prev,
                          requireSpecialChars: checked
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preventReuse">Ngăn tái sử dụng (số mật khẩu cũ)</Label>
                  <Input
                    id="preventReuse"
                    type="number"
                    min="0"
                    max="10"
                    value={passwordPolicy.preventReuse}
                    onChange={(e) => setPasswordPolicy(prev => ({
                      ...prev,
                      preventReuse: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>

                <Button>
                  Lưu chính sách
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Kiểm tra bảo mật ({securityAudits.length})
                </h3>

                {securityAudits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p>Không có vấn đề bảo mật nào được phát hiện</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {securityAudits.map((audit) => (
                      <Card key={audit.id} className={audit.resolved ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                                audit.severity === 'CRITICAL' ? 'text-red-600' :
                                audit.severity === 'HIGH' ? 'text-orange-600' :
                                audit.severity === 'MEDIUM' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={severityColors[audit.severity]}>
                                    {audit.severity === 'CRITICAL' && 'Nghiêm trọng'}
                                    {audit.severity === 'HIGH' && 'Cao'}
                                    {audit.severity === 'MEDIUM' && 'Trung bình'}
                                    {audit.severity === 'LOW' && 'Thấp'}
                                  </Badge>
                                  {audit.resolved && (
                                    <Badge variant="outline" className="text-green-600">
                                      Đã giải quyết
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium">{audit.message}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(audit.timestamp)}
                                </p>
                              </div>
                            </div>
                            {!audit.resolved && (
                              <Button size="sm" variant="outline">
                                Giải quyết
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialog} onOpenChange={setResetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Tạo mật khẩu mới cho {user.firstName} {user.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Độ mạnh mật khẩu:</span>
                    <span className={strengthInfo.color}>{strengthInfo.label}</span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                </div>
              )}

              {passwordErrors.length > 0 && (
                <div className="text-sm text-red-600">
                  <ul className="list-disc list-inside">
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu..."
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const generated = generateRandomPassword();
                setNewPassword(generated);
                setConfirmPassword(generated);
              }}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tạo mật khẩu ngẫu nhiên
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialog(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={loading || passwordErrors.length > 0 || !newPassword || !confirmPassword}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
