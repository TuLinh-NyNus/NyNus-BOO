/**
 * LaTeX Editor Types
 * TypeScript interfaces và types cho LaTeX Editor system
 */

import type { ParsedLatexFile } from '@/lib/theory/latex-parser';

// ===== CORE EDITOR INTERFACES =====

/**
 * LaTeX Editor Configuration
 * Cấu hình cho editor instance
 */
export interface LatexEditorConfig {
  /** Ngôn ngữ syntax highlighting */
  language: 'latex' | 'tex';
  /** Theme cho editor */
  theme: 'light' | 'dark' | 'auto';
  /** Font size */
  fontSize: number;
  /** Hiển thị line numbers */
  showLineNumbers: boolean;
  /** Hiển thị minimap */
  showMinimap: boolean;
  /** Word wrap */
  wordWrap: boolean;
  /** Auto-completion enabled */
  autoCompletion: boolean;
  /** Bracket matching */
  bracketMatching: boolean;
  /** Auto-indent */
  autoIndent: boolean;
}

/**
 * Editor State
 * Trạng thái hiện tại của editor
 */
export interface EditorState {
  /** Nội dung hiện tại */
  content: string;
  /** File đã được modify */
  isModified: boolean;
  /** Đang trong quá trình save */
  isSaving: boolean;
  /** Đang trong quá trình parse */
  isParsing: boolean;
  /** Kết quả parse LaTeX */
  parseResult: ParsedLatexFile | null;
  /** Lỗi parse nếu có */
  parseError: string | null;
  /** Cursor position */
  cursorPosition: EditorPosition;
  /** Selection range */
  selection: EditorSelection | null;
}

/**
 * Editor Position
 * Vị trí cursor trong editor
 */
export interface EditorPosition {
  /** Số dòng (1-based) */
  lineNumber: number;
  /** Số cột (1-based) */
  column: number;
}

/**
 * Editor Selection
 * Vùng text được select
 */
export interface EditorSelection {
  /** Vị trí bắt đầu */
  startPosition: EditorPosition;
  /** Vị trí kết thúc */
  endPosition: EditorPosition;
  /** Text được select */
  selectedText: string;
}

// ===== PREVIEW INTERFACES =====

/**
 * Preview State
 * Trạng thái của preview pane
 */
export interface PreviewState {
  /** Preview có đang hiển thị */
  isVisible: boolean;
  /** Đang trong quá trình render */
  isRendering: boolean;
  /** Lỗi render nếu có */
  renderError: string | null;
  /** Scroll position của preview */
  scrollPosition: number;
  /** Zoom level */
  zoomLevel: number;
}

/**
 * Preview Options
 * Tùy chọn cho preview rendering
 */
export interface PreviewOptions {
  /** Render math với KaTeX */
  renderMath: boolean;
  /** Hiển thị line numbers tương ứng */
  showLineMapping: boolean;
  /** Auto-scroll sync với editor */
  autoScrollSync: boolean;
  /** Refresh delay (ms) */
  refreshDelay: number;
}

// ===== SCROLL SYNC INTERFACES =====

/**
 * Scroll Sync State
 * Trạng thái đồng bộ scroll
 */
export interface ScrollSyncState {
  /** Scroll sync có enabled */
  isEnabled: boolean;
  /** Đang trong quá trình sync */
  isSyncing: boolean;
  /** Tỷ lệ mapping giữa editor và preview */
  scrollRatio: number;
  /** Last sync timestamp */
  lastSyncTime: number;
}

/**
 * Scroll Sync Options
 * Tùy chọn cho scroll synchronization
 */
export interface ScrollSyncOptions {
  /** Smooth scrolling */
  smoothScrolling: boolean;
  /** Sync delay (ms) */
  syncDelay: number;
  /** Sync threshold (pixels) */
  syncThreshold: number;
}

// ===== FILE OPERATIONS =====

/**
 * File Operation Result
 * Kết quả của file operations
 */
export interface FileOperationResult {
  /** Operation thành công */
  success: boolean;
  /** Message mô tả kết quả */
  message: string;
  /** Error details nếu có */
  error?: string;
  /** Timestamp của operation */
  timestamp: Date;
}

/**
 * Save Options
 * Tùy chọn khi save file
 */
export interface SaveOptions {
  /** Tạo backup trước khi save */
  createBackup: boolean;
  /** Validate LaTeX trước khi save */
  validateBeforeSave: boolean;
  /** Format content trước khi save */
  formatContent: boolean;
  /** Encoding của file */
  encoding: 'utf-8' | 'latin1';
}

// ===== AUTO-COMPLETION =====

/**
 * Completion Item
 * Item trong auto-completion list
 */
