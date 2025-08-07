import * as z from 'zod';

// Email validation với detailed feedback
export const emailSchema = z
  .string()
  .min(1, 'Email không được để trống')
  .email('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: user@example.com)')
  .max(254, 'Email không được vượt quá 254 ký tự')
  .refine(
    (email) => {
      // Kiểm tra format email cơ bản
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    {
      message: 'Email phải có định dạng hợp lệ với @ và tên miền',
    }
  )
  .refine(
    (email) => {
      // Kiểm tra không có ký tự đặc biệt không hợp lệ
      const invalidChars = /[<>()[\]\\,;:\s@"]/;
      const localPart = email.split('@')[0];
      return !invalidChars.test(localPart.replace(/[.]/g, ''));
    },
    {
      message: 'Email chứa ký tự không hợp lệ',
    }
  );

// Password strength validation
export const passwordSchema = z
  .string()
  .min(1, 'Mật khẩu không được để trống')
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
  .refine(
    (password) => /[a-z]/.test(password),
    {
      message: 'Mật khẩu phải có ít nhất 1 chữ cái thường',
    }
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    {
      message: 'Mật khẩu phải có ít nhất 1 chữ cái hoa',
    }
  )
  .refine(
    (password) => /\d/.test(password),
    {
      message: 'Mật khẩu phải có ít nhất 1 chữ số',
    }
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    {
      message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt',
    }
  )
  .refine(
    (password) => !/\s/.test(password),
    {
      message: 'Mật khẩu không được chứa khoảng trắng',
    }
  );

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Họ tên không được để trống')
  .min(2, 'Họ tên phải có ít nhất 2 ký tự')
  .max(50, 'Họ tên không được vượt quá 50 ký tự')
  .refine(
    (name) => {
      // Kiểm tra chỉ chứa chữ cái, khoảng trắng và một số ký tự đặc biệt hợp lệ
      const nameRegex = /^[a-zA-ZÀ-ỹ\s'-]+$/;
      return nameRegex.test(name);
    },
    {
      message: 'Họ tên chỉ được chứa chữ cái, khoảng trắng, dấu nháy và dấu gạch ngang',
    }
  )
  .refine(
    (name) => {
      // Kiểm tra không có nhiều khoảng trắng liên tiếp
      return !/\s{2,}/.test(name.trim());
    },
    {
      message: 'Họ tên không được có nhiều khoảng trắng liên tiếp',
    }
  )
  .transform((name) => name.trim());

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(5, 'Mật khẩu phải có ít nhất 5 ký tự'),
});

// Register schema với confirm password
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập',
      path: ['confirmPassword'],
    }
  );

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token không hợp lệ'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
      path: ['confirmPassword'],
    }
  );

// Type exports
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Password strength calculation
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Nhập mật khẩu',
      color: 'gray',
      suggestions: ['Vui lòng nhập mật khẩu'],
    };
  }

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Sử dụng ít nhất 8 ký tự');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Thêm chữ cái thường');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Thêm chữ cái hoa');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Thêm chữ số');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Thêm ký tự đặc biệt (!@#$%^&*)');
  }

  // Additional checks for very strong passwords
  if (password.length >= 12) {
    score += 0.5;
  }

  if (password.length >= 16) {
    score += 0.5;
  }

  // Cap at 4
  score = Math.min(4, Math.floor(score));

  const strengthMap = {
    0: { label: 'Rất yếu', color: 'red' },
    1: { label: 'Yếu', color: 'orange' },
    2: { label: 'Trung bình', color: 'yellow' },
    3: { label: 'Mạnh', color: 'blue' },
    4: { label: 'Rất mạnh', color: 'green' },
  };

  return {
    score,
    label: strengthMap[score as keyof typeof strengthMap].label,
    color: strengthMap[score as keyof typeof strengthMap].color,
    suggestions,
  };
}
