import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskScoreIndicatorProps {
  score: number; // 0-100
  level?: RiskLevel;
  showLabel?: boolean;
  showScore?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'progress' | 'detailed';
  className?: string;
  onInfoClick?: () => void;
}

const riskConfig: Record<RiskLevel, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = {
  low: {
    label: 'Thấp',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
    icon: ShieldCheck,
    description: 'Hoạt động bình thường, không có rủi ro đáng lo ngại',
  },
  medium: {
    label: 'Trung bình',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 border-yellow-300',
    icon: Shield,
    description: 'Có một số hoạt động cần theo dõi',
  },
  high: {
    label: 'Cao',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-300',
    icon: ShieldAlert,
    description: 'Phát hiện hoạt động đáng ngờ, cần xem xét',
  },
  critical: {
    label: 'Nghiêm trọng',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
    icon: AlertTriangle,
    description: 'Hoạt động có nguy cơ cao, cần xử lý ngay',
  },
};

// Determine risk level from score
function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// Get progress bar color based on risk level
function getProgressColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-orange-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function RiskScoreIndicator({
  score,
  level,
  showLabel = true,
  showScore = false,
  showProgress = false,
  size = 'md',
  variant = 'badge',
  className,
  onInfoClick,
}: RiskScoreIndicatorProps) {
  const riskLevel = level || getRiskLevelFromScore(score);
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      badge: 'text-xs px-2 py-0.5',
      icon: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      badge: 'text-sm px-2.5 py-1',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  };

  const currentSizeClasses = sizeClasses[size];

  // Badge variant
  if (variant === 'badge') {
    return (
      <div className={cn('inline-flex items-center gap-1', className)}>
        <Badge
          variant="outline"
          className={cn(
            config.bgColor,
            config.color,
            currentSizeClasses.badge,
            'font-medium border'
          )}
        >
          <Icon className={cn(currentSizeClasses.icon, 'mr-1')} />
          {showLabel && config.label}
          {showScore && (
            <span className="ml-1">({score})</span>
          )}
        </Badge>
        
        {onInfoClick && (
          <button
            onClick={onInfoClick}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={config.description}
          >
            <Info className={currentSizeClasses.icon} />
          </button>
        )}
      </div>
    );
  }

  // Progress variant
  if (variant === 'progress') {
    return (
      <div className={cn('space-y-2', className)}>
        {showLabel && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={cn(currentSizeClasses.icon, config.color)} />
              <span className={cn('font-medium', currentSizeClasses.text, config.color)}>
                Mức độ rủi ro: {config.label}
              </span>
            </div>
            {showScore && (
              <span className={cn(currentSizeClasses.text, 'text-gray-600')}>
                {score}/100
              </span>
            )}
          </div>
        )}
        
        {showProgress && (
          <Progress
            value={score}
            className={cn('h-2', getProgressColor(riskLevel))}
          />
        )}

        {onInfoClick && (
          <button
            onClick={onInfoClick}
            className={cn(
              'text-xs text-gray-500 hover:text-gray-700 cursor-pointer',
              'flex items-center gap-1'
            )}
          >
            <Info className="h-3 w-3" />
            {config.description}
          </button>
        )}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className={cn('p-3 rounded-lg border', config.bgColor, className)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn(currentSizeClasses.icon, config.color)} />
            <div>
              <div className={cn('font-semibold', currentSizeClasses.text, config.color)}>
                Điểm rủi ro: {score}/100
              </div>
              <div className={cn('font-medium', 'text-xs', config.color)}>
                Mức độ: {config.label}
              </div>
            </div>
          </div>
          
          {onInfoClick && (
            <button
              onClick={onInfoClick}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {showProgress && (
          <div className="mt-2">
            <Progress
              value={score}
              className={cn('h-1', getProgressColor(riskLevel))}
            />
          </div>
        )}
        
        <div className={cn('mt-2 text-xs', config.color, 'opacity-80')}>
          {config.description}
        </div>
      </div>
    );
  }

  return null;
}

// Preset components for different risk levels
export function LowRiskIndicator(props: Omit<RiskScoreIndicatorProps, 'score' | 'level'>) {
  return (
    <RiskScoreIndicator
      score={15}
      level="low"
      {...props}
    />
  );
}

export function MediumRiskIndicator(props: Omit<RiskScoreIndicatorProps, 'score' | 'level'>) {
  return (
    <RiskScoreIndicator
      score={45}
      level="medium"
      {...props}
    />
  );
}

export function HighRiskIndicator(props: Omit<RiskScoreIndicatorProps, 'score' | 'level'>) {
  return (
    <RiskScoreIndicator
      score={75}
      level="high"
      {...props}
    />
  );
}

export function CriticalRiskIndicator(props: Omit<RiskScoreIndicatorProps, 'score' | 'level'>) {
  return (
    <RiskScoreIndicator
      score={90}
      level="critical"
      {...props}
    />
  );
}