/**
 * MapCode Tooltip Component
 * Tooltip system cho MapCode với examples và help
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { cn } from '@/lib/utils';
import { parseQuestionCode, MAPCODE_CONFIG } from '@/lib/utils/question-code';
import { HelpCircle, BookOpen, Code, AlertCircle } from 'lucide-react';

// ===== INTERFACES =====

export interface MapCodeTooltipProps {
  /** QuestionCode string để hiển thị tooltip */
  code?: string;
  /** Trigger element */
  children: React.ReactNode;
  /** Tooltip mode */
  mode?: 'hover' | 'click' | 'focus';
  /** Tooltip position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Show examples */
  showExamples?: boolean;
  /** Show help guide */
  showHelp?: boolean;
  /** Custom className */
  className?: string;
}

// ===== TOOLTIP CONTENT =====

function MapCodeTooltipContent({ 
  code, 
  showExamples = true, 
  showHelp = true 
}: { 
  code?: string; 
  showExamples?: boolean; 
  showHelp?: boolean; 
}) {
  const parsed = code ? parseQuestionCode(code) : null;

  return (
    <Card className="w-80 max-w-sm border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Code className="h-4 w-4" />
          MapCode System
        </CardTitle>
        <CardDescription className="text-xs">
          Hệ thống phân loại câu hỏi NyNus
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Code Analysis */}
        {code && parsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Mã hiện tại:</span>
              <Badge className="font-mono text-xs">
                {code}
              </Badge>
            </div>
            
            {parsed.isValid ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Lớp:</span>
                  <span className="ml-1 font-medium">
                    {MAPCODE_CONFIG.grades[parsed.grade as keyof typeof MAPCODE_CONFIG.grades] || parsed.grade}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Môn:</span>
                  <span className="ml-1 font-medium">
                    {MAPCODE_CONFIG.subjects[parsed.subject as keyof typeof MAPCODE_CONFIG.subjects] || parsed.subject}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Chương:</span>
                  <span className="ml-1 font-medium">
                    {MAPCODE_CONFIG.chapters[parsed.chapter as keyof typeof MAPCODE_CONFIG.chapters] || parsed.chapter}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Mức độ:</span>
                  <span className="ml-1 font-medium">
                    {MAPCODE_CONFIG.levels[parsed.level as keyof typeof MAPCODE_CONFIG.levels] || parsed.level}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">{parsed.error}</span>
              </div>
            )}
            
            <Separator />
          </div>
        )}

        {/* Format Examples */}
        {showExamples && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              <span className="text-xs font-medium">Ví dụ Format:</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs">
                  0P1N1
                </Badge>
                <span className="text-xs text-gray-500">ID5 Format</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs">
                  0P1N1-2
                </Badge>
                <span className="text-xs text-gray-500">ID6 Format</span>
              </div>
            </div>
            
            <Separator />
          </div>
        )}

        {/* Help Guide */}
        {showHelp && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-3 w-3" />
              <span className="text-xs font-medium">Cấu trúc:</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-6 gap-1 font-mono text-center">
                <div className="bg-blue-50 text-blue-700 p-1 rounded">G</div>
                <div className="bg-green-50 text-green-700 p-1 rounded">S</div>
                <div className="bg-yellow-50 text-yellow-700 p-1 rounded">C</div>
                <div className="bg-purple-50 text-purple-700 p-1 rounded">L</div>
                <div className="bg-pink-50 text-pink-700 p-1 rounded">Le</div>
                <div className="bg-gray-50 text-gray-700 p-1 rounded">F</div>
              </div>
              <div className="grid grid-cols-6 gap-1 text-center text-[10px] text-gray-500">
                <div>Lớp</div>
                <div>Môn</div>
                <div>Chương</div>
                <div>Mức độ</div>
                <div>Bài</div>
                <div>Dạng*</div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                * Dạng chỉ có trong ID6 format
              </p>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="font-medium">Mức độ:</div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>N: Nhận biết</div>
                <div>H: Thông hiểu</div>
                <div>V: Vận dụng</div>
                <div>C: Vận dụng cao</div>
                <div>T: VIP</div>
                <div>M: Note</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== MAIN COMPONENT =====

export function MapCodeTooltip({
  code,
  children,
  mode = 'hover',
  position = 'top',
  showExamples = true,
  showHelp = true,
  className,
}: MapCodeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Handle show/hide logic
  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 150); // Small delay to allow mouse movement to tooltip
    setTimeoutId(id);
  };

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  // Event handlers based on mode
  const getEventHandlers = () => {
    switch (mode) {
      case 'click':
        return {
          onClick: toggleTooltip,
        };
      case 'focus':
        return {
          onFocus: showTooltip,
          onBlur: hideTooltip,
        };
      default: // hover
        return {
          onMouseEnter: showTooltip,
          onMouseLeave: hideTooltip,
        };
    }
  };

  // Position classes
  const getPositionClasses = () => {
    const base = 'absolute z-50';
    switch (position) {
      case 'bottom':
        return `${base} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${base} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${base} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default: // top
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Trigger Element */}
      <div {...getEventHandlers()}>
        {children}
      </div>

      {/* Tooltip Content */}
      {isVisible && (
        <div 
          className={getPositionClasses()}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <MapCodeTooltipContent 
            code={code}
            showExamples={showExamples}
            showHelp={showHelp}
          />
        </div>
      )}
    </div>
  );
}

// ===== COMPONENT VARIANTS =====

/**
 * Simple MapCode Tooltip - chỉ hiển thị basic info
 */
export function SimpleMapCodeTooltip({ 
  code, 
  children, 
  ...props 
}: Omit<MapCodeTooltipProps, 'showExamples' | 'showHelp'>) {
  return (
    <MapCodeTooltip
      code={code}
      showExamples={false}
      showHelp={false}
      {...props}
    >
      {children}
    </MapCodeTooltip>
  );
}

/**
 * Help MapCode Tooltip - focus on help và examples
 */
export function HelpMapCodeTooltip({ 
  children, 
  ...props 
}: Omit<MapCodeTooltipProps, 'code' | 'showExamples' | 'showHelp'>) {
  return (
    <MapCodeTooltip
      showExamples={true}
      showHelp={true}
      {...props}
    >
      {children}
    </MapCodeTooltip>
  );
}

// ===== EXPORTS =====

export default MapCodeTooltip;
