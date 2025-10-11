'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { AuthService } from '@/services/grpc/auth.service';
import { convertProtobufVerifyEmailResponse, convertProtobufSendVerificationEmailResponse } from '@/lib/utils/protobuf-converters';
import { useAuth } from '@/contexts/auth-context-grpc';

type VerificationState = 'loading' | 'success' | 'error' | 'invalid-token' | 'expired-token';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      setState('loading');
      
      const protobufResponse = await AuthService.verifyEmail(verificationToken);
      const response = convertProtobufVerifyEmailResponse(protobufResponse);

      if (response.success) {
        setState('success');
        setMessage(response.message || 'Email đã được xác thực thành công!');
        
        // Note: User data will be refreshed on next page load or login
        
        toast({
          title: 'Xác thực thành công!',
          description: 'Email của bạn đã được xác thực. Bạn có thể đăng nhập bình thường.',
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        // Handle different error cases
        if (response.message.includes('expired')) {
          setState('expired-token');
          setMessage('Token xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.');
        } else if (response.message.includes('invalid') || response.message.includes('used')) {
          setState('invalid-token');
          setMessage('Token xác thực không hợp lệ hoặc đã được sử dụng.');
        } else {
          setState('error');
          setMessage(response.message || 'Không thể xác thực email. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      setState('error');
      setMessage((error as Error).message || 'Đã xảy ra lỗi khi xác thực email.');
    }
  }, [router, toast]);

  // Verify email on component mount
  useEffect(() => {
    if (!token) {
      setState('invalid-token');
      setMessage('Token xác thực không hợp lệ hoặc bị thiếu');
      return;
    }

    verifyEmail(token);
  }, [token, verifyEmail]);

  const handleResendVerification = async () => {
    if (!user?.id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để gửi lại email xác thực.',
        variant: 'error',
      });
      return;
    }

    try {
      setIsResending(true);
      
      const protobufResponse = await AuthService.sendVerificationEmail(user.id);
      const response = convertProtobufSendVerificationEmailResponse(protobufResponse);

      if (response.success) {
        toast({
          title: 'Email đã được gửi!',
          description: 'Vui lòng kiểm tra hộp thư để nhận email xác thực mới.',
        });
      } else {
        toast({
          title: 'Không thể gửi email',
          description: response.message || 'Đã xảy ra lỗi khi gửi email xác thực.',
          variant: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: (error as Error).message || 'Không thể gửi email xác thực.',
        variant: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">Đang xác thực email...</CardTitle>
              <CardDescription>
                Vui lòng chờ trong khi chúng tôi xác thực email của bạn
              </CardDescription>
            </CardHeader>
          </Card>
        );

      case 'success':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">Xác thực thành công!</CardTitle>
              <CardDescription className="mt-2">
                {message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Email của bạn đã được xác thực thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full">
                  Đăng nhập ngay
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );

      case 'expired-token':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-orange-700">Token đã hết hạn</CardTitle>
              <CardDescription className="mt-2">
                {message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Token xác thực có hiệu lực trong 24 giờ. Vui lòng yêu cầu gửi lại email xác thực mới.
                </AlertDescription>
              </Alert>

              {user && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Gửi lại email xác thực
                    </>
                  )}
                </Button>
              )}
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
        );

      case 'invalid-token':
      case 'error':
      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-700">Xác thực thất bại</CardTitle>
              <CardDescription className="mt-2">
                {message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Không thể xác thực email của bạn. Vui lòng kiểm tra lại link hoặc yêu cầu gửi lại email xác thực.
                </AlertDescription>
              </Alert>

              {user && state !== 'invalid-token' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Gửi lại email xác thực
                    </>
                  )}
                </Button>
              )}
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
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {renderContent()}
    </div>
  );
}
