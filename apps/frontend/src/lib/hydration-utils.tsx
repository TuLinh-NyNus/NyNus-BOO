/**
 * Hydration Utilities
 * Giải quyết các vấn đề hydration mismatch do browser extensions
 */

import React, { useEffect, useState } from 'react';

/**
 * Hook để handle client-side only rendering
 * Tránh hydration mismatch khi có sự khác biệt giữa server và client
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Component wrapper để render chỉ trên client-side
 * Sử dụng khi cần tránh hoàn toàn hydration mismatch
 */
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps): React.ReactElement {
  const isClient = useIsClient();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Props để thêm suppressHydrationWarning cho các component
 * bị ảnh hưởng bởi browser extensions
 */
export const hydrationSafeProps = {
  suppressHydrationWarning: true
} as const;

/**
 * Danh sách các thuộc tính thường được inject bởi browser extensions
 * Để reference và debugging
 */
export const BROWSER_EXTENSION_ATTRIBUTES = [
  'bis_skin_checked',     // Bitdefender
  'data-darkreader',      // Dark Reader
  'data-adblock',         // AdBlock
  'data-lastpass',        // LastPass
  'data-grammarly',       // Grammarly
] as const;

/**
 * Utility để log hydration warnings trong development
 */
export function logHydrationWarning(componentName: string, reason: string) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Hydration Warning] ${componentName}: ${reason}`);
  }
}
