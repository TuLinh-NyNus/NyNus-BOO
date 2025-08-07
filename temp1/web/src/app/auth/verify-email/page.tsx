'use client';

import { Loader2, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui';
import { Card, CardContent, CardFooter } from "@/components/ui/display/card";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { authService } from '@/lib/api/auth.service';

/**
 * Trang xác thực email cho NyNus platform
 */
export default function VerifyEmailPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setIsLoading(false);
      setError('Token xác thực không hợp lệ');
    }
  }, [token]);

  /**
   * Verify email with token
   */
  const verifyEmail = async (verificationToken: string) => {
    try {
      await authService.verifyEmail(verificationToken);
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Xác thực email thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend verification email
   */
  const handleResendEmail = async () => {
    const email = prompt('Vui lòng nhập email của bạn:');
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Email không hợp lệ');
      return;
    }

    setResendLoading(true);
    try {
      await authService.resendVerificationEmail(email);
      alert('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Không thể gửi lại email xác thực');
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="mx-auto h-16 w-16 text-blue-600 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-800">Đang xác thực email...</h2>
              <p className="text-gray-600">
                Vui lòng đợi trong khi chúng tôi xác thực email của bạn.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800">Email đã được xác thực!</h2>
              <p className="text-gray-600">
                Tài khoản của bạn đã được kích hoạt thành công.
                Bạn có thể đăng nhập và sử dụng đầy đủ các tính năng của NyNus.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Bước tiếp theo:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Đăng nhập vào tài khoản của bạn</li>
                  <li>• Hoàn thiện thông tin cá nhân</li>
                  <li>• Khám phá các khóa học và bài tập</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Đăng nhập ngay
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-600" />
            <h2 className="text-2xl font-bold text-red-800">Xác thực thất bại</h2>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <p className="text-gray-600">
                Link xác thực có thể đã hết hạn hoặc không hợp lệ.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Có thể do:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Link đã hết hạn (24 giờ)</li>
                  <li>• Link đã được sử dụng</li>
                  <li>• Email đã được xác thực trước đó</li>
                  <li>• Link bị hỏng hoặc không đầy đủ</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Bạn có thể yêu cầu gửi lại email xác thực:
                </p>
                <Button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  variant="outline"
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Gửi lại email xác thực
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Đăng nhập
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Cần hỗ trợ?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Liên hệ với chúng tôi
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
