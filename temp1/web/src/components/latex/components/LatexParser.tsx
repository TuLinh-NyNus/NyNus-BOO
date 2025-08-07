'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QuestionIdDetails, SubcountDetails, ExtractedAnswer, EditableAnswer, MapIDResult } from '@/lib/types/latex-parser';
import { extractFromLatex } from '@/lib/utils/latex-parser';
import logger from '@/lib/utils/logger';
import { ExtractedQuestion } from '@/types/question';
import { QuestionFormData } from '../../features/questions/components/question-form/question-form-tabs';

interface LatexParserProps {
  latexInput: string;
  isAnalyzing: boolean;
  onExtractionComplete: (result: ExtractedQuestion | null) => void;
  onError: (error: string | null) => void;
  onEditableDataChange: (data: {
    questionId: string | null;
    questionIdDetails: QuestionIdDetails | null;
    subcount: SubcountDetails | null;
    source: string | null;
    solution: string | null;
    answers: EditableAnswer[] | null;
  }) => void;
}

/**
 * Component chuyên xử lý parsing LaTeX và trích xuất thông tin
 * Tách từ LatexExtractor để tăng tính modular
 */
export function LatexParser({
  latexInput,
  isAnalyzing,
  onExtractionComplete,
  onError,
  onEditableDataChange
}: LatexParserProps) {
  // State cho kết quả trích xuất
  const [extractionResult, setExtractionResult] = useState<ExtractedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracted, setIsExtracted] = useState<boolean>(false);
  
  // State để lưu trữ dữ liệu có thể chỉnh sửa
  const [editableQuestionId, setEditableQuestionId] = useState<string | null>(null);
  const [editableQuestionIdDetails, setEditableQuestionIdDetails] = useState<QuestionIdDetails | null>(null);
  const [editableSubcount, setEditableSubcount] = useState<SubcountDetails | null>(null);
  const [editableSource, setEditableSource] = useState<string | null>(null);
  const [editableSolution, setEditableSolution] = useState<string | null>(null);
  const [editableanswers, setEditableanswers] = useState<EditableAnswer[] | null>(null);

  // State để lưu thông tin decoded MapID
  const [decodedMapID, setDecodedMapID] = useState<MapIDResult | null>(null);

  // Refs để tránh multiple processing
  const isProcessing = useRef<boolean>(false);

  /**
   * Hàm để decode QuestionID thành thông tin đầy đủ
   */
  const decodeQuestionID = useCallback(async (id: string) => {
    try {
      // Chuyển đổi ID5/ID6 thành MapID format
      // Ví dụ: 0H5V4 -> [0H5V4]
      // Tham số 1: Lớp (grade)
      // Tham số 2: Môn học (subject)
      // Tham số 3: Chương (chapter)
      // Tham số 4: Mức độ (difficulty/level)
      // Tham số 5: Bài (lesson)
      // Tham số 6: Dạng (type/questionType)
      const mapID = id.startsWith('[') ? id : `[${id}]`;

      // Gọi API để decode
      const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(mapID)}`);
      const data = await response.json();

      if (response.ok && data.success && data.result) {
        setDecodedMapID(data.result);
        logger.debug('Decoded MapID successfully:', data.result);
      } else {
        logger.warn('Failed to decode MapID:', data.message || 'Unknown error');
        setDecodedMapID(null);
      }
    } catch (error) {
      logger.error('Error decoding MapID:', error);
      setDecodedMapID(null);
    }
  }, []);

  /**
   * Xử lý khi thay đổi QuestionID
   */
  const handleQuestionIdChange = useCallback((newQuestionId: string) => {
    setEditableQuestionId(newQuestionId);
    // Khi người dùng thay đổi QuestionID, cố gắng decode
    if (newQuestionId) {
      decodeQuestionID(newQuestionId);
    }
  }, [decodeQuestionID]);

  /**
   * Xử lý khi thay đổi thông tin chi tiết của QuestionID
   */
  const handleQuestionIdDetailsChange = useCallback((field: keyof QuestionIdDetails, value: string) => {
    if (editableQuestionIdDetails) {
      const newDetails = {
        ...editableQuestionIdDetails,
        [field]: value
      };
      setEditableQuestionIdDetails(newDetails);
    }
  }, [editableQuestionIdDetails]);

  /**
   * Xử lý khi thay đổi Subcount
   */
  const handleSubcountChange = useCallback((field: keyof SubcountDetails, value: string) => {
    if (editableSubcount) {
      const newSubcount = { ...editableSubcount, [field]: value };

      // Tự động cập nhật fullId khi prefix hoặc number thay đổi
      if (field === 'prefix' || field === 'number') {
        newSubcount.fullId = `${newSubcount.prefix || ''}.${newSubcount.number || ''}`;
      }

      setEditableSubcount(newSubcount);
    }
  }, [editableSubcount]);

  /**
   * Xử lý khi thay đổi source
   */
  const handleSourceChange = useCallback((newSource: string) => {
    setEditableSource(newSource);
  }, []);

  /**
   * Xử lý khi thay đổi solution
   */
  const handleSolutionChange = useCallback((newSolution: string) => {
    setEditableSolution(newSolution);
  }, []);

  /**
   * Xử lý khi thay đổi answers
   */
  const handleanswersChange = useCallback((newanswers: EditableAnswer[]) => {
    setEditableanswers(newanswers);
  }, []);

  /**
   * Phân tích LaTeX và trích xuất thông tin
   */
  const performLatexExtraction = useCallback(async (content: string) => {
    if (isProcessing.current) return;
    
    isProcessing.current = true;
    setError(null);

    try {
      // Thử phân tích LaTeX
      const result = extractFromLatex(content);
      
      if (result) {
        setExtractionResult(result);

        // Cập nhật state có thể chỉnh sửa với giá trị từ trích xuất
        setEditableQuestionId(result.questionId);
        setEditableQuestionIdDetails(result.questionIdDetails);
        setEditableSubcount(result.subcount);
        setEditableSource(result.source);
        setEditableSolution(result.solution);
        setEditableanswers(result.answers);

        // Đánh dấu đã trích xuất
        setIsExtracted(true);

        // Nếu có questionId, thử decode nó
        if (result.questionId) {
          await decodeQuestionID(result.questionId);
        }

        // Notify parent component
        onExtractionComplete(result);
      } else {
        throw new Error('Không thể trích xuất thông tin từ nội dung LaTeX');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi phân tích LaTeX';
      
      // Chỉ hiển thị lỗi nếu là lỗi nghiêm trọng, không phải lỗi định dạng
      if (!errorMessage.includes('không hợp lệ') && !errorMessage.includes('thiếu dấu ngoặc')) {
        setError(errorMessage);
        onError(errorMessage);
      }
      
      // Không reset extraction result nếu đã có kết quả trước đó
      if (!extractionResult) {
        setExtractionResult(null);
        setIsExtracted(false);
        onExtractionComplete(null);
      }
    } finally {
      // Đánh dấu đã xử lý xong
      setTimeout(() => {
        isProcessing.current = false;
      }, 100);
    }
  }, [extractionResult, onExtractionComplete, onError, decodeQuestionID]);

  /**
   * Validate LaTeX content trước khi parsing
   */
  const validateLatexContent = useCallback((content: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      errors.push('Nội dung LaTeX không được để trống');
      return { isValid: false, errors };
    }

    // Kiểm tra cấu trúc cơ bản
    if (!content.includes('\\begin{ex}') || !content.includes('\\end{ex}')) {
      errors.push('Nội dung LaTeX phải chứa môi trường \\begin{ex}...\\end{ex}');
    }

    // Kiểm tra cân bằng dấu ngoặc
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Dấu ngoặc nhọn không cân bằng trong nội dung LaTeX');
    }

    // Kiểm tra cân bằng dấu ngoặc vuông
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push('Dấu ngoặc vuông không cân bằng trong nội dung LaTeX');
    }

    return { isValid: errors.length === 0, errors };
  }, []);

  /**
   * Reset parser state
   */
  const resetParserState = useCallback(() => {
    setExtractionResult(null);
    setError(null);
    setIsExtracted(false);
    setEditableQuestionId(null);
    setEditableQuestionIdDetails(null);
    setEditableSubcount(null);
    setEditableSource(null);
    setEditableSolution(null);
    setEditableanswers(null);
    setDecodedMapID(null);
    isProcessing.current = false;
  }, []);

  /**
   * Get current editable data
   */
  const getCurrentEditableData = useCallback(() => {
    return {
      questionId: editableQuestionId,
      questionIdDetails: editableQuestionIdDetails,
      subcount: editableSubcount,
      source: editableSource,
      solution: editableSolution,
      answers: editableanswers
    };
  }, [editableQuestionId, editableQuestionIdDetails, editableSubcount, editableSource, editableSolution, editableanswers]);

  // Phân tích LaTeX khi có dữ liệu mới
  useEffect(() => {
    // Chỉ phân tích khi có dữ liệu và không đang trong quá trình phân tích
    if (latexInput && !isAnalyzing && !isProcessing.current) {
      // Validate trước khi parse
      const validation = validateLatexContent(latexInput);
      
      if (validation.isValid) {
        performLatexExtraction(latexInput);
      } else {
        setError(validation.errors.join('; '));
        onError(validation.errors.join('; '));
      }
    }
  }, [latexInput, isAnalyzing, validateLatexContent, performLatexExtraction, onError]);

  // Reset state khi latexInput thay đổi hoàn toàn
  useEffect(() => {
    // Chỉ reset khi latexInput thay đổi hoàn toàn (ví dụ: khi chọn mẫu mới)
    if (!latexInput) {
      resetParserState();
    }
  }, [latexInput, resetParserState]);

  // Notify parent về editable data changes
  useEffect(() => {
    onEditableDataChange(getCurrentEditableData());
  }, [getCurrentEditableData, onEditableDataChange]);

  /**
   * Chuyển đổi loại câu hỏi từ định dạng nội bộ sang định dạng UI
   */
  const mapQuestionType = useCallback((type: string): string => {
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

  /**
   * Validate form data được tạo từ extraction
   */
  const validateFormData = useCallback((data: QuestionFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Kiểm tra các trường bắt buộc
    if (!data.content) errors.push("Nội dung câu hỏi không được để trống");
    if (!data.form) errors.push("Loại câu hỏi không được để trống");

    // Kiểm tra đáp án cho các loại câu hỏi cần đáp án
    if (['MC', 'TF', 'SA'].includes(data.form) && (!data.answers || data.answers.length === 0)) {
      errors.push("Câu hỏi này cần có ít nhất một đáp án");
    }

    // Kiểm tra đáp án đúng cho trắc nghiệm
    if (data.form === 'MC' && (!data.correctAnswer || data.correctAnswer.length === 0)) {
      errors.push("Câu hỏi trắc nghiệm cần có đáp án đúng");
    }

    return { isValid: errors.length === 0, errors };
  }, []);

  /**
   * Process answers để xử lý các trường hợp đặc biệt như phân số bị cắt
   */
  const processanswers = useCallback((answers: ExtractedAnswer[]): ExtractedAnswer[] => {
    const processedanswers: ExtractedAnswer[] = [...answers];
    const answersToRemove: string[] = [];

    // Xử lý phân số bị cắt
    for (let i = 0; i < processedanswers.length; i++) {
      const answer = processedanswers[i];
      let content = answer.content || `Đáp án ${answer.id}`;

      // Kiểm tra nếu nội dung là phân số bị cắt (ví dụ: "$\\dfrac{2")
      if (content.includes('\\dfrac{') && !content.includes('}{')) {
        // Tìm vị trí của phân số trong nội dung
        const fractionPos = content.indexOf('\\dfrac{');
        // Tìm vị trí của dấu { sau \dfrac
        const openBracePos = fractionPos + 7; // 7 là độ dài của '\dfrac{'

        // Lấy phần tử số (numerator)
        const numerator = content.substring(openBracePos);

        // Tìm số tiếp theo trong mảng đáp án
        if (i + 1 < processedanswers.length) {
          const nextAnswer = processedanswers[i + 1];

          // Tách phần trước và sau phân số
          const beforeFraction = content.substring(0, fractionPos);
          // Tạo phân số hoàn chỉnh
          content = beforeFraction + '\\dfrac{' + numerator + '}{' + nextAnswer.content + '}$';

          // Cập nhật nội dung đáp án hiện tại
          processedanswers[i] = {
            ...answer,
            content: content
          };

          // Đánh dấu đáp án tiếp theo để xóa (vì đã được sử dụng làm mẫu số)
          answersToRemove.push(nextAnswer.id);
        }
      }
    }

    // Lọc bỏ các đáp án đã được sử dụng làm mẫu số
    return processedanswers.filter(answer => !answersToRemove.includes(answer.id));
  }, []);

  /**
   * Get parsing statistics
   */
  const getParsingStats = useCallback(() => {
    if (!extractionResult) {
      return {
        hasContent: false,
        hasQuestionId: false,
        hasanswers: false,
        answerCount: 0,
        hascorrectanswers: false,
        correctAnswerCount: 0
      };
    }

    const correctanswers = extractionResult.answers?.filter(a => a.isCorrect) || [];

    return {
      hasContent: !!extractionResult.content,
      hasQuestionId: !!extractionResult.questionId,
      hasanswers: !!extractionResult.answers && extractionResult.answers.length > 0,
      answerCount: extractionResult.answers?.length || 0,
      hascorrectanswers: correctanswers.length > 0,
      correctAnswerCount: correctanswers.length
    };
  }, [extractionResult]);

  // Return parser utilities và state cho parent components
  return {
    // State
    extractionResult,
    error,
    isExtracted,
    decodedMapID,

    // Editable data
    editableQuestionId,
    editableQuestionIdDetails,
    editableSubcount,
    editableSource,
    editableSolution,
    editableanswers,

    // Handlers
    handleQuestionIdChange,
    handleQuestionIdDetailsChange,
    handleSubcountChange,
    handleSourceChange,
    handleSolutionChange,
    handleanswersChange,

    // Utilities
    decodeQuestionID,
    validateLatexContent,
    resetParserState,
    performLatexExtraction,
    mapQuestionType,
    validateFormData,
    processanswers,
    getParsingStats
  };
}
