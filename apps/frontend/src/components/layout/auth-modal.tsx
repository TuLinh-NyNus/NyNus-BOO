"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { useAuth } from "@/contexts/auth-context";
import { AuthIllustration } from "@/components/ui/auth-illustration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function AuthModal({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const { loginWithGoogle, forgotPassword, isLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      onLogin();
    } else {
      onRegister();
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await loginWithGoogle();
      onClose();
      onLogin();
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Đăng nhập Google thất bại');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setIsForgotMode(false);
    setIsLoginMode(!isLoginMode);
    resetForm();
    setError(null);
    setForgotSuccess(null);
  };

  const switchToForgot = () => {
    setIsForgotMode(true);
    setError(null);
    setForgotSuccess(null);
  };

  const backToLogin = () => {
    setIsForgotMode(false);
    setIsLoginMode(true);
    setError(null);
    setForgotSuccess(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="p-0 overflow-hidden sm:rounded-2xl bg-card text-card-foreground border border-border max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
          {/* Left Side - Illustration */}
          <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-[color:var(--color-primary)]/15 to-[color:var(--color-secondary)]/15 dark:from-indigo-500/10 dark:to-cyan-500/10">
            <div className="w-full max-w-sm">
              <div className="aspect-square rounded-3xl flex items-center justify-center overflow-hidden">
                <AuthIllustration className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col justify-center p-6 lg:p-10">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-primary">
                {isForgotMode ? "Quên mật khẩu" : isLoginMode ? "Đăng nhập" : "Đăng ký"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isForgotMode
                  ? "Nhập email của bạn để nhận liên kết đặt lại mật khẩu."
                  : isLoginMode
                    ? "Truy cập vào hệ thống học toán thông minh với AI của NyNus"
                    : "Tham gia cùng hàng nghìn học viên và bắt đầu hành trình học tập"}
              </DialogDescription>
            </DialogHeader>

            {/* Form */}
            {!isForgotMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Địa chỉ email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Mật khẩu"
                      autoComplete={isLoginMode ? "current-password" : "new-password"}
                      required
                      aria-invalid={!!error}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="text-sm rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoginMode ? "Đăng nhập" : "Đăng ký"}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await forgotPassword(email);
                    setForgotSuccess("Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Không thể gửi liên kết đặt lại");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Nhập email của bạn"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div role="alert" className="text-sm rounded-md border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2">
                    {error}
                  </div>
                )}

                {forgotSuccess && (
                  <div className="text-sm rounded-md border border-ring/20 bg-muted text-foreground px-3 py-2">
                    {forgotSuccess}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  Gửi liên kết đặt lại
                </Button>
              </form>
            )}

            {/* Extra actions */}
            {!isForgotMode && isLoginMode && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">hoặc</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FaGoogle className="mr-2 h-4 w-4" />
                  )}
                  {isGoogleLoading ? "Đang đăng nhập..." : "Đăng nhập bằng Google"}
                </Button>
              </>
            )}

            <div className="mt-6 space-y-3 text-center">
              {!isForgotMode && isLoginMode && (
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={switchToForgot}
                >
                  Quên mật khẩu?
                </button>
              )}

              {!isForgotMode && (
                <div className="text-sm text-muted-foreground">
                  {isLoginMode ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-medium text-primary hover:underline"
                  >
                    {isLoginMode ? "Đăng ký ngay" : "Đăng nhập"}
                  </button>
                </div>
              )}

              {isForgotMode && (
                <div className="text-sm text-muted-foreground">
                  Nhớ mật khẩu? {" "}
                  <button type="button" onClick={backToLogin} className="font-medium text-primary hover:underline">
                    Đăng nhập
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
