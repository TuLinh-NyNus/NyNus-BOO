/**
 * Question Validation Panel Component
 * Comprehensive validation panel cho question quality và compliance
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  // ChevronRight,
  Star,
  Target,
  Zap,
  Shield
} from "lucide-react";

// Import types và utilities
import { Question } from "@/types/question";
import {
  validateQuestion,
  validateQuestionForOperation,
  calculateQuestionQuality,
  QuestionValidationResult,
  QuestionOperation
} from "@/lib/utils/question-management";

// ===== TYPES =====

export interface QuestionValidationPanelProps {
  question: Question;
  operation?: QuestionOperation;
  showQualityScore?: boolean;
  showSuggestions?: boolean;
  showDetails?: boolean;
  onValidationChange?: (result: QuestionValidationResult) => void;
  className?: string;
}

// ===== VALIDATION CATEGORIES =====

interface ValidationCategory {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const VALIDATION_CATEGORIES: ValidationCategory[] = [
  {
    key: 'content',
    title: 'Nội dung',
    icon: Target,
    description: 'Kiểm tra chất lượng nội dung câu hỏi'
  },
  {
    key: 'structure',
    title: 'Cấu trúc',
    icon: Shield,
    description: 'Kiểm tra cấu trúc và định dạng'
  },
  {
    key: 'metadata',
    title: 'Thông tin',
    icon: Info,
    description: 'Kiểm tra metadata và phân loại'
  },
  {
    key: 'quality',
    title: 'Chất lượng',
    icon: Star,
    description: 'Đánh giá tổng thể chất lượng'
  }
];

// ===== MAIN COMPONENT =====

export function QuestionValidationPanel({
  question,
  operation,
  showQualityScore = true,
  showSuggestions = true,
  showDetails = false,
  onValidationChange,
  className = ""
}: QuestionValidationPanelProps) {
  // ===== COMPUTED VALUES =====

  // Calculate validation result without side effects
  const validationResult = useMemo(() => {
    const result = operation
      ? validateQuestionForOperation(question, operation)
      : validateQuestion(question);

    return result;
  }, [question, operation]);

  const qualityScore = useMemo(() =>
    calculateQuestionQuality(question),
    [question]
  );

  // ===== EFFECTS =====

  /**
   * Notify parent component when validation result changes
   * Technical: Call callback in useEffect to avoid setState during render
   * Note: onValidationChange is intentionally excluded from dependencies
   * to prevent infinite loops when parent doesn't memoize the callback
   */
  useEffect(() => {
    onValidationChange?.(validationResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationResult]);

  // ===== CATEGORIZATION =====

  const categorizedErrors = useMemo(() => {
    const categories: Record<string, typeof validationResult.errors> = {
      content: [],
      structure: [],
      metadata: [],
      quality: []
    };
    
    validationResult.errors.forEach(error => {
      if (['content', 'explanation'].includes(error.field)) {
        categories.content.push(error);
      } else if (['type', 'answers'].includes(error.field)) {
        categories.structure.push(error);
      } else if (['questionCodeId', 'difficulty', 'status'].includes(error.field)) {
        categories.metadata.push(error);
      } else {
        categories.quality.push(error);
      }
    });
    
    return categories;
  }, [validationResult]);
  
  const categorizedWarnings = useMemo(() => {
    const categories: Record<string, typeof validationResult.warnings> = {
      content: [],
      structure: [],
      metadata: [],
      quality: []
    };
    
    validationResult.warnings.forEach(warning => {
      if (['content', 'explanation'].includes(warning.field)) {
        categories.content.push(warning);
      } else if (['type', 'answers'].includes(warning.field)) {
        categories.structure.push(warning);
      } else if (['questionCodeId', 'difficulty', 'status'].includes(warning.field)) {
        categories.metadata.push(warning);
      } else {
        categories.quality.push(warning);
      }
    });
    
    return categories;
  }, [validationResult]);
  
  // ===== RENDER HELPERS =====
  
  /**
   * Get validation status color
   */
  const getStatusColor = () => {
    if (validationResult.isValid && validationResult.warnings.length === 0) {
      return 'text-green-600';
    } else if (validationResult.isValid) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };
  
  /**
   * Get validation status icon
   */
  const getStatusIcon = () => {
    if (validationResult.isValid && validationResult.warnings.length === 0) {
      return CheckCircle;
    } else if (validationResult.isValid) {
      return AlertTriangle;
    } else {
      return XCircle;
    }
  };
  
  /**
   * Get quality score color
   */
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  /**
   * Render validation category
   */
  const renderValidationCategory = (category: ValidationCategory) => {
    const errors = categorizedErrors[category.key] || [];
    const warnings = categorizedWarnings[category.key] || [];
    const hasIssues = errors.length > 0 || warnings.length > 0;
    
    if (!hasIssues && !showDetails) return null;
    
    const Icon = category.icon;
    const statusIcon = errors.length > 0 ? XCircle : warnings.length > 0 ? AlertTriangle : CheckCircle;
    const statusColor = errors.length > 0 ? 'text-red-600' : warnings.length > 0 ? 'text-yellow-600' : 'text-green-600';
    
    return (
      <Collapsible key={category.key} defaultOpen={hasIssues}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3 h-auto">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">{category.title}</div>
                <div className="text-sm text-muted-foreground">{category.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasIssues && (
                <Badge variant={errors.length > 0 ? "destructive" : "secondary"}>
                  {errors.length + warnings.length}
                </Badge>
              )}
              <div className={statusColor}>
                {React.createElement(statusIcon, { className: "h-4 w-4" })}
              </div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-2">
            {/* Errors */}
            {errors.map((error, index) => (
              <Alert key={`error-${index}`} variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{error.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Trường: {error.field} | Mã: {error.code}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            
            {/* Warnings */}
            {warnings.map((warning, index) => (
              <Alert key={`warning-${index}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{warning.message}</div>
                  {warning.suggestion && (
                    <div className="text-sm text-muted-foreground mt-1">
                      💡 {warning.suggestion}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Trường: {warning.field} | Mã: {warning.code}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            
            {/* No issues */}
            {!hasIssues && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Không có vấn đề
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };
  
  // ===== MAIN RENDER =====
  
  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();
  
  return (
    <Card className={`question-validation-panel ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={statusColor}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <span>Kiểm tra câu hỏi</span>
            {operation && (
              <Badge variant="outline">
                {operation}
              </Badge>
            )}
          </div>
          
          {showQualityScore && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className={`font-bold ${getQualityColor(qualityScore)}`}>
                {qualityScore}/100
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="font-medium">
              {validationResult.isValid ? 'Câu hỏi hợp lệ' : 'Câu hỏi có lỗi'}
            </div>
            <div className="text-sm text-muted-foreground">
              {validationResult.errors.length} lỗi, {validationResult.warnings.length} cảnh báo
            </div>
          </div>
          
          {showQualityScore && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Điểm chất lượng</div>
              <Progress value={qualityScore} className="w-20 h-2" />
            </div>
          )}
        </div>
        
        {/* Validation categories */}
        <div className="space-y-2">
          {VALIDATION_CATEGORIES.map(renderValidationCategory)}
        </div>
        
        {/* Quick suggestions */}
        {showSuggestions && validationResult.warnings.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Gợi ý cải thiện</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              {validationResult.warnings
                .filter(w => w.suggestion)
                .slice(0, 3)
                .map((warning, index) => (
                  <li key={index}>• {warning.suggestion}</li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact validation panel
 */
export function CompactQuestionValidationPanel(props: QuestionValidationPanelProps) {
  return (
    <QuestionValidationPanel
      {...props}
      showDetails={false}
      showSuggestions={false}
      className={`compact-validation ${props.className || ''}`}
    />
  );
}

/**
 * Detailed validation panel
 */
export function DetailedQuestionValidationPanel(props: QuestionValidationPanelProps) {
  return (
    <QuestionValidationPanel
      {...props}
      showDetails={true}
      showSuggestions={true}
      showQualityScore={true}
      className={`detailed-validation ${props.className || ''}`}
    />
  );
}
