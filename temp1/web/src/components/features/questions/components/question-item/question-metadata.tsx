import { Calendar, Eye, Hash } from 'lucide-react';
import { memo } from 'react';

interface QuestionMetadataProps {
  question: {
    questionID?: {
      fullId?: string;
    };
    usageCount?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  className?: string;
}

/**
 * Component hiển thị metadata của câu hỏi (ID, usage count, dates)
 * Extracted từ QuestionItem để improve organization
 */
export const QuestionMetadata = memo(function QuestionMetadata({ 
  question, 
  className = "flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300" 
}: QuestionMetadataProps) {
  return (
    <div className={className}>
      {/* Question ID */}
      {question.questionID?.fullId && (
        <span className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          <span className="font-mono text-xs">{question.questionID.fullId}</span>
        </span>
      )}
      
      {/* Usage Count */}
      {typeof question.usageCount === 'number' && (
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{question.usageCount} lượt sử dụng</span>
        </span>
      )}
      
      {/* Created Date */}
      {question.createdAt && (
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(question.createdAt).toLocaleDateString('vi-VN')}</span>
        </span>
      )}
    </div>
  );
});

QuestionMetadata.displayName = 'QuestionMetadata';
