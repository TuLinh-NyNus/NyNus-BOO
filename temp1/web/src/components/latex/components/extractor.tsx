'use client';

import { useState, useCallback } from 'react';
import { QuestionIdDetails, SubcountDetails, EditableAnswer, MapIDResult } from '@/lib/types/latex-parser';
import { ExtractedQuestion } from '@/types/question';
import { QuestionFormData } from '../../features/questions/components/question-form/question-form-tabs';
import { LaTeXErrorBoundary } from '../../features/questions/error-boundaries';

// Import new decomposed components
import { LatexParser } from './LatexParser';
import { LatexPreview } from './LatexPreview';
import { LatexControls } from './LatexControls';

interface ExtractorProps {
  latexInput: string;
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  isAnalyzing: boolean;
  saveQuestionToDatabase: () => Promise<unknown>;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  saveMessage: string;
}

export function LatexExtractorComponent({
  latexInput,
  formData,
  setFormData,
  isAnalyzing,
  saveQuestionToDatabase,
  isSaving,
  saveStatus,
  saveMessage
}: ExtractorProps) {
  // State for extraction results
  const [extractionResult, setExtractionResult] = useState<ExtractedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for editable data from parser
  const [editableData, setEditableData] = useState<{
    questionId: string | null;
    questionIdDetails: QuestionIdDetails | null;
    subcount: SubcountDetails | null;
    source: string | null;
    solution: string | null;
    answers: EditableAnswer[] | null;
  }>({
    questionId: null,
    questionIdDetails: null,
    subcount: null,
    source: null,
    solution: null,
    answers: null
  });

  // Handlers for parser component
  const handleExtractionComplete = useCallback((result: ExtractedQuestion | null) => {
    setExtractionResult(result);
  }, []);

  const handleError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  const handleEditableDataChange = useCallback((data: {
    questionId: string | null;
    questionIdDetails: QuestionIdDetails | null;
    subcount: SubcountDetails | null;
    source: string | null;
    solution: string | null;
    answers: EditableAnswer[] | null;
  }) => {
    setEditableData(data);
  }, []);

  // Utility functions for controls
  const mapQuestionTypeUtil = useCallback((type: string): string => {
    const typeMap: {[key: string]: string} = {
      'multiple-choice': 'MC',
      'true-false': 'TF',
      'short-answer': 'SA',
      'essay': 'ES',
      'matching': 'MT',
      'ordering': 'OR',
      'fill-in-blank': 'FB'
    };
    return typeMap[type] || 'MC';
  }, []);

  const processanswersUtil = useCallback((answers: EditableAnswer[]): EditableAnswer[] => {
    // Simplified processing - detailed logic is in LatexParser
    return answers.filter(answer => answer && answer.id);
  }, []);

  const validateFormDataUtil = useCallback((data: QuestionFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.content) errors.push("Nội dung câu hỏi không được để trống");
    if (!data.type) errors.push("Loại câu hỏi không được để trống");

    // Check answers for question types that need them
    if (['multiple-choice', 'true-false', 'short-answer'].includes(data.type) && 
        (!data.answers || data.answers.length === 0)) {
      errors.push("Câu hỏi này cần có ít nhất một đáp án");
    }

    return { isValid: errors.length === 0, errors };
  }, []);

  // Get parser instance with hooks
  const parserHooks = LatexParser({
    latexInput,
    isAnalyzing,
    onExtractionComplete: handleExtractionComplete,
    onError: handleError,
    onEditableDataChange: handleEditableDataChange
  });

  return (
    <div className="h-full flex flex-col LatexExtractor">
      {/* Preview Component */}
      <LatexPreview
        extractionResult={extractionResult}
        error={error}
        decodedMapID={parserHooks.decodedMapID}
        editableQuestionId={editableData.questionId}
        editableQuestionIdDetails={editableData.questionIdDetails}
        editableSubcount={editableData.subcount}
        editableSource={editableData.source}
        editableSolution={editableData.solution}
        editableanswers={editableData.answers}
        onQuestionIdChange={parserHooks.handleQuestionIdChange}
        onQuestionIdDetailsChange={parserHooks.handleQuestionIdDetailsChange}
        onSubcountChange={parserHooks.handleSubcountChange}
        onSourceChange={parserHooks.handleSourceChange}
        onSolutionChange={parserHooks.handleSolutionChange}
        onanswersChange={parserHooks.handleanswersChange}
      />

      {/* Controls Component */}
      <LatexControls
        extractionResult={extractionResult}
        formData={formData}
        setFormData={setFormData}
        editableQuestionId={editableData.questionId}
        editableQuestionIdDetails={editableData.questionIdDetails}
        editableSubcount={editableData.subcount}
        editableSource={editableData.source}
        editableSolution={editableData.solution}
        editableanswers={editableData.answers}
        saveQuestionToDatabase={saveQuestionToDatabase}
        isSaving={isSaving}
        saveStatus={saveStatus}
        saveMessage={saveMessage}
        mapQuestionType={mapQuestionTypeUtil}
        processanswers={processanswersUtil}
        validateFormData={validateFormDataUtil}
      />
    </div>
  );
}

// Wrap component with error boundary
function LatexExtractor(props: ExtractorProps) {
  return (
    <LaTeXErrorBoundary>
      <LatexExtractorComponent {...props} />
    </LaTeXErrorBoundary>
  );
}

// Export default for backward compatibility
export default LatexExtractor;
