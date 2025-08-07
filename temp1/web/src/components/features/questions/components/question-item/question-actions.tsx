import { 
  FileText, 
  Info, 
  Pencil, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';

import { Button } from '@/components/ui';
import logger from '@/lib/utils/logger';

interface QuestionActionsProps {
  questionId: string;
  question: {
    subcount?: string;
  };
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
  onViewPdf?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isDeleting?: boolean;
  className?: string;
}

/**
 * Component chứa các action buttons cho câu hỏi
 * Extracted từ QuestionItem để improve maintainability và reusability
 */
export const QuestionActions = memo(function QuestionActions({
  questionId,
  question,
  onView,
  onEdit,
  onDelete,
  onViewPdf,
  onViewDetails,
  isDeleting = false,
  className = "flex items-center gap-1 sm:gap-2"
}: QuestionActionsProps) {
  const router = useRouter();

  // Optimized event handlers với useCallback
  const handleView = useCallback(() => {
    if (!questionId) {
      logger.warn('Cannot view question: questionId is missing');
      return;
    }
    onView(questionId);
  }, [onView, questionId]);

  const handleViewPdf = useCallback(() => {
    if (!questionId) {
      logger.warn('Cannot view PDF: questionId is missing');
      return;
    }
    onViewPdf?.(questionId);
  }, [onViewPdf, questionId]);

  const handleViewDetails = useCallback(() => {
    if (!questionId) {
      logger.warn('Cannot view details: questionId is missing');
      return;
    }
    onViewDetails?.(questionId);
  }, [onViewDetails, questionId]);

  const handleEdit = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!questionId) {
      logger.warn('Cannot edit question: questionId is missing');
      return;
    }

    try {
      // Nếu có subcount, navigate đến edit page với subcount
      if (question.subcount) {
        logger.info('Navigating to edit page with subcount:', question.subcount);
        router.push(`/admin/questions/edit/${question.subcount}`);
      } else {
        // Nếu không có subcount, sử dụng hàm onEdit được truyền từ component cha
        logger.info('Using onEdit callback for questionId:', questionId);
        onEdit?.(questionId);
      }
    } catch (error) {
      logger.error('Error in handleEdit:', error);
      // Fallback: sử dụng hàm onEdit được truyền từ component cha
      onEdit?.(questionId);
    }
  }, [questionId, question.subcount, router, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!questionId) {
      logger.warn('Cannot delete question: questionId is missing');
      return;
    }

    onDelete(questionId);
  }, [onDelete, questionId]);

  return (
    <div className={className}>
      {/* Nút xem PDF */}
      {onViewPdf && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 sm:h-8 sm:w-8 px-0 flex justify-center items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-300 hover:scale-105"
          title="Xem PDF"
          onClick={handleViewPdf}
        >
          <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="sr-only">Xem PDF</span>
        </Button>
      )}

      {/* Nút xem chi tiết */}
      {onViewDetails && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 sm:h-8 sm:w-8 px-0 flex justify-center items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors duration-300 hover:scale-105"
          title="Xem thông tin chi tiết"
          onClick={handleViewDetails}
        >
          <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="sr-only">Chi tiết</span>
        </Button>
      )}

      {/* Nút sửa câu hỏi */}
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 sm:h-8 sm:w-8 px-0 flex justify-center items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-300 hover:scale-105"
          title="Sửa câu hỏi"
          onClick={handleEdit}
        >
          <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="sr-only">Sửa</span>
        </Button>
      )}

      {/* Nút xóa câu hỏi */}
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 sm:h-8 sm:w-8 md:w-auto px-0 md:px-2 flex justify-center items-center bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-white transition-colors duration-300 hover:scale-105"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Xóa câu hỏi"
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        )}
        <span className="sr-only">Xóa</span>
      </Button>
    </div>
  );
});

QuestionActions.displayName = 'QuestionActions';
