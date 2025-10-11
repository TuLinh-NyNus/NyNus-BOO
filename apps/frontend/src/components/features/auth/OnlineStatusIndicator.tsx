/**
 * Online Status Indicator Component
 * Component hiển thị trạng thái online/offline và chất lượng mạng
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlay/tooltip';
import { useOnlineStatus } from '@/hooks/usePWA';

// ===== TYPES =====

interface OnlineStatusIndicatorProps {
  /** Display variant */
  variant?: 'dot' | 'badge' | 'full' | 'icon-only';
  /** Component size */
  size?: 'sm' | 'md' | 'lg';
  /** Show network quality indicator */
  showNetworkQuality?: boolean;
  /** Show last seen timestamp */
  showLastSeen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom online/offline labels */
  labels?: {
    online: string;
    offline: string;
    connecting: string;
    poor: string;
    good: string;
    excellent: string;
  };
}

interface NetworkQuality {
  level: 'poor' | 'good' | 'excellent';
  rtt: number;
  downlink: number;
  effectiveType: string;
}

// ===== CONSTANTS =====

const DEFAULT_LABELS = {
  online: 'Trực tuyến',
  offline: 'Ngoại tuyến',
  connecting: 'Đang kết nối...',
  poor: 'Mạng yếu',
  good: 'Mạng tốt',
  excellent: 'Mạng xuất sắc'
};

const SIZE_CONFIG = {
  sm: {
    dot: 'h-2 w-2',
    icon: 'h-3 w-3',
    text: 'text-xs',
    badge: 'text-xs px-1.5 py-0.5'
  },
  md: {
    dot: 'h-3 w-3',
    icon: 'h-4 w-4',
    text: 'text-sm',
    badge: 'text-sm px-2 py-1'
  },
  lg: {
    dot: 'h-4 w-4',
    icon: 'h-5 w-5',
    text: 'text-base',
    badge: 'text-base px-3 py-1.5'
  }
} as const;

// ===== COMPONENT =====

