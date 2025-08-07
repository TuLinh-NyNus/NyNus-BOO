'use client';

import { AlertTriangle, RefreshCw, Home, FileText, Search, Edit } from 'lucide-react';
import React, { Component, ReactNode } from 'react';

import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import logger from '@/lib/utils/logger';

/**
 * Question operation types for error context
 */
export enum QuestionErrorType {
  FORM_SUBMISSION = 'form_submission',
  DATA_LOADING = 'data_loading',
  SEARCH = 'search',
  LATEX_PROCESSING = 'latex_processing',
  MAPID_DECODING = 'mapid_decoding',
  FILE_UPLOAD = 'file_upload',
  VALIDATION = 'validation',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

/**
 * Error context for question operations
 */
export interface QuestionErrorContext {
  type: QuestionErrorType;
  operation?: string;
  questionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Props for error fallback components
 */
export interface QuestionErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  context?: QuestionErrorContext;
  resetError: () => void;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  onReportError?: (error: Error, context?: QuestionErrorContext) => void;
}

/**
 * Props for QuestionErrorBoundary
 */
export interface QuestionErrorBoundaryProps {
  children: ReactNode;
  context?: QuestionErrorContext;
  fallback?: React.ComponentType<QuestionErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, context?: QuestionErrorContext) => void;
  onRetry?: () => void;
  enableRetry?: boolean;
  enableReporting?: boolean;
}

/**
 * State for QuestionErrorBoundary
 */
interface QuestionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

/**
 * Get Vietnamese error message based on error type and context
 */
function getVietnameseErrorMessage(error: Error, context?: QuestionErrorContext): {
  title: string;
  description: string;
  suggestion: string;
} {
  const errorType = context?.type || QuestionErrorType.UNKNOWN;
  const errorMessage = error.message.toLowerCase();

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      title: 'Lỗi kết nối mạng',
      description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.',
      suggestion: 'Thử lại sau vài giây hoặc kiểm tra kết nối mạng.'
    };
  }

  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
    return {
      title: 'Lỗi xác thực',
      description: 'Phiên đăng nhập đã hết hạn. Bạn cần đăng nhập lại để tiếp tục.',
      suggestion: 'Đăng nhập lại để tiếp tục sử dụng hệ thống.'
    };
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      title: 'Lỗi dữ liệu không hợp lệ',
      description: 'Dữ liệu bạn nhập không đúng định dạng yêu cầu.',
      suggestion: 'Vui lòng kiểm tra lại thông tin và thử lại.'
    };
  }

  // Context-specific errors
  switch (errorType) {
    case QuestionErrorType.FORM_SUBMISSION:
      return {
        title: 'Lỗi lưu câu hỏi',
        description: 'Không thể lưu câu hỏi vào hệ thống. Dữ liệu của bạn đã được tự động lưu tạm thời.',
        suggestion: 'Thử lại hoặc liên hệ quản trị viên nếu lỗi tiếp tục xảy ra.'
      };

    case QuestionErrorType.DATA_LOADING:
      return {
        title: 'Lỗi tải dữ liệu',
        description: 'Không thể tải danh sách câu hỏi từ hệ thống.',
        suggestion: 'Thử tải lại trang hoặc kiểm tra kết nối mạng.'
      };

    case QuestionErrorType.SEARCH:
      return {
        title: 'Lỗi tìm kiếm',
        description: 'Không thể thực hiện tìm kiếm câu hỏi.',
        suggestion: 'Thử lại với từ khóa khác hoặc làm mới trang.'
      };

    case QuestionErrorType.LATEX_PROCESSING:
      return {
        title: 'Lỗi xử lý LaTeX',
        description: 'Không thể xử lý nội dung LaTeX. Có thể do cú pháp không đúng.',
        suggestion: 'Kiểm tra lại cú pháp LaTeX và thử lại.'
      };

    case QuestionErrorType.MAPID_DECODING:
      return {
        title: 'Lỗi giải mã MapID',
        description: 'Không thể giải mã MapID. Định dạng có thể không đúng.',
        suggestion: 'Kiểm tra lại định dạng MapID và thử lại.'
      };

    case QuestionErrorType.FILE_UPLOAD:
      return {
        title: 'Lỗi tải file',
        description: 'Không thể tải file lên hệ thống. File có thể quá lớn hoặc không đúng định dạng.',
        suggestion: 'Kiểm tra kích thước và định dạng file, sau đó thử lại.'
      };

    default:
      return {
        title: 'Đã xảy ra lỗi',
        description: 'Hệ thống gặp sự cố không mong muốn. Chúng tôi đã ghi nhận lỗi này.',
        suggestion: 'Thử lại sau vài phút hoặc liên hệ hỗ trợ kỹ thuật.'
      };
  }
}

/**
 * Default error fallback component for question operations
 */
function QuestionErrorFallback({
  error,
  errorInfo,
  context,
  resetError,
  onRetry,
  onNavigateHome,
  onReportError
}: QuestionErrorFallbackProps) {
  const { title, description, suggestion } = getVietnameseErrorMessage(error, context);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      resetError();
    }
  };

  const handleReportError = () => {
    if (onReportError) {
      onReportError(error, context);
    }
  };

  const getIcon = () => {
    switch (context?.type) {
      case QuestionErrorType.FORM_SUBMISSION:
        return <Edit className="h-8 w-8 text-red-500" />;
      case QuestionErrorType.SEARCH:
        return <Search className="h-8 w-8 text-red-500" />;
      case QuestionErrorType.DATA_LOADING:
        return <FileText className="h-8 w-8 text-red-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {suggestion}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>

            {onNavigateHome && (
              <Button 
                onClick={onNavigateHome}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            )}

            {onReportError && (
              <Button 
                onClick={handleReportError}
                variant="ghost"
                size="sm"
                className="w-full text-gray-500"
              >
                Báo cáo lỗi
              </Button>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Chi tiết lỗi (Development)
              </summary>
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div><strong>Error:</strong> {error.message}</div>
                {error.stack && (
                  <div className="mt-1">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
                {context && (
                  <div className="mt-1">
                    <strong>Context:</strong> {JSON.stringify(context, null, 2)}
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Question Error Boundary Component
 * 
 * Provides specialized error handling for question-related operations:
 * - Vietnamese error messages
 * - Context-aware error handling
 * - Recovery mechanisms
 * - Error reporting
 */
export class QuestionErrorBoundary extends Component<
  QuestionErrorBoundaryProps,
  QuestionErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: QuestionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<QuestionErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { context, onError } = this.props;
    
    // Log error with context
    logger.error('QuestionErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      context,
      errorInfo
    });

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, context);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  handleRetry = () => {
    const { onRetry, enableRetry = true } = this.props;
    const { retryCount } = this.state;

    if (!enableRetry || retryCount >= this.maxRetries) {
      return;
    }

    this.setState({
      retryCount: retryCount + 1
    });

    if (onRetry) {
      onRetry();
    }

    // Reset error state to retry
    this.resetError();
  };

  handleNavigateHome = () => {
    window.location.href = '/';
  };

  handleReportError = (error: Error, context?: QuestionErrorContext) => {
    // TODO: Implement error reporting to monitoring service
    logger.error('Error reported by user:', { error: error.message, context });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: CustomFallback, context, enableReporting = true } = this.props;

    if (hasError && error) {
      const FallbackComponent = CustomFallback || QuestionErrorFallback;
      
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          context={context}
          resetError={this.resetError}
          onRetry={this.handleRetry}
          onNavigateHome={this.handleNavigateHome}
          onReportError={enableReporting ? this.handleReportError : undefined}
        />
      );
    }

    return children;
  }
}
