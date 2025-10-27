/**
 * Question Analytics Tracker Component
 * Client component để track analytics events cho question pages
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import { useEffect } from 'react';
import { useQuestionAnalytics } from '@/hooks/use-analytics';

// ===== TYPES =====

export interface QuestionAnalyticsTrackerProps {
  /** Question ID */
  questionId: string;
  /** Question type */
  questionType?: string;
  /** Question category */
  category?: string;
  /** Question difficulty */
  difficulty?: string;
}

// ===== MAIN COMPONENT =====

/**
 * Question Analytics Tracker
 * Automatically tracks question view when component mounts
 * 
 * @example
 * ```tsx
 * // In Server Component
 * export default async function QuestionPage({ params }) {
 *   const question = await getQuestion(params.id);
 *   
 *   return (
 *     <>
 *       <QuestionAnalyticsTracker 
 *         questionId={question.id}
 *         questionType={question.type}
 *         category={question.category}
 *         difficulty={question.difficulty}
 *       />
 *       {/ * Rest of page * /}
 *     </>
 *   );
 * }
 * ```
 */
export function QuestionAnalyticsTracker({
  questionId,
  questionType,
  category,
  difficulty,
}: QuestionAnalyticsTrackerProps) {
  const { trackView } = useQuestionAnalytics();

  useEffect(() => {
    // Track view when component mounts
    trackView(questionId, {
      type: questionType,
      category,
      difficulty,
    });
  }, [questionId, questionType, category, difficulty, trackView]);

  // This component doesn't render anything
  return null;
}

// ===== EXPORTS =====
export default QuestionAnalyticsTracker;

