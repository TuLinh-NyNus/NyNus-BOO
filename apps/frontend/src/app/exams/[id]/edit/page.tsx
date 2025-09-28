/**
 * Edit Exam Page
 * Page để chỉnh sửa đề thi theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-19
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EditExamClient from './edit-exam-client';
import { isValidExamId } from '@/lib/exam-paths';

// ===== TYPES =====

/**
 * Page Props Interface
 * Props cho edit exam page
 */
interface EditExamPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ===== METADATA =====

/**
 * Generate metadata for edit exam page
 * Dynamic metadata based on exam ID
 */
export async function generateMetadata({ params }: EditExamPageProps): Promise<Metadata> {
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
    title: `Chỉnh sửa đề thi - NyNus`,
    description: 'Chỉnh sửa thông tin và cài đặt đề thi',
    openGraph: {
      title: `Chỉnh sửa đề thi - NyNus`,
      description: 'Chỉnh sửa thông tin và cài đặt đề thi',
      type: 'website',
    },
    alternates: {
      canonical: `/exams/${id}/edit`,
    },
    robots: {
      index: false, // Don't index edit pages
      follow: false,
    },
  };
}

// ===== MAIN COMPONENT =====

/**
 * Edit Exam Page Component
 * Server component cho edit exam page với proper validation
 * 
 * Features:
 * - Exam ID validation
 * - Dynamic metadata generation
 * - Error handling for invalid IDs
 * - Client component delegation
 * - Role-based access control (handled by middleware)
 */
export default async function EditExamPage({ params }: EditExamPageProps) {
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

  // TODO: Check if user has permission to edit this exam
  // const hasPermission = await checkEditPermission(id, user);
  // if (!hasPermission) {
  //   redirect('/exams');
  // }

  return <EditExamClient examId={id} />;
}
