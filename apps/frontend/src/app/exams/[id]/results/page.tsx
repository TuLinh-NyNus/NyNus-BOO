/**
 * Exam Results Page
 * Page hiển thị kết quả thi theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExamResultsClient from './exam-results-client';
import { isValidExamId } from '@/lib/exam-paths';

// ===== TYPES =====

/**
 * Page Props Interface
 * Props cho exam results page
 */
interface ExamResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ===== METADATA =====

/**
 * Generate metadata for exam results page
 * Dynamic metadata based on exam ID
 */
export async function generateMetadata({ params }: ExamResultsPageProps): Promise<Metadata> {
  const { id } = await params;
  
  // Validate exam ID format
  if (!isValidExamId(id)) {
    return {
      title: 'Đề thi không tồn tại - NyNus',
      description: 'Đề thi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }

  // TODO: Fetch exam data for metadata
  // const exam = await fetchExamById(id);
  
  return {
    title: `Kết quả thi - NyNus`,
    description: 'Xem kết quả thi chi tiết và phân tích điểm số',
    openGraph: {
      title: `Kết quả thi - NyNus`,
      description: 'Xem kết quả thi chi tiết và phân tích điểm số',
      type: 'website',
    },
    alternates: {
      canonical: `/exams/${id}/results`,
    },
    robots: {
      index: false, // Don't index results pages for privacy
      follow: false,
    },
  };
}

// ===== MAIN COMPONENT =====

/**
 * Exam Results Page Component
 * Server component cho exam results page với proper validation
 * 
 * Features:
 * - Exam ID validation
 * - Dynamic metadata generation
 * - Error handling for invalid IDs
 * - Client component delegation
 * - Privacy protection (no indexing)
 */
export default async function ExamResultsPage({ params }: ExamResultsPageProps) {
  const { id } = await params;
  
  // Validate exam ID format
  if (!isValidExamId(id)) {
    notFound();
  }

  // TODO: Fetch exam data on server side
  // const exam = await fetchExamById(id);
  // if (!exam) {
  //   notFound();
  // }

  // TODO: Check if user has permission to view results
  // const hasPermission = await checkResultsPermission(id, user);
  // if (!hasPermission) {
  //   redirect(`/exams/${id}`);
  // }

  return <ExamResultsClient examId={id} />;
}
