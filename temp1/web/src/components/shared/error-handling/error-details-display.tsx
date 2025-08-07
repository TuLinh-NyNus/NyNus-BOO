'use client';

import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  XCircle, 
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { cn } from '@/lib/utils';

export interface ErrorDetail {
  questionIndex?: number;
  questionContent?: string;
  error: {
    message: string;
    code?: string;
    line?: number;
    column?: number;
    context?: string;
    stack?: string;
    timestamp: string;
    severity?: 'error' | 'warning' | 'info';
  };
  recoverable?: boolean;
}

interface ErrorDetailsDisplayProps {
  errors: ErrorDetail[];
  title?: string;
  className?: string;
  maxHeight?: string;
}

export function ErrorDetailsDisplay({ 
  errors, 
  title = "Chi tiết lỗi", 
  className,
  maxHeight = "400px" 
}: ErrorDetailsDisplayProps): JSX.Element | null {
  const [expandedErrors, setExpandedErrors] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  const toggleError = (index: number) => {
    setExpandedErrors(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAll = () => {
    if (showAll) {
      setExpandedErrors([]);
    } else {
      setExpandedErrors(errors.map((_, index) => index));
    }
    setShowAll(!showAll);
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportErrors = () => {
    const errorText = errors.map((error, index) => {
      return `Error ${index + 1}:
Message: ${error.error.message}
Code: ${error.error.code || 'N/A'}
Severity: ${error.error.severity || 'error'}
Timestamp: ${error.error.timestamp}
Question Index: ${error.questionIndex || 'N/A'}
Context: ${error.error.context || 'N/A'}
${error.error.stack ? `Stack: ${error.error.stack}` : ''}
---`;
    }).join('\n\n');

    const blob = new Blob([errorText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title} ({errors.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="text-xs"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Ẩn tất cả
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Hiện tất cả
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportErrors}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-3 overflow-y-auto"
          style={{ maxHeight }}
        >
          {errors.map((error, index) => (
            <div
              key={index}
              className={cn(
                "border rounded-lg p-3",
                getSeverityColor(error.error.severity)
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {getSeverityIcon(error.error.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {error.error.message}
                      </span>
                      {error.error.code && (
                        <Badge variant="outline" className="text-xs">
                          {error.error.code}
                        </Badge>
                      )}
                    </div>
                    {error.questionIndex !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Câu hỏi #{error.questionIndex + 1}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(error.error.message)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleError(index)}
                    className="h-6 w-6 p-0"
                  >
                    {expandedErrors.includes(index) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedErrors.includes(index) && (
                <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
                  {error.error.context && (
                    <div>
                      <p className="text-xs font-medium mb-1">Context:</p>
                      <p className="text-xs text-muted-foreground font-mono bg-background/50 p-2 rounded">
                        {error.error.context}
                      </p>
                    </div>
                  )}
                  
                  {error.questionContent && (
                    <div>
                      <p className="text-xs font-medium mb-1">Question Content:</p>
                      <p className="text-xs text-muted-foreground font-mono bg-background/50 p-2 rounded max-h-20 overflow-y-auto">
                        {error.questionContent}
                      </p>
                    </div>
                  )}

                  {error.error.stack && (
                    <div>
                      <p className="text-xs font-medium mb-1">Stack Trace:</p>
                      <pre className="text-xs text-muted-foreground font-mono bg-background/50 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {error.error.stack}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(error.error.timestamp).toLocaleString()}
                    </span>
                    {error.recoverable && (
                      <Badge variant="secondary" className="text-xs">
                        Recoverable
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
