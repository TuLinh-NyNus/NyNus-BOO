'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';

/**
 * Page-level Error Boundary
 * Dành cho errors ở page level - full screen fallback
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Trang gặp sự cố</h1>
            <p className="mb-4">Xin lỗi, trang này đang gặp sự cố kỹ thuật.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('Page Error:', error, errorInfo);
        // Optional: Send to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level Error Boundary  
 * Dành cho individual components - compact fallback
 */
export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            {componentName ? `Component "${componentName}"` : 'Component'} gặp sự cố.
          </p>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`Component Error (${componentName || 'Unknown'}):`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Async Operation Error Boundary
 * Dành cho async operations với auto-reset
 */
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      resetOnPropsChange
      fallback={
        <div className="p-4 text-center">
          <p className="text-gray-600 mb-2">Không thể tải dữ liệu</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:underline"
          >
            Thử lại
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
