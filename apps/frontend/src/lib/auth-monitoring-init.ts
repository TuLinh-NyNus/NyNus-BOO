/**
 * Authentication Monitoring Initialization
 * ======================================
 * Initialize authentication monitoring và health checks
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { startAuthMonitoring } from '@/lib/utils/auth-monitor';
import { logger } from '@/lib/logger';

/**
 * Initialize authentication monitoring
 * Chỉ chạy trên client-side
 */
export function initializeAuthMonitoring(): void {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Start monitoring với health report mỗi 5 phút
    startAuthMonitoring(5 * 60 * 1000);
    
    logger.info('[AuthMonitoring] Authentication monitoring initialized successfully');
  } catch (error) {
    logger.error('[AuthMonitoring] Failed to initialize authentication monitoring', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Auto-initialize khi module được import
if (typeof window !== 'undefined') {
  // Delay initialization để đảm bảo app đã load
  setTimeout(() => {
    initializeAuthMonitoring();
  }, 1000);
}


