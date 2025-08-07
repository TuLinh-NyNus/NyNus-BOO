/**
 * Shared component types for better TypeScript compliance
 */

import { ReactNode, ComponentProps, HTMLAttributes } from 'react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// Common UI component props
export interface UIComponentProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
}

// Form component props
export interface FormComponentProps<T = string> extends BaseComponentProps {
  name?: string;
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

// Display component props
export interface DisplayComponentProps<T = unknown> extends BaseComponentProps {
  data: T;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRefresh?: () => void;
}

// Modal/Dialog component props
export interface ModalComponentProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Table component props
export interface TableComponentProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  sorting?: SortingProps;
  selection?: SelectionProps<T>;
  onRowClick?: (row: T) => void;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface SortingProps {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export interface SelectionProps<T = any> {
  selectedRows: T[];
  onSelectionChange: (selectedRows: T[]) => void;
  selectable?: (row: T) => boolean;
}

// Search component props
export interface SearchComponentProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  suggestions?: SearchSuggestion[];
}

export interface SearchSuggestion {
  id: string;
  label: string;
  value: string;
  category?: string;
  icon?: ReactNode;
}

// File upload component props
export interface FileUploadComponentProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  onError?: (error: string) => void;
  dragAndDrop?: boolean;
  preview?: boolean;
}

// Navigation component props
export interface NavigationComponentProps extends BaseComponentProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

// Chart component props
export interface ChartComponentProps extends BaseComponentProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  width?: number;
  height?: number;
  responsive?: boolean;
  legend?: boolean;
  tooltip?: boolean;
  colors?: string[];
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  [key: string]: string | number | boolean | undefined;
}

// Notification component props
export interface NotificationComponentProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Layout component props
export interface LayoutComponentProps extends BaseComponentProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

// Card component props
export interface CardComponentProps extends BaseComponentProps {
  title?: string;
  description?: string;
  header?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  loading?: boolean;
}

// Tabs component props
export interface TabsComponentProps extends BaseComponentProps {
  items: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

// Dropdown component props
export interface DropdownComponentProps extends BaseComponentProps {
  trigger: ReactNode;
  items: DropdownItem[];
  onItemClick?: (item: DropdownItem) => void;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  closeOnItemClick?: boolean;
}

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

// Progress component props
export interface ProgressComponentProps extends BaseComponentProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

// Skeleton component props
export interface SkeletonComponentProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

// Generic component props with strict typing
export type StrictComponentProps<T extends HTMLElement = HTMLDivElement> = 
  BaseComponentProps & HTMLAttributes<T>;

// Event handler types
export type ClickHandler = (event: React.MouseEvent) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler = (event: React.FormEvent) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;

// Utility types for component composition
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ComponentVariant<T extends string> = T | (string & Record<string, never>);

// Responsive props type
export interface ResponsiveProps<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

// Theme-aware component props
export interface ThemeComponentProps extends BaseComponentProps {
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}
