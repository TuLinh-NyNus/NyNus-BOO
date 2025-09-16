'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, KeyRound, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/services/grpc/auth.service';

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength indicators
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  useEffect(() => {
    // Calculate password strength
    const checks = Object.values(passwordChecks).filter(Boolean).length;
    setPasswordStrength((checks / 5) * 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const validateForm = (): boolean => {
    if (!password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return false;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (passwordStrength < 60) {
      setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      const response = await authService.resetPassword({
        token: params.token,
        password: password,
      });

      if (response.success) {
        setSuccess(true);
        toast({
          title: 'Mật khẩu đã được đặt lại!',
          description: 'Bạn có thể đăng nhập với mật khẩu mới.',
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.message || 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.');
      }
    } catch (err) {
      setError((err as Error).message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-orange-500';
    if (passwordStrength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Yếu';
    if (passwordStrength < 60) return 'Trung bình';
    if (passwordStrength < 80) return 'Khá mạnh';
    return 'Mạnh';
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu thành công!</CardTitle>
            <CardDescription className="mt-2">
              Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang đăng nhập...
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Progress value={100} className="w-full" />
          </CardContent>

          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full">
                Đến trang đăng nhập
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Đặt lại mật khẩu</CardTitle>
          <CardDescription className="text-center">
            Nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="pl-9 pr-9"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Độ mạnh:</span>
                    <span className={`text-sm font-medium ${passwordStrength >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className={`h-2 ${getPasswordStrengthColor()}`} />
                  
                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center space-x-1">
                      {passwordChecks.minLength ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={passwordChecks.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                        Ít nhất 8 ký tự
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {passwordChecks.hasUpperCase ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={passwordChecks.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}>
                        Chữ hoa
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {passwordChecks.hasLowerCase ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={passwordChecks.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}>
                        Chữ thường
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {passwordChecks.hasNumber ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={passwordChecks.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                        Chữ số
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {passwordChecks.hasSpecial ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={passwordChecks.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}>
                        Ký tự đặc biệt
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  className="pl-9 pr-9"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || passwordStrength < 60 || password !== confirmPassword}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Đang xử lý...
                </span>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Nhớ mật khẩu?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            Token hết hạn?{' '}
            <Link href="/forgot-password" className="text-primary hover:underline font-medium">
              Gửi lại email
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}