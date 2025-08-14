/**
 * Status Badge Component
 * Consistent status badges cho question management với transitions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui';
import {
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  EyeOff
} from 'lucide-react';
import { QuestionStatus } from '@/lib/types/question';

/**
 * Props cho Status Badge
 */
interface StatusBadgeProps {
  /** Question status */
  status?: QuestionStatus;
  /** Display variant */
  variant?: 'badge' | 'full' | 'icon';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon */
  showIcon?: boolean;
  /** Show label */
  showLabel?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Click handler for status change */
  onClick?: (status: QuestionStatus) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Status Badge Component
 * Visual representation của question status với consistent styling
 */
export function StatusBadge({
  status,
  variant = 'badge',
  size = 'md',
  showIcon = true,
  showLabel = true,
  showTooltip = true,
  onClick,
  className = ''
}: StatusBadgeProps) {
  /**
   * Get status configuration
   */
  const getStatusConfig = (statusValue?: QuestionStatus) => {
    if (!statusValue) {
      return {
        label: 'Không xác định',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300',
        icon: AlertCircle,
        description: 'Trạng thái chưa được xác định'
      };
    }

    const configs = {
      [QuestionStatus.ACTIVE]: {
        label: 'Hoạt động',
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        icon: CheckCircle,
        description: 'Câu hỏi đang được sử dụng và có thể xuất hiện trong đề thi'
      },
      [QuestionStatus.PENDING]: {
        label: 'Chờ duyệt',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
        icon: Clock,
        description: 'Câu hỏi đang chờ được duyệt bởi quản trị viên'
      },
      [QuestionStatus.INACTIVE]: {
        label: 'Không hoạt động',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        icon: EyeOff,
        description: 'Câu hỏi tạm thời không được sử dụng'
      },
      [QuestionStatus.ARCHIVED]: {
        label: 'Đã lưu trữ',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
        icon: Archive,
        description: 'Câu hỏi đã được lưu trữ và không còn sử dụng'
      }
    };

    return configs[statusValue];
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  /**
   * Get size classes
   */
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        badge: 'text-xs px-2 py-1',
        icon: 'h-3 w-3',
        text: 'text-xs'
      },
      md: {
        badge: 'text-sm px-3 py-1',
        icon: 'h-4 w-4',
        text: 'text-sm'
      },
      lg: {
        badge: 'text-base px-4 py-2',
        icon: 'h-5 w-5',
        text: 'text-base'
      }
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  /**
   * Handle click
   */
  const handleClick = () => {
    if (onClick && status) {
      onClick(status);
    }
  };

  /**
   * Render badge variant
   */
  const renderBadge = () => (
    <Badge
      className={`
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border ${sizeClasses.badge} font-medium transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      title={showTooltip ? config.description : undefined}
      onClick={handleClick}
    >
      {showIcon && <Icon className={`${sizeClasses.icon} ${showLabel ? 'mr-1' : ''}`} />}
      {showLabel && config.label}
    </Badge>
  );

  /**
   * Render icon variant
   */
  const renderIcon = () => (
    <div 
      className={`
        status-icon ${config.textColor} transition-colors duration-200
        ${onClick ? 'cursor-pointer hover:scale-110' : ''}
        ${className}
      `}
      title={showTooltip ? `${config.label}: ${config.description}` : undefined}
      onClick={handleClick}
    >
      <Icon className={sizeClasses.icon} />
    </div>
  );

  /**
   * Render full variant
   */
  const renderFull = () => (
    <div 
      className={`
        status-full flex items-center gap-2 transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      title={showTooltip ? config.description : undefined}
      onClick={handleClick}
    >
      <div className={`p-2 rounded-full ${config.bgColor}`}>
        <Icon className={`${sizeClasses.icon} ${config.textColor}`} />
      </div>
      
      {showLabel && (
        <div>
          <div className={`font-medium ${sizeClasses.text}`}>
            {config.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {config.description}
          </div>
        </div>
      )}
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'icon':
      return renderIcon();
    case 'full':
      return renderFull();
    case 'badge':
    default:
      return renderBadge();
  }
}

/**
 * Status Selector Component
 * Dropdown selector cho status changes
 */
export function StatusSelector({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = ''
}: {
  currentStatus?: QuestionStatus;
  onStatusChange: (status: QuestionStatus) => void;
  disabled?: boolean;
  className?: string;
}) {
  const statuses = [
    QuestionStatus.ACTIVE,
    QuestionStatus.PENDING,
    QuestionStatus.INACTIVE,
    QuestionStatus.ARCHIVED
  ];

  return (
    <div className={`status-selector ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            disabled={disabled}
            className={`
              transition-all duration-200 rounded-lg p-2
              ${currentStatus === status 
                ? 'ring-2 ring-blue-500 ring-offset-2' 
                : 'hover:scale-105'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <StatusBadge
              status={status}
              variant="full"
              size="sm"
              showLabel={true}
              showTooltip={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Status History Component
 * Shows status change history
 */
export function StatusHistory({
  history,
  className = ''
}: {
  history: Array<{
    status: QuestionStatus;
    timestamp: string;
    user?: string;
    reason?: string;
  }>;
  className?: string;
}) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`status-history space-y-3 ${className}`}>
      <h4 className="font-medium text-sm">Lịch sử trạng thái</h4>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {history.map((entry, index) => (
          <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
            <StatusBadge
              status={entry.status}
              variant="icon"
              size="sm"
              showLabel={false}
              showTooltip={false}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <StatusBadge
                  status={entry.status}
                  variant="badge"
                  size="sm"
                  showIcon={false}
                  showTooltip={false}
                />
                <span className="text-muted-foreground">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              
              {entry.user && (
                <div className="text-xs text-muted-foreground mt-1">
                  Bởi: {entry.user}
                </div>
              )}
              
              {entry.reason && (
                <div className="text-xs text-muted-foreground mt-1">
                  Lý do: {entry.reason}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
