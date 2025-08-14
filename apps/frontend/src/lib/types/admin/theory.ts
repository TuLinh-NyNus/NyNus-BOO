/**
 * Admin Theory Management Types
 * Types cho admin theory management interface
 */

import { FileInfo } from '@/lib/theory/file-operations';

// ===== CORE THEORY ADMIN INTERFACES =====

/**
 * Theory File Status
 * Trạng thái của file LaTeX trong admin
 */
export type TheoryFileStatus = 
  | 'not_parsed'     // Chưa được parse
  | 'parsing'        // Đang parse
  | 'parsed'         // Đã parse thành công
  | 'error'          // Có lỗi khi parse
  | 'outdated';      // File đã thay đổi, cần parse lại

/**
 * Theory File Admin Info
 * Thông tin file LaTeX cho admin interface
 */
export interface TheoryFileAdminInfo extends FileInfo {
  // Parse status
  status: TheoryFileStatus;
  parseError?: string;
  parsedAt?: Date;
  
  // File operations
  canEdit: boolean;
  canDelete: boolean;
  canRename: boolean;
  
  // Statistics
  wordCount?: number;
  sectionCount?: number;
  mathFormulaCount?: number;
  
  // Backup info
  hasBackup: boolean;
  backupCount: number;
  lastBackupAt?: Date;
}

/**
 * Theory Directory Admin Info
 * Thông tin thư mục cho admin interface
 */
export interface TheoryDirectoryAdminInfo {
  name: string;
  path: string;
  grade: string;
  
  // File counts
  totalFiles: number;
  parsedFiles: number;
  errorFiles: number;
  
  // Statistics
  totalWordCount: number;
  totalSections: number;
  
  // Operations
  canUpload: boolean;
  canCreateFolder: boolean;
}

/**
 * Theory Admin Statistics
 * Thống kê tổng quan cho admin dashboard
 */
export interface TheoryAdminStatistics {
  // File counts by grade
  filesByGrade: {
    'LỚP 10': number;
    'LỚP 11': number;
    'LỚP 12': number;
  };
  
  // Parse status counts
  totalFiles: number;
  parsedFiles: number;
  errorFiles: number;
  pendingFiles: number;
  
  // Content statistics
  totalWordCount: number;
  totalSections: number;
  totalMathFormulas: number;
  
  // Performance metrics
  averageParseTime: number; // milliseconds
  lastParseTime: Date;
  
  // Storage info
  totalStorageSize: number; // bytes
  backupStorageSize: number; // bytes
}

/**
 * Bulk Operation Type
 * Loại bulk operation có thể thực hiện
 */
export type BulkOperationType = 
  | 'parse_all'        // Parse tất cả files
  | 'parse_grade'      // Parse files theo lớp
  | 'refresh_cache'    // Refresh cache
  | 'validate_syntax'  // Validate LaTeX syntax
  | 'generate_backup'  // Tạo backup
  | 'export_content';  // Export content

/**
 * Bulk Operation Request
 * Request cho bulk operations
 */
export interface BulkOperationRequest {
  type: BulkOperationType;
  target?: {
    grade?: string;
    files?: string[]; // file paths
  };
  options?: {
    forceReparse?: boolean;
    includeBackup?: boolean;
    exportFormat?: 'json' | 'html' | 'pdf';
  };
}

/**
 * Bulk Operation Result
 * Kết quả của bulk operation
 */
export interface BulkOperationResult {
  operationType: BulkOperationType;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  
  // Results
  totalFiles: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  
  // Details
  successFiles: string[];
  errorFiles: { file: string; error: string }[];
  skippedFiles: string[];
  
  // Output (for export operations)
  outputPath?: string;
  outputSize?: number;
}

/**
 * File Upload Request
 * Request cho file upload
 */
export interface FileUploadRequest {
  files: File[];
  targetDirectory: string;
  options?: {
    overwrite?: boolean;
    autoRename?: boolean;
    autoParse?: boolean;
    createBackup?: boolean;
  };
}

