/**
 * Global Loading Overlay Component
 * 
 * Hiển thị loading overlay toàn cục dựa trên loading state manager
 */

'use client';

import { Loader2, X, AlertCircle } from 'lucide-react';
import React from 'react';

import { Button, Progress } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { useLoadingStore } from '@/lib/ui/loading-state-manager';
import { cn } from '@/lib/utils';

interface GlobalLoadingOverlayProps {
  className?: string;
  showProgress?: boolean;
  allowCancel?: boolean;
}

/**
 * Global Loading Overlay Component
 */
export function GlobalLoadingOverlay({
  className,
  showProgress = true,
  allowCancel = true
}: GlobalLoadingOverlayProps): JSX.Element | null {
  const { loadingStates, globalLoading, stopLoading } = useLoadingStore();
  const activeStates = Array.from(loadingStates.values());

  // Don't render if no loading states
  if (!globalLoading || activeStates.length === 0) {
    return null;
  }

  // Get primary loading state (first one or most recent)
  const primaryState = activeStates[activeStates.length - 1];
  const hasProgress = primaryState.progress !== undefined;
  const canCancel = allowCancel && primaryState.canCancel && primaryState.onCancel;

  // Calculate elapsed time
  const elapsedTime = Date.now() - primaryState.startTime;
  const elapsedSeconds = Math.floor(elapsedTime / 1000);

  return (
    <div className={cn(
      'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4',
      className
    )}>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span>Đang xử lý</span>
            </div>
            
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (primaryState.onCancel) {
                    primaryState.onCancel();
                  }
                  stopLoading(primaryState.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Primary loading message */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {primaryState.message}
            </p>
            
            {/* Progress bar if available */}
            {showProgress && hasProgress && (
              <div className="space-y-2">
                <Progress 
                  value={primaryState.progress} 
                  className="w-full h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round(primaryState.progress || 0)}% hoàn thành
                </p>
              </div>
            )}
            
            {/* Elapsed time */}
            <p className="text-xs text-muted-foreground mt-2">
              {elapsedSeconds < 60 
                ? `${elapsedSeconds} giây`
                : `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`
              }
            </p>
          </div>

          {/* Multiple loading states */}
          {activeStates.length > 1 && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Các tác vụ đang chạy ({activeStates.length}):
              </p>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {activeStates.map((state, index) => (
                  <div 
                    key={state.id}
                    className={cn(
                      'flex items-center justify-between text-xs p-1 rounded',
                      index === activeStates.length - 1 && 'bg-blue-50 text-blue-700'
                    )}
                  >
                    <span className="truncate flex-1">{state.message}</span>
                    {state.progress !== undefined && (
                      <span className="ml-2 text-muted-foreground">
                        {Math.round(state.progress)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeout warning */}
          {primaryState.timeout && elapsedTime > (primaryState.timeout * 0.8) && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs">
                Tác vụ đang mất nhiều thời gian hơn dự kiến...
              </p>
            </div>
          )}

          {/* Cancel button for non-cancellable but long-running tasks */}
          {!canCancel && elapsedTime > 30000 && ( // 30 seconds
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => stopLoading(primaryState.id)}
                className="text-xs"
              >
                Dừng hiển thị
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact Loading Indicator for smaller spaces
 */
export function CompactLoadingIndicator({
  className,
  showMessage = true
}: {
  className?: string;
  showMessage?: boolean;
}): JSX.Element | null {
  const { loadingStates, globalLoading } = useLoadingStore();
  const activeStates = Array.from(loadingStates.values());

  if (!globalLoading || activeStates.length === 0) {
    return null;
  }

  const primaryState = activeStates[activeStates.length - 1];

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md',
      className
    )}>
      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      
      {showMessage && (
        <div className="flex-1 min-w-0">
          <p className="text-sm text-blue-800 truncate">
            {primaryState.message}
          </p>
          
          {primaryState.progress !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <Progress 
                value={primaryState.progress} 
                className="flex-1 h-1"
              />
              <span className="text-xs text-blue-600">
                {Math.round(primaryState.progress)}%
              </span>
            </div>
          )}
        </div>
      )}

      {activeStates.length > 1 && (
        <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
          +{activeStates.length - 1}
        </span>
      )}
    </div>
  );
}

/**
 * Loading Status Bar for bottom of screen
 */
export function LoadingStatusBar({
  className
}: {
  className?: string;
}): JSX.Element | null {
  const { loadingStates, globalLoading, stopLoading } = useLoadingStore();
  const activeStates = Array.from(loadingStates.values());

  if (!globalLoading || activeStates.length === 0) {
    return null;
  }

  const primaryState = activeStates[activeStates.length - 1];

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40',
      className
    )}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {primaryState.message}
            </p>
            
            {primaryState.progress !== undefined && (
              <Progress 
                value={primaryState.progress} 
                className="w-full h-1 mt-1"
              />
            )}
          </div>

          {activeStates.length > 1 && (
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
              {activeStates.length} tác vụ
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 flex-shrink-0"
          onClick={() => stopLoading(primaryState.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
