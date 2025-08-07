'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui';
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/form/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";


const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError(null);
    setRateLimitError(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Có lỗi xảy ra';

        // Check for rate limiting error
        if (response.status === 429 || errorMessage.includes('rate limit') || errorMessage.includes('quá nhiều')) {
          setRateLimitError(true);
          setError('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ.');
        } else {
          setError(errorMessage);
        }
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    setRateLimitError(false);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Quên mật khẩu
          </DialogTitle>
          <DialogDescription>
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút.
              </AlertDescription>
            </Alert>
            <div className="text-sm bg-blue-50 p-3 rounded-lg space-y-2">
              <p className="font-medium text-blue-800">📧 Thông tin quan trọng:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Link đặt lại mật khẩu có hiệu lực trong <strong>1 giờ</strong></li>
                <li>• Link chỉ có thể sử dụng <strong>một lần duy nhất</strong></li>
                <li>• Kiểm tra thư mục <strong>Spam/Junk</strong> nếu không thấy email</li>
              </ul>
            </div>
            <Button onClick={handleClose} className="w-full">
              Đóng
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant={rateLimitError ? "default" : "destructive"} className={rateLimitError ? "border-orange-200 bg-orange-50" : ""}>
                  <AlertCircle className="h-4 w-4" />
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Nhập email của bạn"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi email'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
