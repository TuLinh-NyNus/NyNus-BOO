'use client';

import { Save, Search, FileText, Code, Map } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';

import { 
  QuestionErrorBoundary, 
  QuestionErrorType, 
  QuestionErrorFallbackProps,
  QuestionErrorBoundaryProps 
} from './question-error-boundary';

/**
 * Question Form Error Boundary
 * Specialized for form submission and validation errors
 */
export function QuestionFormErrorBoundary({ 
  children, 
  onRetry,
  ...props 
}: Omit<QuestionErrorBoundaryProps, 'context'> & {
  onRetry?: () => void;
}) {
  return (
    <QuestionErrorBoundary
      context={{
        type: QuestionErrorType.FORM_SUBMISSION,
        operation: 'question_form'
      }}
      fallback={QuestionFormErrorFallback}
      onRetry={onRetry}
      enableRetry={true}
      enableReporting={true}
      {...props}
    >
      {children}
    </QuestionErrorBoundary>
  );
}

/**
 * Custom fallback for form errors
 */
function QuestionFormErrorFallback({
  error,
  resetError,
  onRetry
}: QuestionErrorFallbackProps) {
  const handleSaveDraft = () => {
    try {
      // Save current form data to localStorage
      const formData = sessionStorage.getItem('current_question_form');
      if (formData) {
        localStorage.setItem('question_draft_' + Date.now(), formData);
      }
    } catch (e) {
      console.warn('Could not save draft:', e);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      resetError();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[300px] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Save className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Lỗi lưu câu hỏi
          </CardTitle>
          <CardDescription className="text-gray-600">
            Không thể lưu câu hỏi vào hệ thống. Dữ liệu của bạn vẫn được giữ an toàn.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Save className="h-4 w-4" />
            <AlertDescription>
              Chúng tôi đã tự động lưu bản nháp câu hỏi của bạn. Bạn có thể thử lại hoặc quay lại sau.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              Thử lưu lại
            </Button>

            <Button 
              onClick={handleSaveDraft}
              variant="outline"
              className="w-full"
            >
              Lưu bản nháp
            </Button>

            <Button 
              onClick={resetError}
              variant="ghost"
              className="w-full"
            >
              Tiếp tục chỉnh sửa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Question Search Error Boundary
 * Specialized for search and data loading errors
 */
export function QuestionSearchErrorBoundary({ 
  children, 
  onRetry,
  ...props 
}: Omit<QuestionErrorBoundaryProps, 'context'> & {
  onRetry?: () => void;
}) {
  return (
    <QuestionErrorBoundary
      context={{
        type: QuestionErrorType.SEARCH,
        operation: 'question_search'
      }}
      fallback={QuestionSearchErrorFallback}
      onRetry={onRetry}
      enableRetry={true}
      {...props}
    >
      {children}
    </QuestionErrorBoundary>
  );
}

/**
 * Custom fallback for search errors
 */
function QuestionSearchErrorFallback({
  error,
  resetError,
  onRetry
}: QuestionErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      resetError();
    }
  };

  const handleClearSearch = () => {
    // Clear search filters and reset
    sessionStorage.removeItem('question_search_filters');
    resetError();
  };

  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Search className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Lỗi tìm kiếm
          </CardTitle>
          <CardDescription className="text-gray-600">
            Không thể tìm kiếm câu hỏi. Vui lòng thử lại.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry}
              className="w-full"
              size="sm"
            >
              Thử lại
            </Button>

            <Button 
              onClick={handleClearSearch}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Xóa bộ lọc và thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Question Display Error Boundary
 * Specialized for data loading and display errors
 */
export function QuestionDisplayErrorBoundary({ 
  children, 
  questionId,
  onRetry,
  ...props 
}: Omit<QuestionErrorBoundaryProps, 'context'> & {
  questionId?: string;
  onRetry?: () => void;
}) {
  return (
    <QuestionErrorBoundary
      context={{
        type: QuestionErrorType.DATA_LOADING,
        operation: 'question_display',
        questionId
      }}
      fallback={QuestionDisplayErrorFallback}
      onRetry={onRetry}
      enableRetry={true}
      {...props}
    >
      {children}
    </QuestionErrorBoundary>
  );
}

/**
 * Custom fallback for display errors
 */
function QuestionDisplayErrorFallback({
  error,
  resetError,
  onRetry,
  context
}: QuestionErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      resetError();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[150px] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-2">
            <FileText className="h-6 w-6 text-red-500" />
          </div>
          <CardTitle className="text-base font-semibold text-gray-900">
            Không thể hiển thị câu hỏi
          </CardTitle>
          {context?.questionId && (
            <CardDescription className="text-sm text-gray-600">
              ID: {context.questionId}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <Button 
            onClick={handleRetry}
            className="w-full"
            size="sm"
          >
            Tải lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * LaTeX Processing Error Boundary
 * Specialized for LaTeX parsing and rendering errors
 */
export function LaTeXErrorBoundary({ 
  children, 
  onRetry,
  ...props 
}: Omit<QuestionErrorBoundaryProps, 'context'> & {
  onRetry?: () => void;
}) {
  return (
    <QuestionErrorBoundary
      context={{
        type: QuestionErrorType.LATEX_PROCESSING,
        operation: 'latex_processing'
      }}
      fallback={LaTeXErrorFallback}
      onRetry={onRetry}
      enableRetry={true}
      {...props}
    >
      {children}
    </QuestionErrorBoundary>
  );
}

/**
 * Custom fallback for LaTeX errors
 */
function LaTeXErrorFallback({
  error,
  resetError,
  onRetry
}: QuestionErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      resetError();
    }
  };

  const handleShowRaw = () => {
    // Switch to raw text mode
    sessionStorage.setItem('latex_fallback_mode', 'raw');
    resetError();
  };

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Code className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 mb-1">
            Lỗi xử lý LaTeX
          </h4>
          <p className="text-sm text-red-700 mb-3">
            Không thể hiển thị nội dung LaTeX. Có thể do cú pháp không đúng.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleRetry}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Thử lại
            </Button>
            <Button 
              onClick={handleShowRaw}
              size="sm"
              variant="ghost"
              className="text-red-700 hover:bg-red-100"
            >
              Hiển thị văn bản gốc
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MapID Processing Error Boundary
 * Specialized for MapID decoding and processing errors
 */
export function MapIDErrorBoundary({ 
  children, 
  mapId,
  onRetry,
  ...props 
}: Omit<QuestionErrorBoundaryProps, 'context'> & {
  mapId?: string;
  onRetry?: () => void;
}) {
  return (
    <QuestionErrorBoundary
      context={{
        type: QuestionErrorType.MAPID_DECODING,
        operation: 'mapid_processing',
        metadata: { mapId }
      }}
      fallback={MapIDErrorFallback}
      onRetry={onRetry}
      enableRetry={true}
      {...props}
    >
      {children}
    </QuestionErrorBoundary>
  );
}

/**
 * Custom fallback for MapID errors
 */
function MapIDErrorFallback({
  error,
  resetError,
  onRetry,
  context
}: QuestionErrorFallbackProps) {
  const mapId = context?.metadata?.mapId;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      resetError();
    }
  };

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Map className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-orange-800 mb-1">
            Lỗi giải mã MapID
          </h4>
          <p className="text-sm text-orange-700 mb-2">
            Không thể giải mã MapID{mapId ? `: ${mapId}` : ''}. Định dạng có thể không đúng.
          </p>
          <Button 
            onClick={handleRetry}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            Thử lại
          </Button>
        </div>
      </div>
    </div>
  );
}
