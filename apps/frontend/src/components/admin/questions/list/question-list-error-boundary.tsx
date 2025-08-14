/**
 * Question List Error Boundary Component
 * Error boundary cho question list với recovery options
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { Component, ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Home,
  ArrowLeft,
  // FileX
} from "lucide-react";

// ===== TYPES =====

export interface QuestionListErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
  showErrorDetails?: boolean;
  className?: string;
}

export interface QuestionListErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

// ===== ERROR TYPES =====

export enum QuestionListErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  RENDERING_ERROR = 'RENDERING_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// ===== HELPER FUNCTIONS =====

/**
 * Determine error type từ error message
 */
function determineErrorType(error: Error): QuestionListErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return QuestionListErrorType.NETWORK_ERROR;
  }
  
  if (message.includes('json') || message.includes('parse')) {
    return QuestionListErrorType.PARSING_ERROR;
  }
  
  if (message.includes('permission') || message.includes('unauthorized')) {
    return QuestionListErrorType.PERMISSION_ERROR;
  }
  
  if (message.includes('render') || message.includes('component')) {
    return QuestionListErrorType.RENDERING_ERROR;
  }
  
  return QuestionListErrorType.UNKNOWN_ERROR;
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyErrorMessage(errorType: QuestionListErrorType): string {
  switch (errorType) {
    case QuestionListErrorType.NETWORK_ERROR:
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.';
    case QuestionListErrorType.PARSING_ERROR:
      return 'Dữ liệu nhận được không hợp lệ. Vui lòng thử lại sau.';
    case QuestionListErrorType.PERMISSION_ERROR:
      return 'Bạn không có quyền truy cập vào danh sách câu hỏi này.';
    case QuestionListErrorType.RENDERING_ERROR:
      return 'Có lỗi khi hiển thị danh sách câu hỏi. Vui lòng thử lại.';
    case QuestionListErrorType.UNKNOWN_ERROR:
    default:
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
  }
}

/**
 * Get recovery suggestions
 */
function getRecoverySuggestions(errorType: QuestionListErrorType): string[] {
  switch (errorType) {
    case QuestionListErrorType.NETWORK_ERROR:
      return [
        'Kiểm tra kết nối internet',
        'Thử tải lại trang',
        'Kiểm tra trạng thái server'
      ];
    case QuestionListErrorType.PARSING_ERROR:
      return [
        'Thử tải lại dữ liệu',
        'Xóa cache trình duyệt',
        'Liên hệ admin nếu vấn đề tiếp tục'
      ];
    case QuestionListErrorType.PERMISSION_ERROR:
      return [
        'Đăng nhập lại',
        'Kiểm tra quyền truy cập',
        'Liên hệ admin để được cấp quyền'
      ];
    case QuestionListErrorType.RENDERING_ERROR:
      return [
        'Thử tải lại trang',
        'Thử chế độ xem khác',
        'Xóa cache trình duyệt'
      ];
    case QuestionListErrorType.UNKNOWN_ERROR:
    default:
      return [
        'Thử tải lại trang',
        'Kiểm tra console để biết thêm chi tiết',
        'Liên hệ hỗ trợ kỹ thuật'
      ];
  }
}

// ===== ERROR FALLBACK COMPONENTS =====

/**
 * Simple error fallback
 */
function SimpleErrorFallback({ 
  error, 
  onRetry, 
  retryCount 
}: { 
  error: Error; 
  onRetry?: () => void; 
  retryCount: number;
}) {
  const errorType = determineErrorType(error);
  const message = getUserFriendlyErrorMessage(errorType);
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && retryCount < 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Thử lại
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Detailed error fallback
 */
function DetailedErrorFallback({ 
  error, 
  errorInfo, 
  onRetry, 
  retryCount,
  showErrorDetails = false 
}: { 
  error: Error; 
  errorInfo: React.ErrorInfo | null;
  onRetry?: () => void; 
  retryCount: number;
  showErrorDetails?: boolean;
}) {
  const errorType = determineErrorType(error);
  const message = getUserFriendlyErrorMessage(errorType);
  const suggestions = getRecoverySuggestions(errorType);
  
  return (
    <Card className="my-4 border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Lỗi hiển thị danh sách câu hỏi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{message}</p>
        
        {/* Recovery suggestions */}
        <div>
          <h4 className="font-medium text-sm mb-2">Gợi ý khắc phục:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-xs mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onRetry && retryCount < 3 && (
            <Button onClick={onRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại ({3 - retryCount} lần còn lại)
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <Home className="h-4 w-4 mr-2" />
            Tải lại trang
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        
        {/* Error details for development */}
        {showErrorDetails && process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Chi tiết lỗi (Development)
            </summary>
            <div className="mt-2 p-3 bg-muted rounded text-xs font-mono">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
              </div>
              {errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

// ===== MAIN ERROR BOUNDARY =====

export class QuestionListErrorBoundary extends Component<
  QuestionListErrorBoundaryProps,
  QuestionListErrorBoundaryState
> {
  constructor(props: QuestionListErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<QuestionListErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call onError callback
    this.props.onError?.(error, errorInfo);

    // Log error cho development
    if (process.env.NODE_ENV === 'development') {
      console.error('QuestionListErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });

      onRetry?.();
    }
  };

  render() {
    const { children, fallback, showErrorDetails = false, className = "" } = this.props;
    const { hasError, error, errorInfo, retryCount } = this.state;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <div className={className}>{fallback}</div>;
      }

      // Use detailed fallback for development or when explicitly requested
      if (showErrorDetails || process.env.NODE_ENV === 'development') {
        return (
          <div className={className}>
            <DetailedErrorFallback
              error={error}
              errorInfo={errorInfo}
              onRetry={this.handleRetry}
              retryCount={retryCount}
              showErrorDetails={showErrorDetails}
            />
          </div>
        );
      }

      // Use simple fallback for production
      return (
        <div className={className}>
          <SimpleErrorFallback
            error={error}
            onRetry={this.handleRetry}
            retryCount={retryCount}
          />
        </div>
      );
    }

    return children;
  }
}

// ===== FUNCTIONAL WRAPPER =====

/**
 * Functional wrapper cho easier usage
 */
export function withQuestionListErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<QuestionListErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <QuestionListErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </QuestionListErrorBoundary>
    );
  };
}
