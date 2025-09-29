/**
 * Printable Question Component
 * Print-optimized layout cho questions với proper formatting
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { QuestionLaTeXDisplay, SolutionLaTeXDisplay } from '@/components/ui/latex';
import { AnswerOptionsDisplay } from '../answers';
import { Question, QuestionType, QuestionDifficulty } from '@/types/question';

/**
 * Props cho Printable Question
 */
interface PrintableQuestionProps {
  /** Question data */
  question: Question;
  /** Show solution */
  showSolution?: boolean;
  /** Show answers */
  showAnswers?: boolean;
  /** Show metadata */
  showMetadata?: boolean;
  /** Question number */
  questionNumber?: number;
  /** Header info */
  headerInfo?: {
    examTitle?: string;
    examDate?: string;
    studentName?: string;
    className?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Printable Question Component
 * Optimized layout cho print media với proper page breaks
 */
export function PrintableQuestion({
  question,
  showSolution = false,
  showAnswers = true,
  showMetadata = true,
  questionNumber,
  headerInfo,
  className = ''
}: PrintableQuestionProps) {
  /**
   * Get question type label
   */
  const getTypeLabel = (type: QuestionType) => {
    const labels = {
      [QuestionType.MC]: 'Trắc nghiệm',
      [QuestionType.MULTIPLE_CHOICE]: 'Trắc nghiệm',
      [QuestionType.TF]: 'Đúng/Sai',
      [QuestionType.SA]: 'Trả lời ngắn',
      [QuestionType.ES]: 'Tự luận',
      [QuestionType.MA]: 'Ghép đôi'
    };
    return labels[type] || type;
  };

  /**
   * Get difficulty label
   */
  const getDifficultyLabel = (difficulty?: QuestionDifficulty) => {
    if (!difficulty) return 'Chưa xác định';
    
    const labels = {
      [QuestionDifficulty.EASY]: 'Dễ',
      [QuestionDifficulty.MEDIUM]: 'Trung bình',
      [QuestionDifficulty.HARD]: 'Khó',
      [QuestionDifficulty.EXPERT]: 'Chuyên gia'
    };
    return labels[difficulty] || difficulty;
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`printable-question ${className}`}>
      {/* Print-only header */}
      {headerInfo && (
        <div className="print-header print:block hidden mb-6 pb-4 border-b-2 border-gray-300">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold uppercase">
              {headerInfo.examTitle || 'Đề thi'}
            </h1>
            {headerInfo.examDate && (
              <p className="text-sm mt-1">Ngày thi: {headerInfo.examDate}</p>
            )}
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              {headerInfo.studentName && (
                <p>Họ tên: {headerInfo.studentName}</p>
              )}
              {headerInfo.className && (
                <p>Lớp: {headerInfo.className}</p>
              )}
            </div>
            <div className="text-right">
              <p>Mã câu hỏi: {question.questionCodeId}</p>
              <p>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Question header */}
      <div className="question-header mb-4">
        <div className="flex items-center gap-3 mb-2">
          {questionNumber && (
            <div className="question-number">
              <span className="text-lg font-bold">Câu {questionNumber}:</span>
            </div>
          )}
          
          <div className="question-meta flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {getTypeLabel(question.type)}
            </span>
            
            {question.difficulty && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {getDifficultyLabel(question.difficulty)}
              </span>
            )}
            
            {question.points && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {question.points} điểm
              </span>
            )}
          </div>
        </div>

        {/* Question code info */}
        <div className="text-xs text-gray-500 mb-3">
          Mã: {question.questionCodeId}
          {showMetadata && question.creator && (
            <span className="ml-4">Tác giả: {question.creator}</span>
          )}
          {showMetadata && (
            <span className="ml-4">Cập nhật: {formatDate(question.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* Question content */}
      <div className="question-content mb-6">
        <QuestionLaTeXDisplay
          content={question.content}
          questionType={question.type}
          previewMode={false}
          className="print-content"
        />
      </div>

      {/* Answer options */}
      {showAnswers && (
        <div className="answer-options mb-6">
          <AnswerOptionsDisplay
            question={question}
            showCorrect={false}
            interactive={false}
            className="print-answers"
          />
        </div>
      )}

      {/* Answer space for written responses */}
      {(question.type === QuestionType.SA || question.type === QuestionType.ES) && (
        <div className="answer-space mb-6">
          <div className="border border-gray-300 rounded p-4 min-h-[100px]">
            <p className="text-sm text-gray-500 mb-2">Trả lời:</p>
            <div className="space-y-3">
              {Array.from({ length: question.type === QuestionType.ES ? 8 : 3 }).map((_, index) => (
                <div key={index} className="border-b border-gray-200 h-6"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Solution (if requested) */}
      {showSolution && question.solution && (
        <div className="solution-section print:break-before-page">
          <SolutionLaTeXDisplay
            solution={question.solution}
            explanation={question.explanation}
            defaultVisible={true}
            collapsible={false}
            title="Lời giải chi tiết"
            showSteps={true}
            className="print-solution"
          />
        </div>
      )}

      {/* Tags (if any) */}
      {showMetadata && question.tag && question.tag.length > 0 && (
        <div className="question-tags mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Từ khóa: </span>
            {question.tag.join(', ')}
          </div>
        </div>
      )}

      {/* Print footer */}
      <div className="print-footer print:block hidden mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>NyNus Question Bank System</span>
          <span>Trang: [Tự động]</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Print Preview Component
 * Wrapper cho print preview functionality
 */
export function PrintPreview({
  questions,
  options = {}
}: {
  questions: Question[];
  options?: {
    showSolution?: boolean;
    showAnswers?: boolean;
    showMetadata?: boolean;
    headerInfo?: {
      examTitle?: string;
      examDate?: string;
      studentName?: string;
      className?: string;
    };
  };
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-preview">
      {/* Print controls (screen only) */}
      <div className="print:hidden mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Xem trước bản in</h3>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            In ngay
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Sử dụng Ctrl+P hoặc Cmd+P để in trực tiếp
        </p>
      </div>

      {/* Questions */}
      <div className="print-content space-y-8">
        {questions.map((question, index) => (
          <PrintableQuestion
            key={question.id}
            question={question}
            questionNumber={index + 1}
            showSolution={options.showSolution}
            showAnswers={options.showAnswers}
            showMetadata={options.showMetadata}
            headerInfo={index === 0 ? options.headerInfo : undefined}
            className={index > 0 ? 'print:break-before-page' : ''}
          />
        ))}
      </div>
    </div>
  );
}
