import { 
  StreamingChunk, 
  ProcessingResult, 
  StreamingOptions, 
  LatexValidationResult,
  ProcessingStatus,
  StreamingState 
} from './types';

/**
 * Class để xử lý streaming LaTeX content
 */
export class StreamingLatexProcessor {
  private Options: Required<StreamingOptions>;
  private state: StreamingState;
  private callbacks: {
    onChunk?: (chunk: StreamingChunk) => void;
    onProgress?: (progress: number) => void;
    onComplete?: (results: ProcessingResult[]) => void;
    onError?: (error: string) => void;
  } = {};

  constructor(Options: StreamingOptions = {}) {
    this.Options = {
      chunkSize: Options.chunkSize || 1000,
      delayMs: Options.delayMs || 100,
      validateLatex: Options.validateLatex ?? true,
    };

    this.state = {
      status: 'idle',
      progress: 0,
      currentChunk: null,
      results: [],
      error: null,
    };
  }

  /**
   * Đăng ký callback functions
   */
  on(event: string, callback: (...args: unknown[]) => void): void {
    switch (event) {
      case 'chunk':
        this.callbacks.onChunk = callback as (chunk: StreamingChunk) => void;
        break;
      case 'progress':
        this.callbacks.onProgress = callback as (progress: number) => void;
        break;
      case 'complete':
        this.callbacks.onComplete = callback as (results: ProcessingResult[]) => void;
        break;
      case 'error':
        this.callbacks.onError = callback as (error: string) => void;
        break;
    }
  }

  /**
   * Xử lý nội dung LaTeX theo chunks
   */
  async processContent(content: string): Promise<ProcessingResult[]> {
    try {
      this.state.status = 'processing';
      this.state.progress = 0;
      this.state.results = [];
      this.state.error = null;

      const chunks = this.splitIntoChunks(content);
      const results: ProcessingResult[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const progress = ((i + 1) / chunks.length) * 100;

        // Tạo streaming chunk
        const streamingChunk: StreamingChunk = {
          id: `chunk-${i}`,
          content: chunk,
          timestamp: Date.now(),
          isComplete: i === chunks.length - 1,
        };

        this.state.currentChunk = streamingChunk;
        this.state.progress = progress;

        // Callback cho chunk
        if (this.callbacks.onChunk) {
          this.callbacks.onChunk(streamingChunk);
        }

        // Callback cho progress
        if (this.callbacks.onProgress) {
          this.callbacks.onProgress(progress);
        }

        // Xử lý chunk
        const result = await this.processChunk(chunk);
        results.push(result);

        // Delay để simulate streaming
        if (this.Options.delayMs > 0) {
          await this.delay(this.Options.delayMs);
        }
      }

      this.state.status = 'completed';
      this.state.results = results;

      // Callback cho complete
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(results);
      }

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state.status = 'error';
      this.state.error = errorMessage;

      if (this.callbacks.onError) {
        this.callbacks.onError(errorMessage);
      }

      throw error;
    }
  }

  /**
   * Chia nội dung thành các chunks
   */
  private splitIntoChunks(content: string): string[] {
    const chunks: string[] = [];
    const chunkSize = this.Options.chunkSize;

    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }

    return chunks;
  }

  /**
   * Xử lý một chunk
   */
  private async processChunk(chunk: string): Promise<ProcessingResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate LaTeX nếu được yêu cầu
    if (this.Options.validateLatex) {
      const validation = this.validateLatex(chunk);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }

    // Xử lý nội dung (có thể thêm logic xử lý khác ở đây)
    const processedContent = this.processLatexContent(chunk);

    return {
      success: errors.length === 0,
      processedContent,
      errors,
      warnings,
    };
  }

  /**
   * Validate LaTeX syntax
   */
  private validateLatex(content: string): LatexValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Kiểm tra cặp dấu ngoặc
    const bracketPairs = [
      { open: '\\{', close: '\\}' },
      { open: '\\[', close: '\\]' },
      { open: '\\(', close: '\\)' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ];

    bracketPairs.forEach(pair => {
      const openCount = (content.match(new RegExp(pair.open.replace(/[\\[\](){}]/g, '\\$&'), 'g')) || []).length;
      const closeCount = (content.match(new RegExp(pair.close.replace(/[\\[\](){}]/g, '\\$&'), 'g')) || []).length;
      
      if (openCount !== closeCount) {
        errors.push(`Unmatched ${pair.open}${pair.close}: ${openCount} open, ${closeCount} close`);
      }
    });

    // Kiểm tra các lệnh LaTeX phổ biến
    const commonCommands = ['\\begin', '\\end', '\\frac', '\\sqrt', '\\sum', '\\int'];
    commonCommands.forEach(cmd => {
      if (content.includes(cmd) && !content.includes(cmd + '{')) {
        warnings.push(`Command ${cmd} might be missing braces`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Xử lý nội dung LaTeX
   */
  private processLatexContent(content: string): string {
    // Có thể thêm logic xử lý LaTeX ở đây
    // Ví dụ: normalize whitespace, fix common issues, etc.
    return content.trim();
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Lấy trạng thái hiện tại
   */
  getState(): StreamingState {
    return { ...this.state };
  }

  /**
   * Reset processor
   */
  reset(): void {
    this.state = {
      status: 'idle',
      progress: 0,
      currentChunk: null,
      results: [],
      error: null,
    };
  }
}

export default StreamingLatexProcessor;
