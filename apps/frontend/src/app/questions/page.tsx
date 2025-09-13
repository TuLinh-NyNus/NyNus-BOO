/**
 * Questions Landing Page
 * Main landing page cho public question interface với thiết kế Enhanced UX/UI
 * 
 * @author NyNus Development Team
 * @version 2.0.0
 * @created 2025-01-18
 * @updated 2025-01-19 - Enhanced UX/UI redesign
 */

import { Metadata } from 'next';
import EnhancedQuestionsClient from './enhanced-client';

// ===== METADATA =====

/**
 * Questions Landing Page Metadata
 * SEO metadata cho questions landing page
 */
export const metadata: Metadata = {
  title: 'Ngân hàng câu hỏi',
  description: 'Khám phá hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó. Học tập hiệu quả với AI.',
  keywords: [
    'câu hỏi toán học',
    'ngân hàng đề thi',
    'luyện tập toán',
    'AI giáo dục',
    'NyNus'
  ],
  openGraph: {
    title: 'Ngân hàng câu hỏi - NyNus',
    description: 'Hàng nghìn câu hỏi toán học được phân loại theo chủ đề và độ khó',
    type: 'website',
  },
  alternates: {
    canonical: '/questions',
  },
};

// ===== MOCK DATA =====

// Featured questions data now handled by FeaturedQuestionsSection component

// Category data now imported from shared constants

// ===== MAIN COMPONENT =====

/**
 * Questions Landing Page Component
 * Server component wrapper cho enhanced questions page
 */
export default function QuestionsLandingPage() {
  return <EnhancedQuestionsClient />;
}
