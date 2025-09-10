'use client';

import { useTheme } from "next-themes";
import { useEffect } from "react";

interface ThemeForcerProps {
  /**
   * Force theme để áp dụng cứng
   * - 'dark': Luôn force dark theme
   * - 'light': Luôn force light theme  
   */
  forceTheme: 'dark' | 'light';
  
  /**
   * Có disable ThemeToggle button không
   * Mặc định là false
   */
  disableToggle?: boolean;
  
  /**
   * Component con sẽ được wrap
   */
  children: React.ReactNode;
}

/**
 * ThemeForcer Component
 * 
 * Component này được sử dụng để force một theme cụ thể cho các trang
 * mà không phụ thuộc vào user preference từ localStorage.
 * 
 * Sử dụng trong các trường hợp:
 * - Trang chủ luôn muốn sử dụng dark theme
 * - Trang courses luôn muốn sử dụng dark theme và tắt toggle
 * - Bất kỳ trang nào muốn có theme cố định
 * 
 * @param forceTheme - Theme muốn force ('dark' | 'light')  
 * @param disableToggle - Có disable theme toggle button không
 * @param children - Component con
 */
export function ThemeForcer({ forceTheme, disableToggle = false, children }: ThemeForcerProps) {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    // Force theme ngay khi component mount
    if (theme !== forceTheme) {
      setTheme(forceTheme);
    }
  }, [forceTheme, setTheme, theme]);

  useEffect(() => {
    // Thêm class CSS để hide theme toggle nếu cần
    if (disableToggle) {
      document.documentElement.setAttribute('data-theme-toggle-disabled', 'true');
    } else {
      document.documentElement.removeAttribute('data-theme-toggle-disabled');
    }

    // Cleanup khi component unmount
    return () => {
      document.documentElement.removeAttribute('data-theme-toggle-disabled');
    };
  }, [disableToggle]);

  return <>{children}</>;
}
