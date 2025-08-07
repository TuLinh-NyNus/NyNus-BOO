import { memo } from 'react';

import LaTeXRenderer from '@/components/latex/components/latex-renderer';

interface QuestionContentProps {
  content: string;
  className?: string;
}

/**
 * Component hiển thị nội dung câu hỏi với LaTeX rendering
 * Extracted từ QuestionItem để improve reusability
 */
export const QuestionContent = memo(function QuestionContent({ 
  content, 
  className = "text-slate-800 dark:text-white w-full transition-colors duration-300 text-sm sm:text-base" 
}: QuestionContentProps) {
  if (!content) {
    return (
      <div className={className}>
        <span className="text-slate-500 italic">Nội dung câu hỏi không có sẵn</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <LaTeXRenderer content={content} />
    </div>
  );
});

QuestionContent.displayName = 'QuestionContent';
