/**
 * MapCode Display Component
 * Hiển thị QuestionCode với breakdown chi tiết các components
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { cn } from '@/lib/utils';
import { parseQuestionCode, MAPCODE_CONFIG } from '@/lib/utils/question-code';
import { QuestionCode } from '@/lib/types/question';
import { Copy, AlertCircle } from 'lucide-react';

// ===== INTERFACES =====

export interface MapCodeDisplayProps {
  /** QuestionCode string để hiển thị */
  code: string;
  /** Layout mode */
  layout?: 'card' | 'inline' | 'compact';
  /** Hiển thị header */
  showHeader?: boolean;
  /** Hiển thị copy button */
  showCopyButton?: boolean;
  /** Hiển thị breakdown details */
  showBreakdown?: boolean;
  /** Custom className */
  className?: string;
  /** Copy success callback */
  onCopy?: (code: string) => void;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get label cho component value
 */
function getComponentLabel(type: keyof typeof MAPCODE_CONFIG, value: string): string {
  const config = MAPCODE_CONFIG[type] as Record<string, string>;
  return config[value] || `Không xác định (${value})`;
}

/**
 * Component type definition
 */
type ComponentType = 'grades' | 'subjects' | 'chapters' | 'levels' | 'lessons' | 'forms';

/**
 * Copy to clipboard
 */
async function copyToClipboard(text: string, onCopy?: (code: string) => void) {
  try {
    await navigator.clipboard.writeText(text);
    onCopy?.(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}

// ===== COMPONENT BREAKDOWN =====

function MapCodeBreakdown({ parsed }: { parsed: QuestionCode }) {
  if (!parsed.isValid) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{parsed.error}</span>
      </div>
    );
  }

  const components: Array<{ label: string; value: string; type: ComponentType; position: number }> = [
    { label: 'Lớp', value: parsed.grade, type: 'grades', position: 1 },
    { label: 'Môn', value: parsed.subject, type: 'subjects', position: 2 },
    { label: 'Chương', value: parsed.chapter, type: 'chapters', position: 3 },
    { label: 'Mức độ', value: parsed.level, type: 'levels', position: 4 },
    { label: 'Bài', value: parsed.lesson, type: 'lessons', position: 5 },
  ];

  if (parsed.form && parsed.format === 'ID6') {
    components.push({ label: 'Dạng', value: parsed.form, type: 'forms', position: 6 });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {components.map((component) => (
          <div key={component.position} className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Pos {component.position}
              </Badge>
              <span className="text-sm font-medium text-gray-600">
                {component.label}
              </span>
            </div>
            <div className="space-y-1">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                {component.value}
              </Badge>
              <p className="text-xs text-gray-500">
                {getComponentLabel(component.type, component.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Format:</span>
        <Badge variant={parsed.format === 'ID6' ? 'default' : 'secondary'}>
          {parsed.format}
        </Badge>
      </div>
    </div>
  );
}

// ===== LAYOUT VARIANTS =====

function CardLayout({ 
  code, 
  parsed, 
  showHeader, 
  showCopyButton, 
  showBreakdown, 
  className,
  onCopy 
}: {
  code: string;
  parsed: QuestionCode;
  showHeader?: boolean;
  showCopyButton?: boolean;
  showBreakdown?: boolean;
  className?: string;
  onCopy?: (code: string) => void;
}) {
  return (
    <Card className={cn('w-full', className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">MapCode Details</CardTitle>
              <CardDescription>Chi tiết phân tích mã câu hỏi</CardDescription>
            </div>
            {showCopyButton && (
              <button
                onClick={() => copyToClipboard(code, onCopy)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Copy MapCode"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Code:</span>
          <Badge className="font-mono text-base px-3 py-1">
            {code}
          </Badge>
          {!showHeader && showCopyButton && (
            <button
              onClick={() => copyToClipboard(code, onCopy)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy MapCode"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
        
        {showBreakdown && <MapCodeBreakdown parsed={parsed} />}
      </CardContent>
    </Card>
  );
}

function InlineLayout({ 
  code, 
  parsed, 
  showCopyButton, 
  showBreakdown, 
  className,
  onCopy 
}: {
  code: string;
  parsed: QuestionCode;
  showCopyButton?: boolean;
  showBreakdown?: boolean;
  className?: string;
  onCopy?: (code: string) => void;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Badge className="font-mono text-sm px-3 py-1.5">
          {code}
        </Badge>
        {showCopyButton && (
          <button
            onClick={() => copyToClipboard(code, onCopy)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy MapCode"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {showBreakdown && <MapCodeBreakdown parsed={parsed} />}
    </div>
  );
}

function CompactLayout({ 
  code, 
  parsed, 
  showCopyButton, 
  className,
  onCopy 
}: {
  code: string;
  parsed: QuestionCode;
  showCopyButton?: boolean;
  className?: string;
  onCopy?: (code: string) => void;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge 
        className="font-mono text-xs px-2 py-1"
        variant={parsed.isValid ? 'default' : 'destructive'}
        title={parsed.isValid ? `Format: ${parsed.format}` : parsed.error}
      >
        {code}
      </Badge>
      {showCopyButton && (
        <button
          onClick={() => copyToClipboard(code, onCopy)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Copy MapCode"
        >
          <Copy className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export function MapCodeDisplay({
  code,
  layout = 'card',
  showHeader = true,
  showCopyButton = true,
  showBreakdown = true,
  className,
  onCopy,
}: MapCodeDisplayProps) {
  // Parse QuestionCode
  const parsed = parseQuestionCode(code);
  
  // Render based on layout
  switch (layout) {
    case 'inline':
      return (
        <InlineLayout
          code={code}
          parsed={parsed}
          showCopyButton={showCopyButton}
          showBreakdown={showBreakdown}
          className={className}
          onCopy={onCopy}
        />
      );
    
    case 'compact':
      return (
        <CompactLayout
          code={code}
          parsed={parsed}
          showCopyButton={showCopyButton}
          className={className}
          onCopy={onCopy}
        />
      );
    
    default:
      return (
        <CardLayout
          code={code}
          parsed={parsed}
          showHeader={showHeader}
          showCopyButton={showCopyButton}
          showBreakdown={showBreakdown}
          className={className}
          onCopy={onCopy}
        />
      );
  }
}

// ===== EXPORTS =====

export default MapCodeDisplay;
