/**
 * Version Compare Modal Component
 * Modal để so sánh 2 versions side-by-side
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { QuestionVersion } from './version-timeline-item';
import { GitCompare } from 'lucide-react';

// ===== TYPES =====

export interface VersionCompareModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** First version to compare */
  version1: QuestionVersion;
  /** Second version to compare */
  version2: QuestionVersion;
  /** Callback when modal closes */
  onClose: () => void;
}

// ===== HELPER FUNCTIONS =====

/**
 * Simple diff highlighting (basic implementation)
 * TODO: Use proper diff library like diff-match-patch
 */
function highlightDiff(text1: string, text2: string): {
  text1: JSX.Element[];
  text2: JSX.Element[];
} {
  // Basic word-level diff
  const words1 = text1.split(/(\s+)/);
  const words2 = text2.split(/(\s+)/);
  
  const highlighted1: JSX.Element[] = [];
  const highlighted2: JSX.Element[] = [];
  
  words1.forEach((word, i) => {
    if (!words2.includes(word)) {
      highlighted1.push(
        <span key={i} className="bg-red-200 dark:bg-red-900/50">
          {word}
        </span>
      );
    } else {
      highlighted1.push(<span key={i}>{word}</span>);
    }
  });
  
  words2.forEach((word, i) => {
    if (!words1.includes(word)) {
      highlighted2.push(
        <span key={i} className="bg-green-200 dark:bg-green-900/50">
          {word}
        </span>
      );
    } else {
      highlighted2.push(<span key={i}>{word}</span>);
    }
  });
  
  return { text1: highlighted1, text2: highlighted2 };
}

// ===== MAIN COMPONENT =====

/**
 * Version Compare Modal Component
 * So sánh 2 versions side-by-side với diff highlighting
 * 
 * @example
 * ```tsx
 * <VersionCompareModal
 *   isOpen={showCompare}
 *   version1={oldVersion}
 *   version2={newVersion}
 *   onClose={() => setShowCompare(false)}
 * />
 * ```
 */
export function VersionCompareModal({
  isOpen,
  version1,
  version2,
  onClose,
}: VersionCompareModalProps) {
  const diff = highlightDiff(version1.content, version2.content);
  
  // Determine which is older
  const isVersion1Older = version1.versionNumber < version2.versionNumber;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b dark:border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GitCompare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>So sánh phiên bản</DialogTitle>
              <DialogDescription>
                So sánh thay đổi giữa các phiên bản
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 divide-x dark:divide-border h-[calc(90vh-120px)] overflow-hidden">
          {/* Version 1 (Left) */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b dark:border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Version {version1.versionNumber}</h3>
                {isVersion1Older && (
                  <Badge variant="outline" className="text-xs">
                    Cũ hơn
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(version1.changedAt).toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Bởi {version1.changedByName || 'Unknown'}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap break-words">
                  {diff.text1}
                </div>
              </div>
            </div>
          </div>

          {/* Version 2 (Right) */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b dark:border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Version {version2.versionNumber}</h3>
                {!isVersion1Older && (
                  <Badge variant="default" className="text-xs">
                    Mới hơn
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(version2.changedAt).toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Bởi {version2.changedByName || 'Unknown'}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap break-words">
                  {diff.text2}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t dark:border-border bg-muted/20">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 dark:bg-red-900/50 rounded" />
              <span>Đã xóa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 dark:bg-green-900/50 rounded" />
              <span>Đã thêm</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===== EXPORTS =====
export default VersionCompareModal;