export function OnlineStatusIndicator({
  variant = 'dot',
  size = 'md',
  showNetworkQuality = false,
  showLastSeen = false,
  className,
  labels = DEFAULT_LABELS
}: OnlineStatusIndicatorProps) {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality | null>(null);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const isOnline = useOnlineStatus();
  const sizeConfig = SIZE_CONFIG[size];

  // ===== EFFECTS =====

  // Monitor network quality
  useEffect(() => {
    if (!('connection' in navigator) || !showNetworkQuality) return;

    const connection = (navigator as { connection?: { 
      rtt: number; 
      downlink: number; 
      effectiveType: string;
      addEventListener: (event: string, handler: () => void) => void;
      removeEventListener: (event: string, handler: () => void) => void;
    } }).connection;

    if (!connection) return;

    const updateNetworkQuality = () => {
      const { rtt, downlink, effectiveType } = connection;
      
      let level: NetworkQuality['level'] = 'good';
      
      if (rtt > 300 || downlink < 1 || effectiveType === 'slow-2g' || effectiveType === '2g') {
        level = 'poor';
      } else if (rtt < 100 && downlink > 5 && (effectiveType === '4g' || effectiveType === '5g')) {
        level = 'excellent';
      }

      setNetworkQuality({
        level,
        rtt,
        downlink,
        effectiveType
      });
    };

    updateNetworkQuality();
    connection.addEventListener('change', updateNetworkQuality);

    return () => {
      connection.removeEventListener('change', updateNetworkQuality);
    };
  }, [showNetworkQuality]);

  // Handle connection state changes
  useEffect(() => {
    if (!isOnline && !lastSeen) {
      setLastSeen(new Date());
    } else if (isOnline && lastSeen) {
      setLastSeen(null);
    }

    // Show connecting state briefly when coming back online
    if (isOnline && lastSeen) {
      setIsConnecting(true);
      const timer = setTimeout(() => {
        setIsConnecting(false);
        setLastSeen(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, lastSeen]);

  // ===== COMPUTED VALUES =====

  const status = useMemo(() => {
    if (isConnecting) return 'connecting';
    return isOnline ? 'online' : 'offline';
  }, [isOnline, isConnecting]);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'online':
        return 'text-green-500 bg-green-500';
      case 'offline':
        return 'text-red-500 bg-red-500';
      case 'connecting':
        return 'text-yellow-500 bg-yellow-500';
      default:
        return 'text-gray-500 bg-gray-500';
    }
  }, [status]);

  const networkQualityIcon = useMemo(() => {
    if (!networkQuality || !isOnline) return null;

    switch (networkQuality.level) {
      case 'poor':
        return SignalLow;
      case 'good':
        return SignalMedium;
      case 'excellent':
        return SignalHigh;
      default:
        return Signal;
    }
  }, [networkQuality, isOnline]);

  const tooltipContent = useMemo(() => {
    const statusLabel = labels[status as keyof typeof labels];
    
    if (!showNetworkQuality || !networkQuality || !isOnline) {
      if (showLastSeen && lastSeen) {
        return `${statusLabel} - Lần cuối: ${lastSeen.toLocaleTimeString('vi-VN')}`;
      }
      return statusLabel;
    }

    const qualityLabel = labels[networkQuality.level as keyof typeof labels];
    return `${statusLabel} - ${qualityLabel} (${networkQuality.effectiveType.toUpperCase()})`;
  }, [status, networkQuality, lastSeen, showNetworkQuality, showLastSeen, labels, isOnline]);

  // ===== RENDER FUNCTIONS =====

  const renderDot = () => (
    <div
      className={cn(
        'rounded-full border-2 border-background',
        sizeConfig.dot,
        statusColor,
        isConnecting && 'animate-pulse',
        className
      )}
      aria-label={tooltipContent}
    />
  );

  const renderIcon = () => {
    const IconComponent = isOnline ? Wifi : WifiOff;
    const NetworkIcon = networkQualityIcon;

    return (
      <div className={cn('flex items-center gap-1', className)}>
        <IconComponent 
          className={cn(
            sizeConfig.icon,
            statusColor.split(' ')[0], // Only text color
            isConnecting && 'animate-pulse'
          )}
          aria-label={tooltipContent}
        />
        {showNetworkQuality && NetworkIcon && isOnline && (
          <NetworkIcon 
            className={cn(
              sizeConfig.icon,
              networkQuality?.level === 'poor' ? 'text-red-500' :
              networkQuality?.level === 'excellent' ? 'text-green-500' : 'text-yellow-500'
            )}
          />
        )}
      </div>
    );
  };

  const renderBadge = () => {
    const statusLabel = labels[status as keyof typeof labels];
    
    return (
      <Badge
        variant={status === 'online' ? 'default' : status === 'connecting' ? 'secondary' : 'destructive'}
        className={cn(
          sizeConfig.badge,
          'flex items-center gap-1',
          isConnecting && 'animate-pulse',
          className
        )}
      >
        <div className={cn('rounded-full', sizeConfig.dot, statusColor)} />
        {statusLabel}
        {showNetworkQuality && networkQuality && isOnline && (
          <span className="text-xs opacity-75">
            ({networkQuality.effectiveType.toUpperCase()})
          </span>
        )}
      </Badge>
    );
  };

  const renderFull = () => {
    const statusLabel = labels[status as keyof typeof labels];
    
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('rounded-full', sizeConfig.dot, statusColor, isConnecting && 'animate-pulse')} />
        <span className={cn(sizeConfig.text, 'font-medium')}>
          {statusLabel}
        </span>
        {showNetworkQuality && networkQuality && isOnline && (
          <span className={cn(sizeConfig.text, 'text-muted-foreground')}>
            ({networkQuality.effectiveType.toUpperCase()})
          </span>
        )}
        {showLastSeen && lastSeen && (
          <span className={cn(sizeConfig.text, 'text-muted-foreground')}>
            - {lastSeen.toLocaleTimeString('vi-VN')}
          </span>
        )}
      </div>
    );
  };

  // ===== MAIN RENDER =====

  const renderContent = () => {
    switch (variant) {
      case 'dot':
        return renderDot();
      case 'icon-only':
        return renderIcon();
      case 'badge':
        return renderBadge();
      case 'full':
        return renderFull();
      default:
        return renderDot();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex">
            {renderContent()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default OnlineStatusIndicator;
