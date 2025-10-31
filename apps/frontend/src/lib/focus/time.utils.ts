/**
 * Time Utilities for Focus Room
 * Helper functions cho việc format và tính toán thời gian
 * 
 * @author NyNus Development Team
 * @created 2025-01-30
 */

/**
 * Format seconds thành MM:SS
 * @param seconds - Số giây
 * @returns Chuỗi định dạng "25:00"
 */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format seconds thành human-readable duration
 * @param seconds - Số giây
 * @returns Chuỗi định dạng "2h 30m" hoặc "45m" hoặc "30s"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }
  
  return `${minutes}m`;
}

/**
 * Tính toán thời điểm kết thúc
 * @param startTime - Thời điểm bắt đầu
 * @param durationSeconds - Thời lượng (giây)
 * @returns Thời điểm kết thúc
 */
export function calculateEndTime(startTime: Date, durationSeconds: number): Date {
  return new Date(startTime.getTime() + durationSeconds * 1000);
}

/**
 * Tính khoảng cách thời gian giữa 2 thời điểm
 * @param date1 - Thời điểm 1
 * @param date2 - Thời điểm 2
 * @returns Số giây chênh lệch
 */
export function getTimeDifference(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / 1000);
}

/**
 * Parse MM:SS string thành seconds
 * @param timeString - Chuỗi định dạng "25:00"
 * @returns Số giây
 */
export function parseTimerString(timeString: string): number {
  const [mins, secs] = timeString.split(":").map(Number);
  return mins * 60 + secs;
}

/**
 * Tính phần trăm thời gian đã trôi qua
 * @param elapsed - Thời gian đã trôi (giây)
 * @param total - Tổng thời gian (giây)
 * @returns Phần trăm (0-100)
 */
export function calculateProgress(elapsed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

