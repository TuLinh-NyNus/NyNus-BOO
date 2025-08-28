/**
 * Test Hydration Page
 * Trang để test các hydration fixes
 */

'use client';

import { HydrationTest } from '@/components/admin/test/hydration-test';

export default function TestHydrationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Hydration Test Page
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">
              Hydration Status Check
            </h2>
            <p className="text-gray-600 mb-4">
              Component này kiểm tra trạng thái hydration và phát hiện browser extensions 
              có thể gây ra hydration mismatch errors.
            </p>
            <HydrationTest />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">
              Common Hydration Issues Fixed
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Browser extension attributes (bis_skin_checked, data-bitwarden-watching, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Server/client rendering mismatch</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Dynamic content hydration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Navigation component hydration</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">
              Implementation Details
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>HydrationSafe Component:</strong> Wrapper component that prevents hydration mismatches
              </p>
              <p>
                <strong>useHydrationFix Hook:</strong> Automatically cleans up browser extension attributes
              </p>
              <p>
                <strong>suppressHydrationWarning:</strong> Added to components that may have extension interference
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