export interface CompletionItem {
  /** Label hiển thị */
  label: string;
  /** Text sẽ được insert */
  insertText: string;
  /** Loại completion */
  kind: CompletionItemKind;
  /** Documentation */
  documentation?: string;
  /** Detail information */
  detail?: string;
  /** Sort order */
  sortText?: string;
}

/**
 * Completion Item Kind
 * Loại của completion item
 */
export enum CompletionItemKind {
  Command = 'command',
  Environment = 'environment',
  Snippet = 'snippet',
  Keyword = 'keyword',
  Function = 'function',
  Variable = 'variable',
  Text = 'text'
}

/**
 * Completion Context
 * Context khi trigger auto-completion
 */
export interface CompletionContext {
  /** Vị trí trigger */
  position: EditorPosition;
  /** Text trước cursor */
  textBeforeCursor: string;
  /** Text sau cursor */
  textAfterCursor: string;
  /** Trigger character */
  triggerCharacter?: string;
}

// ===== EDITOR ACTIONS =====

/**
 * Editor Action
 * Các action có thể thực hiện trong editor
 */
export interface EditorAction {
  /** ID của action */
  id: string;
  /** Label hiển thị */
  label: string;
  /** Keyboard shortcut */
  keybinding?: string;
  /** Icon */
  icon?: string;
  /** Handler function */
  handler: (editor: unknown) => void;
  /** Enabled condition */
  enabled?: boolean;
}

// ===== VALIDATION =====

/**
 * Validation Result
 * Kết quả validation LaTeX content
 */
export interface ValidationResult {
  /** Content hợp lệ */
  isValid: boolean;
  /** Danh sách errors */
  errors: ValidationError[];
  /** Danh sách warnings */
  warnings: ValidationWarning[];
  /** Validation timestamp */
  timestamp: Date;
}

/**
 * Validation Error
 * Lỗi validation
 */
export interface ValidationError {
  /** Message mô tả lỗi */
  message: string;
  /** Vị trí lỗi */
  position: EditorPosition;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
  /** Error code */
  code?: string;
}

/**
 * Validation Warning
 * Warning validation
 */
export interface ValidationWarning {
  /** Message mô tả warning */
  message: string;
  /** Vị trí warning */
  position: EditorPosition;
  /** Suggestion để fix */
  suggestion?: string;
}

// ===== EDITOR EVENTS =====

/**
 * Editor Event Types
 * Các loại event từ editor
 */
export type EditorEventType = 
  | 'content-changed'
  | 'cursor-moved'
  | 'selection-changed'
  | 'save-requested'
  | 'parse-completed'
  | 'validation-completed'
  | 'scroll-changed';

/**
 * Editor Event
 * Event được emit từ editor
 */
export interface EditorEvent<T = unknown> {
  /** Loại event */
  type: EditorEventType;
  /** Data của event */
  data: T;
  /** Timestamp */
  timestamp: Date;
}

// ===== UTILITY TYPES =====

/**
 * Editor Theme
 * Theme configuration cho editor
 */
export interface EditorTheme {
  /** Theme name */
  name: string;
  /** Base theme */
  base: 'light' | 'dark';
  /** Color rules */
  colors: Record<string, string>;
  /** Token colors */
  tokenColors: TokenColor[];
}

/**
 * Token Color
 * Màu sắc cho syntax highlighting
 */
export interface TokenColor {
  /** Token scope */
  scope: string | string[];
  /** Foreground color */
  foreground?: string;
  /** Background color */
  background?: string;
  /** Font style */
  fontStyle?: 'normal' | 'italic' | 'bold' | 'underline';
}

// ===== CONSTANTS =====

/**
 * Default Editor Configuration
 */
export const DEFAULT_EDITOR_CONFIG: LatexEditorConfig = {
  language: 'latex',
  theme: 'auto',
  fontSize: 14,
  showLineNumbers: true,
  showMinimap: true,
  wordWrap: true,
  autoCompletion: true,
  bracketMatching: true,
  autoIndent: true,
};

/**
 * Default Preview Options
 */
export const DEFAULT_PREVIEW_OPTIONS: PreviewOptions = {
  renderMath: true,
  showLineMapping: false,
  autoScrollSync: true,
  refreshDelay: 300,
};

/**
 * Default Scroll Sync Options
 */
export const DEFAULT_SCROLL_SYNC_OPTIONS: ScrollSyncOptions = {
  smoothScrolling: true,
  syncDelay: 100,
  syncThreshold: 10,
};

/**
 * Default Save Options
 */
export const DEFAULT_SAVE_OPTIONS: SaveOptions = {
  createBackup: true,
  validateBeforeSave: true,
  formatContent: false,
  encoding: 'utf-8',
};
