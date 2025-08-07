'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button, PasswordStrengthIndicator } from '@/components/ui';
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { usePasswordValidation, usePasswordMatch, useSuccessMessage } from '@/hooks/use-auth-validation';
import { cn } from '@/lib/utils';
import { passwordChangeSchema, type PasswordChangeFormValues } from '@/lib/validation/profile-schemas';

interface PasswordChangeFormProps {
  onPasswordChange?: (data: PasswordChangeFormValues) => Promise<void>;
}

export function PasswordChangeForm({ onPasswordChange }: PasswordChangeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Real-time validation hooks
  const passwordValidation = usePasswordValidation();
  const passwordMatch = usePasswordMatch();
  const successMessage = useSuccessMessage();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Watch form values for real-time validation
  const watchedCurrentPassword = watch('currentPassword');
  const watchedNewPassword = watch('newPassword');
  const watchedConfirmPassword = watch('confirmPassword');

  // Trigger real-time validations
  useEffect(() => {
    if (watchedNewPassword) {
      passwordValidation.validatePassword(watchedNewPassword);
    }
  }, [watchedNewPassword, passwordValidation]);

  useEffect(() => {
    passwordMatch.validateMatch(watchedNewPassword, watchedConfirmPassword);
  }, [watchedNewPassword, watchedConfirmPassword, passwordMatch]);

  const onSubmit = async (data: PasswordChangeFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onPasswordChange) {
        await onPasswordChange(data);
      }
      
      successMessage.showSuccess('Thay đổi mật khẩu thành công!');
      
      // Reset form
      reset();
      passwordValidation.clearValidation();
      passwordMatch.clearValidation();
    } catch (err) {
      setError('Có lỗi xảy ra khi thay đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setError(null);
    passwordValidation.clearValidation();
    passwordMatch.clearValidation();
    successMessage.hideSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message */}
      {successMessage.isVisible && successMessage.message && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            {successMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-600 dark:text-blue-400">
          <strong>Lưu ý bảo mật:</strong> Mật khẩu mới phải khác với mật khẩu hiện tại và đáp ứng các yêu cầu bảo mật.
        </AlertDescription>
      </Alert>

      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Mật khẩu hiện tại
        </Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            {...register('currentPassword')}
            className={errors.currentPassword ? "border-red-500 focus:ring-red-500 pr-12" : "pr-12"}
            placeholder="Nhập mật khẩu hiện tại"
            aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
            aria-invalid={!!errors.currentPassword}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-r-lg transition-colors duration-200"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            tabIndex={-1}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p id="currentPassword-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Mật khẩu mới
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            {...register('newPassword')}
            className={cn(
              "pr-12",
              passwordValidation.isValid 
                ? "border-green-500 focus:ring-green-500" 
                : passwordValidation.error || errors.newPassword
                ? "border-red-500 focus:ring-red-500" 
                : ""
            )}
            placeholder="Nhập mật khẩu mới"
            aria-describedby="newPassword-strength newPassword-error"
            aria-invalid={!!(passwordValidation.error || errors.newPassword)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-r-lg transition-colors duration-200"
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            tabIndex={-1}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {watchedNewPassword && (
          <PasswordStrengthIndicator 
            password={watchedNewPassword} 
            className="mt-3"
            showSuggestions={true}
          />
        )}
        
        {!passwordValidation.error && errors.newPassword && (
          <p id="newPassword-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Xác nhận mật khẩu mới
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register('confirmPassword')}
            className={cn(
              "pr-12",
              passwordMatch.isMatching 
                ? "border-green-500 focus:ring-green-500" 
                : passwordMatch.error || errors.confirmPassword
                ? "border-red-500 focus:ring-red-500" 
                : ""
            )}
            placeholder="Nhập lại mật khẩu mới"
            aria-describedby={passwordMatch.error || errors.confirmPassword ? "confirmPassword-error" : undefined}
            aria-invalid={!!(passwordMatch.error || errors.confirmPassword)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-r-lg transition-colors duration-200"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>
        
        {/* Password matching validation */}
        {passwordMatch.error && (
          <p id="confirmPassword-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {passwordMatch.error}
          </p>
        )}
        
        {!passwordMatch.error && errors.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.confirmPassword.message}
          </p>
        )}
        
        {/* Success message */}
        {passwordMatch.isMatching && !passwordMatch.error && watchedConfirmPassword && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Mật khẩu khớp
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button
          type="submit"
          disabled={
            isLoading || 
            !isDirty ||
            !watchedCurrentPassword ||
            !watchedNewPassword ||
            !watchedConfirmPassword ||
            !passwordValidation.isValid ||
            !passwordMatch.isMatching
          }
          className="flex-1 sm:flex-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang thay đổi...
            </>
          ) : (
            'Thay đổi mật khẩu'
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isLoading || !isDirty}
          className="flex-1 sm:flex-none"
        >
          Hủy thay đổi
        </Button>
      </div>
    </form>
  );
}
