"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, Loader2, UserPlus } from "lucide-react";
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
import { logger } from "@/lib/logger";

import { useAuth } from "@/contexts/auth-context-grpc";
import { registerSchema, type RegisterFormData, checkPasswordStrength } from "@/lib/validation/auth-schemas";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
  showGoogleLogin?: boolean;
}

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
  className,
  showGoogleLogin = true,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, loginWithGoogle, isLoading } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      acceptTerms: false,
    },
  });

  const watchedPassword = form.watch("password");
  const passwordStrength = watchedPassword ? checkPasswordStrength(watchedPassword) : null;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await register(data.email, data.password, data.firstName, data.lastName);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng ký thất bại";
      setError(errorMessage);
      logger.error("[RegisterForm] Registration failed", {
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
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập Google thất bại";
      setError(errorMessage);
      logger.error("[RegisterForm] Google login failed", {
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
        <h2 className="text-2xl font-bold text-foreground">Đăng ký</h2>
        <p className="text-muted-foreground">
          Tham gia cùng hàng nghìn học viên và bắt đầu hành trình học tập
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
          Đăng ký với Google
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
              Hoặc đăng ký với email
            </span>
          </div>
        </div>
      )}

      {/* Register Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Họ"
                        className="pl-10"
                        autoComplete="given-name"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Tên"
                        className="pl-10"
                        autoComplete="family-name"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                      autoComplete="new-password"
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
                
                {/* Password Strength Indicator */}
                {passwordStrength && watchedPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Độ mạnh mật khẩu:</span>
                      <span className={cn("font-medium", passwordStrength.color)}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={cn("h-2 rounded-full transition-all", passwordStrength.color)}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.suggestions.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {passwordStrength.suggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms Acceptance */}
          <FormField
            control={form.control}
            name="acceptTerms"
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
                  <FormLabel className="text-sm">
                    Tôi đồng ý với{" "}
                    <a href="/terms" className="text-primary hover:underline" target="_blank">
                      Điều khoản sử dụng
                    </a>{" "}
                    và{" "}
                    <a href="/privacy" className="text-primary hover:underline" target="_blank">
                      Chính sách bảo mật
                    </a>
                  </FormLabel>
                  <FormMessage />
                </div>
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
          <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Đăng ký
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={onSwitchToLogin}
              disabled={isLoading}
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

