"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthIllustration } from "@/components/ui/auth-illustration";

import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

type AuthMode = "login" | "register" | "forgot-password";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
  showIllustration?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
  showIllustration = true,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    setMode("login"); // Reset to login mode when closing
    onClose();
  };

  const getModalTitle = () => {
    switch (mode) {
      case "login":
        return "Đăng nhập";
      case "register":
        return "Đăng ký";
      case "forgot-password":
        return "Quên mật khẩu";
      default:
        return "Xác thực";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Illustration */}
          {showIllustration && (
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 to-primary/5 p-8">
              <AuthIllustration />
              <div className="text-center mt-6 space-y-2">
                <h3 className="text-xl font-semibold text-primary">
                  Hệ thống học toán thông minh
                </h3>
                <p className="text-muted-foreground">
                  Khám phá phương pháp học toán hiệu quả với AI
                </p>
              </div>
            </div>
          )}

          {/* Right Side - Form */}
          <div className="flex flex-col">
            {/* Header */}
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  {getModalTitle()}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Form Content */}
            <div className="flex-1 p-6 pt-4">
              {mode === "login" && (
                <LoginForm
                  onSuccess={handleSuccess}
                  onSwitchToRegister={() => setMode("register")}
                  onForgotPassword={() => setMode("forgot-password")}
                  showGoogleLogin={true}
                  showRememberMe={true}
                  showForgotPassword={true}
                />
              )}

              {mode === "register" && (
                <RegisterForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={() => setMode("login")}
                  showGoogleLogin={true}
                />
              )}

              {mode === "forgot-password" && (
                <ForgotPasswordForm
                  onSuccess={() => setMode("login")}
                  onBackToLogin={() => setMode("login")}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Convenience hooks for different auth modes
export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const openLogin = () => {
    setMode("login");
    setIsOpen(true);
  };

  const openRegister = () => {
    setMode("register");
    setIsOpen(true);
  };

  const openForgotPassword = () => {
    setMode("forgot-password");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    mode,
    openLogin,
    openRegister,
    openForgotPassword,
    close,
  };
}
