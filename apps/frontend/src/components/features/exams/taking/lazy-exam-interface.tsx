/**
 * Lazy Exam Interface Wrapper
 * Client component wrapper for lazy loading exam interface
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load TakeExamClient for better performance
const TakeExamClient = dynamic(() => import('@/app/exams/[id]/take/take-exam-client'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Đang tải giao diện thi...</span>
    </div>
  ),
  ssr: false // Disable SSR for exam interface for better performance
});

interface LazyExamInterfaceProps {
  examId: string;
}

export default function LazyExamInterface({ examId }: LazyExamInterfaceProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang khởi tạo giao diện thi...</span>
      </div>
    }>
      <TakeExamClient examId={examId} />
    </Suspense>
  );
}
