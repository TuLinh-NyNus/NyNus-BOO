'use client';

import { useEffect, useState } from 'react';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Component để xử lý hydration mismatch issues
 * Đặc biệt hữu ích khi browser extensions inject attributes vào DOM
 */
export function HydrationSafe({ 
  children, 
  fallback = null, 
  className 
}: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Đảm bảo component chỉ render sau khi hydration hoàn tất
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return (
    <div className={className} suppressHydrationWarning={true}>
      {children}
    </div>
  );
}

/**
 * Hook để kiểm tra hydration status
 */
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
