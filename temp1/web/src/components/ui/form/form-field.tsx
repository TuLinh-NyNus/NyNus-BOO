/**
 * Enhanced Form Field Components với improved UX
 */

import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import React from 'react'

import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  error?: string
  success?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  description?: string
}

/**
 * Form Field Wrapper với enhanced error/success states
 */
export function FormField({
  label,
  error,
  success,
  required,
  children,
  className,
  description,
}: FormFieldProps): JSX.Element {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {children}
      
      {error && (
        <div 
          className="flex items-center gap-1 text-sm text-red-600"
          data-testid={`${label.toLowerCase().replace(/\s+/g, '-')}-error`}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
}

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: string
  description?: string
  showPasswordToggle?: boolean
  loading?: boolean
}

/**
 * Enhanced Input với real-time validation feedback
 */
export function EnhancedInput({
  label,
  error,
  success,
  description,
  showPasswordToggle = false,
  loading = false,
  type,
  className,
  ...props
}: EnhancedInputProps): JSX.Element {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type

  const inputId = `${label.toLowerCase().replace(/\s+/g, '-')}-input`

  return (
    <FormField
      label={label}
      error={error}
      success={success}
      required={props.required}
      description={description}
    >
      <div className="relative">
        <Input
          {...props}
          id={inputId}
          type={inputType}
          className={cn(
            'transition-all duration-200',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            success && !error && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
            isFocused && !error && !success && 'border-blue-500 ring-2 ring-blue-500/20',
            loading && 'opacity-50 cursor-not-allowed',
            showPasswordToggle && 'pr-10',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          disabled={loading || props.disabled}
          data-testid={inputId}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
      </div>
    </FormField>
  )
}

/**
 * Password Strength Indicator
 */
interface PasswordStrengthProps {
  password: string
  requirements?: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  }
}

export function PasswordStrength({ 
  password, 
  requirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  }
}: PasswordStrengthProps): JSX.Element | null {
  const checks = [
    {
      label: `Ít nhất ${requirements.minLength} ký tự`,
      valid: password.length >= (requirements.minLength || 8),
    },
    {
      label: 'Chứa chữ hoa',
      valid: requirements.requireUppercase ? /[A-Z]/.test(password) : true,
    },
    {
      label: 'Chứa chữ thường',
      valid: requirements.requireLowercase ? /[a-z]/.test(password) : true,
    },
    {
      label: 'Chứa số',
      valid: requirements.requireNumbers ? /\d/.test(password) : true,
    },
    {
      label: 'Chứa ký tự đặc biệt',
      valid: requirements.requireSpecialChars ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true,
    },
  ].filter(check => check.label !== 'Chứa chữ hoa' || requirements.requireUppercase)
   .filter(check => check.label !== 'Chứa chữ thường' || requirements.requireLowercase)
   .filter(check => check.label !== 'Chứa số' || requirements.requireNumbers)
   .filter(check => check.label !== 'Chứa ký tự đặc biệt' || requirements.requireSpecialChars)

  const validCount = checks.filter(check => check.valid).length
  const strength = validCount / checks.length

  const getStrengthColor = () => {
    if (strength < 0.5) return 'bg-red-500'
    if (strength < 0.8) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (strength < 0.5) return 'Yếu'
    if (strength < 0.8) return 'Trung bình'
    return 'Mạnh'
  }

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Độ mạnh mật khẩu:</span>
        <span className={cn(
          'font-medium',
          strength < 0.5 && 'text-red-600',
          strength >= 0.5 && strength < 0.8 && 'text-yellow-600',
          strength >= 0.8 && 'text-green-600'
        )}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', getStrengthColor())}
          style={{ width: `${Math.round(strength * 100)}%` }}
        />
      </div>
      
      <ul className="space-y-1 text-xs">
        {checks.map((check, index) => (
          <li
            key={index}
            className={cn(
              'flex items-center gap-2',
              check.valid ? 'text-green-600' : 'text-gray-400'
            )}
          >
            {check.valid ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
