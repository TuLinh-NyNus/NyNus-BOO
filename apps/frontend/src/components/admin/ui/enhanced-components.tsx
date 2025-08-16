'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/display/badge';

/**
 * Enhanced Admin Components
 * Wrapper components với styling tối ưu cho admin panel dark theme
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Enhanced Card for Admin
interface AdminCardProps extends React.ComponentProps<typeof Card> {
  variant?: 'default' | 'elevated' | 'bordered';
}

export function AdminCard({ className, variant = 'default', ...props }: AdminCardProps) {
  const variantClasses = {
    default: 'admin-card',
    elevated: 'admin-card shadow-lg',
    bordered: 'admin-card border-2'
  };

  return (
    <Card 
      className={cn(variantClasses[variant], className)} 
      {...props} 
    />
  );
}

// Enhanced Card Header for Admin
export function AdminCardHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader 
      className={cn('admin-text-primary border-b border-admin-border', className)} 
      {...props} 
    />
  );
}

// Enhanced Card Content for Admin
export function AdminCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent 
      className={cn('admin-text-primary', className)} 
      {...props} 
    />
  );
}

// Enhanced Card Title for Admin
export function AdminCardTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle 
      className={cn('admin-text-primary text-lg font-semibold', className)} 
      {...props} 
    />
  );
}

// Enhanced Card Description for Admin
export function AdminCardDescription({ className, ...props }: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription 
      className={cn('admin-text-secondary', className)} 
      {...props} 
    />
  );
}

// Enhanced Button for Admin
interface AdminButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  adminVariant?: 'primary' | 'secondary';
}

export function AdminButton({ 
  className, 
  variant = 'default', 
  adminVariant = 'primary',
  ...props 
}: AdminButtonProps) {
  const adminClasses = {
    primary: 'admin-button-primary',
    secondary: 'admin-button-secondary'
  };

  return (
    <Button 
      variant={variant}
      className={cn(adminClasses[adminVariant], className)} 
      {...props} 
    />
  );
}

// Enhanced Badge for Admin
interface AdminBadgeProps extends React.ComponentProps<typeof Badge> {
  adminVariant?: 'default' | 'success' | 'warning' | 'error' | 'secondary';
}

export function AdminBadge({ 
  className, 
  adminVariant = 'default',
  ...props 
}: AdminBadgeProps) {
  const adminClasses = {
    default: 'admin-badge-default',
    success: 'admin-badge-success',
    warning: 'admin-badge-warning',
    error: 'admin-badge-error',
    secondary: 'admin-badge-secondary'
  };

  return (
    <Badge 
      className={cn(adminClasses[adminVariant], className)} 
      {...props} 
    />
  );
}

// Enhanced Table components for Admin
export function AdminTable({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn('admin-table w-full border-collapse', className)}
      {...props}
    />
  );
}

export function AdminTableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead 
      className={cn('admin-table-header', className)} 
      {...props} 
    />
  );
}

export function AdminTableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn('', className)}
      {...props}
    />
  );
}

export function AdminTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr 
      className={cn('admin-table-row', className)} 
      {...props} 
    />
  );
}

interface AdminTableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  as?: 'td' | 'th';
}

export function AdminTableCell({ className, as = 'td', ...props }: AdminTableCellProps) {
  const Component = as;
  return (
    <Component 
      className={cn('admin-table-cell', className)} 
      {...props} 
    />
  );
}

// Enhanced Input for Admin
export function AdminInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        'admin-input w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2',
        className
      )} 
      {...props} 
    />
  );
}

// Enhanced Text components for Admin
interface AdminTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'primary' | 'secondary' | 'muted';
}

export function AdminText({ 
  className, 
  as = 'p', 
  variant = 'primary',
  ...props 
}: AdminTextProps) {
  const Component = as;
  const variantClasses = {
    primary: 'admin-text-primary',
    secondary: 'admin-text-secondary',
    muted: 'admin-text-muted'
  };

  return (
    <Component 
      className={cn(variantClasses[variant], className)} 
      {...props} 
    />
  );
}

// Enhanced Icon wrapper for Admin
interface AdminIconProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary' | 'muted' | 'accent';
  children: React.ReactNode;
}

export function AdminIcon({ 
  className, 
  variant = 'primary',
  children,
  ...props 
}: AdminIconProps) {
  const variantClasses = {
    primary: 'admin-icon-primary',
    secondary: 'admin-icon-secondary',
    muted: 'admin-icon-muted',
    accent: 'admin-icon-accent'
  };

  return (
    <span 
      className={cn(variantClasses[variant], className)} 
      {...props}
    >
      {children}
    </span>
  );
}
