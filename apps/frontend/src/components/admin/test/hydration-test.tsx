'use client';

import { useEffect, useState } from 'react';
import { HydrationSafe } from '@/components/common/hydration-safe';

/**
 * Component để test hydration fixes
 * Hiển thị thông tin về hydration status và browser extensions
 */
export function HydrationTest() {
  const [hydrationInfo, setHydrationInfo] = useState({
    isHydrated: false,
    hasExtensionAttributes: false,
    extensionAttributes: [] as string[],
    timestamp: ''
  });

  useEffect(() => {
    // Check for browser extension attributes
    const checkExtensionAttributes = () => {
      const extensionAttrs = [
        'bis_skin_checked',
        'data-bitwarden-watching',
        'data-lastpass-icon-root',
        'data-1password-watching',
        'data-dashlane-watching'
      ];

      const foundAttrs: string[] = [];
      extensionAttrs.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        if (elements.length > 0) {
          foundAttrs.push(`${attr} (${elements.length} elements)`);
        }
      });

      setHydrationInfo({
        isHydrated: true,
        hasExtensionAttributes: foundAttrs.length > 0,
        extensionAttributes: foundAttrs,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    // Check immediately and after a delay
    checkExtensionAttributes();
    const timeoutId = setTimeout(checkExtensionAttributes, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <HydrationSafe className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        Hydration Test Component
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Hydration Status:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            hydrationInfo.isHydrated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {hydrationInfo.isHydrated ? 'Hydrated' : 'Not Hydrated'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Browser Extensions:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            hydrationInfo.hasExtensionAttributes 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {hydrationInfo.hasExtensionAttributes ? 'Detected' : 'None'}
          </span>
        </div>

        {hydrationInfo.extensionAttributes.length > 0 && (
          <div className="mt-2">
            <span className="font-medium">Extension Attributes Found:</span>
            <ul className="list-disc list-inside ml-4 mt-1">
              {hydrationInfo.extensionAttributes.map((attr, index) => (
                <li key={index} className="text-orange-700">{attr}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          Last checked: {hydrationInfo.timestamp}
        </div>
      </div>
    </HydrationSafe>
  );
}
