'use client';

import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { calculatePasswordStrength, type PasswordStrength } from '@/lib/validation/auth-schemas';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  className,
  showSuggestions = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          border: 'border-red-200',
          bgLight: 'bg-red-50',
        };
      case 'orange':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600',
          border: 'border-orange-200',
          bgLight: 'bg-orange-50',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-600',
          border: 'border-yellow-200',
          bgLight: 'bg-yellow-50',
        };
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          border: 'border-blue-200',
          bgLight: 'bg-blue-50',
        };
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600',
          border: 'border-green-200',
          bgLight: 'bg-green-50',
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-600',
          border: 'border-gray-200',
          bgLight: 'bg-gray-50',
        };
    }
  };

  const colorClasses = getColorClasses(strength.color);

  return (
    <div className={cn('space-y-2', className)} role="region" aria-label="Độ mạnh mật khẩu">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Độ mạnh mật khẩu
          </span>
          <span className={cn('text-xs font-medium', colorClasses.text)}>
            {strength.label}
          </span>
        </div>
        
        <div className="flex space-x-1" role="progressbar" aria-valuenow={strength.score} aria-valuemax={4}>
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors duration-200',
                level <= strength.score
                  ? colorClasses.bg
                  : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && strength.suggestions.length > 0 && (
        <div 
          className={cn(
            'p-3 rounded-lg border text-xs',
            colorClasses.border,
            colorClasses.bgLight,
            'dark:bg-slate-800 dark:border-slate-600'
          )}
          role="alert"
          aria-live="polite"
        >
          <div className="font-medium mb-1 text-slate-700 dark:text-slate-300">
            Để tăng độ mạnh mật khẩu:
          </div>
          <ul className="space-y-0.5 text-slate-600 dark:text-slate-400">
            {strength.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1 h-1 bg-current rounded-full mr-2 flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success message for strong passwords */}
      {strength.score >= 3 && (
        <div 
          className="flex items-center text-xs text-green-600 dark:text-green-400"
          role="status"
          aria-live="polite"
        >
          <svg 
            className="w-3 h-3 mr-1 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          {strength.score === 4 ? 'Mật khẩu rất mạnh!' : 'Mật khẩu đủ mạnh'}
        </div>
      )}
    </div>
  );
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  const requirements = [
    {
      label: 'Ít nhất 8 ký tự',
      met: password.length >= 8,
    },
    {
      label: 'Chứa chữ cái thường',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Chứa chữ cái hoa',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Chứa chữ số',
      met: /\d/.test(password),
    },
    {
      label: 'Chứa ký tự đặc biệt',
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    },
  ];

  return (
    <div className={cn('space-y-2', className)} role="region" aria-label="Yêu cầu mật khẩu">
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
        Yêu cầu mật khẩu:
      </div>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li 
            key={index} 
            className={cn(
              'flex items-center text-xs transition-colors duration-200',
              req.met 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <svg 
              className={cn(
                'w-3 h-3 mr-2 flex-shrink-0 transition-colors duration-200',
                req.met ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'
              )}
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              {req.met ? (
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              ) : (
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2a1 1 0 002 0V7zm-1 4a1 1 0 100 2 1 1 0 000-2z" 
                  clipRule="evenodd" 
                />
              )}
            </svg>
            <span className={req.met ? 'line-through' : ''}>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
