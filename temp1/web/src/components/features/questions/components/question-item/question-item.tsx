'use client';

import { memo, useMemo } from 'react';

import { QuestionBadges } from './question-badges';
import { QuestionContent } from './question-content';
import { QuestionMetadata } from './question-metadata';
import { QuestionActions } from './question-actions';
import { Card } from "@/components/ui/display/card";

interface QuestionItemProps {
  question: {
    _id?: string;
    id?: string;
    content: string;
    type?: string;
    subject?: string;
    grade?: string;
    difficulty?: string;
    questionId?: string;
    questionID?: {
      fullId?: string;
      grade?: {
        value?: string;
        description?: string;
      };
      subject?: {
        value?: string;
        description?: string;
      };
      level?: {
        value?: string;
        description?: string;
      };
    };
    subcount?: string;
    source?: string;
    usageCount?: number;
    rawContent?: string;
    raw_content?: string;
    solution?: string;
    answers?: unknown;
    correctAnswer?: unknown;
    images?: {
      questionImage?: string;
      solutionImage?: string;
    };
    tags?: string[];
    examRefs?: unknown[];
    feedback?: number | {
      count?: number;
      feedbackCount?: number;
    };
    createdAt?: string;
    updatedAt?: string;
  };
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
  onViewPdf?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * Main QuestionItem component - now acts as orchestrator
 * Complexity reduced from 18 to 6 through component decomposition
 */
const QuestionItem = memo(function QuestionItem({
  question,
  onView,
  onEdit,
  onDelete,
  onViewPdf,
  onViewDetails,
  isDeleting = false
}: QuestionItemProps): JSX.Element {

  // Memoized calculations - simplified
  const questionId = useMemo(() =>
    question._id || question._id || '',
    [question._id, question._id]
  );

  const displayContent = useMemo(() =>
    question.rawContent || question.content,
    [question.rawContent, question.content]
  );

  const uniqueContentId = useMemo(() =>
    `question-${question.content?.substring(0, 20).replace(/\s+/g, '-') || 'unknown'}`,
    [question.content]
  );

  return (
    <Card
      className="p-3 sm:p-4 md:p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300"
      id={uniqueContentId}
      data-id={questionId}
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Badges Component */}
            <QuestionBadges question={question} />

            {/* Content Component */}
            <QuestionContent content={displayContent} />

            {/* Metadata Component */}
            <QuestionMetadata question={question} />
          </div>

          {/* Actions Component */}
          <QuestionActions
            questionId={questionId}
            question={question}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewPdf={onViewPdf}
            onViewDetails={onViewDetails}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </Card>
  );
});

QuestionItem.displayName = 'QuestionItem';

export { QuestionItem };
export default QuestionItem;
