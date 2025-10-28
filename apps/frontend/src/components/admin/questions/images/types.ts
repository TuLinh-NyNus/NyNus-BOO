/**
 * Cloudinary Integration UI Types
 * TypeScript interfaces cho image upload, preview, và gallery components
 * 
 * @author NyNus Team
 * @version 2.0.0 - Migrated to Cloudinary
 */

import { QuestionImage, ImageType, ImageStatus } from '@/lib/mockdata/shared/core-types';

// ===== UPLOAD INTERFACES =====

export interface ImageUploadProps {
  /** Question ID để associate images */
  questionId?: string;
  /** Question Code để organize folder structure */
  questionCode?: string;
  /** Callback khi upload hoàn thành */
  onUploadComplete?: (images: QuestionImage[]) => void;
  /** Callback khi có lỗi upload */
  onUploadError?: (error: string) => void;
  /** Maximum số files có thể upload */
  maxFiles?: number;
  /** Accepted file types */
  acceptedTypes?: string[];
  /** Maximum file size (bytes) */
  maxFileSize?: number;
  /** Custom className */
  className?: string;
}

export interface DragDropZoneProps {
  /** Callback khi files được drop */
  onFilesDropped: (files: File[]) => void;
  /** Callback khi files được selected */
  onFilesSelected: (files: File[]) => void;
  /** Accept file types */
  accept?: string;
  /** Maximum files */
  maxFiles?: number;
  /** Is uploading state */
  isUploading?: boolean;
  /** Custom className */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

export interface FileValidationResult {
  /** Is file valid */
  isValid: boolean;
  /** Error message nếu invalid */
  error?: string;
  /** File size formatted */
  formattedSize: string;
  /** File type */
  fileType: string;
}

// ===== PREVIEW INTERFACES =====

export interface ImagePreviewProps {
  /** Image để preview */
  image: QuestionImage;
  /** Is modal open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Download callback */
  onDownload?: () => void;
  /** Delete callback */
  onDelete?: () => void;
  /** Edit callback */
  onEdit?: () => void;
}

export interface ImageThumbnailProps {
  /** Image để hiển thị thumbnail */
  image: QuestionImage;
  /** Size của thumbnail */
  size?: 'sm' | 'md' | 'lg';
  /** Click callback */
  onClick?: () => void;
  /** Show metadata overlay */
  showMetadata?: boolean;
  /** Custom className */
  className?: string;
}

export interface ImageMetadataProps {
  /** Image để hiển thị metadata */
  image: QuestionImage;
  /** Layout mode */
  layout?: 'horizontal' | 'vertical';
  /** Show detailed info */
  showDetails?: boolean;
  /** Custom className */
  className?: string;
}

// ===== GALLERY INTERFACES =====

export interface ImageGalleryProps {
  /** Question ID để filter images */
  questionId?: string;
  /** Question Code để filter images */
  questionCode?: string;
  /** Gallery filters */
  filters?: GalleryFilters;
  /** Image selection callback */
  onImageSelect?: (image: QuestionImage) => void;
  /** Multiple selection mode */
  multiSelect?: boolean;
  /** Selected images */
  selectedImages?: string[];
  /** Selection change callback */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Custom className */
  className?: string;
}

export interface GalleryFilters {
  /** Filter by image type */
  imageType?: ImageType;
  /** Filter by status */
  status?: ImageStatus;
  /** Search query */
  searchQuery?: string;
  /** Date range filter */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** Sort options */
  sortBy?: 'createdAt' | 'updatedAt' | 'size' | 'name';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

export interface ImageCardProps {
  /** Image để hiển thị */
  image: QuestionImage;
  /** Is selected */
  isSelected?: boolean;
  /** Selection callback */
  onSelect?: (imageId: string) => void;
  /** Preview callback */
  onPreview?: () => void;
  /** Download callback */
  onDownload?: () => void;
  /** Delete callback */
  onDelete?: () => void;
  /** Show actions */
  showActions?: boolean;
  /** Custom className */
  className?: string;
}

// ===== PROGRESS TRACKING INTERFACES =====

export interface ProgressTrackerProps {
  /** Upload queue */
  uploadQueue: UploadQueueItem[];
  /** Overall progress */
  overallProgress: number;
  /** Show detailed progress */
  showDetails?: boolean;
  /** Retry callback */
  onRetry?: (itemId: string) => void;
  /** Cancel callback */
  onCancel?: (itemId: string) => void;
  /** Clear completed callback */
  onClearCompleted?: () => void;
  /** Custom className */
  className?: string;
}

export interface UploadQueueItem {
  /** Unique ID */
  id: string;
  /** File being uploaded */
  file: File;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: UploadStatus;
  /** Error message nếu failed */
  error?: string;
  /** Upload start time */
  startTime: Date;
  /** Upload end time */
  endTime?: Date;
  /** Resulting QuestionImage */
  result?: QuestionImage;
}

export interface StatusIndicatorProps {
  /** Upload status */
  status: UploadStatus;
  /** Progress percentage */
  progress?: number;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show text label */
  showLabel?: boolean;
  /** Custom className */
  className?: string;
}

// ===== ENUMS =====

export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// ===== UTILITY INTERFACES =====

export interface UploadConfig {
  /** Maximum file size (bytes) */
  maxFileSize: number;
  /** Maximum total files */
  maxFiles: number;
  /** Accepted MIME types */
  acceptedTypes: string[];
  /** Upload endpoint URL */
  uploadEndpoint: string;
  /** Chunk size for large files */
  chunkSize: number;
  /** Retry attempts */
  maxRetries: number;
}

export interface GoogleDriveConfig {
  /** Google Drive folder ID */
  folderId: string;
  /** API endpoint */
  apiEndpoint: string;
  /** Authentication token */
  authToken?: string;
}

// ===== API INTERFACES =====

export interface UploadResponse {
  /** Success status */
  success: boolean;
  /** Uploaded image data */
  data?: QuestionImage;
  /** Error message */
  error?: string;
  /** Upload metadata */
  metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
    uploadTime: number;
  };
}

export interface GalleryResponse {
  /** Success status */
  success: boolean;
  /** Images data */
  data?: QuestionImage[];
  /** Total count */
  total?: number;
  /** Error message */
  error?: string;
  /** Pagination info */
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== DEFAULT CONFIGURATIONS =====

const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  acceptedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  uploadEndpoint: '/api/images/upload',
  chunkSize: 1024 * 1024, // 1MB chunks
  maxRetries: 3,
};

const DEFAULT_GALLERY_FILTERS: GalleryFilters = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

// ===== EXPORTS =====

export {
  DEFAULT_UPLOAD_CONFIG,
  DEFAULT_GALLERY_FILTERS,
};
