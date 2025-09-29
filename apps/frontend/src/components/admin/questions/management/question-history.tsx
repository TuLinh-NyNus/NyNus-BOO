/**
 * Question History Component
 * Comprehensive history tracking và version management
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  ScrollArea,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  History,
  Clock,
  User,
  GitBranch,
  RotateCcw,
  Eye,
  // Compare, // Not available in lucide-react
  Download,
  Tag,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Edit,
  AlertTriangle
} from "lucide-react";

// Import types và utilities
import {
  QuestionVersion,
  QuestionHistory,
  VersionComparisonResult,
  compareQuestionVersions,
  formatVersionForDisplay
} from "@/lib/utils/question-versioning";

// Note: restoreQuestionToVersion is handled via onVersionRestore callback
import { Question } from "@/types/question";

// ===== TYPES =====

export interface QuestionHistoryProps {
  questionId: string;
  history: QuestionHistory;
  currentQuestion: Question;
  onVersionRestore?: (version: QuestionVersion) => void;
  onVersionCompare?: (fromVersion: QuestionVersion, toVersion: QuestionVersion) => void;
  onVersionView?: (version: QuestionVersion) => void;
  userRole?: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  className?: string;
}

// ===== MAIN COMPONENT =====

export function QuestionHistoryComponent({
  questionId,
  history,
  currentQuestion,
  onVersionRestore,
  onVersionCompare,
  onVersionView,
  userRole = "GUEST",
  className = ""
}: QuestionHistoryProps) {
  // ===== STATE =====
  
  const [selectedVersions, setSelectedVersions] = useState<QuestionVersion[]>([]);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<QuestionVersion | null>(null);
  const [comparisonResult, setComparisonResult] = useState<VersionComparisonResult | null>(null);
  
  // ===== COMPUTED VALUES =====
  
  const sortedVersions = useMemo(() => 
    [...history.versions].sort((a, b) => b.version - a.version),
    [history.versions]
  );
  
  const canRestore = userRole === 'TEACHER' || userRole === 'ADMIN';
  const canCompare = selectedVersions.length === 2;

  // Current version info
  const currentVersionInfo = useMemo(() => {
    if (!currentQuestion) return null;
    return {
      id: questionId,
      version: 'current', // Version property not available in Question type
      content: currentQuestion.content,
      lastModified: currentQuestion.updatedAt || new Date().toISOString()
    };
  }, [questionId, currentQuestion]);
  
  // ===== HANDLERS =====
  
  const handleVersionSelect = (version: QuestionVersion) => {
    setSelectedVersions(prev => {
      const isSelected = prev.some(v => v.id === version.id);
      if (isSelected) {
        return prev.filter(v => v.id !== version.id);
      } else {
        return prev.length >= 2 ? [prev[1], version] : [...prev, version];
      }
    });
  };
  
  const handleVersionExpand = (versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };
  
  const handleRestoreRequest = (version: QuestionVersion) => {
    setRestoreTarget(version);
    setShowRestoreDialog(true);
  };
  
  const handleRestoreConfirm = () => {
    if (restoreTarget) {
      onVersionRestore?.(restoreTarget);
      setShowRestoreDialog(false);
      setRestoreTarget(null);
    }
  };
  
  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      const [newer, older] = selectedVersions.sort((a, b) => b.version - a.version);
      const result = compareQuestionVersions(older, newer);
      setComparisonResult(result);
      onVersionCompare?.(older, newer);
    }
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Get change type color
   */
  const getChangeTypeColor = (changeType: string) => {
    const colorMap = {
      'create': 'bg-green-100 text-green-800',
      'content_change': 'bg-blue-100 text-blue-800',
      'answer_change': 'bg-purple-100 text-purple-800',
      'metadata_change': 'bg-yellow-100 text-yellow-800',
      'status_change': 'bg-orange-100 text-orange-800',
      'bulk_update': 'bg-gray-100 text-gray-800',
      'update': 'bg-gray-100 text-gray-800'
    };
    return colorMap[changeType as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };
  
  /**
   * Render version item
   */
  const renderVersionItem = (version: QuestionVersion, index: number) => {
    const isSelected = selectedVersions.some(v => v.id === version.id);
    const isExpanded = expandedVersions.has(version.id);
    const isLatest = index === 0;
    const formatted = formatVersionForDisplay(version);
    
    return (
      <div
        key={version.id}
        className={`border rounded-lg p-4 transition-colors ${
          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        {/* Version header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleVersionSelect(version)}
              className="rounded"
            />
            
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatted.title}</span>
              {isLatest && (
                <Badge variant="default" className="text-xs">
                  Hiện tại
                </Badge>
              )}
            </div>
            
            <Badge className={`text-xs ${getChangeTypeColor(version.changeType)}`}>
              {formatted.subtitle}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVersionView?.(version)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {canRestore && !isLatest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestoreRequest(version)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVersionExpand(version.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Version metadata */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{version.createdBy}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatted.timestamp}</span>
          </div>
          
          {version.comment && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span className="italic">&quot;{version.comment}&quot;</span>
            </div>
          )}
        </div>
        
        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            <Separator />
            
            {/* Changes list */}
            <div>
              <h4 className="font-medium text-sm mb-2">Thay đổi ({version.changes.length})</h4>
              <div className="space-y-1">
                {version.changes.map((change, changeIndex) => {
                  const ChangeIcon = change.changeType === 'add' ? Plus :
                                   change.changeType === 'remove' ? Minus : Edit;
                  const changeColor = change.changeType === 'add' ? 'text-green-600' :
                                    change.changeType === 'remove' ? 'text-red-600' : 'text-blue-600';
                  
                  return (
                    <div key={changeIndex} className="flex items-center gap-2 text-sm">
                      <ChangeIcon className={`h-3 w-3 ${changeColor}`} />
                      <span className="font-mono text-xs bg-muted px-1 rounded">
                        {change.field}
                      </span>
                      <span className="text-muted-foreground">
                        {change.changeType === 'add' ? 'Thêm' :
                         change.changeType === 'remove' ? 'Xóa' : 'Sửa'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Tags */}
            {version.tags && version.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Thẻ</h4>
                <div className="flex flex-wrap gap-1">
                  {version.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <Card className={`question-history ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <span>Lịch sử thay đổi</span>
            <Badge variant="outline">
              {history.totalVersions} phiên bản
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {canCompare && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompareVersions}
                disabled={!canCompare}
              >
                <GitBranch className="h-4 w-4 mr-1" />
                So sánh
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Export history */}}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Selection info */}
        {selectedVersions.length > 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Đã chọn {selectedVersions.length} phiên bản.
              {selectedVersions.length === 2 && " Nhấn 'So sánh' để xem khác biệt."}
              {selectedVersions.length === 1 && " Chọn thêm 1 phiên bản để so sánh."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Comparison result */}
        {comparisonResult && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">
                So sánh phiên bản {comparisonResult.fromVersion.version} → {comparisonResult.toVersion.version}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div><strong>Tổng thay đổi:</strong> {comparisonResult.summary.totalChanges}</div>
                <div><strong>Nội dung:</strong> {comparisonResult.summary.contentChanged ? 'Có thay đổi' : 'Không đổi'}</div>
                <div><strong>Đáp án:</strong> {comparisonResult.summary.answersChanged ? 'Có thay đổi' : 'Không đổi'}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setComparisonResult(null)}
              >
                Đóng
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current version info */}
        {currentVersionInfo && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary">Phiên bản hiện tại</h4>
                <p className="text-sm text-muted-foreground">
                  ID: {currentVersionInfo.id} | Version: {currentVersionInfo.version}
                </p>
              </div>
              <Badge variant="default">Current</Badge>
            </div>
          </div>
        )}

        {/* Versions list */}
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {sortedVersions.map((version, index) =>
              renderVersionItem(version, index)
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Restore confirmation dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận khôi phục phiên bản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khôi phục câu hỏi về phiên bản {restoreTarget?.version}?
              Hành động này sẽ tạo một phiên bản mới với nội dung từ phiên bản được chọn.
            </DialogDescription>
          </DialogHeader>
          
          {restoreTarget && (
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Phiên bản:</strong> {restoreTarget.version}
              </div>
              <div className="text-sm">
                <strong>Ngày tạo:</strong> {new Date(restoreTarget.createdAt).toLocaleString('vi-VN')}
              </div>
              <div className="text-sm">
                <strong>Người tạo:</strong> {restoreTarget.createdBy}
              </div>
              {restoreTarget.comment && (
                <div className="text-sm">
                  <strong>Ghi chú:</strong> {restoreTarget.comment}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleRestoreConfirm}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Khôi phục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact history view
 */
export function CompactQuestionHistory(props: QuestionHistoryProps) {
  return (
    <QuestionHistoryComponent
      {...props}
      className={`compact-history ${props.className || ''}`}
    />
  );
}

/**
 * Read-only history view
 */
export function ReadOnlyQuestionHistory(props: Omit<QuestionHistoryProps, 'onVersionRestore'>) {
  return (
    <QuestionHistoryComponent
      {...props}
      onVersionRestore={undefined}
      userRole="GUEST"
    />
  );
}
