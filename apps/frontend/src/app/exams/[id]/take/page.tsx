/**
 * Take Exam Page
 * Page để làm bài thi theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LazyExamInterface from '@/components/features/exams/taking/lazy-exam-interface';
import { isValidExamId } from '@/lib/exam-paths';

// ===== TYPES =====

/**
 * Page Props Interface
 * Props cho take exam page
 */
interface TakeExamPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ===== METADATA =====

/**
 * Generate metadata for take exam page
 * Dynamic metadata based on exam ID
 */
export async function generateMetadata({ params }: TakeExamPageProps): Promise<Metadata> {
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
    title: `Làm bài thi - NyNus`,
    description: 'Giao diện làm bài thi trực tuyến với timer và auto-save',
    openGraph: {
      title: `Làm bài thi - NyNus`,
      description: 'Giao diện làm bài thi trực tuyến với timer và auto-save',
      type: 'website',
    },
    alternates: {
      canonical: `/exams/${id}/take`,
    },
    robots: {
      index: false, // Don't index exam taking pages
      follow: false,
    },
  };
}

// ===== MAIN COMPONENT =====

/**
 * Take Exam Page Component
 * Server component cho take exam page với proper validation
 * 
 * Features:
 * - Exam ID validation
 * - Dynamic metadata generation
 * - Error handling for invalid IDs
 * - Client component delegation
 * - Role-based access control (handled by middleware)
 */
export default async function TakeExamPage({ params }: TakeExamPageProps) {
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

  // TODO: Check if exam is available for taking
  // if (exam.status !== 'ACTIVE') {
  //   redirect(`/exams/${id}`);
  // }

  // TODO: Check if user has permission to take this exam
  // const hasPermission = await checkTakePermission(id, user);
  // if (!hasPermission) {
  //   redirect(`/exams/${id}`);
  // }

  return <LazyExamInterface examId={id} />;
}
