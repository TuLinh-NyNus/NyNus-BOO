/**
 * Admin Theory Components Index
 * Export tất cả theory management components
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Build Management Components
export {
  TheoryBuildManager,
  CompactTheoryBuildManager,
  DetailedTheoryBuildManager,
  type TheoryBuildManagerProps,
  type BuildStatus
} from './theory-build-manager';

export {
  BuildProgressTracker,
  CompactBuildProgressTracker,
  type BuildProgressTrackerProps,
  type BuildStep,
  type PerformanceMetrics
} from './build-progress';

export {
  ContentUploadZone,
  CompactContentUploadZone,
  type ContentUploadZoneProps,
  type UploadFile,
  type UploadStats
} from './content-upload-zone';

export {
  MobilePreviewPanel,
  CompactMobilePreviewPanel,
  type MobilePreviewPanelProps,
  type PreviewContent,
  type DevicePreview
} from './mobile-preview';

// Enhanced LaTeX Editor Components (Phase 2.3)
export {
  TheoryEditor,
  CompactTheoryEditor,
  FullTheoryEditor,
  type TheoryEditorProps,
  type LaTeXTemplate,
  type AutoSaveStatus
} from './theory-editor';

export {
  LaTeXPreview,
  CompactLaTeXPreview,
  SplitLaTeXPreview,
  type LaTeXPreviewProps
} from './latex-preview';

// Build Metrics Components (Phase 2.4)
export {
  BuildMetrics,
  CompactBuildMetrics,
  DetailedBuildMetrics,
  type BuildMetricsProps,
  type BuildMetricsData,
  type HistoricalMetrics
} from './build-metrics';

// Re-export common types for convenience
export type {
  PerformanceMetrics as PreviewPerformanceMetrics
} from './mobile-preview';

export type {
  PerformanceMetrics as LaTeXPerformanceMetrics
} from './latex-preview';

// Theory Content Management Components (Phase 5.1)
export {
  TheoryContentManager,
  type TheoryContentManagerProps,
  type TheoryContent,
  type BulkOperation,
  type ContentFilter
} from './theory-content-manager';

export {
  ContentAnalyticsDashboard,
  type ContentAnalyticsDashboardProps,
  type ContentMetrics,
  type PerformanceData
} from './content-analytics-dashboard';

export {
  AdvancedContentValidator,
  type AdvancedContentValidatorProps,
  type ValidationResult,
  type ValidationIssue
} from './advanced-content-validator';
