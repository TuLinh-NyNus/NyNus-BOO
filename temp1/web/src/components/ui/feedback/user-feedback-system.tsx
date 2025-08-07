/**
 * User Feedback System
 * 
 * Hệ thống phản hồi người dùng toàn diện với notifications, confirmations, và progress tracking
 */

'use client';

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import React, { createContext, useContext, useState, useCallback } from 'react';

import { Button, Progress } from '@/components/ui';
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/overlay/dialog";
import { cn } from '@/lib/utils';
import logger from '@/lib/utils/logger';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ProgressOptions {
  title: string;
  description?: string;
  progress: number;
  canCancel?: boolean;
  onCancel?: () => void;
}

export interface NotificationOptions {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
}

interface FeedbackContextType {
  showConfirmation: (Options: ConfirmationOptions) => void;
  showProgress: (Options: ProgressOptions) => void;
  hideProgress: () => void;
  showNotification: (Options: NotificationOptions) => void;
  hideNotification: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

/**
 * User Feedback Provider
 */
export function UserFeedbackProvider({ children }: { children: React.ReactNode }): JSX.Element {
  // Confirmation Dialog State
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    options?: ConfirmationOptions;
    isLoading?: boolean;
  }>({ isOpen: false });

  // Progress Dialog State
  const [progressState, setProgressState] = useState<{
    isOpen: boolean;
    options?: ProgressOptions;
  }>({ isOpen: false });

  // Notification State
  const [notificationState, setNotificationState] = useState<{
    isVisible: boolean;
    options?: NotificationOptions;
  }>({ isVisible: false });

  // Show confirmation dialog
  const showConfirmation = useCallback((Options: ConfirmationOptions) => {
    setConfirmationState({ isOpen: true, options });
  }, []);

  // Handle confirmation
  const handleConfirm = useCallback(async () => {
    if (!confirmationState.options) return;

    setConfirmationState(prev => ({ ...prev, isLoading: true }));

    try {
      await confirmationState.options.onConfirm();
      setConfirmationState({ isOpen: false });
    } catch (error) {
      logger.error('Confirmation action failed:', error);
      // Keep dialog open on error
      setConfirmationState(prev => ({ ...prev, isLoading: false }));
    }
  }, [confirmationState.options]);

  // Handle cancel confirmation
  const handleCancelConfirmation = useCallback(() => {
    if (confirmationState.options?.onCancel) {
      confirmationState.options.onCancel();
    }
    setConfirmationState({ isOpen: false });
  }, [confirmationState.options]);

  // Show progress dialog
  const showProgress = useCallback((Options: ProgressOptions) => {
    setProgressState({ isOpen: true, options });
  }, []);

  // Hide progress dialog
  const hideProgress = useCallback(() => {
    setProgressState({ isOpen: false });
  }, []);

  // Handle cancel progress
  const handleCancelProgress = useCallback(() => {
    if (progressState.options?.onCancel) {
      progressState.options.onCancel();
    }
    hideProgress();
  }, [progressState.options, hideProgress]);

  // Show notification
  const showNotification = useCallback((Options: NotificationOptions) => {
    setNotificationState({ isVisible: true, options });

    // Auto-hide after duration
    if (options.duration !== 0) {
      const duration = options.duration || 5000;
      setTimeout(() => {
        setNotificationState({ isVisible: false });
      }, duration);
    }
  }, []);

  // Hide notification
  const hideNotification = useCallback(() => {
    setNotificationState({ isVisible: false });
  }, []);

  const contextValue: FeedbackContextType = {
    showConfirmation,
    showProgress,
    hideProgress,
    showNotification,
    hideNotification
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmationState.isOpen} 
        onOpenChange={(open) => !open && !confirmationState.isLoading && handleCancelConfirmation()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmationState.options?.variant === 'destructive' && (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              {confirmationState.options?.variant === 'warning' && (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              {confirmationState.options?.variant === 'default' && (
                <Info className="h-5 w-5 text-blue-600" />
              )}
              {confirmationState.options?.title}
            </DialogTitle>
            <DialogDescription>
              {confirmationState.options?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={confirmationState.isLoading}
            >
              {confirmationState.options?.cancelText || 'Hủy'}
            </Button>
            <Button
              variant={confirmationState.options?.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={confirmationState.isLoading}
            >
              {confirmationState.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                confirmationState.options?.confirmText || 'Xác nhận'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog 
        open={progressState.isOpen} 
        onOpenChange={(open) => !open && progressState.options?.canCancel && handleCancelProgress()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{progressState.options?.title}</DialogTitle>
            {progressState.options?.description && (
              <DialogDescription>
                {progressState.options.description}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            <Progress 
              value={progressState.options?.progress || 0} 
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(progressState.options?.progress || 0)}% hoàn thành
            </div>
          </div>

          {progressState.options?.canCancel && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancelProgress}
              >
                Hủy
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {notificationState.isVisible && notificationState.options && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
          <Alert 
            variant={notificationState.options.variant === 'error' ? 'destructive' : 'default'}
            className={cn(
              'shadow-lg border',
              notificationState.options.variant === 'success' && 'border-green-500 bg-green-50',
              notificationState.options.variant === 'warning' && 'border-yellow-500 bg-yellow-50',
              notificationState.options.variant === 'info' && 'border-blue-500 bg-blue-50'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {notificationState.options.variant === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                )}
                {notificationState.options.variant === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                {notificationState.options.variant === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                )}
                {notificationState.options.variant === 'info' && (
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {notificationState.options.title}
                  </div>
                  {notificationState.options.description && (
                    <AlertDescription className="mt-1">
                      {notificationState.options.description}
                    </AlertDescription>
                  )}
                  
                  {notificationState.options.actions && (
                    <div className="flex gap-2 mt-3">
                      {notificationState.options.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={action.variant || 'outline'}
                          onClick={() => {
                            action.onClick();
                            hideNotification();
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={hideNotification}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

/**
 * Hook để sử dụng user feedback system
 */
export function useUserFeedback(): FeedbackContextType {
  const context = useContext(FeedbackContext);
  
  if (!context) {
    throw new Error('useUserFeedback must be used within UserFeedbackProvider');
  }
  
  return context;
}
