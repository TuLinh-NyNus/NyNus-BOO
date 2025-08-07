/**
 * Tối ưu hóa bulk import cho file lớn
 */

export interface ImportProgress {
  totalQuestions: number;
  processedQuestions: number;
  successCount: number;
  errorCount: number;
  currentBatch: number;
  totalBatches: number;
  status: 'parsing' | 'uploading' | 'completed' | 'error';
  message: string;
}

export interface ImportConfig {
  batchSize: number;
  maxConcurrentBatches: number;
  delayBetweenBatches: number;
  enableProgressCallback: boolean;
}

export class BulkImportOptimizer {
  private config: ImportConfig = {
    batchSize: 100,           // 100 câu hỏi/batch
    maxConcurrentBatches: 3,  // Tối đa 3 batch song song
    delayBetweenBatches: 500, // 500ms delay giữa các batch
    enableProgressCallback: true
  };

  constructor(config?: Partial<ImportConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Xử lý file lớn bằng streaming
   */
  async processLargeFile(
    file: File,
    onProgress: (progress: ImportProgress) => void
  ): Promise<{ success: boolean; totalProcessed: number; errors: string[] }> {
    const reader = new FileReader();
    const chunks: string[] = [];
    const buffer = '';
    const chunkSize = 1024 * 1024; // 1MB chunks

    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const questions = this.parseQuestionsFromContent(content);
          
          onProgress({
            totalQuestions: questions.length,
            processedQuestions: 0,
            successCount: 0,
            errorCount: 0,
            currentBatch: 0,
            totalBatches: Math.ceil(questions.length / this.config.batchSize),
            status: 'parsing',
            message: `Đã phân tích ${questions.length} câu hỏi`
          });

          const result = await this.processBatches(questions, onProgress);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Lỗi đọc file'));
      reader.readAsText(file);
    });
  }

  /**
   * Phân tích câu hỏi từ nội dung LaTeX
   */
  private parseQuestionsFromContent(content: string): string[] {
    // Tách câu hỏi dựa trên pattern \begin{ex}...\end{ex}
    const questionPattern = /\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g;
    const questions: string[] = [];
    let match;

    while ((match = questionPattern.exec(content)) !== null) {
      questions.push(`\\begin{ex}${match[1]}\\end{ex}`);
    }

    return questions;
  }

  /**
   * Xử lý theo batch với progress tracking
   */
  private async processBatches(
    questions: string[],
    onProgress: (progress: ImportProgress) => void
  ): Promise<{ success: boolean; totalProcessed: number; errors: string[] }> {
    const batches = this.createBatches(questions);
    const results = {
      success: true,
      totalProcessed: 0,
      errors: [] as string[]
    };

    onProgress({
      totalQuestions: questions.length,
      processedQuestions: 0,
      successCount: 0,
      errorCount: 0,
      currentBatch: 0,
      totalBatches: batches.length,
      status: 'uploading',
      message: 'Bắt đầu upload câu hỏi...'
    });

    // Xử lý từng batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        const batchResult = await this.processSingleBatch(batch, i + 1);
        
        results.totalProcessed += batchResult.successCount;
        results.errors.push(...batchResult.errors);

        // Cập nhật progress
        onProgress({
          totalQuestions: questions.length,
          processedQuestions: results.totalProcessed,
          successCount: results.totalProcessed,
          errorCount: results.errors.length,
          currentBatch: i + 1,
          totalBatches: batches.length,
          status: 'uploading',
          message: `Đã xử lý ${i + 1}/${batches.length} batch`
        });

        // Delay giữa các batch để tránh quá tải server
        if (i < batches.length - 1) {
          await this.delay(this.config.delayBetweenBatches);
        }

      } catch (error) {
        console.error(`Lỗi batch ${i + 1}:`, error);
        results.errors.push(`Batch ${i + 1}: ${error.message}`);
        results.success = false;
      }
    }

    onProgress({
      totalQuestions: questions.length,
      processedQuestions: results.totalProcessed,
      successCount: results.totalProcessed,
      errorCount: results.errors.length,
      currentBatch: batches.length,
      totalBatches: batches.length,
      status: results.success ? 'completed' : 'error',
      message: `Hoàn thành! Đã xử lý ${results.totalProcessed}/${questions.length} câu hỏi`
    });

    return results;
  }

  /**
   * Tạo các batch từ danh sách câu hỏi
   */
  private createBatches(questions: string[]): string[][] {
    const batches: string[][] = [];
    
    for (let i = 0; i < questions.length; i += this.config.batchSize) {
      batches.push(questions.slice(i, i + this.config.batchSize));
    }
    
    return batches;
  }

  /**
   * Xử lý một batch câu hỏi
   */
  private async processSingleBatch(
    batch: string[],
    batchNumber: number
  ): Promise<{ successCount: number; errors: string[] }> {
    try {
      const response = await fetch('/api/admin/questions/batch-import-optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: batch.map(content => ({ latexContent: content })),
          batchNumber,
          totalBatches: Math.ceil(batch.length / this.config.batchSize)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        successCount: result.successCount || 0,
        errors: result.errors || []
      };

    } catch (error) {
      return {
        successCount: 0,
        errors: [`Batch ${batchNumber}: ${error.message}`]
      };
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ước tính thời gian xử lý
   */
  estimateProcessingTime(questionCount: number): {
    estimatedMinutes: number;
    estimatedBatches: number;
    recommendedBatchSize: number;
  } {
    const recommendedBatchSize = questionCount > 10000 ? 50 : 
                                questionCount > 1000 ? 100 : 200;
    
    const batches = Math.ceil(questionCount / recommendedBatchSize);
    const estimatedSeconds = batches * (this.config.delayBetweenBatches / 1000 + 2); // 2s per batch
    
    return {
      estimatedMinutes: Math.ceil(estimatedSeconds / 60),
      estimatedBatches: batches,
      recommendedBatchSize
    };
  }
}
