/**
 * Types cho streaming LaTeX processor
 */

export interface StreamingChunk {
  id: string;
  content: string;
  timestamp: number;
  isComplete: boolean;
}

export interface ProcessingResult {
  success: boolean;
  processedContent: string;
  errors: string[];
  warnings: string[];
}

export interface StreamingOptions {
  chunkSize?: number;
  delayMs?: number;
  validateLatex?: boolean;
}

export interface LatexValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface StreamingState {
  status: ProcessingStatus;
  progress: number;
  currentChunk: StreamingChunk | null;
  results: ProcessingResult[];
  error: string | null;
}

// Processing phases enum
export enum ProcessingPhase {
  INITIALIZING = 'initializing',
  READING_FILE = 'reading_file',
  PARSING_LATEX = 'parsing_latex',
  BATCH_PROCESSING = 'batch_processing',
  UPLOADING = 'uploading',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Additional types for large file uploader
export interface ProcessingOptions {
  batchSize?: number;
  maxRetries?: number;
  timeout?: number;
  validateLatex?: boolean;
}

export interface ProgressInfo {
  processed: number;
  total: number;
  percentage: number;
  phase: ProcessingPhase;
  estimatedTimeRemaining?: number;
}

export interface ProcessingError {
  message: string;
  code?: string;
  recoverable: boolean;
  context?: string;
}
