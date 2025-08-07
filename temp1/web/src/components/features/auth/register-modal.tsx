"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { PasswordStrengthIndicator } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { useAuthFormValidation, useSuccessMessage } from "@/hooks/use-auth-validation";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth-schemas";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time validation hooks
  const validation = useAuthFormValidation();
  const successMessage = useSuccessMessage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch form values for real-time validation
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  const watchedConfirmPassword = watch("confirmPassword");

  // Trigger real-time validations
  useEffect(() => {
    validation.name.validateName(watchedName);
  }, [watchedName]); // Remove validation.name dependency

  useEffect(() => {
    validation.email.validateEmail(watchedEmail);
  }, [watchedEmail]); // Remove validation.email dependency

  useEffect(() => {
    validation.password.validatePassword(watchedPassword);
  }, [watchedPassword]); // Remove validation.password dependency

  useEffect(() => {
    validation.passwordMatch.validateMatch(watchedPassword, watchedConfirmPassword);
  }, [watchedPassword, watchedConfirmPassword]); // Remove validation.passwordMatch dependency

  const onSubmit = async (_data: RegisterFormValues) => {
    setRegisterError(null);
    setIsLoading(true);

    try {
      // TODO: Implement registration with API
      // For now, simulate success after validation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      successMessage.showSuccess("Đăng ký thành công! Chào mừng bạn đến với NyNus.");
      setTimeout(() => {
        reset();
        validation.clearAll();
        onSwitchToLogin(); // Switch to login modal
      }, 2000);
    } catch (error) {
      setRegisterError("Đăng ký thất bại. Vui lòng kiểm tra kết nối mạng và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear validations when modal closes
  useEffect(() => {
    if (!isOpen) {
      validation.clearAll();
      setRegisterError(null);
      successMessage.hideSuccess();
    }
  }, [isOpen]); // Remove validation and successMessage dependencies

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl flex overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full fancy-glass z-10"
              aria-label="Close register modal"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Left side - Illustration */}
            <div className="hidden md:block w-1/2 auth-gradient p-8 relative overflow-hidden">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="text-white">
                  <h2 className="text-3xl font-bold mb-2">Tham gia cùng chúng tôi!</h2>
                  <p className="text-indigo-100">Bắt đầu hành trình học tập cùng NyNus ngay hôm nay</p>
                </div>
                
                <div className="flex items-center justify-center h-full">
                  <Image
                    src="/images/login-illustration.svg"
                    alt="Collaborating team illustration"
                    width={400}
                    height={400}
                    className="object-contain"
                    priority
                  />
                </div>
                
                <div className="mt-auto text-sm text-indigo-100">
                  <p>Học toán thông minh với AI, nền tảng học tập cá nhân hóa giúp học sinh đạt kết quả tốt hơn.</p>
                </div>
              </div>
            </div>

            {/* Right side - Register form */}
            <div className="w-full md:w-1/2 flex flex-col p-8">
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Đăng ký tài khoản
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Tạo tài khoản để truy cập đầy đủ tính năng học tập
                  </p>
                </div>

                {/* Success Message */}
                {successMessage.isVisible && successMessage.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-start"
                    role="status"
                    aria-live="polite"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{successMessage.message}</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {registerError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{registerError}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium form-label">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          validation.name.isValid
                            ? "text-green-500"
                            : validation.name.error
                            ? "text-red-500"
                            : "text-slate-400"
                        )} />
                      </div>
                      <input
                        id="name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className={cn(
                          "form-input w-full pl-10 pr-12 py-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200",
                          validation.name.isValid
                            ? "border-green-500 focus:ring-green-500"
                            : validation.name.error || errors.name
                            ? "border-red-500 focus:ring-red-500"
                            : "focus:ring-primary"
                        )}
                        {...register("name")}
                        aria-describedby={validation.name.error || errors.name ? "name-error" : undefined}
                        aria-invalid={!!(validation.name.error || errors.name)}
                      />
                      {/* Validation status icon */}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {validation.name.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : validation.name.error ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    {/* Real-time validation error */}
                    {validation.name.error && (
                      <div
                        id="name-error"
                        className="flex items-center text-red-500 text-sm mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{validation.name.error}</span>
                      </div>
                    )}
                    {/* Form validation error (fallback) */}
                    {!validation.name.error && errors.name && (
                      <div
                        id="name-error"
                        className="flex items-center text-red-500 text-sm mt-1"
                        role="alert"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{errors.name.message}</span>
                      </div>
                    )}
                    {/* Success message */}
                    {validation.name.isValid && !validation.name.error && watchedName && (
                      <div className="flex items-center text-green-600 text-sm mt-1">
                        <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>Họ tên hợp lệ</span>
                      </div>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium form-label">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          validation.email.isValid
                            ? "text-green-500"
                            : validation.email.error
                            ? "text-red-500"
                            : "text-slate-400"
                        )} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className={cn(
                          "form-input w-full pl-10 pr-12 py-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200",
                          validation.email.isValid
                            ? "border-green-500 focus:ring-green-500"
                            : validation.email.error || errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "focus:ring-primary"
                        )}
                        {...register("email")}
                        aria-describedby={validation.email.error || errors.email ? "email-error" : undefined}
                        aria-invalid={!!(validation.email.error || errors.email)}
                      />
                      {/* Validation status icon */}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {validation.email.isValidating ? (
                          <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        ) : validation.email.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : validation.email.error ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                    {/* Real-time validation error */}
                    {validation.email.error && (
                      <div
                        id="email-error"
                        className="flex items-center text-red-500 text-sm mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{validation.email.error}</span>
                      </div>
                    )}
                    {/* Form validation error (fallback) */}
                    {!validation.email.error && errors.email && (
                      <div
                        id="email-error"
                        className="flex items-center text-red-500 text-sm mt-1"
                        role="alert"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                    {/* Success message */}
                    {validation.email.isValid && !validation.email.error && watchedEmail && (
                      <div className="flex items-center text-green-600 text-sm mt-1">
                        <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>Email hợp lệ</span>
                      </div>
                    )}
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium form-label">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          validation.password.isValid
                            ? "text-green-500"
                            : validation.password.error
                            ? "text-red-500"
                            : "text-slate-400"
                        )} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "form-input w-full pl-10 pr-12 py-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200",
                          validation.password.isValid
                            ? "border-green-500 focus:ring-green-500"
                            : validation.password.error || errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "focus:ring-primary"
                        )}
                        {...register("password")}
                        aria-describedby="password-strength password-error"
                        aria-invalid={!!(validation.password.error || errors.password)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-r-xl transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <PasswordStrengthIndicator
                        password={watchedPassword}
                        className="mt-3"
                        showSuggestions={true}
                      />
                    )}

                    {/* Form validation error (fallback) */}
                    {!validation.password.error && errors.password && (
                      <div
                        id="password-error"
                        className="flex items-center text-red-500 text-sm mt-1"
                        role="alert"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{errors.password.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium form-label">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          validation.passwordMatch.isMatching
                            ? "text-green-500"
                            : validation.passwordMatch.error
                            ? "text-red-500"
                            : "text-slate-400"
                        )} />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "form-input w-full pl-10 pr-12 py-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200",
                          validation.passwordMatch.isMatching
                            ? "border-green-500 focus:ring-green-500"
                            : validation.passwordMatch.error || errors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : "focus:ring-primary"
                        )}
                        {...register("confirmPassword")}
                        aria-describedby={validation.passwordMatch.error || errors.confirmPassword ? "confirm-password-error" : undefined}
                        aria-invalid={!!(validation.passwordMatch.error || errors.confirmPassword)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-r-xl transition-colors duration-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        )}
                      </button>
                    </div>

                    {/* Real-time password matching validation */}
                    {validation.passwordMatch.error && (
                      <div
                        id="confirm-password-error"
                        className="flex items-center text-red-500 text-sm mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{validation.passwordMatch.error}</span>
                      </div>
                    )}

                    {/* Form validation error (fallback) */}
                    {!validation.passwordMatch.error && errors.confirmPassword && (
                      <div
                        id="confirm-password-error"
                        className="flex items-center text-red-500 text-sm mt-1"
                        role="alert"
                      >
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{errors.confirmPassword.message}</span>
                      </div>
                    )}

                    {/* Success message */}
                    {validation.passwordMatch.isMatching && !validation.passwordMatch.error && watchedConfirmPassword && (
                      <div className="flex items-center text-green-600 text-sm mt-1">
                        <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>Mật khẩu khớp</span>
                      </div>
                    )}
                  </div>

                  {/* Register button */}
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !watchedName ||
                      !watchedEmail ||
                      !watchedPassword ||
                      !watchedConfirmPassword ||
                      !validation.name.isValid ||
                      !validation.email.isValid ||
                      !validation.password.isValid ||
                      !validation.passwordMatch.isMatching
                    }
                    className={cn(
                      "w-full py-3 font-medium rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 flex items-center justify-center",
                      isLoading ||
                      !watchedName ||
                      !watchedEmail ||
                      !watchedPassword ||
                      !watchedConfirmPassword ||
                      !validation.name.isValid ||
                      !validation.email.isValid ||
                      !validation.password.isValid ||
                      !validation.passwordMatch.isMatching
                        ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                    )}
                    aria-describedby="register-button-status"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span>Đang đăng ký...</span>
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </button>

                  {/* Button status for screen readers */}
                  <div id="register-button-status" className="sr-only" aria-live="polite">
                    {isLoading
                      ? "Đang xử lý đăng ký"
                      : !watchedName || !watchedEmail || !watchedPassword || !watchedConfirmPassword
                      ? "Vui lòng điền đầy đủ thông tin để đăng ký"
                      : !validation.name.isValid || !validation.email.isValid || !validation.password.isValid || !validation.passwordMatch.isMatching
                      ? "Vui lòng sửa các lỗi để tiếp tục đăng ký"
                      : "Sẵn sàng đăng ký"
                    }
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white dark:bg-slate-900 text-sm text-slate-500 dark:text-slate-400">
                        Hoặc đăng ký với
                      </span>
                    </div>
                  </div>

                  {/* Social login */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="flex items-center justify-center py-2.5 fancy-card hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 rounded-xl"
                    >
                      <Image src="/images/google-logo.svg" width={20} height={20} alt="Google logo" className="mr-2" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center py-2.5 fancy-card hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 rounded-xl"
                    >
                      <Image src="/images/facebook-logo.svg" width={20} height={20} alt="Facebook logo" className="mr-2" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
                    </button>
                  </div>
                </form>

                {/* Sign in link */}
                <div className="mt-8 text-center">
                  <span className="text-slate-600 dark:text-slate-400">Đã có tài khoản? </span>
                  <button
                    onClick={onSwitchToLogin}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
                <p>
                  Đăng ký đồng nghĩa với việc bạn đồng ý với{" "}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" className="text-primary hover:text-primary/80">
                    Chính sách bảo mật
                  </Link>{" "}
                  của chúng tôi.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterModal; 
