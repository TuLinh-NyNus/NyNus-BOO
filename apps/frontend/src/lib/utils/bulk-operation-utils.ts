/**
 * Bulk Operation Utilities
 * Utilities cho bulk operations trên questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { Question } from '@/types/question';

// ===== TYPES =====

export type BulkOperationType = 
  | 'delete'
  | 'status-change'
  | 'export'
  | 'tag-assignment'
  | 'move-category'
  | 'duplicate'
  | 'archive';

export interface BulkOperationRequest {
  type: BulkOperationType;
  questionIds: string[];
  parameters?: Record<string, unknown>;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
  data?: unknown;
}

export interface BulkOperationProgress {
  total: number;
  processed: number;
  percentage: number;
  currentItem?: string;
  estimatedTimeRemaining?: number;
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate bulk operation request
 */
export function validateBulkOperationRequest(request: BulkOperationRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check question IDs
  if (!request.questionIds || request.questionIds.length === 0) {
    errors.push('Cần chọn ít nhất một câu hỏi');
  }
  
  if (request.questionIds.length > 1000) {
    errors.push('Không thể xử lý quá 1000 câu hỏi cùng lúc');
  }
  
  // Validate based on operation type
  switch (request.type) {
    case 'status-change':
      if (!request.parameters?.newStatus) {
        errors.push('Cần chỉ định trạng thái mới');
      }
      break;
      
    case 'export':
      if (!request.parameters?.format) {
        errors.push('Cần chỉ định định dạng export');
      }
      break;
      
    case 'tag-assignment':
      if (!request.parameters?.tags || !Array.isArray(request.parameters.tags) || request.parameters.tags.length === 0) {
        errors.push('Cần chỉ định ít nhất một tag');
      }
      break;
      
    case 'move-category':
      if (!request.parameters?.targetCategoryId) {
        errors.push('Cần chỉ định danh mục đích');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if questions can be processed for specific operation
 */
export function canProcessQuestions(
  questions: Question[],
  operationType: BulkOperationType
): {
  canProcess: boolean;
  warnings: string[];
  blockedQuestions: string[];
} {
  const warnings: string[] = [];
  const blockedQuestions: string[] = [];
  
  questions.forEach(question => {
    switch (operationType) {
      case 'delete':
        // Check if question is in use
        if (question.usageCount && question.usageCount > 0) {
          warnings.push(`Câu hỏi ${question.id} đang được sử dụng`);
        }
        break;
        
      case 'status-change':
        // Check current status
        if (question.status === 'ARCHIVED') {
          blockedQuestions.push(question.id);
          warnings.push(`Câu hỏi ${question.id} đã được lưu trữ`);
        }
        break;
        
      case 'export':
        // Check if question has content
        if (!question.content || question.content.trim() === '') {
          warnings.push(`Câu hỏi ${question.id} không có nội dung`);
        }
        break;
    }
  });
  
  return {
    canProcess: blockedQuestions.length === 0,
    warnings,
    blockedQuestions
  };
}

// ===== OPERATION FUNCTIONS =====

/**
 * Simulate bulk delete operation
 */
export async function simulateBulkDelete(questionIds: string[]): Promise<BulkOperationResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate some failures
  const failedCount = Math.floor(questionIds.length * 0.1); // 10% failure rate
  const processedCount = questionIds.length - failedCount;
  
  return {
    success: failedCount === 0,
    processedCount,
    failedCount,
    errors: failedCount > 0 ? [`Không thể xóa ${failedCount} câu hỏi`] : [],
    warnings: []
  };
}

/**
 * Simulate bulk status change operation
 */
export async function simulateBulkStatusChange(
  questionIds: string[],
  newStatus: string
): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    processedCount: questionIds.length,
    failedCount: 0,
    errors: [],
    warnings: [],
    data: { newStatus }
  };
}

/**
 * Simulate bulk export operation
 */
export async function simulateBulkExport(
  questionIds: string[],
  format: string
): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate file generation
  const fileName = `questions_export_${Date.now()}.${format}`;
  
  return {
    success: true,
    processedCount: questionIds.length,
    failedCount: 0,
    errors: [],
    warnings: [],
    data: {
      fileName,
      downloadUrl: `/api/downloads/${fileName}`,
      fileSize: questionIds.length * 1024 // Simulate file size
    }
  };
}

