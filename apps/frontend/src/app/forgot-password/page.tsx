'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/services/grpc/auth.service';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSubmitted(true);
        toast({
          title: 'Email đã được gửi!',
          description: 'Vui lòng kiểm tra hộp thư để reset mật khẩu.',
        });
      } else {
        setError(response.message || 'Không thể gửi email reset mật khẩu');
      }
    } catch (err) {
      setError((err as Error).message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Kiểm tra email của bạn</CardTitle>
            <CardDescription className="mt-2">
              Chúng tôi đã gửi hướng dẫn reset mật khẩu đến
              <br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Nếu bạn không nhận được email trong vài phút, vui lòng kiểm tra thư mục spam hoặc thử lại.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
            >
              Gửi lại email
            </Button>
          </CardContent>

          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đăng nhập
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
          <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu?</CardTitle>
          <CardDescription className="text-center">
            Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn reset mật khẩu
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-9"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Đang gửi...
                </span>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi email reset mật khẩu
                </>
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
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}