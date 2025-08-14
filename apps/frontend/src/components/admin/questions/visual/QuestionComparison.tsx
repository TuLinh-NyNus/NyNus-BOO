/**
 * Question Comparison Component
 * Side-by-side comparison với diff highlighting và synchronized scrolling
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { ArrowLeftRight, Eye, EyeOff, Download, X } from 'lucide-react';
import { QuestionCard } from '../display/QuestionCard';
import { Question } from '@/lib/types/question';

/**
 * Props cho Question Comparison
 */
interface QuestionComparisonProps {
  /** Left question */
  questionA: Question;
  /** Right question */
  questionB: Question;
  /** Show differences highlighting */
  showDiff?: boolean;
  /** Show metadata comparison */
  showMetadata?: boolean;
  /** Show solutions */
  showSolutions?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Export comparison handler */
  onExport?: (questionA: Question, questionB: Question) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Question Comparison Component
 * Side-by-side layout với synchronized scrolling và diff highlighting
 */
export function QuestionComparison({
  questionA,
  questionB,
  showDiff = true,
  showMetadata = true,
  showSolutions = false,
  onClose,
  onExport,
  className = ''
}: QuestionComparisonProps) {
  const [syncScroll, setSyncScroll] = useState(true);
  const [showDiffHighlight, setShowDiffHighlight] = useState(showDiff);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  /**
   * Synchronized scrolling
   */
  const handleScroll = (source: 'left' | 'right') => (event: React.UIEvent<HTMLDivElement>) => {
    if (!syncScroll) return;

    const sourceElement = event.currentTarget;
    const targetElement = source === 'left' ? rightPanelRef.current : leftPanelRef.current;

    if (targetElement) {
      const scrollPercentage = sourceElement.scrollTop / (sourceElement.scrollHeight - sourceElement.clientHeight);
      const targetScrollTop = scrollPercentage * (targetElement.scrollHeight - targetElement.clientHeight);
      targetElement.scrollTop = targetScrollTop;
    }
  };

  /**
   * Calculate similarity percentage
   */
  const calculateSimilarity = () => {
    const contentA = questionA.content.toLowerCase().replace(/\s+/g, ' ').trim();
    const contentB = questionB.content.toLowerCase().replace(/\s+/g, ' ').trim();
    
    if (contentA === contentB) return 100;
    
    // Simple similarity calculation based on common words
    const wordsA = contentA.split(' ');
    const wordsB = contentB.split(' ');
    const commonWords = wordsA.filter(word => wordsB.includes(word));
    
    const similarity = (commonWords.length * 2) / (wordsA.length + wordsB.length) * 100;
    return Math.round(similarity);
  };

  /**
   * Get comparison metrics
   */
  const getComparisonMetrics = () => {
    const similarity = calculateSimilarity();
    
    return {
      similarity,
      sameType: questionA.type === questionB.type,
      sameDifficulty: questionA.difficulty === questionB.difficulty,
      sameCreator: questionA.creator === questionB.creator,
      contentLengthDiff: Math.abs(questionA.content.length - questionB.content.length),
      hasSolutionA: !!questionA.solution,
      hasSolutionB: !!questionB.solution
    };
  };

  const metrics = getComparisonMetrics();

  /**
   * Get similarity color
   */
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'text-red-600 bg-red-50';
    if (similarity >= 60) return 'text-yellow-600 bg-yellow-50';
    if (similarity >= 40) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className={`question-comparison ${className}`}>
      {/* Header với controls */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              So sánh câu hỏi
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Sync scroll toggle */}
              <Button
                variant={syncScroll ? "default" : "outline"}
                size="sm"
                onClick={() => setSyncScroll(!syncScroll)}
                className="flex items-center gap-1"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {syncScroll ? 'Đồng bộ' : 'Tự do'}
                </span>
              </Button>

              {/* Diff highlight toggle */}
              <Button
                variant={showDiffHighlight ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDiffHighlight(!showDiffHighlight)}
                className="flex items-center gap-1"
              >
                {showDiffHighlight ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Khác biệt</span>
              </Button>

              {/* Export */}
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(questionA, questionB)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Xuất</span>
                </Button>
              )}

              {/* Close */}
              {onClose && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Comparison metrics */}
        {showMetadata && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {/* Similarity */}
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Độ tương tự</div>
                <div className={`text-lg font-bold px-2 py-1 rounded ${getSimilarityColor(metrics.similarity)}`}>
                  {metrics.similarity}%
                </div>
              </div>

              {/* Type comparison */}
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Loại câu hỏi</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  metrics.sameType ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {metrics.sameType ? 'Giống nhau' : 'Khác nhau'}
                </div>
              </div>

              {/* Difficulty comparison */}
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Độ khó</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  metrics.sameDifficulty ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {metrics.sameDifficulty ? 'Giống nhau' : 'Khác nhau'}
                </div>
              </div>

              {/* Content length */}
              <div className="text-center">
                <div className="font-medium text-muted-foreground">Độ dài</div>
                <div className="text-sm">
                  {metrics.contentLengthDiff === 0 ? (
                    <span className="text-green-600">Bằng nhau</span>
                  ) : (
                    <span className="text-blue-600">±{metrics.contentLengthDiff} ký tự</span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {metrics.sameCreator && (
                <Badge variant="outline" className="text-xs">
                  Cùng tác giả
                </Badge>
              )}
              {metrics.hasSolutionA && metrics.hasSolutionB && (
                <Badge variant="outline" className="text-xs">
                  Đều có lời giải
                </Badge>
              )}
              {metrics.hasSolutionA !== metrics.hasSolutionB && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  Khác về lời giải
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left panel */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Câu hỏi A</Badge>
            <span className="text-sm text-muted-foreground">
              {questionA.questionCodeId}
            </span>
          </div>
          
          <div
            ref={leftPanelRef}
            onScroll={handleScroll('left')}
            className="max-h-[600px] overflow-y-auto border rounded-lg"
          >
            <QuestionCard
              question={questionA}
              variant="detailed"
              showSolution={showSolutions}
              showMetadata={showMetadata}
              showActions={false}
              className={showDiffHighlight ? 'comparison-highlight-a' : ''}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Câu hỏi B</Badge>
            <span className="text-sm text-muted-foreground">
              {questionB.questionCodeId}
            </span>
          </div>
          
          <div
            ref={rightPanelRef}
            onScroll={handleScroll('right')}
            className="max-h-[600px] overflow-y-auto border rounded-lg"
          >
            <QuestionCard
              question={questionB}
              variant="detailed"
              showSolution={showSolutions}
              showMetadata={showMetadata}
              showActions={false}
              className={showDiffHighlight ? 'comparison-highlight-b' : ''}
            />
          </div>
        </div>
      </div>

      {/* Comparison summary */}
      <Card className="mt-4">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Thông tin câu hỏi A:</h4>
                <ul className="space-y-1">
                  <li>Mã: {questionA.questionCodeId}</li>
                  <li>Loại: {questionA.type}</li>
                  <li>Độ khó: {questionA.difficulty || 'Chưa xác định'}</li>
                  <li>Tác giả: {questionA.creator || 'Không xác định'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Thông tin câu hỏi B:</h4>
                <ul className="space-y-1">
                  <li>Mã: {questionB.questionCodeId}</li>
                  <li>Loại: {questionB.type}</li>
                  <li>Độ khó: {questionB.difficulty || 'Chưa xác định'}</li>
                  <li>Tác giả: {questionB.creator || 'Không xác định'}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
