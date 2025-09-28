/**
 * Exam Detail Page
 * Page hiển thị chi tiết đề thi theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExamDetailClient from './exam-detail-client';
import { isValidExamId } from '@/lib/exam-paths';

// ===== TYPES =====

/**
 * Page Props Interface
 * Props cho dynamic exam detail page
 */
interface ExamDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ===== METADATA =====

/**
 * Generate metadata for exam detail page
 * Dynamic metadata based on exam ID
 */
export async function generateMetadata({ params }: ExamDetailPageProps): Promise<Metadata> {
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
    title: `Chi tiết đề thi - NyNus`,
    description: 'Xem chi tiết đề thi, làm bài và xem kết quả',
    openGraph: {
      title: `Chi tiết đề thi - NyNus`,
      description: 'Xem chi tiết đề thi, làm bài và xem kết quả',
      type: 'website',
    },
    alternates: {
      canonical: `/exams/${id}`,
    },
  };
}

// ===== MAIN COMPONENT =====

/**
 * Exam Detail Page Component
 * Server component cho exam detail page với proper validation
 * 
 * Features:
 * - Exam ID validation
 * - Dynamic metadata generation
 * - Error handling for invalid IDs
 * - Client component delegation
 */
export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
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

  return <ExamDetailClient examId={id} />;
}

// ===== STATIC GENERATION =====

/**
 * Generate static params for popular exams
 * This can be used for ISR (Incremental Static Regeneration)
 */
export async function generateStaticParams() {
  // TODO: Fetch popular exam IDs
  // const popularExams = await fetchPopularExams();
  // return popularExams.map(exam => ({ id: exam.id }));
  
  return []; // Return empty array for now
}
