/**
 * PWA Hook
 * Custom hook để quản lý PWA functionality
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import { useState, useEffect, useCallback } from 'react';

// ===== TYPES =====

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isSupported: boolean;
  deviceType: 'mobile' | 'desktop';
}

interface PWAActions {
  install: () => Promise<boolean>;
  checkForUpdates: () => Promise<boolean>;
  registerServiceWorker: () => Promise<boolean>;
  unregisterServiceWorker: () => Promise<boolean>;
}

interface UsePWAReturn extends PWAState, PWAActions {
  deferredPrompt: BeforeInstallPromptEvent | null;
}

// ===== CONSTANTS =====

const PWA_STORAGE_KEYS = {
  INSTALL_DISMISSED: 'pwa-install-dismissed',
  LAST_UPDATE_CHECK: 'pwa-last-update-check',
  USER_PREFERENCES: 'pwa-user-preferences'
} as const;

// ===== MAIN HOOK =====

export function usePWA(): UsePWAReturn {
  // ===== STATE =====

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  // ===== EFFECTS =====

  useEffect(() => {
    // Check PWA support
    const checkPWASupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = 'manifest' in document.createElement('link');
      const hasBeforeInstallPrompt = 'onbeforeinstallprompt' in window;
      
      setIsSupported(hasServiceWorker && hasManifest);
      
      return hasServiceWorker && hasManifest && hasBeforeInstallPrompt;
    };

    // Check if already installed
    const checkInstallStatus = () => {
      // Check display mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // Check if launched from home screen (iOS)
      const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
      
      setIsInstalled(isStandalone || isFullscreen || isMinimalUI || isIOSStandalone);
    };

    // Detect device type
    const detectDeviceType = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setDeviceType(isMobile ? 'mobile' : 'desktop');
    };

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Initialize
    checkPWASupport();
    checkInstallStatus();
    detectDeviceType();
    updateOnlineStatus();

    // Event listeners
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsInstallable(true);
      
      console.log('[PWA] Install prompt available');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Clear dismissed flag
      localStorage.removeItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED);
      
      console.log('[PWA] App installed successfully');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // ===== ACTIONS =====

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('[PWA] User dismissed install prompt');
        // Remember dismissal
        localStorage.setItem(PWA_STORAGE_KEYS.INSTALL_DISMISSED, Date.now().toString());
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  const registerServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New Service Worker available');
              // Notify user about update
              if (window.confirm('Có phiên bản mới của ứng dụng. Bạn có muốn cập nhật không?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return false;
    }
  }, []);

  const unregisterServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      console.log('[PWA] Service Worker unregistered');
      return true;
    } catch (error) {
      console.error('[PWA] Service Worker unregistration failed:', error);
      return false;
    }
  }, []);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        await registration.update();
        
        // Update last check time
        localStorage.setItem(PWA_STORAGE_KEYS.LAST_UPDATE_CHECK, Date.now().toString());
        
        console.log('[PWA] Checked for updates');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
      return false;
    }
  }, []);

  // ===== RETURN =====

  return {
    // State
    deferredPrompt,
    isInstallable,
    isInstalled,
    isOnline,
    isSupported,
    deviceType,
    
    // Actions
    install,
    checkForUpdates,
    registerServiceWorker,
    unregisterServiceWorker
  };
}

// ===== UTILITY HOOKS =====

/**
 * Hook để theo dõi trạng thái online/offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
}

/**
 * Hook để quản lý Service Worker messaging
 */
export function useServiceWorkerMessaging() {
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerReady(true);
      });
    }
  }, []);

  const sendMessage = useCallback(async (message: unknown): Promise<unknown> => {
    if (!isServiceWorkerReady || !navigator.serviceWorker.controller) {
      throw new Error('Service Worker not ready');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      navigator.serviceWorker.controller?.postMessage(message as Record<string, unknown>, [messageChannel.port2]);
    });
  }, [isServiceWorkerReady]);

  return {
    isServiceWorkerReady,
    sendMessage
  };
}

export default usePWA;
