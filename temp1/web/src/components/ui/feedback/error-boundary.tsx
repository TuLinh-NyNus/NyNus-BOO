/**
 * Error Boundary Component cho React
 */

'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/display/card"
import logger from '@/lib/utils/logger'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  retry?: () => void
  errorInfo?: React.ErrorInfo
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Đã xảy ra lỗi
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md bg-gray-100 p-3">
            <p className="text-sm text-gray-700 font-mono">
              {error.message || 'Lỗi không xác định'}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={resetError}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Về trang chủ
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Error Boundary Class Component
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log error to monitoring service
    this.props.onError?.(error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based Error Boundary (for functional components)
 */
export function useErrorHandler():  {
  handleError: (error: Error) => void;
  resetError: () => void;
} {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    logger.error('Error caught by useErrorHandler:', error)
    setError(error)
  }, [])

  // Throw error to be caught by Error Boundary
  if (error) {
    throw error
  }

  return { handleError, resetError }
}

/**
 * Auth Error Fallback Component
 */
export function AuthErrorFallback({ error, resetError }: ErrorFallbackProps): JSX.Element {
  const isAuthError = error.message.includes('401') || 
                     error.message.includes('unauthorized') ||
                     error.message.includes('authentication')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {isAuthError ? 'Phiên đăng nhập hết hạn' : 'Lỗi xác thực'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isAuthError 
              ? 'Vui lòng đăng nhập lại để tiếp tục sử dụng.'
              : 'Có lỗi xảy ra trong quá trình xác thực.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="w-full"
            variant="default"
          >
            Đăng nhập lại
          </Button>
          
          <Button 
            onClick={resetError}
            className="w-full"
            variant="outline"
          >
            Thử lại
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
