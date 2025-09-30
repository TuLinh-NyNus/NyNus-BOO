import { Badge } from '@/components/ui/badge';
import { Crown, GraduationCap, BookOpen, Users, User } from 'lucide-react';

export type UserRole = 'ADMIN' | 'TEACHER' | 'TUTOR' | 'STUDENT' | 'GUEST';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const roleConfig: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  ADMIN: {
    label: 'Quản trị viên',
    icon: Crown,
    color: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200',
  },
  TEACHER: {
    label: 'Giáo viên',
    icon: GraduationCap,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
  },
  TUTOR: {
    label: 'Gia sư',
    icon: BookOpen,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 hover:bg-purple-200',
  },
  STUDENT: {
    label: 'Học sinh',
    icon: Users,
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200',
  },
  GUEST: {
    label: 'Khách',
    icon: User,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
  },
};

export function RoleBadge({ role, size = 'md', showIcon = true, className = '' }: RoleBadgeProps) {
  const config = roleConfig[role];
  
  if (!config) {
    return null;
  }

  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.color} ${sizeClasses[size]} font-medium transition-colors ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </Badge>
  );
}