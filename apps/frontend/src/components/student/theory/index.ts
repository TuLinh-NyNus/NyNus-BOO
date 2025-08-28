/**
 * Student Theory Components Index
 * Export tất cả student theory components
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Student Theory Viewer Components
export {
  StudentTheoryViewer,
  CompactStudentTheoryViewer,
  FullStudentTheoryViewer,
  type StudentTheoryViewerProps,
  type TheoryContent,
  type ReadingProgress
} from './student-theory-viewer';

// Mobile LaTeX Content Components
export {
  MobileLaTeXContent,
  CompactMobileLaTeXContent,
  FullMobileLaTeXContent,
  type MobileLaTeXContentProps,
  type MobilePerformanceMetrics,
  type TouchGesture
} from './mobile-latex-content';

// Touch Navigation Components
export {
  TouchNavigation,
  CompactTouchNavigation,
  FullTouchNavigation,
  type TouchNavigationProps,
  type ChapterInfo,
  type SwipeGesture
} from './touch-navigation';

// Re-export common types for convenience
export type {
  MobilePerformanceMetrics as StudentMobileMetrics,
  TouchGesture as StudentTouchGesture
} from './mobile-latex-content';

export type {
  SwipeGesture as StudentSwipeGesture
} from './touch-navigation';
