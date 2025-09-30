'use client';

import { useEffect } from 'react';

const EXTENSION_ATTRIBUTES = [
  'bis_skin_checked',
  'bis_register',
  'data-adblock-key',
  'data-bitwarden-watching',
  'data-lastpass-icon-root',
  'data-1password-watching',
  'data-dashlane-watching'
];

const EXTENSION_PREFIXES = [
  '__processed_',
  'data-avast',
  'data-avast-annotation',
  'data-avast-ext',
  'data-avast-pam'
];

/**
 * Hook để safely cleanup browser extension attributes
 * Thay thế cho dangerous inline script trong layout.tsx
 * 
 * @description
 * Hook này loại bỏ các attributes được inject bởi browser extensions
 * một cách an toàn mà không vi phạm CSP hoặc tạo XSS vulnerability
 */
export function useBrowserExtensionCleanup() {
  useEffect(() => {
    // Chỉ chạy trên client-side
    if (typeof window === 'undefined') return;

    const shouldRemoveAttribute = (attrName: string): boolean => {
      if (!attrName) return false;
      
      // Kiểm tra exact matches
      if (EXTENSION_ATTRIBUTES.includes(attrName)) return true;
      
      // Kiểm tra prefix matches
      return EXTENSION_PREFIXES.some(prefix => attrName.startsWith(prefix));
    };

    const cleanElement = (element: Element) => {
      if (!element.getAttributeNames) return;
      
      // Lấy tất cả attribute names và loại bỏ extension ones
      element.getAttributeNames().forEach(name => {
        if (shouldRemoveAttribute(name)) {
          try {
            element.removeAttribute(name);
          } catch (_error) {
            // Silently fail cho read-only attributes
            console.debug('Không thể xóa attribute:', name);
          }
        }
      });
    };

    const walkAndClean = (root: Element) => {
      cleanElement(root);
      // Clean tất cả descendant elements
      root.querySelectorAll('*').forEach(cleanElement);
    };

    // Thực hiện immediate cleanup để tránh hydration mismatch
    const immediateCleanup = () => walkAndClean(document.documentElement);
    
    // Chạy cleanup ngay lập tức
    immediateCleanup();
    
    // Chạy lại sau 0ms để đảm bảo
    const timeoutId = setTimeout(immediateCleanup, 0);

    // Setup MutationObserver cho dynamic changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attributeName = mutation.attributeName;
          
          if (attributeName && shouldRemoveAttribute(attributeName)) {
            try {
              target.removeAttribute(attributeName);
            } catch (_error) {
              console.debug('Không thể xóa dynamic attribute:', attributeName);
            }
          }
        } else if (mutation.type === 'childList') {
          // Clean newly added nodes
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              walkAndClean(node as Element);
            }
          });
        }
      });
    });

    // Observe với optimized settings
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: EXTENSION_ATTRIBUTES // Chỉ watch specific attributes
    });

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []); // Empty deps array - chỉ chạy once sau mount
}
