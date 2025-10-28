/**
 * Quick Actions Component
 * Panel các hành động nhanh cho admin
 * 
 * @author NyNus Team
 * @created 2025-01-27
 */

'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  HelpCircle, 
  BookOpen, 
  Users, 
  BarChart3,
  ChevronDown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/display/badge';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: 'create' | 'manage' | 'analyze';
  isNew?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  // Create Actions
  {
    id: 'create-question',
    label: 'Tạo Câu Hỏi',
    description: 'Thêm câu hỏi mới vào ngân hàng',
    icon: <HelpCircle className="h-4 w-4" />,
    href: '/3141592654/admin/questions/create',
    category: 'create',
    isNew: false
  },
  {
    id: 'create-course',
    label: 'Tạo Khóa Học',
    description: 'Tạo khóa học mới',
    icon: <BookOpen className="h-4 w-4" />,
    href: '/3141592654/admin/courses/create',
    category: 'create',
    isNew: true
  },
  
  // Manage Actions
  {
    id: 'manage-users',
    label: 'Quản Lý Người Dùng',
    description: 'Xem và chỉnh sửa tài khoản',
    icon: <Users className="h-4 w-4" />,
    href: '/3141592654/admin/users',
    category: 'manage'
  },
  {
    id: 'manage-questions',
    label: 'Quản Lý Câu Hỏi',
    description: 'Duyệt và chỉnh sửa câu hỏi',
    icon: <HelpCircle className="h-4 w-4" />,
    href: '/3141592654/admin/questions',
    category: 'manage'
  },
  
  // Analyze Actions
  {
    id: 'view-analytics',
    label: 'Xem Báo Cáo',
    description: 'Phân tích chi tiết hệ thống',
    icon: <BarChart3 className="h-4 w-4" />,
    href: '/3141592654/admin/analytics',
    category: 'analyze'
  }
];

const CATEGORY_LABELS = {
  create: 'Tạo Mới',
  manage: 'Quản Lý', 
  analyze: 'Phân Tích'
};

const CATEGORY_COLORS = {
  create: 'text-emerald-400',
  manage: 'text-blue-400',
  analyze: 'text-amber-400'
};

/**
 * Quick Actions Dropdown Component
 */
export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const handleActionClick = (href: string) => {
    setIsOpen(false);
    window.location.href = href;
  };

  const groupedActions = QUICK_ACTIONS.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "relative overflow-hidden border transition-all duration-300",
            "bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10",
            "border-white/20 hover:border-white/30",
            "backdrop-blur-xl shadow-lg hover:shadow-xl",
            "hover:scale-105 active:scale-95",
            "group"
          )}
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 shadow-lg">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hành Động Nhanh
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-80 p-2",
          "bg-card/95 backdrop-blur-xl border-white/20",
          "shadow-2xl shadow-black/20"
        )}
      >
        <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-bold">Hành Động Nhanh</span>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        {Object.entries(groupedActions).map(([category, actions]) => (
          <div key={category} className="py-1">
            <div className={cn(
              "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
              CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
            )}>
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
            </div>
            
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleActionClick(action.href)}
                className={cn(
                  "flex items-start gap-3 p-3 mx-1 rounded-lg",
                  "hover:bg-white/5 focus:bg-white/5",
                  "transition-all duration-200 cursor-pointer",
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 mt-0.5">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{action.label}</span>
                    {action.isNew && (
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-xs px-1.5 py-0.5">
                        MỚI
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
            
            {category !== 'analyze' && (
              <DropdownMenuSeparator className="bg-white/5 my-2" />
            )}
          </div>
        ))}
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleActionClick('/3141592654/admin')}
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="h-3 w-3 mr-2" />
            Xem tất cả tính năng
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Quick Actions Floating Button (Alternative compact version)
 */
export function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "rounded-full w-14 h-14 shadow-2xl",
              "bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500",
              "hover:scale-110 active:scale-95",
              "transition-all duration-300",
              "border-2 border-white/20"
            )}
          >
            <Plus className={cn(
              "h-6 w-6 transition-transform duration-200",
              isOpen && "rotate-45"
            )} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          side="top"
          className="w-72 mb-2 bg-card/95 backdrop-blur-xl border-white/20 shadow-2xl"
        >
          <DropdownMenuLabel>Tạo Nhanh</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {QUICK_ACTIONS.filter(action => action.category === 'create').map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => window.location.href = action.href}
              className="flex items-center gap-3 p-3"
            >
              <div className="p-2 rounded-lg bg-primary/20">
                {action.icon}
              </div>
              <div>
                <div className="font-semibold">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