/**
 * Simulate bulk tag assignment
 */
export async function simulateBulkTagAssignment(
  questionIds: string[],
  tags: string[]
): Promise<BulkOperationResult> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    success: true,
    processedCount: questionIds.length,
    failedCount: 0,
    errors: [],
    warnings: [],
    data: { assignedTags: tags }
  };
}

// ===== PROGRESS TRACKING =====

/**
 * Create progress tracker for bulk operations
 */
export class BulkOperationProgressTracker {
  private total: number;
  private processed: number = 0;
  private startTime: number;
  private onProgress?: (progress: BulkOperationProgress) => void;
  
  constructor(total: number, onProgress?: (progress: BulkOperationProgress) => void) {
    this.total = total;
    this.startTime = Date.now();
    this.onProgress = onProgress;
  }
  
  /**
   * Update progress
   */
  updateProgress(processed: number, currentItem?: string): void {
    this.processed = processed;
    
    const percentage = (processed / this.total) * 100;
    const elapsed = Date.now() - this.startTime;
    const estimatedTotal = elapsed / (processed / this.total);
    const estimatedTimeRemaining = estimatedTotal - elapsed;
    
    const progress: BulkOperationProgress = {
      total: this.total,
      processed,
      percentage,
      currentItem,
      estimatedTimeRemaining: estimatedTimeRemaining > 0 ? estimatedTimeRemaining : undefined
    };
    
    this.onProgress?.(progress);
  }
  
  /**
   * Mark as complete
   */
  complete(): void {
    this.updateProgress(this.total);
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get operation display name
 */
export function getOperationDisplayName(type: BulkOperationType): string {
  const names = {
    'delete': 'Xóa',
    'status-change': 'Thay đổi trạng thái',
    'export': 'Xuất dữ liệu',
    'tag-assignment': 'Gán thẻ',
    'move-category': 'Chuyển danh mục',
    'duplicate': 'Nhân bản',
    'archive': 'Lưu trữ'
  };
  
  return names[type] || type;
}

/**
 * Get operation confirmation message
 */
export function getOperationConfirmationMessage(
  type: BulkOperationType,
  count: number,
  parameters?: Record<string, unknown>
): string {
  const operationName = getOperationDisplayName(type);
  
  switch (type) {
    case 'delete':
      return `Bạn có chắc chắn muốn xóa ${count} câu hỏi? Hành động này không thể hoàn tác.`;
    
    case 'status-change':
      return `Bạn có muốn thay đổi trạng thái của ${count} câu hỏi thành "${parameters?.newStatus}"?`;
    
    case 'export':
      return `Xuất ${count} câu hỏi sang định dạng ${typeof parameters?.format === 'string' ? parameters.format.toUpperCase() : 'không xác định'}?`;
    
    case 'tag-assignment':
      const tagCount = Array.isArray(parameters?.tags) ? parameters.tags.length : 0;
      return `Gán ${tagCount} thẻ cho ${count} câu hỏi?`;
    
    case 'move-category':
      return `Chuyển ${count} câu hỏi sang danh mục mới?`;
    
    case 'duplicate':
      return `Tạo bản sao của ${count} câu hỏi?`;
    
    case 'archive':
      return `Lưu trữ ${count} câu hỏi?`;
    
    default:
      return `Thực hiện ${operationName} trên ${count} câu hỏi?`;
  }
}

/**
 * Format operation result message
 */
export function formatOperationResultMessage(result: BulkOperationResult): string {
  if (result.success) {
    return `Đã xử lý thành công ${result.processedCount} câu hỏi`;
  } else {
    return `Xử lý thành công ${result.processedCount} câu hỏi, thất bại ${result.failedCount} câu hỏi`;
  }
}

/**
 * Estimate operation time
 */
export function estimateOperationTime(type: BulkOperationType, count: number): number {
  // Time estimates in milliseconds per item
  const timePerItem = {
    'delete': 50,
    'status-change': 30,
    'export': 100,
    'tag-assignment': 40,
    'move-category': 60,
    'duplicate': 80,
    'archive': 35
  };
  
  return (timePerItem[type] || 50) * count;
}
