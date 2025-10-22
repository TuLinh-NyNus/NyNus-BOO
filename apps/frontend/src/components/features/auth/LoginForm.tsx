"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, Loader2, LogIn } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAuth } from "@/contexts/auth-context-grpc";
import { loginSchema, type LoginFormData } from "@/lib/validation/auth-schemas";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
  className?: string;
  showGoogleLogin?: boolean;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
  className,
  showGoogleLogin = true,
  showRememberMe = true,
  showForgotPassword = true,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, loginWithGoogle, isLoading } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);

      // ✅ FIX: Don't call onSuccess() immediately after login
      // The login() function in AuthContext handles redirect to /dashboard
      // Modal will automatically close when page navigates away
      // This prevents race condition between modal close and redirect
      // onSuccess?.(); // ❌ REMOVED - causes modal to close before redirect completes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(errorMessage);
      logger.error("[LoginForm] Login failed", {
        error: err instanceof Error ? err.message : String(err),
        email: data.email,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await loginWithGoogle();

      // ✅ FIX: Don't call onSuccess() immediately after Google login
      // The loginWithGoogle() function in AuthContext handles redirect to /dashboard
      // Modal will automatically close when page navigates away
      // onSuccess?.(); // ❌ REMOVED - causes modal to close before redirect completes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập Google thất bại";
      setError(errorMessage);
      logger.error("[LoginForm] Google login failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Đăng nhập</h2>
        <p className="text-muted-foreground">
          Truy cập vào hệ thống học toán thông minh với AI của NyNus
        </p>
      </div>

      {/* Google Login Button */}
      {showGoogleLogin && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FaGoogle className="h-4 w-4 mr-2 text-red-500" />
          )}
          Đăng nhập với Google
        </Button>
      )}

      {/* Divider */}
      {showGoogleLogin && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Hoặc tiếp tục với email
            </span>
          </div>
        </div>
      )}

      {/* Login Form */}
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
                      placeholder="Địa chỉ email"
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

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            {showRememberMe && (
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Ghi nhớ đăng nhập
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {showForgotPassword && (
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={onForgotPassword}
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
            )}
          </div>

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
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Đăng nhập
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Switch to Register */}
      {onSwitchToRegister && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
