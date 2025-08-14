/**
 * Solution LaTeX Display Component
 * Specialized component cho hiển thị solution content với LaTeX
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { LaTeXRenderer } from './LaTeXRenderer';
import { Button, Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
import { Eye, EyeOff, CheckCircle, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Props cho Solution LaTeX Display
 */
interface SolutionLaTeXDisplayProps {
  /** Solution content với LaTeX */
  solution: string;
  /** Explanation content (optional) */
  explanation?: string;
  /** Show solution by default */
  defaultVisible?: boolean;
  /** Enable collapsible behavior */
  collapsible?: boolean;
  /** Solution title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show step-by-step indicator */
  showSteps?: boolean;
}

/**
 * Solution LaTeX Display Component
 * Hiển thị solution với LaTeX rendering và interactive features
 */
export function SolutionLaTeXDisplay({
  solution,
  explanation,
  defaultVisible = false,
  collapsible = true,
  title = 'Lời giải',
  className = '',
  showSteps = true
}: SolutionLaTeXDisplayProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  /**
   * Parse solution thành steps nếu có structure
   */
  const parseSolutionSteps = (content: string) => {
    // Tìm các bước giải (patterns: "Bước 1:", "Step 1:", "1)", etc.)
    const stepPatterns = [
      /(?:Bước|Step)\s*(\d+)[:\.]?\s*/gi,
      /^(\d+)\)\s*/gm,
      /^(\d+)\.\s*/gm
    ];
    
    let steps: string[] = [];
    
    for (const pattern of stepPatterns) {
      const matches = Array.from(content.matchAll(pattern));
      if (matches.length > 1) {
        // Split content by steps
        const parts = content.split(pattern);
        steps = parts.slice(1).map((part, index) => {
          const stepNumber = matches[index]?.[1] || (index + 1).toString();
          return `**Bước ${stepNumber}:** ${part.trim()}`;
        });
        break;
      }
    }
    
    return steps.length > 0 ? steps : [content];
  };

  const solutionSteps = showSteps ? parseSolutionSteps(solution) : [solution];

  /**
   * Toggle solution visibility
   */
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Handle empty solution
  if (!solution?.trim()) {
    return (
      <div className={`solution-latex-empty ${className}`}>
        <div className="flex items-center gap-2 text-gray-400 p-3 border rounded-lg bg-gray-50">
          <BookOpen className="h-4 w-4" />
          <span className="italic">Chưa có lời giải</span>
        </div>
      </div>
    );
  }

  // Non-collapsible version
  if (!collapsible) {
    return (
      <div className={`solution-latex-display ${className}`}>
        <div className="solution-header mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-700">{title}</h4>
          </div>
        </div>
        
        <div className="solution-content space-y-4">
          {solutionSteps.map((step, index) => (
            <div key={index} className="solution-step">
              <LaTeXRenderer
                content={step}
                className="solution-latex-content"
                showErrorDetails={true}
                cleanContent={true}
              />
            </div>
          ))}
          
          {explanation && (
            <div className="solution-explanation mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="explanation-header mb-2">
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Giải thích
                </Badge>
              </div>
              <LaTeXRenderer
                content={explanation}
                className="explanation-content text-blue-800"
                showErrorDetails={true}
                cleanContent={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Collapsible version
  return (
    <div className={`solution-latex-collapsible ${className}`}>
      <Collapsible open={isVisible} onOpenChange={setIsVisible}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between solution-toggle"
            onClick={toggleVisibility}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">{title}</span>
              {isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </div>
            {isVisible ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="solution-content-wrapper">
          <div className="solution-content mt-3 p-4 border rounded-lg bg-green-50">
            <div className="space-y-4">
              {solutionSteps.map((step, index) => (
                <div key={index} className="solution-step">
                  <LaTeXRenderer
                    content={step}
                    className="solution-latex-content"
                    showErrorDetails={true}
                    cleanContent={true}
                  />
                </div>
              ))}
              
              {explanation && (
                <div className="solution-explanation mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="explanation-header mb-2">
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Giải thích
                    </Badge>
                  </div>
                  <LaTeXRenderer
                    content={explanation}
                    className="explanation-content text-blue-800"
                    showErrorDetails={true}
                    cleanContent={true}
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Compact Solution Preview
 * Cho solution preview trong lists
 */
export function SolutionPreview({
  solution,
  maxLength = 100,
  className = ''
}: {
  solution: string;
  maxLength?: number;
  className?: string;
}) {
  if (!solution?.trim()) return null;
  
  const truncatedSolution = solution.length > maxLength 
    ? solution.substring(0, maxLength) + '...'
    : solution;

  return (
    <div className={`solution-preview ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        <span className="text-xs font-medium text-green-700">Có lời giải</span>
      </div>
      <LaTeXRenderer
        content={truncatedSolution}
        className="solution-preview-content text-sm text-gray-600"
        showErrorDetails={false}
        cleanContent={true}
      />
    </div>
  );
}
