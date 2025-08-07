'use client';

import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { authService } from '@/lib/api/auth.service';

/**
 * Trang quên mật khẩu cho NyNus platform
 */
export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRateLimitError(false);

    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Địa chỉ email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';

      // Check for rate limiting error
      if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quá nhiều')) {
        setRateLimitError(true);
        setError('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800">Email đã được gửi!</h2>
              <p className="text-gray-600">
                Nếu email <strong>{email}</strong> tồn tại trong hệ thống, 
                bạn sẽ nhận được email hướng dẫn reset mật khẩu trong vài phút.
              </p>
              <div className="space-y-3 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">📧 Thông tin quan trọng:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Link đặt lại mật khẩu có hiệu lực trong <strong>1 giờ</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Link chỉ có thể sử dụng <strong>một lần duy nhất</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Kiểm tra thư mục <strong>Spam/Junk</strong> nếu không thấy email</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu</CardTitle>
          <CardDescription className="text-center">
            Nhập email để nhận hướng dẫn reset mật khẩu
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant={rateLimitError ? "default" : "destructive"} className={rateLimitError ? "border-orange-200 bg-orange-50" : ""}>
                <AlertDescription className={rateLimitError ? "text-orange-800" : ""}>
                  {error}
                  {rateLimitError && (
                    <div className="mt-2 text-sm">
                      <p>💡 <strong>Mẹo:</strong> Để bảo vệ hệ thống, chúng tôi giới hạn 5 yêu cầu mỗi giờ cho mỗi email.</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Lưu ý:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Email reset sẽ có hiệu lực trong 1 giờ</li>
                <li>• Kiểm tra thư mục Spam nếu không thấy email</li>
                <li>• Chỉ có thể yêu cầu reset 3 lần/giờ</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi email...
                </>
              ) : (
                'Gửi email reset'
              )}
            </Button>

            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Quay lại đăng nhập
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Đăng ký tài khoản
              </Link>
            </div>

            <div className="text-center text-sm text-gray-500">
              Cần hỗ trợ?{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Liên hệ với chúng tôi
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
