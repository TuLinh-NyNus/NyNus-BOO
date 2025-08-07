/**
 * Stream-based import optimizer
 * Xử lý file lớn mà không load toàn bộ vào memory
 */

export interface StreamImportConfig {
  chunkSize: number;          // Kích thước chunk để đọc file
  batchSize: number;          // Số câu hỏi/batch gửi lên server
  maxConcurrentBatches: number; // Số batch song song
  streamBufferSize: number;   // Buffer size cho stream
}

export class StreamImportOptimizer {
  private config: StreamImportConfig = {
    chunkSize: 1024 * 1024,    // 1MB chunks
    batchSize: 200,            // 200 câu hỏi/batch
    maxConcurrentBatches: 5,   // 5 batch song song
    streamBufferSize: 10       // 10 batch buffer
  };

  constructor(config?: Partial<StreamImportConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Stream processing cho file cực lớn
   */
  async streamProcessLargeFile(
    file: File,
    onProgress: (progress: any) => void
  ): Promise<{ success: boolean; totalProcessed: number; errors: string[] }> {
    console.log(`[Stream Import] Bắt đầu stream processing file ${file.name} (${file.size} bytes)`);

    const reader = file.stream().getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    let totalQuestions = 0;
    let processedQuestions = 0;
    let successCount = 0;
    const errors: string[] = [];
    
    // Queue để quản lý batch processing
    const batchQueue: string[][] = [];
    const activeBatches = new Set<Promise<any>>();

    try {
      // Đọc file theo chunks
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Xử lý buffer cuối cùng
          if (buffer.trim()) {
            const finalQuestions = this.extractQuestionsFromBuffer(buffer);
            if (finalQuestions.length > 0) {
              await this.processBatchQueue(finalQuestions, batchQueue, activeBatches, onProgress);
            }
          }
          break;
        }

        // Decode chunk và thêm vào buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Trích xuất câu hỏi hoàn chỉnh từ buffer
        const { questions, remainingBuffer } = this.extractCompleteQuestions(buffer);
        buffer = remainingBuffer;

        if (questions.length > 0) {
          totalQuestions += questions.length;
          
          // Chia thành batches và thêm vào queue
          const batches = this.createBatches(questions);
          batchQueue.push(...batches);

          // Xử lý batches nếu queue đủ lớn hoặc đạt max concurrent
          if (batchQueue.length >= this.config.streamBufferSize || 
              activeBatches.size >= this.config.maxConcurrentBatches) {
            
            const results = await this.processBatchQueue([], batchQueue, activeBatches, onProgress);
            processedQuestions += results.processed;
            successCount += results.success;
            errors.push(...results.errors);
          }

          // Update progress
          onProgress({
            totalQuestions,
            processedQuestions,
            successCount,
            errorCount: errors.length,
            status: 'uploading',
            message: `Đang xử lý... ${processedQuestions}/${totalQuestions} câu hỏi`
          });
        }
      }

      // Xử lý các batch còn lại
      while (batchQueue.length > 0 || activeBatches.size > 0) {
        const results = await this.processBatchQueue([], batchQueue, activeBatches, onProgress);
        processedQuestions += results.processed;
        successCount += results.success;
        errors.push(...results.errors);
      }

      console.log(`[Stream Import] Hoàn thành: ${successCount}/${totalQuestions} câu hỏi`);

      return {
        success: errors.length === 0,
        totalProcessed: totalQuestions,
        errors
      };

    } catch (error) {
      console.error('[Stream Import] Lỗi:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Trích xuất câu hỏi hoàn chỉnh từ buffer
   */
  private extractCompleteQuestions(buffer: string): {
    questions: string[];
    remainingBuffer: string;
  } {
    const questions: string[] = [];
    const questionPattern = /\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g;
    
    let lastIndex = 0;
    let match;

    while ((match = questionPattern.exec(buffer)) !== null) {
      questions.push(match[0]);
      lastIndex = match.index + match[0].length;
    }

    // Giữ lại phần buffer chưa hoàn chỉnh
    const remainingBuffer = buffer.substring(lastIndex);

    return { questions, remainingBuffer };
  }

  /**
   * Trích xuất câu hỏi từ buffer (cho buffer cuối cùng)
   */
  private extractQuestionsFromBuffer(buffer: string): string[] {
    const questionPattern = /\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g;
    const questions: string[] = [];
    let match;

    while ((match = questionPattern.exec(buffer)) !== null) {
      questions.push(match[0]);
    }

    return questions;
  }

  /**
   * Tạo batches từ danh sách câu hỏi
   */
  private createBatches(questions: string[]): string[][] {
    const batches: string[][] = [];
    
    for (let i = 0; i < questions.length; i += this.config.batchSize) {
      batches.push(questions.slice(i, i + this.config.batchSize));
    }
    
    return batches;
  }

  /**
   * Xử lý batch queue
   */
  private async processBatchQueue(
    newQuestions: string[],
    batchQueue: string[][],
    activeBatches: Set<Promise<any>>,
    onProgress: (progress: any) => void
  ): Promise<{ processed: number; success: number; errors: string[] }> {
    let totalProcessed = 0;
    let totalSuccess = 0;
    const allErrors: string[] = [];

    // Thêm questions mới vào queue
    if (newQuestions.length > 0) {
      const newBatches = this.createBatches(newQuestions);
      batchQueue.push(...newBatches);
    }

    // Xử lý batches cho đến khi đạt max concurrent hoặc hết queue
    while (batchQueue.length > 0 && activeBatches.size < this.config.maxConcurrentBatches) {
      const batch = batchQueue.shift()!;
      
      const batchPromise = this.processSingleBatch(batch)
        .then(result => {
          totalProcessed += result.processed;
          totalSuccess += result.success;
          allErrors.push(...result.errors);
          return result;
        })
        .finally(() => {
          activeBatches.delete(batchPromise);
        });

      activeBatches.add(batchPromise);
    }

    // Đợi ít nhất 1 batch hoàn thành nếu đã đạt max concurrent
    if (activeBatches.size >= this.config.maxConcurrentBatches) {
      await Promise.race(activeBatches);
    }

    return {
      processed: totalProcessed,
      success: totalSuccess,
      errors: allErrors
    };
  }

  /**
   * Xử lý một batch câu hỏi
   */
  private async processSingleBatch(batch: string[]): Promise<{
    processed: number;
    success: number;
    errors: string[];
  }> {
    try {
      const response = await fetch('/api/admin/questions/ultra-fast-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: batch.map(content => ({ latexContent: content }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        processed: batch.length,
        success: result.successCount || 0,
        errors: result.errors || []
      };

    } catch (error) {
      return {
        processed: batch.length,
        success: 0,
        errors: [`Batch error: ${error.message}`]
      };
    }
  }

  /**
   * Ước tính hiệu suất
   */
  estimatePerformance(fileSize: number): {
    estimatedQuestions: number;
    estimatedTimeMinutes: number;
    recommendedConfig: Partial<StreamImportConfig>;
  } {
    // Ước tính 1KB = 1 câu hỏi trung bình
    const estimatedQuestions = Math.floor(fileSize / 1024);
    
    // Với stream processing: ~2000 câu hỏi/phút
    const estimatedTimeMinutes = Math.ceil(estimatedQuestions / 2000);
    
    // Cấu hình tối ưu dựa trên kích thước file
    const recommendedConfig: Partial<StreamImportConfig> = {};
    
    if (fileSize > 100 * 1024 * 1024) { // > 100MB
      recommendedConfig.batchSize = 500;
      recommendedConfig.maxConcurrentBatches = 8;
      recommendedConfig.chunkSize = 2 * 1024 * 1024; // 2MB
    } else if (fileSize > 10 * 1024 * 1024) { // > 10MB
      recommendedConfig.batchSize = 300;
      recommendedConfig.maxConcurrentBatches = 5;
    }

    return {
      estimatedQuestions,
      estimatedTimeMinutes,
      recommendedConfig
    };
  }
}
