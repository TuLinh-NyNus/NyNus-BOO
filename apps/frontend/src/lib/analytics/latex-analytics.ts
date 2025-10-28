/**
 * LaTeX Analytics Service
 * ======================
 * Theo dõi và phân tích hiệu suất của hệ thống phân tích LaTeX
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

interface LatexParseEvent {
  timestamp: number;
  contentLength: number;
  parseTimeMs: number;
  success: boolean;
  errorCode?: number;
  errorMessage?: string;
  questionCount?: number;
  warningCount?: number;
}

interface LatexAnalytics {
  totalParses: number;
  successfulParses: number;
  failedParses: number;
  averageParseTime: number;
  averageContentLength: number;
  commonErrors: Record<string, number>;
  performanceMetrics: {
    p50: number; // 50th percentile parse time
    p95: number; // 95th percentile parse time
    p99: number; // 99th percentile parse time
  };
}

class LatexAnalyticsService {
  private events: LatexParseEvent[] = [];
  private readonly maxEvents = 1000; // Keep last 1000 events in memory
  private readonly storageKey = 'latex_analytics_events';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Ghi lại một sự kiện phân tích LaTeX
   */
  recordParseEvent(event: Omit<LatexParseEvent, 'timestamp'>): void {
    const fullEvent: LatexParseEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    // Giữ chỉ các sự kiện gần nhất
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    this.saveToStorage();
  }

  /**
   * Lấy thống kê phân tích
   */
  getAnalytics(): LatexAnalytics {
    if (this.events.length === 0) {
      return {
        totalParses: 0,
        successfulParses: 0,
        failedParses: 0,
        averageParseTime: 0,
        averageContentLength: 0,
        commonErrors: {},
        performanceMetrics: { p50: 0, p95: 0, p99: 0 }
      };
    }

    const successfulEvents = this.events.filter(e => e.success);
    const failedEvents = this.events.filter(e => !e.success);
    
    // Tính toán thời gian phân tích
    const parseTimes = this.events.map(e => e.parseTimeMs).sort((a, b) => a - b);
    const averageParseTime = parseTimes.reduce((sum, time) => sum + time, 0) / parseTimes.length;
    
    // Tính toán độ dài nội dung trung bình
    const averageContentLength = this.events.reduce((sum, e) => sum + e.contentLength, 0) / this.events.length;
    
    // Thống kê lỗi phổ biến
    const commonErrors: Record<string, number> = {};
    failedEvents.forEach(event => {
      if (event.errorMessage) {
        commonErrors[event.errorMessage] = (commonErrors[event.errorMessage] || 0) + 1;
      }
    });

    // Tính toán percentiles
    const getPercentile = (arr: number[], percentile: number): number => {
      const index = Math.ceil((percentile / 100) * arr.length) - 1;
      return arr[Math.max(0, index)] || 0;
    };

    return {
      totalParses: this.events.length,
      successfulParses: successfulEvents.length,
      failedParses: failedEvents.length,
      averageParseTime: Math.round(averageParseTime),
      averageContentLength: Math.round(averageContentLength),
      commonErrors,
      performanceMetrics: {
        p50: getPercentile(parseTimes, 50),
        p95: getPercentile(parseTimes, 95),
        p99: getPercentile(parseTimes, 99)
      }
    };
  }

  /**
   * Lấy thống kê trong khoảng thời gian
   */
  getAnalyticsForPeriod(hours: number): LatexAnalytics {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const originalEvents = this.events;
    
    // Tạm thời lọc events trong khoảng thời gian
    this.events = this.events.filter(e => e.timestamp >= cutoffTime);
    const analytics = this.getAnalytics();
    
    // Khôi phục events gốc
    this.events = originalEvents;
    
    return analytics;
  }

  /**
   * Xóa tất cả dữ liệu analytics
   */
  clearAnalytics(): void {
    this.events = [];
    this.saveToStorage();
  }

  /**
   * Lưu vào localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics to storage:', error);
    }
  }

  /**
   * Tải từ localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics from storage:', error);
      this.events = [];
    }
  }

  /**
   * Xuất dữ liệu analytics (cho debugging hoặc báo cáo)
   */
  exportData(): { events: LatexParseEvent[]; analytics: LatexAnalytics } {
    return {
      events: [...this.events],
      analytics: this.getAnalytics()
    };
  }
}

// Singleton instance
export const latexAnalytics = new LatexAnalyticsService();

// Helper function để đo thời gian thực hiện
export function measureParseTime<T>(
  operation: () => Promise<T>,
  contentLength: number
): Promise<{ result: T; parseTimeMs: number }> {
  const startTime = performance.now();
  
  return operation().then(
    (result) => {
      const parseTimeMs = performance.now() - startTime;
      return { result, parseTimeMs };
    },
    (error) => {
      const parseTimeMs = performance.now() - startTime;
      // Ghi lại lỗi
      latexAnalytics.recordParseEvent({
        contentLength,
        parseTimeMs,
        success: false,
        errorMessage: error.message || 'Unknown error'
      });
      throw error;
    }
  );
}

export type { LatexParseEvent, LatexAnalytics };






