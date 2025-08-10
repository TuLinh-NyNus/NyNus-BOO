"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { AuthIllustration } from "@/components/ui/auth-illustration";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function AuthModal({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  // Google OAuth login handler
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);

      await loginWithGoogle();

      // Close modal on successful login
      onClose();
      onLogin(); // Notify parent component
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Đăng nhập Google thất bại');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
    setError(null); // Clear error when switching modes
  };

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(124, 58, 237, 0.4) 100%)',
            backdropFilter: 'blur(15px)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
              {/* Left Side - Illustration */}
              <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-purple-600/10 to-blue-600/10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-sm"
                >
                  {/* Beautiful SVG Illustration */}
                  <div className="aspect-square rounded-3xl flex items-center justify-center overflow-hidden">
                    <AuthIllustration className="w-full h-full" />
                  </div>
                </motion.div>
              </div>

              {/* Right Side - Form */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isLoginMode ? "Đăng nhập" : "Đăng ký"}
                  </h2>
                  <p className="text-white/70 mb-8">
                    {isLoginMode
                      ? "Truy cập vào hệ thống học toán thông minh với AI của NyNus"
                      : "Tham gia cùng hàng nghìn học viên và bắt đầu hành trình học tập"
                    }
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <input
                        type="email"
                        placeholder="Địa chỉ email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      {isLoginMode ? "Đăng nhập" : "Đăng ký"}
                    </Button>
                  </form>

                  {/* Divider */}
                  {isLoginMode && (
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/20" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-white/70 text-xs">
                          hoặc
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Google Login Button */}
                  {isLoginMode && (
                    <Button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FaGoogle className="h-5 w-5 text-red-400" />
                      )}
                      {isGoogleLoading ? "Đang đăng nhập..." : "Đăng nhập bằng Google"}
                    </Button>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-300 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  {/* Additional Links */}
                  <div className="space-y-4 text-center">
                      {isLoginMode && (
                        <button
                          type="button"
                          className="text-cyan-300 hover:text-cyan-200 text-sm transition-colors"
                        >
                          Quên mật khẩu?
                        </button>
                      )}

                      <div className="text-white/70 text-sm">
                        {isLoginMode ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                        <button
                          type="button"
                          onClick={switchMode}
                          className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                        >
                          {isLoginMode ? "Đăng ký ngay" : "Đăng nhập"}
                        </button>
                      </div>

                      {!isLoginMode && (
                        <div className="text-white/70 text-sm">
                          Cần hỗ trợ đăng ký?{" "}
                          <button
                            type="button"
                            className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                          >
                            Liên hệ hỗ trợ
                          </button>
                        </div>
                      )}
                    </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
