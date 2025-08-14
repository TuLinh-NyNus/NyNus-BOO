/**
 * Enhanced LaTeX Content Renderer
 * Wrapper around LatexToReact với enhanced security và UX
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { parseLatexToReact } from '@/lib/theory/latex-to-react';
import type { ReactParseResult } from '@/lib/theory/latex-to-react';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LatexContentProps {
  content: string;
  className?: string;
  enableSanitization?: boolean;
  showErrors?: boolean;
  enableRetry?: boolean;
  responsive?: boolean;
  maxRetries?: number;
}

interface ContentState {
  isLoading: boolean;
  parseResult: ReactParseResult | null;
  sanitizedContent: string;
  error: string | null;
  retryCount: number;
}

/**
 * Enhanced LaTeX Content Component
 * Provides secure, responsive LaTeX content rendering
 */
export function LatexContent({
  content,
  className,
  enableSanitization = true,
  showErrors = true,
  enableRetry = true,
  responsive = true,
  maxRetries = 3
}: LatexContentProps) {
  const [state, setState] = useState<ContentState>({
    isLoading: true,
    parseResult: null,
    sanitizedContent: '',
    error: null,
    retryCount: 0
  });
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Sanitize content với DOMPurify
  const sanitizeContent = useCallback((rawContent: string): string => {
    if (!enableSanitization) return rawContent;

    try {
      return DOMPurify.sanitize(rawContent, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 'sub', 'sup',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'div', 'span', 'ul', 'ol', 'li',
          'blockquote', 'code', 'pre'
        ],
        ALLOWED_ATTR: ['class', 'id', 'style'],
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
      });
    } catch (error) {
      console.warn('Content sanitization failed:', error);
      return rawContent;
    }
  }, [enableSanitization]);

  // Parse LaTeX content
  const parseContent = useCallback(async (contentToParse: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Add small delay để show loading state
      await new Promise(resolve => setTimeout(resolve, 100));

      const sanitized = sanitizeContent(contentToParse);
      const result = parseLatexToReact(sanitized);

      setState(prev => ({
        ...prev,
        isLoading: false,
        parseResult: result,
        sanitizedContent: sanitized,
        error: result.errors.length > 0 ? result.errors.join('; ') : null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Parsing failed: ${error}`,
        parseResult: null
      }));
    }
  }, [sanitizeContent]);

  // Retry parsing
  const retryParsing = useCallback(() => {
    if (state.retryCount < maxRetries) {
      setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
      parseContent(content);
    }
  }, [state.retryCount, maxRetries, parseContent, content]);

  // Parse content when component mounts or content changes
  useEffect(() => {
    if (content) {
      parseContent(content);
    }
  }, [content, parseContent]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  // Error state
  if (state.error && !state.parseResult) {
    return (
      <div className={cn("space-y-4", className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Không thể hiển thị nội dung LaTeX</p>
              {showErrors && (
                <details className="text-sm">
                  <summary className="cursor-pointer hover:underline">
                    Chi tiết lỗi
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {state.error}
                  </pre>
                </details>
              )}
              {enableRetry && state.retryCount < maxRetries && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryParsing}
                  className="mt-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Thử lại ({state.retryCount + 1}/{maxRetries})
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Fallback content */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Nội dung gốc:</h4>
          <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-40">
            {content.substring(0, 500)}
            {content.length > 500 && '...'}
          </pre>
        </div>
      </div>
    );
  }

  // Success state với optional errors
  return (
    <div className={cn("space-y-4", className)}>
      {/* Error warnings (non-fatal) */}
      {state.error && state.parseResult && showErrors && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-yellow-800">
                Một số phần có thể không hiển thị chính xác
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                {showErrorDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            {showErrorDetails && (
              <details className="mt-2 text-sm text-yellow-700">
                <summary className="cursor-pointer hover:underline">
                  Chi tiết cảnh báo
                </summary>
                <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto">
                  {state.error}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Rendered content */}
      <div
        className={cn(
          "theory-latex-content",
          responsive && "prose prose-lg max-w-none",
          responsive && "prose-headings:scroll-mt-20",
          responsive && "prose-img:rounded-lg prose-img:shadow-md",
          "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
          "prose-pre:bg-muted prose-pre:border"
        )}
      >
        {state.parseResult?.components}
      </div>

      {/* Content metadata */}
      {state.parseResult && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <span>{state.parseResult.components.length} thành phần</span>
          {state.parseResult.warnings.length > 0 && (
            <span>{state.parseResult.warnings.length} cảnh báo</span>
          )}
          {enableSanitization && (
            <span>✓ Đã kiểm tra bảo mật</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Lightweight LaTeX Content Component
 * Simplified version cho basic use cases
 */
export function SimpleLatexContent({ 
  content, 
  className 
}: { 
  content: string; 
  className?: string; 
}) {
  return (
    <LatexContent
      content={content}
      className={className}
      enableSanitization={true}
      showErrors={false}
      enableRetry={false}
      responsive={true}
    />
  );
}

/**
 * LaTeX Content với custom configuration
 */
export function ConfigurableLatexContent({
  content,
  config,
  className
}: {
  content: string;
  config: Partial<LatexContentProps>;
  className?: string;
}) {
  return (
    <LatexContent
      content={content}
      className={className}
      {...config}
    />
  );
}
