import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp } from 'lucide-react';

interface LevelIndicatorProps {
  level: number;
  maxLevel?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelIndicator({ 
  level, 
  maxLevel = 12, 
  showProgress = false,
  size = 'md',
  className = '' 
}: LevelIndicatorProps) {
  const progress = (level / maxLevel) * 100;
  
  const getLevelColor = () => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-blue-500';
    if (level <= 9) return 'bg-purple-500';
    return 'bg-orange-500';
  };

  const getLevelBadgeColor = () => {
    if (level <= 3) return 'bg-green-100 text-green-800 border-green-300';
    if (level <= 6) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (level <= 9) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const getSchoolLevel = () => {
    if (level <= 5) return 'Tiểu học';
    if (level <= 9) return 'THCS';
    return 'THPT';
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (showProgress) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className={`${iconSizes[size]} text-yellow-500`} />
            <span className={`font-semibold ${sizeClasses[size]}`}>
              Lớp {level}
            </span>
            <span className={`text-muted-foreground ${sizeClasses[size]}`}>
              ({getSchoolLevel()})
            </span>
          </div>
          <span className={`text-muted-foreground ${sizeClasses[size]}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className={`h-2 ${getLevelColor()}`} />
        <div className="flex items-center justify-between">
          <span className={`text-muted-foreground text-xs`}>Lớp 1</span>
          <span className={`text-muted-foreground text-xs`}>Lớp 12</span>
        </div>
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`${getLevelBadgeColor()} ${sizeClasses[size]} font-medium ${className}`}
    >
      <TrendingUp className={`${iconSizes[size]} mr-1`} />
      Lớp {level} - {getSchoolLevel()}
    </Badge>
  );
}