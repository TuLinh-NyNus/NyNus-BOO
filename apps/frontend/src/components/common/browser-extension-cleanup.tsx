'use client';

import { useBrowserExtensionCleanup } from '@/hooks';

/**
 * Component xử lý browser extension cleanup
 * Đây là "headless" component chỉ chạy side effects
 * 
 * @description
 * Component này thay thế cho dangerous inline script trong layout.tsx
 * Không render gì cả nhưng chạy cleanup effect an toàn
 */
export function BrowserExtensionCleanup() {
  useBrowserExtensionCleanup();
  
  // Component này không render gì cả chỉ chạy cleanup effect
  return null;
}
