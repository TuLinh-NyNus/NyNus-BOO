/**
 * Comprehensive interfaces for lesson content structures
 * Fixes TypeScript errors in admin lesson components
 */

// Base content types
export type SectionType = 'video' | 'text' | 'quiz' | 'resource' | 'interactive';
export type BlockType = 'text' | 'video' | 'image' | 'code' | 'quiz';
export type InteractiveType = 'poll' | 'discussion' | 'assignment' | 'code-exercise';

// Video content interface
export interface VideoContent {
  url: string;
  thumbnail?: string;
  subtitles?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  title?: string;
  duration?: string;
}

// Text content interface - Matches Prisma schema camelCase
export interface TextContent {
  content: string;                // Matches Prisma content field
  formatting?: 'markdown' | 'html' | 'paragraph'; // camelCase for consistency
  allowComments?: boolean;        // camelCase for consistency
  text?: string;                  // For lesson-editor compatibility
}

// Quiz content interface - Matches Prisma schema camelCase
export interface QuizContent {
  questions: QuizQuestion[];      // camelCase for consistency
  timeLimit?: number;             // camelCase for consistency
  passingScore?: number;          // camelCase for consistency
  allowRetake?: boolean;          // camelCase for consistency
  question?: string;              // For lesson-editor compatibility
  options?: string[];             // camelCase for consistency
  correctAnswer?: number;         // camelCase for consistency
}

// Quiz question interface - Matches Prisma schema camelCase
export interface QuizQuestion {
  id: string;                     // camelCase for consistency
  question: string;               // camelCase for consistency
  type: 'multiple-choice' | 'true-false' | 'short-answer'; // camelCase for consistency
  options?: string[];             // camelCase for consistency
  correctAnswer: string | number | boolean; // camelCase for consistency
  explanation?: string;           // camelCase for consistency
}

// Resource content interface
export interface ResourceContent {
  files: ResourceFile[];
  downloadable?: boolean;
  description?: string;
}

// Resource file interface
export interface ResourceFile {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'slide' | 'exercise' | 'link';
  size?: string;
}

// Interactive content interface
export interface InteractiveContent {
  type: InteractiveType;
  prompt: string;
  settings: Record<string, unknown>;
}

// Image content interface (for lesson-editor)
export interface ImageContent {
  url: string;
  alt: string;
  caption?: string;
}

// Code content interface (for lesson-editor)
export interface CodeContent {
  code: string;
  language: string;
}

// Union type for all content types
export type ContentData = 
  | VideoContent 
  | TextContent 
  | QuizContent 
  | ResourceContent 
  | InteractiveContent
  | ImageContent
  | CodeContent
  | Record<string, unknown>; // Fallback for unknown content

// Content section interface (for lesson-content-builder)
export interface ContentSection {
  id: string;
  title: string;
  type: SectionType;
  content: ContentData;
  duration?: string;
  isRequired: boolean;
  order: number;
}

// Lesson content block interface (for lesson-editor)
export interface LessonContent {
  id: string;
  type: BlockType;
  content: ContentData;
  order: number;
}

// Interactive element interface
export interface InteractiveElement {
  id: string;
  type: InteractiveType;
  title: string;
  description: string;
  settings: Record<string, unknown>;
}

// Lesson data interface
export interface LessonData {
  id?: string;
  title: string;
  description: string;
  course: string;
  chapter: string;
  content: LessonContent[];
  sections?: ContentSection[];
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Props interfaces
export interface LessonContentBuilderProps {
  lessonId?: string;
  initialSections?: ContentSection[];
  onSave?: (sections: ContentSection[]) => void;
}

export interface LessonEditorProps {
  lessonId?: string;
  initialData?: Partial<LessonData>;
  onSave?: (data: LessonData) => void;
}

export interface LessonPreviewProps {
  lessonData: LessonData;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  onClose?: () => void;
}

// Type guards for content types
export function isVideoContent(content: ContentData): content is VideoContent {
  return typeof content === 'object' && content !== null && 'url' in content && !('text' in content);
}

export function isTextContent(content: ContentData): content is TextContent {
  return typeof content === 'object' && content !== null && ('content' in content || 'text' in content);
}

export function isQuizContent(content: ContentData): content is QuizContent {
  return typeof content === 'object' && content !== null && ('questions' in content || 'question' in content);
}

export function isResourceContent(content: ContentData): content is ResourceContent {
  return typeof content === 'object' && content !== null && ('files' in content || 'description' in content);
}

export function isInteractiveContent(content: ContentData): content is InteractiveContent {
  return typeof content === 'object' && content !== null && 'type' in content && 'prompt' in content;
}

export function isImageContent(content: ContentData): content is ImageContent {
  return typeof content === 'object' && content !== null && 'alt' in content;
}

export function isCodeContent(content: ContentData): content is CodeContent {
  return typeof content === 'object' && content !== null && 'code' in content && 'language' in content;
}

// Helper functions for default content
export function getDefaultVideoContent(): VideoContent {
  return {
    url: '',
    thumbnail: '',
    subtitles: false,
    autoplay: false,
    controls: true
  };
}

export function getDefaultTextContent(): TextContent {
  return {
    content: '',
    formatting: 'markdown',
    allowComments: true
  };
}

export function getDefaultQuizContent(): QuizContent {
  return {
    questions: [],
    timeLimit: 0,
    passingScore: 70,
    allowRetake: true
  };
}

export function getDefaultResourceContent(): ResourceContent {
  return {
    files: [],
    downloadable: true,
    description: ''
  };
}

export function getDefaultInteractiveContent(): InteractiveContent {
  return {
    type: 'discussion',
    prompt: '',
    settings: {}
  };
}

// Content type utilities
export function getSectionTypeName(type: SectionType): string {
  switch (type) {
    case 'video': return 'Video';
    case 'text': return 'Văn bản';
    case 'quiz': return 'Quiz';
    case 'resource': return 'Tài liệu';
    case 'interactive': return 'Tương tác';
    default: return 'Nội dung';
  }
}

export function getBlockTypeName(type: BlockType): string {
  switch (type) {
    case 'text': return 'Văn bản';
    case 'video': return 'Video';
    case 'image': return 'Hình ảnh';
    case 'code': return 'Code';
    case 'quiz': return 'Quiz';
    default: return 'Nội dung';
  }
}
