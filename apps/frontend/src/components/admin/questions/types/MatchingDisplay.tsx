/**
 * Matching Display Component
 * Specialized rendering cho Matching questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { ArrowRight, CheckCircle, XCircle, Eye, EyeOff, Shuffle } from 'lucide-react';
import { LaTeXRenderer } from '@/components/ui/latex';
import { MatchingPair } from '@/types/question';

/**
 * Props cho Matching Display
 */
interface MatchingDisplayProps {
  /** Correct matching pairs */
  correctPairs: MatchingPair[];
  /** User's selected pairs */
  selectedPairs?: MatchingPair[];
  /** Show correct answers */
  showCorrect?: boolean;
  /** Interactive mode */
  interactive?: boolean;
  /** Pair selection handler */
  onPairSelect?: (leftItem: string, rightItem: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Matching Display Component
 * Hiển thị câu hỏi ghép đôi với drag-and-drop interface
 */
export function MatchingDisplay({
  correctPairs,
  selectedPairs = [],
  showCorrect = false,
  interactive = false,
  onPairSelect,
  className = ''
}: MatchingDisplayProps) {
  const [showAnswers, setShowAnswers] = useState(showCorrect);
  const [localPairs, setLocalPairs] = useState<MatchingPair[]>(selectedPairs);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Extract unique left và right items
  const leftItems = Array.from(new Set(correctPairs.map(pair => pair.left)));
  const rightItems = Array.from(new Set(correctPairs.map(pair => pair.right)));

  /**
   * Handle item selection
   */
  const handleLeftItemClick = (leftItem: string) => {
    if (!interactive) return;
    setSelectedLeft(selectedLeft === leftItem ? null : leftItem);
  };

  const handleRightItemClick = (rightItem: string) => {
    if (!interactive || !selectedLeft) return;

    // Remove existing pair với left item
    const newPairs = localPairs.filter(pair => pair.left !== selectedLeft);
    
    // Add new pair
    const newPair = { left: selectedLeft, right: rightItem };
    newPairs.push(newPair);
    
    setLocalPairs(newPairs);
    onPairSelect?.(selectedLeft, rightItem);
    setSelectedLeft(null);
  };

  /**
   * Check if pair is correct
   */
  const isPairCorrect = (pair: MatchingPair) => {
    return correctPairs.some(correct => 
      correct.left === pair.left && correct.right === pair.right
    );
  };

  /**
   * Get item styling
   */
  const getLeftItemStyles = (leftItem: string) => {
    let baseStyles = 'p-3 border rounded-lg cursor-pointer transition-all duration-200';
    
    if (!interactive) {
      baseStyles += ' cursor-default';
    }

    if (selectedLeft === leftItem) {
      baseStyles += ' border-blue-500 bg-blue-50 text-blue-800';
    } else {
      const isMatched = localPairs.some(pair => pair.left === leftItem);
      if (isMatched) {
        const pair = localPairs.find(p => p.left === leftItem);
        if (showAnswers && pair) {
          baseStyles += isPairCorrect(pair) 
            ? ' border-green-500 bg-green-50 text-green-800'
            : ' border-red-500 bg-red-50 text-red-800';
        } else {
          baseStyles += ' border-gray-400 bg-gray-50';
        }
      } else {
        baseStyles += ' border-gray-200 hover:border-gray-300 hover:bg-gray-50';
      }
    }

    return baseStyles;
  };

  const getRightItemStyles = (rightItem: string) => {
    let baseStyles = 'p-3 border rounded-lg cursor-pointer transition-all duration-200';
    
    if (!interactive) {
      baseStyles += ' cursor-default';
    }

    const isMatched = localPairs.some(pair => pair.right === rightItem);
    if (isMatched) {
      const pair = localPairs.find(p => p.right === rightItem);
      if (showAnswers && pair) {
        baseStyles += isPairCorrect(pair) 
          ? ' border-green-500 bg-green-50 text-green-800'
          : ' border-red-500 bg-red-50 text-red-800';
      } else {
        baseStyles += ' border-gray-400 bg-gray-50';
      }
    } else if (selectedLeft) {
      baseStyles += ' border-blue-200 hover:border-blue-400 hover:bg-blue-50';
    } else {
      baseStyles += ' border-gray-200 hover:border-gray-300 hover:bg-gray-50';
    }

    return baseStyles;
  };

  /**
   * Shuffle items for display
   */
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledRight] = useState(() => shuffleArray(rightItems));

  return (
    <div className={`matching-display space-y-4 ${className}`}>
      {/* Header với toggle answers */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-300">
            Ghép đôi
          </Badge>
          <span className="text-sm text-muted-foreground">
            {leftItems.length} cặp
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {interactive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocalPairs([])}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Xóa tất cả
            </Button>
          )}
          
          {!interactive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex items-center gap-2"
            >
              {showAnswers ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ẩn đáp án
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Hiện đáp án
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Matching interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Cột A</h4>
          <div className="space-y-2">
            {leftItems.map((leftItem, index) => (
              <div
                key={leftItem}
                className={getLeftItemStyles(leftItem)}
                onClick={() => handleLeftItemClick(leftItem)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <LaTeXRenderer
                      content={leftItem}
                      className="left-item-content"
                      showErrorDetails={false}
                      cleanContent={true}
                    />
                  </div>
                  {/* Connection indicator */}
                  {localPairs.find(pair => pair.left === leftItem) && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Cột B</h4>
          <div className="space-y-2">
            {shuffledRight.map((rightItem, index) => (
              <div
                key={rightItem}
                className={getRightItemStyles(rightItem)}
                onClick={() => handleRightItemClick(rightItem)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <div className="flex-1">
                    <LaTeXRenderer
                      content={rightItem}
                      className="right-item-content"
                      showErrorDetails={false}
                      cleanContent={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current pairs display */}
      {localPairs.length > 0 && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-medium text-gray-800 mb-2">Các cặp đã ghép:</div>
              <div className="space-y-1">
                {localPairs.map((pair, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {showAnswers && (
                      isPairCorrect(pair) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )
                    )}
                    <span className="text-gray-700">
                      {leftItems.indexOf(pair.left) + 1} ↔ {String.fromCharCode(65 + shuffledRight.indexOf(pair.right))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correct answers display */}
      {showAnswers && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-2">Đáp án đúng:</div>
              <div className="space-y-1">
                {correctPairs.map((pair, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-blue-800">
                      {leftItems.indexOf(pair.left) + 1} ↔ {String.fromCharCode(65 + shuffledRight.indexOf(pair.right))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive mode instructions */}
      {interactive && !showAnswers && (
        <div className="text-sm text-muted-foreground text-center py-2">
          {selectedLeft ? (
            <span className="text-blue-600">Chọn một mục ở cột B để ghép với &quot;{selectedLeft}&quot;</span>
          ) : (
            'Chọn một mục ở cột A, sau đó chọn mục tương ứng ở cột B'
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Matching Preview Component
 * Compact preview cho lists
 */
export function MatchingPreview({
  correctPairs,
  className = ''
}: {
  correctPairs: MatchingPair[];
  className?: string;
}) {
  return (
    <div className={`matching-preview ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="text-xs">MA</Badge>
        <span>Ghép đôi</span>
        <span>•</span>
        <span>{correctPairs.length} cặp</span>
      </div>
    </div>
  );
}
