/**
 * Admin Layout Provider
 * Provider cho admin layout state management
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { 
  AdminLayoutContextValue, 
  AdminLayoutConfig, 
  DEFAULT_ADMIN_LAYOUT_CONFIG,
  ResponsiveBreakpoint 
} from '@/types/admin/layout';

/**
 * Admin Layout Context
 * Context cho AdminLayoutProvider
 */
const AdminLayoutContext = createContext<AdminLayoutContextValue | undefined>(undefined);

/**
 * Admin Layout Provider Props
 * Props cho AdminLayoutProvider
 */
interface AdminLayoutProviderProps {
  children: ReactNode;
  config?: Partial<AdminLayoutConfig>;
}

/**
 * Admin Layout Provider Component
 * Provider component cho admin layout state management
 */
export function AdminLayoutProvider({ 
  children, 
  config: configOverride = {} 
}: AdminLayoutProviderProps) {
  // Merge default config với override using useMemo
  const config: AdminLayoutConfig = useMemo(() => ({
    ...DEFAULT_ADMIN_LAYOUT_CONFIG,
    ...configOverride,
    sidebar: {
      ...DEFAULT_ADMIN_LAYOUT_CONFIG.sidebar,
      ...configOverride.sidebar
    },
    header: {
      ...DEFAULT_ADMIN_LAYOUT_CONFIG.header,
      ...configOverride.header
    },
    content: {
      ...DEFAULT_ADMIN_LAYOUT_CONFIG.content,
      ...configOverride.content
    },
    breakpoints: {
      ...DEFAULT_ADMIN_LAYOUT_CONFIG.breakpoints,
      ...configOverride.breakpoints
    }
  }), [configOverride]);

  // State management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(config.sidebar.defaultCollapsed);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  /**
   * Handle window resize
   * Xử lý khi window resize
   */
  const handleResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  }, []);

  /**
   * Toggle sidebar
   * Toggle trạng thái sidebar
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      
      // Save to localStorage if available
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-sidebar-collapsed', String(newState));
      }
      
      return newState;
    });
  }, []);

  /**
   * Set sidebar collapsed
   * Set trạng thái sidebar collapsed
   */
  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    
    // Save to localStorage if available
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
    }
  }, []);

  /**
   * Get responsive breakpoint info
   * Lấy thông tin responsive breakpoint
   */
  const getResponsiveInfo = useCallback((): ResponsiveBreakpoint => {
    const { width, height } = windowSize;
    const { breakpoints } = config;

    let breakpoint: 'mobile' | 'tablet' | 'desktop';
    let isMobile = false;
    let isTablet = false;
    let isDesktop = false;

    if (width < breakpoints.mobile) {
      breakpoint = 'mobile';
      isMobile = true;
    } else if (width < breakpoints.desktop) {
      breakpoint = 'tablet';
      isTablet = true;
    } else {
      breakpoint = 'desktop';
      isDesktop = true;
    }

    return {
      isMobile,
      isTablet,
      isDesktop,
      breakpoint,
      width,
      height
    };
  }, [windowSize, config]);

  /**
   * Initialize layout state
   * Khởi tạo layout state từ localStorage
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load sidebar state from localStorage
      const savedSidebarState = localStorage.getItem('admin-sidebar-collapsed');
      if (savedSidebarState !== null) {
        setIsSidebarCollapsed(savedSidebarState === 'true');
      }

      // Set initial window size
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  }, []);

  /**
   * Setup window resize listener
   * Setup listener cho window resize
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [handleResize]);

  /**
   * Auto-collapse sidebar on mobile
   * Tự động collapse sidebar trên mobile
   */
  useEffect(() => {
    const responsive = getResponsiveInfo();
    
    if (responsive.isMobile && !isSidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [windowSize, isSidebarCollapsed, setSidebarCollapsed, getResponsiveInfo]);

  // Get responsive info
  const responsive = getResponsiveInfo();

  // Context value
  const contextValue: AdminLayoutContextValue = {
    config,
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    isMobile: responsive.isMobile,
    isTablet: responsive.isTablet,
    isDesktop: responsive.isDesktop
  };

  return (
    <AdminLayoutContext.Provider value={contextValue}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

/**
 * Use Admin Layout Hook
 * Hook để sử dụng AdminLayout context
 */
export function useAdminLayout(): AdminLayoutContextValue {
  const context = useContext(AdminLayoutContext);
  
  if (context === undefined) {
    throw new Error('useAdminLayout must be used within an AdminLayoutProvider');
  }
  
  return context;
}

/**
 * Use Responsive Breakpoint Hook
 * Hook để sử dụng responsive breakpoint info
 */
export function useResponsiveBreakpoint(): ResponsiveBreakpoint {
  const { config, isMobile, isTablet, isDesktop } = useAdminLayout();
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const { width, height } = windowSize;
  let breakpoint: 'mobile' | 'tablet' | 'desktop';

  if (width < config.breakpoints.mobile) {
    breakpoint = 'mobile';
  } else if (width < config.breakpoints.desktop) {
    breakpoint = 'tablet';
  } else {
    breakpoint = 'desktop';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    width,
    height
  };
}

/**
 * Use Sidebar State Hook
 * Hook để sử dụng sidebar state
 */
export function useSidebarState() {
  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useAdminLayout();
  
  return {
    isCollapsed: isSidebarCollapsed,
    toggle: toggleSidebar,
    setCollapsed: setSidebarCollapsed,
    isExpanded: !isSidebarCollapsed
  };
}
