/**
 * Bulk Operation Dialog Component
 * Advanced dialog cho bulk operations với parameters và preview
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  // Textarea,
  Checkbox,
  Badge,
  Alert,
  AlertDescription,
  Progress,
} from "@/components/ui";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  // FileText,
  Tag as TagIcon
} from "lucide-react";

// Import types
import {
  BulkOperationType,
  BulkOperationResult,
  BulkOperationProgress,
  getOperationDisplayName,
  validateBulkOperationRequest
} from "@/lib/utils/bulk-operation-utils";
import { Question } from "@/types/question";

// ===== TYPES =====

interface BulkOperationParameters extends Record<string, unknown> {
  // Status change parameters
  newStatus?: string;

  // Export parameters
  format?: string;
  includeAnswers?: boolean;
  includeSolutions?: boolean;
  includeMetadata?: boolean;

  // Tag assignment parameters
  tagsInput?: string;
  tags?: string[];

  // Move category parameters
  targetCategoryId?: string;
}

export interface BulkOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  operationType: BulkOperationType;
  selectedQuestions: Question[];
  onExecute: (type: BulkOperationType, parameters: Record<string, unknown>) => Promise<BulkOperationResult>;
}

// ===== CONSTANTS =====

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word Document' },
  { value: 'xlsx', label: 'Excel Spreadsheet' },
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' }
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Không hoạt động' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'ARCHIVED', label: 'Lưu trữ' }
];

// ===== MAIN COMPONENT =====

export function BulkOperationDialog({
  isOpen,
  onClose,
  operationType,
  selectedQuestions,
  onExecute
}: BulkOperationDialogProps) {
  // ===== STATE =====
  
  const [parameters, setParameters] = useState<BulkOperationParameters>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const [result, setResult] = useState<BulkOperationResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // ===== COMPUTED VALUES =====
  
  const operationName = getOperationDisplayName(operationType);
  const selectedCount = selectedQuestions.length;
  
  // ===== HANDLERS =====
  
  /**
   * Handle parameter change
   */
  const handleParameterChange = (key: string, value: unknown) => {
    setParameters(prev => ({ ...prev, [key]: value }));
    setValidationErrors([]); // Clear validation errors when parameters change
  };
  
  /**
   * Validate parameters
   */
  const validateParameters = (): boolean => {
    const request = {
      type: operationType,
      questionIds: selectedQuestions.map(q => q.id),
      parameters
    };
    
    const validation = validateBulkOperationRequest(request);
    setValidationErrors(validation.errors);
    
    return validation.isValid;
  };
  
  /**
   * Handle execute operation
   */
  const handleExecute = async () => {
    if (!validateParameters()) return;
    
    setIsExecuting(true);
    setResult(null);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev) {
            return { total: selectedCount, processed: 0, percentage: 0 };
          }
          const newProcessed = Math.min(prev.processed + 1, selectedCount);
          return {
            ...prev,
            processed: newProcessed,
            percentage: (newProcessed / selectedCount) * 100
          };
        });
      }, 100);
      
      const operationResult = await onExecute(operationType, parameters);
      setResult(operationResult);
      
      clearInterval(progressInterval);
      setProgress({ total: selectedCount, processed: selectedCount, percentage: 100 });
      
      // Auto close on success after delay
      if (operationResult.success) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        processedCount: 0,
        failedCount: selectedCount,
        errors: [error instanceof Error ? error.message : 'Đã xảy ra lỗi'],
        warnings: []
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  /**
   * Handle close dialog
   */
  const handleClose = () => {
    if (!isExecuting) {
      setParameters({});
      setProgress(null);
      setResult(null);
      setValidationErrors([]);
      onClose();
    }
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render operation-specific parameters
   */
  const renderParameters = () => {
    switch (operationType) {
      case 'status-change':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="newStatus">Trạng thái mới</Label>
              <Select
                value={parameters.newStatus || ''}
                onValueChange={(value) => handleParameterChange('newStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'export':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="format">Định dạng xuất</Label>
              <Select
                value={parameters.format || ''}
                onValueChange={(value) => handleParameterChange('format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn định dạng" />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tùy chọn xuất</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAnswers"
                    checked={parameters.includeAnswers || false}
                    onCheckedChange={(checked) => handleParameterChange('includeAnswers', checked)}
                  />
                  <Label htmlFor="includeAnswers">Bao gồm đáp án</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSolutions"
                    checked={parameters.includeSolutions || false}
                    onCheckedChange={(checked) => handleParameterChange('includeSolutions', checked)}
                  />
                  <Label htmlFor="includeSolutions">Bao gồm lời giải</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={parameters.includeMetadata || false}
                    onCheckedChange={(checked) => handleParameterChange('includeMetadata', checked)}
                  />
                  <Label htmlFor="includeMetadata">Bao gồm metadata</Label>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'tag-assignment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tags">Thẻ (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                placeholder="Ví dụ: khó, quan trọng, ôn tập"
                value={parameters.tagsInput || ''}
                onChange={(e) => {
                  const tagsInput = e.target.value;
                  const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
                  handleParameterChange('tagsInput', tagsInput);
                  handleParameterChange('tags', tags);
                }}
              />
              {parameters.tags && Array.isArray(parameters.tags) && parameters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parameters.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'move-category':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetCategory">Danh mục đích</Label>
              <Input
                id="targetCategory"
                placeholder="Nhập ID hoặc tên danh mục"
                value={parameters.targetCategoryId || ''}
                onChange={(e) => handleParameterChange('targetCategoryId', e.target.value)}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  /**
   * Render progress
   */
  const renderProgress = () => {
    if (!progress) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Đang xử lý...</span>
          <span>{progress.processed}/{progress.total}</span>
        </div>
        <Progress value={progress.percentage} />
      </div>
    );
  };
  
  /**
   * Render result
   */
  const renderResult = () => {
    if (!result) return null;
    
    const Icon = result.success ? CheckCircle : XCircle;
    const variant = result.success ? "default" : "destructive";
    
    return (
      <Alert variant={variant}>
        <Icon className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              {result.success 
                ? `Đã xử lý thành công ${result.processedCount} câu hỏi`
                : `Xử lý thành công ${result.processedCount}, thất bại ${result.failedCount} câu hỏi`
              }
            </p>
            
            {result.errors.length > 0 && (
              <div>
                <p className="font-medium">Lỗi:</p>
                <ul className="text-xs space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {Boolean(result.data && typeof result.data === 'object' && 'downloadUrl' in result.data) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open((result.data as { downloadUrl: string }).downloadUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-1" />
                Tải xuống
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{operationName} {selectedCount} câu hỏi</DialogTitle>
          <DialogDescription>
            Cấu hình thông số cho thao tác {operationName.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Parameters */}
          {renderParameters()}
          
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="text-xs space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Progress */}
          {renderProgress()}
          
          {/* Result */}
          {renderResult()}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExecuting}
          >
            {result?.success ? 'Đóng' : 'Hủy'}
          </Button>
          
          {!result && (
            <Button
              onClick={handleExecute}
              disabled={isExecuting || validationErrors.length > 0}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                `${operationName} ${selectedCount} câu hỏi`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
