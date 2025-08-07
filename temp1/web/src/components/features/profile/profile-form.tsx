'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, AlertCircle, Mail, User, Phone, MapPin, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui';
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { useEmailValidation, useNameValidation, useSuccessMessage } from '@/hooks/use-auth-validation';
import { cn } from '@/lib/utils';
import { profileUpdateSchema, type ProfileUpdateFormValues, type ExtendedProfile } from '@/lib/validation/profile-schemas';

interface ProfileFormProps {
  user: ExtendedProfile;
  onUpdate?: (data: ProfileUpdateFormValues) => Promise<void>;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time validation hooks
  const emailValidation = useEmailValidation(300);
  const firstNameValidation = useNameValidation();
  const lastNameValidation = useNameValidation();
  const successMessage = useSuccessMessage();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      bio: user.bio || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
    },
  });

  // Watch form values for real-time validation
  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');
  const watchedEmail = watch('email');
  const watchedBio = watch('bio');
  const watchedPhone = watch('phoneNumber');
  const watchedAddress = watch('address');

  // Trigger real-time validations
  useEffect(() => {
    if (watchedFirstName) {
      firstNameValidation.validateName(watchedFirstName);
    }
  }, [watchedFirstName, firstNameValidation]);

  useEffect(() => {
    if (watchedLastName) {
      lastNameValidation.validateName(watchedLastName);
    }
  }, [watchedLastName, lastNameValidation]);

  useEffect(() => {
    if (watchedEmail) {
      emailValidation.validateEmail(watchedEmail);
    }
  }, [watchedEmail, emailValidation]);

  const onSubmit = async (data: ProfileUpdateFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onUpdate) {
        await onUpdate(data);
      }
      
      successMessage.showSuccess('Cập nhật thông tin thành công!');
      
      // Reset form dirty state
      reset(data);
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      bio: user.bio || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
    });
    setError(null);
    emailValidation.clearValidation();
    firstNameValidation.clearValidation();
    lastNameValidation.clearValidation();
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Tên
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              {...register('firstName')}
              className={cn(
                firstNameValidation.isValid 
                  ? "border-green-500 focus:ring-green-500" 
                  : firstNameValidation.error || errors.firstName
                  ? "border-red-500 focus:ring-red-500" 
                  : ""
              )}
              aria-describedby={firstNameValidation.error || errors.firstName ? "firstName-error" : undefined}
              aria-invalid={!!(firstNameValidation.error || errors.firstName)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {firstNameValidation.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : firstNameValidation.error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          </div>
          {firstNameValidation.error && (
            <p id="firstName-error" className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {firstNameValidation.error}
            </p>
          )}
          {!firstNameValidation.error && errors.firstName && (
            <p id="firstName-error" className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Họ
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              {...register('lastName')}
              className={cn(
                lastNameValidation.isValid 
                  ? "border-green-500 focus:ring-green-500" 
                  : lastNameValidation.error || errors.lastName
                  ? "border-red-500 focus:ring-red-500" 
                  : ""
              )}
              aria-describedby={lastNameValidation.error || errors.lastName ? "lastName-error" : undefined}
              aria-invalid={!!(lastNameValidation.error || errors.lastName)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {lastNameValidation.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : lastNameValidation.error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          </div>
          {lastNameValidation.error && (
            <p id="lastName-error" className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {lastNameValidation.error}
            </p>
          )}
          {!lastNameValidation.error && errors.lastName && (
            <p id="lastName-error" className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={cn(
              emailValidation.isValid 
                ? "border-green-500 focus:ring-green-500" 
                : emailValidation.error || errors.email
                ? "border-red-500 focus:ring-red-500" 
                : ""
            )}
            aria-describedby={emailValidation.error || errors.email ? "email-error" : undefined}
            aria-invalid={!!(emailValidation.error || errors.email)}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {emailValidation.isValidating ? (
              <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : emailValidation.isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : emailValidation.error ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : null}
          </div>
        </div>
        {emailValidation.error && (
          <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {emailValidation.error}
          </p>
        )}
        {!emailValidation.error && errors.email && (
          <p id="email-error" className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email.message}
          </p>
        )}
        {watchedEmail && watchedEmail !== user.email && (
          <p className="text-sm text-amber-600 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Thay đổi email sẽ yêu cầu xác minh qua email mới
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Số điện thoại
        </Label>
        <Input
          id="phoneNumber"
          {...register('phoneNumber')}
          placeholder="0123456789"
          className={errors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Địa chỉ
        </Label>
        <Input
          id="address"
          {...register('address')}
          placeholder="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
          className={errors.address ? "border-red-500 focus:ring-red-500" : ""}
        />
        {errors.address && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Tiểu sử
        </Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Giới thiệu về bản thân..."
          rows={4}
          className={errors.bio ? "border-red-500 focus:ring-red-500" : ""}
        />
        <div className="flex justify-between items-center">
          {errors.bio && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.bio.message}
            </p>
          )}
          <p className="text-sm text-muted-foreground ml-auto">
            {watchedBio?.length || 0}/500 ký tự
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="flex-1 sm:flex-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang cập nhật...
            </>
          ) : (
            'Cập nhật thông tin'
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
