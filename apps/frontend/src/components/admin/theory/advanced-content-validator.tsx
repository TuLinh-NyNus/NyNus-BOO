/**
 * Advanced Content Validator Component
 * Comprehensive content validation với quality scoring và suggestions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Lightbulb,
  Zap,
  Eye,
  Clock,
  FileText,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion' | 'info';
  category: 'content' | 'latex' | 'structure' | 'seo' | 'accessibility' | 'performance';
  message: string;
  description?: string;
  line?: number;
  column?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixable: boolean;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  overallScore: number;
  categoryScores: {
    content: number;
    latex: number;
    structure: number;
    seo: number;
    accessibility: number;
    performance: number;
  };
  issues: ValidationIssue[];
  suggestions: string[];
  metrics: {
    wordCount: number;
    latexCount: number;
    imageCount: number;
    estimatedReadTime: number;
    complexityScore: number;
  };
}

export interface TheoryMetadata {
  title: string;
  subject: string;
  grade: number;
  chapter: number;
  lesson: number;
  difficulty: 'easy' | 'medium' | 'hard';
  keywords: string[];
  estimatedTime: number;
}

export interface AdvancedContentValidatorProps {
  /** Content để validate */
  content: string;
  
  /** Metadata của content */
  metadata?: TheoryMetadata;
  
  /** Handler khi validation hoàn thành */
  onValidationComplete: (result: ValidationResult) => void;
  
  /** Enable quality scoring */
  enableQualityScoring?: boolean;
  
  /** Enable suggestions */
  enableSuggestions?: boolean;
  
  /** Show detailed report */
  showDetailedReport?: boolean;
  
  /** Auto-validate on content change */
  autoValidate?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const MOCK_VALIDATION_RESULT: ValidationResult = {
  isValid: true,
  overallScore: 85,
  categoryScores: {
    content: 90,
    latex: 80,
    structure: 85,
    seo: 75,
    accessibility: 88,
    performance: 92
  },
  issues: [
    {
      id: 'issue-1',
      type: 'warning',
      category: 'latex',
      message: 'LaTeX expression có thể được tối ưu',
      description: 'Biểu thức LaTeX "$x^2 + y^2$" có thể được viết gọn hơn',
      line: 15,
      severity: 'medium',
      fixable: true,
      suggestion: 'Sử dụng \\sum thay vì viết tay'
    },
    {
      id: 'issue-2',
      type: 'suggestion',
      category: 'structure',
      message: 'Nên thêm mục lục cho nội dung dài',
      description: 'Nội dung có hơn 1000 từ nên có mục lục để dễ điều hướng',
      severity: 'low',
      fixable: false,
      suggestion: 'Thêm ## Mục lục ở đầu bài'
    },
    {
      id: 'issue-3',
      type: 'info',
      category: 'seo',
      message: 'Từ khóa chính xuất hiện đủ tần suất',
      description: 'Từ khóa "phương trình bậc hai" xuất hiện 8 lần trong nội dung',
      severity: 'low',
      fixable: false
    }
  ],
  suggestions: [
    'Thêm ví dụ minh họa cho công thức phức tạp',
    'Sử dụng hình ảnh để minh họa khái niệm trừu tượng',
    'Thêm bài tập thực hành cuối bài'
  ],
  metrics: {
    wordCount: 1250,
    latexCount: 15,
    imageCount: 3,
    estimatedReadTime: 8,
    complexityScore: 7.5
  }
};

// ===== MAIN COMPONENT =====

