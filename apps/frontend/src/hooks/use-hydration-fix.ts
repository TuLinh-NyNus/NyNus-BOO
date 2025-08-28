'use client';

import { useEffect } from 'react';

/**
 * Hook để xử lý các vấn đề hydration do browser extensions
 * Đặc biệt hữu ích cho các extensions như Bitwarden, Avast, AVG
 * mà inject attributes như bis_skin_checked="1" vào DOM
 */
export function useHydrationFix() {
  useEffect(() => {
    // Cleanup function để remove các attributes được inject bởi browser extensions
    const cleanupBrowserExtensionAttributes = () => {
      // Danh sách các attributes thường được inject bởi browser extensions
      const extensionAttributes = [
        'bis_skin_checked',
        'data-bitwarden-watching',
        'data-lastpass-icon-root',
        'data-1password-watching',
        'data-dashlane-watching'
      ];

      // Remove attributes từ tất cả elements
      extensionAttributes.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        elements.forEach(element => {
          element.removeAttribute(attr);
        });
      });
    };

    // Chạy cleanup sau khi component mount
    const timeoutId = setTimeout(cleanupBrowserExtensionAttributes, 100);

    // Cleanup khi component unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
}

/**
 * Hook để suppress hydration warnings cho specific elements
 */
export function useSupressHydrationWarning(elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (elementRef.current) {
      // Thêm suppressHydrationWarning attribute
      elementRef.current.setAttribute('suppressHydrationWarning', 'true');
    }
  }, [elementRef]);
}
