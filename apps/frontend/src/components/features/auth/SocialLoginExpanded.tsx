/**
 * Expanded Social Login Component
 * Component mở rộng cho multiple social login providers
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Chrome, 
  Github, 
  Facebook, 
  Twitter,
  Loader2,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { authToast } from '@/components/ui/feedback/enhanced-toast';

// ===== TYPES =====

export interface SocialLoginExpandedProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showTitle?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

interface SocialProvider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
  enabled: boolean;
  description: string;
}

interface LoginState {
  isLoading: boolean;
  loadingProvider: string | null;
  error: string | null;
}

// ===== CONSTANTS =====

const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: Chrome,
    color: 'bg-red-500 hover:bg-red-600',
    hoverColor: 'hover:bg-red-50',
    enabled: true,
    description: 'Đăng nhập nhanh với tài khoản Google'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'bg-gray-900 hover:bg-gray-800',
    hoverColor: 'hover:bg-gray-50',
    enabled: true,
    description: 'Dành cho developers và educators'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    hoverColor: 'hover:bg-blue-50',
    enabled: false, // TODO: Enable when Facebook OAuth is configured
    description: 'Kết nối với mạng xã hội Facebook'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600',
    hoverColor: 'hover:bg-sky-50',
    enabled: false, // TODO: Enable when Twitter OAuth is configured
    description: 'Đăng nhập với tài khoản Twitter/X'
  }
];

// ===== MAIN COMPONENT =====

export const SocialLoginExpanded: React.FC<SocialLoginExpandedProps> = ({
  className,
  onSuccess,
  onError,
  showTitle = true,
  variant = 'default'
}) => {
  // ===== STATE =====

  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    loadingProvider: null,
    error: null
  });

  // ===== HANDLERS =====

  const handleSocialLogin = useCallback(async (providerId: string, providerName: string) => {
    setLoginState({
      isLoading: true,
      loadingProvider: providerId,
      error: null
    });

    try {
      const result = await signIn(providerId, {
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        authToast.loginSuccess(`Đăng nhập ${providerName} thành công!`);
        onSuccess?.();
      }
    } catch (error) {
      console.error(`${providerName} login failed:`, error);
      const errorMessage = `Đăng nhập ${providerName} thất bại. Vui lòng thử lại.`;
      
      setLoginState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      authToast.loginError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoginState({
        isLoading: false,
        loadingProvider: null,
        error: null
      });
    }
  }, [onSuccess, onError]);

  // ===== RENDER FUNCTIONS =====

  const renderProviderButton = (provider: SocialProvider) => {
    const Icon = provider.icon;
    const isLoading = loginState.isLoading && loginState.loadingProvider === provider.id;
    const isDisabled = loginState.isLoading || !provider.enabled;

    if (variant === 'minimal') {
      return (
        <Button
          key={provider.id}
          variant="outline"
          size="icon"
          onClick={() => handleSocialLogin(provider.id, provider.name)}
          disabled={isDisabled}
          className={cn(
            'h-10 w-10 rounded-full transition-colors',
            provider.hoverColor,
            !provider.enabled && 'opacity-50 cursor-not-allowed'
          )}
          title={provider.enabled ? `Đăng nhập với ${provider.name}` : 'Chưa khả dụng'}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </Button>
      );
    }

    if (variant === 'compact') {
      return (
        <Button
          key={provider.id}
          variant="outline"
          onClick={() => handleSocialLogin(provider.id, provider.name)}
          disabled={isDisabled}
          className={cn(
            'flex-1 transition-colors',
            provider.hoverColor,
            !provider.enabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Icon className="h-4 w-4 mr-2" />
          )}
          {provider.name}
        </Button>
      );
    }

    // Default variant
    return (
      <Button
        key={provider.id}
        variant="outline"
        onClick={() => handleSocialLogin(provider.id, provider.name)}
        disabled={isDisabled}
        className={cn(
          'w-full justify-start h-12 transition-colors',
          provider.hoverColor,
          !provider.enabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center w-full">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full mr-3',
            provider.color
          )}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Icon className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">
              Tiếp tục với {provider.name}
              {!provider.enabled && (
                <span className="text-xs text-muted-foreground ml-2">(Sắp có)</span>
              )}
            </div>
            {variant === 'default' && (
              <div className="text-xs text-muted-foreground">
                {provider.description}
              </div>
            )}
          </div>
        </div>
      </Button>
    );
  };

  const renderProviders = () => {
    if (variant === 'minimal') {
      return (
        <div className="flex items-center justify-center gap-3">
          {SOCIAL_PROVIDERS.map(renderProviderButton)}
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div className="flex gap-2">
          {SOCIAL_PROVIDERS.filter(p => p.enabled).map(renderProviderButton)}
        </div>
      );
    }

    // Default variant
    return (
      <div className="space-y-3">
        {SOCIAL_PROVIDERS.map(renderProviderButton)}
      </div>
    );
  };

  // ===== MAIN RENDER =====

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-4', className)}>
        {showTitle && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Hoặc đăng nhập với</p>
          </div>
        )}
        {renderProviders()}
        {loginState.error && (
          <Alert variant="destructive" className="text-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{loginState.error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {showTitle && (
          <div className="text-center">
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground bg-background px-2 -mt-3 inline-block">
              Hoặc tiếp tục với
            </p>
          </div>
        )}
        {renderProviders()}
        {loginState.error && (
          <Alert variant="destructive" className="text-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{loginState.error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      {showTitle && (
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" />
            Đăng nhập NyNus
          </CardTitle>
          <CardDescription>
            Chọn phương thức đăng nhập phù hợp với bạn
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {renderProviders()}
        
        {loginState.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{loginState.error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground bg-background px-2 -mt-3 inline-block">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <a href="/terms" className="underline hover:text-primary">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="/privacy" className="underline hover:text-primary">
              Chính sách bảo mật
            </a>{' '}
            của NyNus
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialLoginExpanded;
