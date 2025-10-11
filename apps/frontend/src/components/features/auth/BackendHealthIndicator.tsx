"use client";

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { checkBackendHealth } from '@/lib/config/endpoints';
import { cn } from '@/lib/utils';

interface HealthStatus {
  healthy: boolean;
  service?: string;
  timestamp?: number;
  error?: string;
}

interface BackendHealthIndicatorProps {
  /** Show detailed status (service name, timestamp) */
  showDetails?: boolean;
  /** Check interval in milliseconds (default: 30000 = 30s) */
  checkInterval?: number;
  /** Show only when unhealthy (hide when healthy) */
  hideWhenHealthy?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Backend Health Indicator Component
 * 
 * Displays real-time backend health status with visual indicators
 * Automatically checks backend health at specified intervals
 * 
 * @example
 * ```tsx
 * // Simple indicator
 * <BackendHealthIndicator />
 * 
 * // Detailed indicator with custom interval
 * <BackendHealthIndicator showDetails checkInterval={60000} />
 * 
 * // Show only when unhealthy
 * <BackendHealthIndicator hideWhenHealthy />
 * ```
 */
export function BackendHealthIndicator({
  showDetails = false,
  checkInterval = 30000,
  hideWhenHealthy = false,
  className,
}: BackendHealthIndicatorProps) {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const result = await checkBackendHealth();
      setStatus(result);
    } catch (error) {
      setStatus({
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Initial check and periodic checks
  useEffect(() => {
    checkHealth();

    const interval = setInterval(checkHealth, checkInterval);
    return () => clearInterval(interval);
  }, [checkInterval]);

  // Hide when healthy if configured
  if (hideWhenHealthy && status?.healthy) {
    return null;
  }

  // Show loading on initial check
  if (!status && isChecking) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-muted-foreground text-sm",
        className
      )}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Đang kiểm tra kết nối...</span>
      </div>
    );
  }

  // Don't render if no status yet
  if (!status) {
    return null;
  }

  const { healthy, service, timestamp, error } = status;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all",
      healthy 
        ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
        : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
      className
    )}>
      {/* Status Icon */}
      {isChecking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : healthy ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}

      {/* Status Text */}
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {healthy ? 'Máy chủ hoạt động bình thường' : 'Không thể kết nối đến máy chủ'}
        </span>
        
        {showDetails && (
          <span className="text-xs opacity-70">
            {healthy ? (
              <>
                {service && <span className="mr-2">• {service}</span>}
                {timestamp && (
                  <span>• {new Date(timestamp * 1000).toLocaleTimeString('vi-VN')}</span>
                )}
              </>
            ) : (
              error && <span>• {error}</span>
            )}
          </span>
        )}
      </div>

      {/* Manual Refresh Button */}
      {!healthy && (
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="ml-auto text-xs underline hover:no-underline disabled:opacity-50"
          title="Thử lại"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}

/**
 * Compact Backend Health Badge
 * 
 * Smaller version for use in headers/footers
 */
export function BackendHealthBadge({ className }: { className?: string }) {
  const [status, setStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const result = await checkBackendHealth();
      setStatus(result);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
      status.healthy
        ? "bg-green-500/10 text-green-700 dark:text-green-400"
        : "bg-red-500/10 text-red-700 dark:text-red-400",
      className
    )}>
      <span className={cn(
        "h-2 w-2 rounded-full",
        status.healthy ? "bg-green-500 animate-pulse" : "bg-red-500"
      )} />
      <span>{status.healthy ? 'Online' : 'Offline'}</span>
    </div>
  );
}

/**
 * Warning Alert for Unhealthy Backend
 * 
 * Large alert banner to show when backend is down
 */
export function BackendHealthAlert() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const result = await checkBackendHealth();
      setStatus(result);
      // Reset dismissal when status changes
      if (result.healthy) {
        setDismissed(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000); // Check more frequently
    return () => clearInterval(interval);
  }, []);

  // Don't show if healthy or dismissed
  if (!status || status.healthy || dismissed) {
    return null;
  }

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
            Không thể kết nối đến máy chủ
          </h3>
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            Hệ thống không thể kết nối đến backend. Vui lòng kiểm tra:
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
            <li>Backend có đang chạy không? (http://localhost:8080/health)</li>
            <li>Kết nối mạng của bạn có ổn định không?</li>
            <li>Firewall có chặn kết nối không?</li>
          </ul>
          {status.error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono bg-red-50 dark:bg-red-950/50 p-2 rounded">
              Chi tiết lỗi: {status.error}
            </p>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          title="Đóng"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
