'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui';
import { QuestionIdDetails, SubcountDetails, EditableAnswer } from '@/lib/types/latex-parser';
import { ExtractedQuestion } from '@/types/question';
import { QuestionFormData } from '../../features/questions/components/question-form/question-form-tabs';
import logger from '@/lib/utils/logger';

interface LatexControlsProps {
  extractionResult: ExtractedQuestion | null;
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  editableQuestionId: string | null;
  editableQuestionIdDetails: QuestionIdDetails | null;
  editableSubcount: SubcountDetails | null;
  editableSource: string | null;
  editableSolution: string | null;
  editableanswers: EditableAnswer[] | null;
  saveQuestionToDatabase: () => Promise<unknown>;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  saveMessage: string;
  mapQuestionType: (type: string) => string;
  processanswers: (answers: EditableAnswer[]) => EditableAnswer[];
  validateFormData: (data: QuestionFormData) => { isValid: boolean; errors: string[] };
}

/**
 * Component chuyên xử lý controls và actions cho LaTeX extraction
 * Tách từ LatexExtractor để tăng tính modular
 */
export function LatexControls({
  extractionResult,
  formData,
  setFormData,
  editableQuestionId,
  editableQuestionIdDetails,
  editableSubcount,
  editableSource,
  editableSolution,
  editableanswers,
  saveQuestionToDatabase,
  isSaving,
  saveStatus,
  saveMessage,
  mapQuestionType,
  processanswers,
  validateFormData
}: LatexControlsProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [applyMessage, setApplyMessage] = useState('');

  /**
   * Áp dụng tất cả các trường trích xuất vào form (simplified)
   */
  const applyAllFields = useCallback(async () => {
    if (!extractionResult || isApplying) return;

    setIsApplying(true);
    setApplyStatus('idle');
    setApplyMessage('');

    try {
      // Tạo một bản sao hoàn toàn mới của formData
      const newFormData = JSON.parse(JSON.stringify(formData));

      // Apply basic fields
      newFormData.form = mapQuestionType(extractionResult.type);
      newFormData.content = extractionResult.content;

      // Apply QuestionID
      if (editableQuestionId) {
        newFormData.questionID = newFormData.questionID || {};
        newFormData.questionID.questionId = editableQuestionId;
      }

      // Apply other fields
      if (editableSource) newFormData.source = editableSource;
      if (editableSolution) newFormData.solution = editableSolution;

      // Apply answers (simplified)
      if (editableanswers && editableanswers.length > 0) {
        const processedanswers = processanswers(editableanswers);
        newFormData.answers = processedanswers.map((answer: EditableAnswer) => ({
          id: answer.id || uuidv4(),
          content: answer.content || `Đáp án ${answer.id}`,
          isCorrect: answer.isCorrect || false
        }));
      }

      // Validate and apply
      const validation = validateFormData(newFormData);
      if (!validation.isValid) {
        throw new Error(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`);
      }

      setFormData(prevData => ({ ...prevData, ...newFormData }));
      setApplyStatus('success');
      setApplyMessage('Đã áp dụng thành công tất cả thông tin vào form!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setApplyStatus('error');
      setApplyMessage(`Lỗi khi áp dụng: ${errorMessage}`);
    } finally {
      setIsApplying(false);
      setTimeout(() => {
        setApplyStatus('idle');
        setApplyMessage('');
      }, 3000);
    }
  }, [
    extractionResult,
    formData,
    setFormData,
    editableQuestionId,
    editableSource,
    editableSolution,
    editableanswers,
    isApplying,
    mapQuestionType,
    processanswers,
    validateFormData
  ]);

  // Simplified individual field application (removed for brevity)

  /**
   * Reset tất cả dữ liệu đã chỉnh sửa về trạng thái ban đầu
   */
  const resetToOriginal = useCallback(() => {
    if (!extractionResult) return;

    // Reset về dữ liệu gốc từ extraction result
    // This would need to be implemented by parent component
    logger.debug('Reset to original extraction result');
  }, [extractionResult]);

  // Không hiển thị gì nếu không có extraction result
  if (!extractionResult) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2 LatexControls">
      {/* Main action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={applyAllFields}
          className="flex-1"
          variant="default"
          disabled={isApplying || isSaving}
        >
          {isApplying ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Đang áp dụng...
            </>
          ) : (
            'Áp dụng thông tin vào form'
          )}
        </Button>

        <Button
          onClick={saveQuestionToDatabase}
          className="flex-1"
          variant="outline"
          disabled={isSaving || isApplying}
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Đang lưu...
            </>
          ) : (
            'Lưu câu hỏi'
          )}
        </Button>
      </div>

      {/* Status feedback for apply action */}
      {applyStatus !== 'idle' && applyMessage && (
        <div className={`mt-2 p-2 rounded-lg text-sm ${
          applyStatus === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
          'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {applyMessage}
        </div>
      )}

      {/* Status feedback for save action */}
      {saveStatus !== 'idle' && saveMessage && (
        <div className={`mt-2 p-2 rounded-lg text-sm ${
          saveStatus === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
          'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Individual field controls removed for simplicity */}
    </div>
  );
}
