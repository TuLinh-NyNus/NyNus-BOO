'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Global Error Page
 * Business Logic: Catches unhandled errors trong Next.js application
 * - Log error details với structured logging
 * - Hiển thị user-friendly error message
 * - Cung cấp retry functionality
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error với structured logging
    logger.error('[GlobalError] Unhandled error caught', error, {
      operation: 'globalError',
      errorName: error.name,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}

