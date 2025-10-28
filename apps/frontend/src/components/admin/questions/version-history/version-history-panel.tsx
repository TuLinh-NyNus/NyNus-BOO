/**
 * Version History Panel Component
 * Panel hiển thị toàn bộ version history của câu hỏi
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  History,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VersionTimelineItem, QuestionVersion } from './version-timeline-item';
import { VersionCompareModal } from './version-compare-modal';
import { VersionRevertDialog } from './version-revert-dialog';

// ===== TYPES =====

export interface VersionHistoryPanelProps {
  /** Whether panel is open */
  isOpen: boolean;
  /** Question ID */
  questionId: string;
  /** Current version number */
  currentVersion: number;
  /** Callback when panel closes */
  onClose: () => void;
  /** Callback when version reverted */
  onVersionRevert?: (versionNumber: number) => Promise<void>;
  /** Custom className */
  className?: string;
}

// ===== MOCK DATA =====
// TODO: Replace with real API data

const MOCK_VERSIONS: QuestionVersion[] = [
  {
    id: 'v5',
    versionNumber: 5,
    questionId: 'q123',
    content: 'Tính giá trị biểu thức $\\sqrt{16} + 3^2$',
    changedBy: 'user-1',
    changedByName: 'Nguyễn Văn A',
    changeReason: 'Sửa công thức LaTeX',
    changedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isCurrent: true,
  },
  {
    id: 'v4',
    versionNumber: 4,
    questionId: 'q123',
    content: 'Tính giá trị biểu thức $\\sqrt{16} + 3^2$',
    changedBy: 'user-2',
    changedByName: 'Trần Thị B',
    changeReason: 'Cập nhật đáp án',
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'v3',
    versionNumber: 3,
    questionId: 'q123',
    content: 'Tính $\\sqrt{16} + 3^2$',
    changedBy: 'user-1',
    changedByName: 'Nguyễn Văn A',
    changeReason: 'Rút gọn đề bài',
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'v2',
    versionNumber: 2,
    questionId: 'q123',
    content: 'Tính giá trị của biểu thức toán học $\\sqrt{16} + 3^2$',
    changedBy: 'user-3',
    changedByName: 'Lê Văn C',
    changeReason: 'Sửa chính tả',
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: 'v1',
    versionNumber: 1,
    questionId: 'q123',
    content: 'Tính giá tri cua biểu thức $\\sqrt{16} + 3^2$',
    changedBy: 'user-1',
    changedByName: 'Nguyễn Văn A',
    changeReason: 'Tạo câu hỏi mới',
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
  },
];

// ===== MAIN COMPONENT =====

/**
 * Version History Panel Component
 * Side panel với timeline của tất cả versions
 * 
 * @example
 * ```tsx
 * <VersionHistoryPanel
 *   isOpen={showPanel}
 *   questionId="q123"
 *   currentVersion={5}
 *   onClose={() => setShowPanel(false)}
 *   onVersionRevert={handleRevert}
 * />
 * ```
 */
export function VersionHistoryPanel({
  isOpen,
  questionId: _questionId,
  currentVersion,
  onClose,
  onVersionRevert,
  className,
}: VersionHistoryPanelProps) {
  // ===== STATE =====
  const [versions] = useState<QuestionVersion[]>(MOCK_VERSIONS);
  const [isLoading] = useState(false);
  const [selectedVersionForCompare, setSelectedVersionForCompare] = useState<QuestionVersion | null>(null);
  const [selectedVersionForRevert, setSelectedVersionForRevert] = useState<QuestionVersion | null>(null);
  const [isReverting, setIsReverting] = useState(false);

  // ===== HANDLERS =====
  const handlePreview = (version: QuestionVersion) => {
    // TODO: Implement preview modal
    console.log('Preview version:', version);
  };

  const handleCompare = (version: QuestionVersion) => {
    setSelectedVersionForCompare(version);
  };

  const handleRevert = (version: QuestionVersion) => {
    setSelectedVersionForRevert(version);
  };

  const handleConfirmRevert = async (_reason: string) => {
    if (!selectedVersionForRevert) return;

    setIsReverting(true);
    try {
      if (onVersionRevert) {
        await onVersionRevert(selectedVersionForRevert.versionNumber);
      }
      setSelectedVersionForRevert(null);
      // TODO: Refresh versions list
    } catch (error) {
      console.error('Revert error:', error);
    } finally {
      setIsReverting(false);
    }
  };

  const handleRefresh = () => {
    // TODO: Implement refresh
    console.log('Refresh versions');
  };

  // ===== RENDER =====
  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className={cn('w-full sm:max-w-2xl overflow-y-auto', className)}
        >
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle>Lịch sử phiên bản</SheetTitle>
                  <SheetDescription>
                    Xem và quản lý các phiên bản của câu hỏi
                  </SheetDescription>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </SheetHeader>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Tổng phiên bản</p>
              <p className="text-2xl font-bold">{versions.length}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Phiên bản hiện tại</p>
              <p className="text-2xl font-bold">v{currentVersion}</p>
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Mỗi lần chỉnh sửa sẽ tạo một phiên bản mới. Bạn có thể xem, so sánh và khôi phục bất kỳ phiên bản nào.
            </AlertDescription>
          </Alert>

          {/* Timeline */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-0">
              {versions.map((version, index) => (
                <VersionTimelineItem
                  key={version.id}
                  version={version}
                  isCurrent={version.versionNumber === currentVersion}
                  isFirst={index === versions.length - 1}
                  isLast={index === 0}
                  onPreview={handlePreview}
                  onCompare={handleCompare}
                  onRevert={handleRevert}
                  disableRevert={isReverting}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && versions.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Chưa có lịch sử phiên bản</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Compare Modal */}
      {selectedVersionForCompare && (
        <VersionCompareModal
          isOpen={!!selectedVersionForCompare}
          version1={selectedVersionForCompare}
          version2={versions.find(v => v.versionNumber === currentVersion)!}
          onClose={() => setSelectedVersionForCompare(null)}
        />
      )}

      {/* Revert Dialog */}
      {selectedVersionForRevert && (
        <VersionRevertDialog
          isOpen={!!selectedVersionForRevert}
          version={selectedVersionForRevert}
          currentVersion={currentVersion}
          onClose={() => setSelectedVersionForRevert(null)}
          onConfirm={handleConfirmRevert}
          isLoading={isReverting}
        />
      )}
    </>
  );
}

// ===== EXPORTS =====
export default VersionHistoryPanel;

