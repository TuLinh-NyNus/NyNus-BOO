/**
 * Theory System Types
 * TypeScript interfaces cho hệ thống lý thuyết với build-time optimization
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { LaTeXRenderOptions, LaTeXRenderResult } from '@/lib/utils/latex-rendering';

// ===== CORE THEORY TYPES =====

/**
 * Môn học được hỗ trợ trong hệ thống
 */
export type Subject = 'TOÁN' | 'LÝ' | 'HÓA' | 'SINH' | 'VĂN' | 'ANH' | 'SỬ' | 'ĐỊA';

/**
 * Cấp độ khó của bài học
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Trạng thái build system
 */
export type BuildStatus = 'idle' | 'scanning' | 'processing' | 'rendering' | 'optimizing' | 'indexing' | 'complete' | 'error';

/**
 * Metadata của bài học từ frontmatter
 */
export interface TheoryMetadata {
  title: string;
  subject: Subject;
  grade: number;
  chapter: number;
  lesson: number;
  description: string;
  keywords: string[];
  difficulty: Difficulty;
  estimatedTime: string;
  author?: string;
  lastUpdated?: string;
  mobileOptimized?: boolean;
}

/**
 * Responsive image set cho mobile optimization
 */
export interface ResponsiveImageSet {
  original: string;
  mobile: string;
  tablet: string;
  desktop: string;
  webp?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  sizes: {
    mobile: { width: number; height: number };
    tablet: { width: number; height: number };
    desktop: { width: number; height: number };
  };
}

/**
 * Navigation breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

/**
 * Mobile-optimized theory content
 * Interface chính cho content đã được pre-render và optimize cho mobile
 */
export interface MobileTheoryContent {
  metadata: TheoryMetadata;
  content: {
    html: string;           // Pre-rendered HTML content
    mobileHtml: string;     // Mobile-optimized version
    images: ResponsiveImageSet[]; // Responsive images
    searchText: string;     // Extracted text for search indexing
    latexExpressions: string[]; // Extracted LaTeX expressions
  };
  navigation: {
    prev?: string;          // Previous lesson path
    next?: string;          // Next lesson path
    parent: string;         // Parent chapter/subject path
    breadcrumbs: BreadcrumbItem[];
  };
  performance: {
    buildTime: number;      // Build time in milliseconds
    fileSize: number;       // File size in bytes
    mobileScore: number;    // Mobile optimization score (0-100)
    renderTime: number;     // LaTeX render time
  };
  filePath: string;         // Original source file path
  outputPath: string;       // Pre-rendered output path
  lastBuilt: string;        // ISO timestamp of last build
}

/**
 * Rendered content result từ build process
 */
export interface RenderedContent {
  html: string;
  metadata: TheoryMetadata;
  navigation: {
    prev?: string;
    next?: string;
    parent: string;
    breadcrumbs: BreadcrumbItem[];
  };
  performance: {
    renderTime: number;
    latexCount: number;
    imageCount: number;
  };
  errors: string[];
}

// ===== BUILD SYSTEM TYPES =====

/**
 * Theory file information
 */
export interface TheoryFile {
  path: string;             // Relative path from content/theory/
  absolutePath: string;     // Absolute file path
  content: string;          // Raw markdown content
  metadata: TheoryMetadata; // Parsed frontmatter
  lastModified: Date;       // File modification time
  size: number;             // File size in bytes
}

/**
 * Build progress information
 */
export interface BuildProgress {
  status: BuildStatus;
  currentFile?: string;
  processedFiles: number;
  totalFiles: number;
  errors: string[];
  warnings: string[];
  startTime: number;
  estimatedTimeRemaining?: number;
}

/**
 * Build result summary
 */
export interface BuildResult {
  success: boolean;
  processedFiles: number;
  errors: string[];
  warnings: string[];
  totalTime: number;
  outputSize: number;
  performance: {
    averageRenderTime: number;
    totalLatexExpressions: number;
    mobileOptimizationScore: number;
  };
}

// ===== SEARCH SYSTEM TYPES =====

/**
 * Searchable content item
 */
export interface SearchableContent {
  id: string;               // Unique identifier (file path)
  title: string;
  content: string;          // Searchable text content
  subject: Subject;
  grade: number;
  chapter: number;
  lesson: number;
  keywords: string[];
  mathFormulas: string[];   // Extracted LaTeX formulas
  url: string;              // URL path for navigation
}

/**
 * Search result item
 */
export interface SearchResult {
  id: string;
  title: string;
  subject: Subject;
  grade: number;
  url: string;
  relevance: number;        // Search relevance score (0-1)
  highlights: string[];     // Highlighted text snippets
  matchType: 'title' | 'content' | 'keyword' | 'formula';
}

/**
 * Pre-built search indexes
 */
export interface PreBuiltIndexes {
  subjects: Record<Subject, SearchableContent[]>;
  searchIndex: SearchableContent[];      // Full search index
  navigationTree: NavigationNode[];      // Hierarchical navigation
  mobileManifest: MobileManifest;        // Mobile-specific metadata
  lastBuilt: string;                     // ISO timestamp
  version: string;                       // Index version
}

/**
 * Navigation tree node
 */
export interface NavigationNode {
  id: string;
  label: string;
  type: 'subject' | 'grade' | 'chapter' | 'lesson';
  path: string;
  children?: NavigationNode[];
  metadata?: {
    lessonCount?: number;
    estimatedTime?: string;
    difficulty?: Difficulty;
  };
}

/**
 * Mobile manifest for PWA-like features
 */
export interface MobileManifest {
  totalContent: number;
  subjects: Subject[];
  grades: number[];
  totalSize: number;
  averageLoadTime: number;
  offlineCapable: boolean;
  lastSync: string;
}

// ===== MOBILE OPTIMIZATION TYPES =====

/**
 * Mobile optimization configuration
 */
export interface MobileOptimizationConfig {
  maxImageWidth: number;
  imageQuality: number;
  enableWebP: boolean;
  lazyLoadImages: boolean;
  optimizeLatex: boolean;
  touchFriendlyNavigation: boolean;
  progressiveLoading: boolean;
}

/**
 * Mobile optimization result
 */
export interface MobileOptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  mobileScore: number;      // Performance score (0-100)
  optimizations: string[];  // Applied optimizations
  warnings: string[];       // Optimization warnings
}

// ===== EXTENDED LATEX TYPES =====

/**
 * Enhanced LaTeX render options cho theory system
 */
export interface TheoryLatexOptions extends LaTeXRenderOptions {
  mobileOptimized?: boolean;
  maxWidth?: string;
  responsiveScaling?: boolean;
  touchFriendly?: boolean;
}

/**
 * Theory-specific LaTeX render result
 */
export interface TheoryLatexResult extends LaTeXRenderResult {
  mobileOptimized: boolean;
  responsiveHtml?: string;
  originalSize: number;
  optimizedSize: number;
}

// ===== UTILITY TYPES =====

/**
 * File processing options
 */
export interface ProcessingOptions {
  validateLatex: boolean;
  optimizeImages: boolean;
  generateMobileVersion: boolean;
  extractSearchText: boolean;
  buildSearchIndex: boolean;
}

/**
 * Content validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// ===== EXPORT TYPES =====

export type {
  LaTeXRenderOptions,
  LaTeXRenderResult
} from '@/lib/utils/latex-rendering';
