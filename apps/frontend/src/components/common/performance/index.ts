/**
 * Performance Components Export
 * Central export point cho tất cả performance optimization components
 */

// Virtual Scrolling Components
export { VirtualScrollList } from './virtual-scrolling/VirtualScrollList';
export { VirtualQuestionList } from './virtual-scrolling/VirtualQuestionList';

// Virtual Scrolling Types
export type {
  VirtualScrollItem,
  VirtualScrollProps,
  VirtualScrollState,
} from './virtual-scrolling/VirtualScrollList';

export type {
  QuestionVirtualScrollProps,
  QuestionListItem,
} from './virtual-scrolling/VirtualQuestionList';

// Virtual Scrolling Utilities
export {
  calculateOptimalItemHeight,
  estimateScrollHeight,
  useVirtualScrollPerformance,
} from './virtual-scrolling/VirtualScrollList';

export {
  calculateOptimalQuestionListHeight,
  estimateQuestionListPerformance,
} from './virtual-scrolling/VirtualQuestionList';

// Image Optimization Components
export {
  OptimizedImage,
  QuestionImage,
  QuestionImageGallery,
} from './image-optimization/OptimizedImage';

// Image Optimization Types
export type {
  OptimizedImageProps,
  QuestionImageProps,
  ImageGalleryProps,
} from './image-optimization/OptimizedImage';

// Image Optimization Utilities
export {
  generateResponsiveSizes,
  calculateOptimalDimensions,
  supportsOptimization,
  generateSrcSet,
} from './image-optimization/OptimizedImage';
