'use client';

import React, { useEffect } from 'react';

/**
 * Dark Theme Provider Component
 * Tự động áp dụng dark theme cho admin panel
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

interface DarkThemeProviderProps {
  children: React.ReactNode;
  className?: string;
}

export function DarkThemeProvider({ children, className = '' }: DarkThemeProviderProps) {
  // Không còn thêm class dark vào documentElement
  // Chỉ áp dụng dark theme locally cho admin panel thông qua wrapper div
  
  return (
    <div className={`dark admin-panel h-full bg-background text-foreground ${className}`}>
      {children}
    </div>
  );
}

/**
 * Hook để kiểm tra dark theme
 * CHỈ dùng để đọc trạng thái, không thay đổi
 */
export function useDarkTheme() {
  const [isDark, setIsDark] = React.useState(false);

  useEffect(() => {
    const checkDarkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkTheme();

    // Observer để theo dõi thay đổi dark theme
    const observer = new MutationObserver(checkDarkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
