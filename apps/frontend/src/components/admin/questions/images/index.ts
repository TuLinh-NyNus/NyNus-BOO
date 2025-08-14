/**
 * Google Drive Integration UI Components Index
 * Export tất cả image-related components cho Google Drive integration
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// ===== IMAGE UPLOAD COMPONENTS =====
export {
  ImageUploadComponent,
  DragDropZone,
  CompactDragDropZone,
  FileValidator,
  validateFile,
  validateFiles,
  formatFileSize,
} from './image-upload';

// ===== IMAGE PREVIEW COMPONENTS =====
export {
  ImagePreviewModal,
  ImageThumbnail,
  ImageThumbnailGrid,
  ImageMetadata,
  CompactImageMetadata,
} from './image-preview';

// ===== IMAGE GALLERY COMPONENTS =====
export {
  ImageGallery,
  ImageCard,
  GalleryFiltersComponent,
} from './image-gallery';

// ===== PROGRESS TRACKING COMPONENTS =====
export {
  ProgressTracker,
  StatusIndicator,
  CompactStatusIndicator,
  StatusSummary,
  UploadQueue,
} from './progress-tracking';

// ===== TYPES & INTERFACES =====
export type {
  // Upload Types
  ImageUploadProps,
  DragDropZoneProps,
  FileValidationResult,

  // Preview Types
  ImagePreviewProps,
  ImageThumbnailProps,
  ImageMetadataProps,

  // Gallery Types
  ImageGalleryProps,
  ImageCardProps,

  // Progress Tracking Types
  ProgressTrackerProps,
  StatusIndicatorProps,
  UploadQueueItem,

  // Utility Types
  UploadConfig,
  GoogleDriveConfig,
  UploadResponse,
  GalleryResponse,
} from './types';

export type { GalleryFilters } from './types';

// Export constants
export { DEFAULT_UPLOAD_CONFIG, DEFAULT_GALLERY_FILTERS } from './types';

// ===== ENUMS =====
export {
  UploadStatus,
} from './types';

// ===== COMPONENT COLLECTIONS =====
// Note: Component collections removed to avoid TypeScript conflicts
// Import individual components as needed
