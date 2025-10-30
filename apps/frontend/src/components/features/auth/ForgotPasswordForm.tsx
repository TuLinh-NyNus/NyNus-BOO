"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, Send, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAuth } from "@/contexts/auth-context-grpc";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validation/auth-schemas";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  className?: string;
}

export function ForgotPasswordForm({
  onSuccess,
  onBackToLogin,
  className,
}: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword } = useAuth();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      await forgotPassword(data.email);
      
      setIsSuccess(true);
      
      // Auto redirect after success
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể gửi email đặt lại mật khẩu";
      setError(errorMessage);
      logger.error("[ForgotPasswordForm] Failed to send reset email", {
        error: err instanceof Error ? err.message : String(err),
        email: data.email,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("space-y-6 text-center", className)}>
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Email đã được gửi</h2>
          <p className="text-muted-foreground">
            Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu đến địa chỉ email của bạn.
          </p>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <div className="space-y-2 text-left">
              <p className="font-medium">Hướng dẫn tiếp theo:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Kiểm tra hộp thư đến của bạn</li>
                <li>Tìm email từ NyNus với tiêu đề &ldquo;Đặt lại mật khẩu&rdquo;</li>
                <li>Nhấp vào liên kết trong email để đặt lại mật khẩu</li>
                <li>Nếu không thấy email, hãy kiểm tra thư mục spam</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
          >
            Gửi lại email
          </Button>
          
          {onBackToLogin && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại đăng nhập
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Quên mật khẩu</h2>
        <p className="text-muted-foreground">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Địa chỉ email của bạn"
                      className="pl-10"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Gửi liên kết đặt lại
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Back to Login */}
      {onBackToLogin && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onBackToLogin}
            disabled={isLoading}
            className="text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại đăng nhập
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu nếu địa chỉ email tồn tại trong hệ thống.
        </p>
      </div>
    </div>
  );
}