export function AdvancedContentValidator({
  content,
  metadata,
  onValidationComplete,
  enableQualityScoring = true,
  enableSuggestions = true,
  showDetailedReport = true,
  autoValidate = true,
  className
}: AdvancedContentValidatorProps) {
  
  // ===== STATE =====
  
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // ===== EFFECTS =====

  // useEffect moved after validateContent definition

  // ===== HANDLERS =====

  const validateContent = useCallback(async () => {
    if (!content.trim()) return;

    setIsValidating(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation result
    const result = MOCK_VALIDATION_RESULT;
    
    setValidationResult(result);
    onValidationComplete(result);
    setIsValidating(false);
  }, [content, onValidationComplete]);

  // Re-create useEffect after validateContent is defined
  useEffect(() => {
    if (autoValidate && content) {
      validateContent();
    }
  }, [content, metadata, autoValidate, validateContent]);

  // ===== RENDER HELPERS =====

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'info': return <Info className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIssueColor = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'suggestion': return 'border-blue-200 bg-blue-50';
      case 'info': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderOverallScore = () => {
    if (!validationResult || !enableQualityScoring) return null;

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Điểm chất lượng tổng thể</h3>
              <p className="text-sm text-muted-foreground">
                Đánh giá toàn diện về chất lượng nội dung
              </p>
            </div>
            <div className={cn("text-4xl font-bold", getScoreColor(validationResult.overallScore))}>
              {validationResult.overallScore}
            </div>
          </div>
          
          <Progress 
            value={validationResult.overallScore} 
            className="h-3"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {Object.entries(validationResult.categoryScores).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className={cn("text-xl font-semibold", getScoreColor(score))}>
                  {score}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {category === 'content' ? 'Nội dung' :
                   category === 'latex' ? 'LaTeX' :
                   category === 'structure' ? 'Cấu trúc' :
                   category === 'seo' ? 'SEO' :
                   category === 'accessibility' ? 'Tiếp cận' : 'Hiệu suất'}
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                  <div 
                    className={cn("h-full rounded-full transition-all", getScoreBarColor(score))}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMetrics = () => {
    if (!validationResult) return null;

    const { metrics } = validationResult;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-xl font-semibold">{metrics.wordCount}</div>
            <div className="text-xs text-muted-foreground">Số từ</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <div className="text-xl font-semibold">{metrics.latexCount}</div>
            <div className="text-xs text-muted-foreground">Công thức</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-xl font-semibold">{metrics.imageCount}</div>
            <div className="text-xs text-muted-foreground">Hình ảnh</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-xl font-semibold">{metrics.estimatedReadTime}</div>
            <div className="text-xs text-muted-foreground">Phút đọc</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-xl font-semibold">{metrics.complexityScore}</div>
            <div className="text-xs text-muted-foreground">Độ phức tạp</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderIssues = () => {
    if (!validationResult || !showDetailedReport) return null;

    const { issues } = validationResult;
    const groupedIssues = issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, ValidationIssue[]>);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết vấn đề</CardTitle>
          <CardDescription>
            Danh sách các vấn đề được phát hiện và gợi ý cải thiện
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedIssues).map(([type, typeIssues]) => (
              <div key={type}>
                <h4 className="font-medium mb-2 capitalize flex items-center gap-2">
                  {getIssueIcon(type as ValidationIssue['type'])}
                  {type === 'error' ? 'Lỗi' :
                   type === 'warning' ? 'Cảnh báo' :
                   type === 'suggestion' ? 'Gợi ý' : 'Thông tin'}
                  <Badge variant="secondary">{typeIssues.length}</Badge>
                </h4>
                
                <div className="space-y-2">
                  {typeIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={cn("p-3 rounded-lg border", getIssueColor(issue.type))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{issue.message}</div>
                          {issue.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {issue.description}
                            </div>
                          )}
                          {issue.line && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Dòng {issue.line}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                          {issue.fixable && (
                            <Badge variant="secondary" className="text-xs">
                              Có thể sửa
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {issue.suggestion && (
                        <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                          <strong>Gợi ý:</strong> {issue.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSuggestions = () => {
    if (!validationResult || !enableSuggestions || validationResult.suggestions.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Gợi ý cải thiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationResult.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded bg-blue-50">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">{suggestion}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className={cn("advanced-content-validator", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Kiểm tra chất lượng nội dung
              </CardTitle>
              <CardDescription>
                Phân tích toàn diện và đánh giá chất lượng nội dung lý thuyết
              </CardDescription>
            </div>
            
            <Button
              onClick={validateContent}
              disabled={isValidating || !content.trim()}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isValidating && "animate-spin")} />
              {isValidating ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isValidating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <div className="text-lg font-medium">Đang phân tích nội dung...</div>
                <div className="text-sm text-muted-foreground">
                  Kiểm tra cấu trúc, LaTeX, SEO và hiệu suất
                </div>
              </div>
            </div>
          ) : validationResult ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="issues">Chi tiết</TabsTrigger>
                <TabsTrigger value="suggestions">Gợi ý</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {renderOverallScore()}
                {renderMetrics()}
              </TabsContent>
              
              <TabsContent value="issues" className="space-y-6">
                {renderIssues()}
              </TabsContent>
              
              <TabsContent value="suggestions" className="space-y-6">
                {renderSuggestions()}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nhập nội dung để bắt đầu kiểm tra chất lượng
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
