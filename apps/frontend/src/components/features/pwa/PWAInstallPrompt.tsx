/**
 * PWA Install Prompt Component
 * Component để hiển thị prompt cài đặt PWA
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===== TYPES =====

export interface PWAInstallPromptProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
  variant?: 'banner' | 'modal' | 'inline';
  showFeatures?: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// ===== CONSTANTS =====

const PWA_FEATURES = [
  {
    icon: Wifi,
    title: 'Hoạt động offline',
    description: 'Truy cập nội dung đã tải khi không có internet'
  },
  {
    icon: Zap,
    title: 'Tải nhanh',
    description: 'Khởi động nhanh hơn so với website thông thường'
  },
  {
    icon: Shield,
    title: 'Bảo mật cao',
    description: 'Chạy trong môi trường an toàn, được mã hóa'
  },
  {
    icon: Star,
    title: 'Trải nghiệm native',
    description: 'Giao diện và tương tác như ứng dụng gốc'
  }
];

// ===== MAIN COMPONENT =====

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className,
  onInstall,
  onDismiss,
  variant = 'banner',
  showFeatures = true
}) => {
  // ===== STATE =====

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  // ===== EFFECTS =====

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show prompt if not dismissed or dismissed more than 7 days ago
      if (!dismissed || daysSinceDismissed > 7) {
        setIsVisible(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      
      // Clear dismissed flag
      localStorage.removeItem('pwa-install-dismissed');
      
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // ===== HANDLERS =====

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        onInstall?.();
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt, onInstall]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    
    onDismiss?.();
  }, [onDismiss]);

  // ===== RENDER FUNCTIONS =====

  const renderFeatures = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {PWA_FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-sm">{feature.title}</div>
              <div className="text-xs text-muted-foreground">{feature.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBannerVariant = () => (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg',
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {deviceType === 'mobile' ? (
              <Smartphone className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
            <div>
              <div className="font-medium">Cài đặt ứng dụng NyNus</div>
              <div className="text-sm opacity-90">
                Trải nghiệm tốt hơn với ứng dụng web
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              {isInstalling ? (
                'Đang cài đặt...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Cài đặt
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderModalVariant = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {deviceType === 'mobile' ? (
                  <Smartphone className="h-6 w-6 text-primary" />
                ) : (
                  <Monitor className="h-6 w-6 text-primary" />
                )}
                <div>
                  <CardTitle>Cài đặt ứng dụng NyNus</CardTitle>
                  <CardDescription>
                    Trải nghiệm học tập tốt hơn với ứng dụng web
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showFeatures && renderFeatures()}
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1"
              >
                {isInstalling ? (
                  'Đang cài đặt...'
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Cài đặt ngay
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                Để sau
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderInlineVariant = () => (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {deviceType === 'mobile' ? (
            <Smartphone className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
          Cài đặt ứng dụng NyNus
        </CardTitle>
        <CardDescription>
          Tải ứng dụng web để có trải nghiệm học tập tốt nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showFeatures && renderFeatures()}
        
        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1"
          >
            {isInstalling ? (
              'Đang cài đặt...'
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Cài đặt
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Bỏ qua
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====

  // Don't render if already installed or not supported
  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {variant === 'banner' && renderBannerVariant()}
      {variant === 'modal' && renderModalVariant()}
      {variant === 'inline' && renderInlineVariant()}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
