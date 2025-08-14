/**
 * Admin Layout Types
 * Consolidated layout types for admin interface
 */

import { ReactNode } from 'react';

// ===== CORE LAYOUT INTERFACES =====

/**
 * Admin Layout Props
 * Props cho AdminLayout component
 */
export interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout Configuration Interface
 * Interface cho layout configuration
 */
export interface AdminLayoutConfig {
  sidebar: {
    width: number;
    collapsible: boolean;
    defaultCollapsed: boolean;
  };
  header: {
    height: number;
    sticky: boolean;
  };
  content: {
    padding: number;
    maxWidth?: number;
  };
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * Default Layout Configuration
 * Default config cho admin layout
 */
export const DEFAULT_ADMIN_LAYOUT_CONFIG: AdminLayoutConfig = {
  sidebar: {
    width: 256, // 64 * 4 = 256px (w-64)
    collapsible: true,
    defaultCollapsed: false
  },
  header: {
    height: 64, // 16 * 4 = 64px (h-16)
    sticky: true
  },
  content: {
    padding: 24, // 6 * 4 = 24px (p-6)
    maxWidth: undefined
  },
  breakpoints: {
    mobile: 640,   // sm
    tablet: 768,   // md
    desktop: 1024  // lg
  }
};

// ===== LAYOUT STATE & ACTIONS =====

/**
 * Layout State Interface
 * Interface cho layout state management
 */
export interface AdminLayoutState {
  sidebarCollapsed: boolean;
  headerVisible: boolean;
  breadcrumbVisible: boolean;
  loading: boolean;
  error: AdminError | null;
}

/**
 * Layout Actions Interface
 * Interface cho layout actions
 */
export interface AdminLayoutActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setHeaderVisible: (visible: boolean) => void;
  setBreadcrumbVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AdminError | null) => void;
  resetLayout: () => void;
}

// ===== RESPONSIVE BREAKPOINTS =====

/**
 * Responsive Breakpoint Hook Return
 * Return type cho useResponsiveBreakpoint hook
 */
export interface ResponsiveBreakpoint {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
}

// ===== CONTEXT INTERFACES =====

/**
 * Layout Context Value
 * Context value cho AdminLayoutProvider
 */
export interface AdminLayoutContextValue {
  config: AdminLayoutConfig;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Layout Provider Props
 * Props cho AdminLayoutProvider
 */
export interface AdminLayoutProviderProps {
  children: ReactNode;
  config?: Partial<AdminLayoutConfig>;
}

// ===== ERROR HANDLING =====

/**
 * Admin Error Interface
 * Interface cho admin errors
 */
export interface AdminError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  source?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

/**
 * Error Boundary Props
 * Props cho AdminErrorBoundary
 */
export interface AdminErrorBoundaryProps {
  children: ReactNode;
  level?: 'page' | 'component' | 'critical';
  enableRetry?: boolean;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: ReactNode;
}

/**
 * Error Boundary State
 * State cho AdminErrorBoundary
 */
export interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

// ===== THEME CONFIGURATION =====

/**
 * Theme Configuration
 * Configuration cho admin theme
 */
export interface AdminThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  borderRadius: number;
  fontFamily: string;
}

/**
 * Theme Context Value
 * Context value cho AdminThemeProvider
 */
export interface AdminThemeContextValue {
  theme: AdminThemeConfig;
  setTheme: (theme: Partial<AdminThemeConfig>) => void;
  toggleMode: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

// ===== HOOK RETURN TYPES =====

/**
 * Layout Hook Return Type
 * Return type cho useAdminLayout hook
 */
export interface UseAdminLayoutReturn {
  state: AdminLayoutState;
  actions: AdminLayoutActions;
  config: AdminLayoutConfig;
  responsive: ResponsiveBreakpoint;
}

// ===== PROVIDER INTERFACES =====

/**
 * Provider Props Interface
 * Base interface cho admin providers
 */
export interface AdminProviderProps {
  children: ReactNode;
}

/**
 * Admin Error Provider Props
 * Props cho AdminErrorProvider
 */
export interface AdminErrorProviderProps extends AdminProviderProps {
  maxErrors?: number;
  enablePersistence?: boolean;
  enableReporting?: boolean;
  onErrorReport?: (error: AdminError) => void;
}

/**
 * Admin Error Context Value
 * Context value cho AdminErrorProvider
 */
export interface AdminErrorContextValue {
  errors: AdminError[];
  addError: (error: AdminError) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  hasErrors: boolean;
  errorCount: number;
}

// ===== CONNECTION STATUS =====

/**
 * Connection Status Type
 * Type cho connection status
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