/**
 * File Upload Result
 * Kết quả upload files
 */
export interface FileUploadResult {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  
  uploadedFiles: {
    originalName: string;
    finalName: string;
    path: string;
    size: number;
  }[];
  
  errors: {
    fileName: string;
    error: string;
  }[];
}

/**
 * File Operation Request
 * Request cho file operations (rename, delete, etc.)
 */
export interface FileOperationRequest {
  operation: 'rename' | 'delete' | 'copy' | 'move';
  sourcePath: string;
  targetPath?: string; // for rename, copy, move
  options?: {
    createBackup?: boolean;
    force?: boolean;
  };
}

/**
 * File Operation Result
 * Kết quả file operation
 */
export interface FileOperationResult {
  operation: string;
  success: boolean;
  sourcePath: string;
  targetPath?: string;
  error?: string;
  backupPath?: string;
}

/**
 * Theory Admin Dashboard Props
 * Props cho admin dashboard component
 */
export interface TheoryAdminDashboardProps {
  initialStatistics?: TheoryAdminStatistics;
  initialFiles?: TheoryFileAdminInfo[];
  refreshInterval?: number;
}

/**
 * File Manager Props
 * Props cho file manager component
 */
export interface FileManagerProps {
  initialDirectory?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  maxFileSize?: number; // bytes
  allowedExtensions?: string[];
  onFileSelect?: (file: TheoryFileAdminInfo) => void;
  onDirectoryChange?: (directory: string) => void;
}

/**
 * Theory Admin Context Value
 * Context value cho theory admin
 */
export interface TheoryAdminContextValue {
  // State
  statistics: TheoryAdminStatistics | null;
  files: TheoryFileAdminInfo[];
  currentDirectory: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshStatistics: () => Promise<void>;
  loadFiles: (directory?: string) => Promise<void>;
  parseFile: (filePath: string) => Promise<void>;
  bulkOperation: (request: BulkOperationRequest) => Promise<BulkOperationResult>;
  uploadFiles: (request: FileUploadRequest) => Promise<FileUploadResult>;
  fileOperation: (request: FileOperationRequest) => Promise<FileOperationResult>;
  
  // Utilities
  getFileStatus: (filePath: string) => TheoryFileStatus;
  canPerformOperation: (operation: string, filePath: string) => boolean;
}

// ===== CONSTANTS =====

/**
 * Theory Admin Constants
 * Constants cho theory admin interface
 */
export const THEORY_ADMIN_CONSTANTS = {
  // File limits
  MAX_FILE_SIZE_MB: 5,
  MAX_FILES_PER_UPLOAD: 20,
  ALLOWED_EXTENSIONS: ['.tex'],
  
  // Parse limits
  MAX_CONCURRENT_PARSE: 5,
  PARSE_TIMEOUT_MS: 30000,
  
  // Refresh intervals
  STATISTICS_REFRESH_MS: 30000,
  FILE_STATUS_REFRESH_MS: 10000,
  
  // Storage paths
  BACKUP_DIRECTORY: '/backups/theory',
  EXPORT_DIRECTORY: '/exports/theory',
  
  // UI constants
  FILES_PER_PAGE: 50,
  TREE_MAX_DEPTH: 5,
} as const;

/**
 * Default Theory Admin Statistics
 * Default values cho statistics
 */
export const DEFAULT_THEORY_STATISTICS: TheoryAdminStatistics = {
  filesByGrade: {
    'LỚP 10': 0,
    'LỚP 11': 0,
    'LỚP 12': 0,
  },
  totalFiles: 0,
  parsedFiles: 0,
  errorFiles: 0,
  pendingFiles: 0,
  totalWordCount: 0,
  totalSections: 0,
  totalMathFormulas: 0,
  averageParseTime: 0,
  lastParseTime: new Date(),
  totalStorageSize: 0,
  backupStorageSize: 0,
};
