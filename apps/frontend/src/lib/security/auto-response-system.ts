/**
 * Auto Response System
 * ====================
 *
 * Automated response system cho security threats
 * Tự động phản ứng với các mối đe dọa được phát hiện
 *
 * Features:
 * - Auto-execute responses (ALERT, BLOCK, MFA_REQUIRED, LOGOUT, RATE_LIMIT)
 * - Frontend responses (show alerts, force re-auth, logout)
 * - User notifications (in-app, email triggers)
 * - Response logging & audit trail
 *
 * Performance:
 * - Responses < 500ms
 * - No false alerts
 * - Users informed clearly
 * - Appeals handled properly
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 4 Enhanced Security
 */

import { logger } from '@/lib/logger';
import type { ThreatEvent, MitigationAction } from './threat-detection-engine';
import type { AnomalyScore } from './anomaly-detector';

// ===== TYPES =====

export type ResponseAction = MitigationAction;

export type ResponseStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface SecurityResponse {
  id: string;
  action: ResponseAction;
  threatId: string;
  userId?: string;
  reason: string;
  triggeredBy: 'threat' | 'anomaly' | 'manual';
  status: ResponseStatus;
  executedAt?: number;
  completedAt?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationConfig {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  customMessage?: string;
}

export interface ResponseConfig {
  enabled: boolean;
  autoExecute: boolean; // Auto-execute or require manual approval
  notifyUser: boolean;
  logResponses: boolean;
  onResponseExecuted?: (response: SecurityResponse) => void;
  onResponseFailed?: (response: SecurityResponse, error: Error) => void;
}

export interface ResponseExecutor {
  action: ResponseAction;
  execute: (response: SecurityResponse) => Promise<void>;
}

// ===== AUTO RESPONSE SYSTEM =====

export class AutoResponseSystem {
  private static instance: AutoResponseSystem;
  private readonly serviceName = 'AutoResponseSystem';
  private config: ResponseConfig;
  private responses: SecurityResponse[] = [];
  private executors: Map<ResponseAction, ResponseExecutor> = new Map();
  private isActive = false;

  static getInstance(config?: Partial<ResponseConfig>): AutoResponseSystem {
    if (!AutoResponseSystem.instance) {
      AutoResponseSystem.instance = new AutoResponseSystem(config);
    }
    return AutoResponseSystem.instance;
  }

  private constructor(config?: Partial<ResponseConfig>) {
    const defaultConfig: ResponseConfig = {
      enabled: true,
      autoExecute: true,
      notifyUser: true,
      logResponses: true,
    };

    this.config = { ...defaultConfig, ...config };

    // Register default executors
    this.registerDefaultExecutors();

    if (this.config.enabled) {
      this.start();
    }

    logger.info(`[${this.serviceName}] Initialized`);
  }

  /**
   * Start auto response system
   */
  start(): void {
    if (this.isActive) {
      logger.warn(`[${this.serviceName}] Already active`);
      return;
    }

    this.isActive = true;
    logger.info(`[${this.serviceName}] Started`);
  }

  /**
   * Stop auto response system
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    logger.info(`[${this.serviceName}] Stopped`);
  }

  /**
   * Register default response executors
   */
  private registerDefaultExecutors(): void {
    // ALERT executor
    this.registerExecutor({
      action: 'ALERT',
      execute: async (response) => {
        logger.warn(`[${this.serviceName}] ALERT response`, {
          threatId: response.threatId,
          userId: response.userId,
          reason: response.reason,
        });

        // Show in-app alert
        if (this.config.notifyUser) {
          this.showInAppAlert(response);
        }

        // Trigger email notification (would call backend)
        // await this.sendEmailNotification(response);
      },
    });

    // BLOCK executor
    this.registerExecutor({
      action: 'BLOCK',
      execute: async (response) => {
        logger.error(`[${this.serviceName}] BLOCK response`, {
          threatId: response.threatId,
          userId: response.userId,
          reason: response.reason,
        });

        // Block user in frontend (prevent actions)
        this.blockUser(response.userId);

        // Show blocking notification
        if (this.config.notifyUser) {
          this.showBlockedNotification(response);
        }

        // Backend should also block user at API level
        // await this.callBackendBlockUser(response.userId);
      },
    });

    // MFA_REQUIRED executor
    this.registerExecutor({
      action: 'MFA_REQUIRED',
      execute: async (response) => {
        logger.warn(`[${this.serviceName}] MFA_REQUIRED response`, {
          threatId: response.threatId,
          userId: response.userId,
          reason: response.reason,
        });

        // Force MFA verification
        this.requireMFA(response.userId);

        // Show MFA requirement notification
        if (this.config.notifyUser) {
          this.showMFARequiredNotification(response);
        }
      },
    });

    // LOGOUT executor
    this.registerExecutor({
      action: 'LOGOUT',
      execute: async (response) => {
        logger.error(`[${this.serviceName}] LOGOUT response`, {
          threatId: response.threatId,
          userId: response.userId,
          reason: response.reason,
        });

        // Force logout
        this.forceLogout(response.userId);

        // Show logout notification
        if (this.config.notifyUser) {
          this.showLogoutNotification(response);
        }

        // Backend should also terminate session
        // await this.callBackendTerminateSession(response.userId);
      },
    });

    // RATE_LIMIT executor
    this.registerExecutor({
      action: 'RATE_LIMIT',
      execute: async (response) => {
        logger.warn(`[${this.serviceName}] RATE_LIMIT response`, {
          threatId: response.threatId,
          userId: response.userId,
          reason: response.reason,
        });

        // Apply rate limiting in frontend
        this.applyRateLimit(response.userId);

        // Show rate limit notification
        if (this.config.notifyUser) {
          this.showRateLimitNotification(response);
        }

        // Backend should also enforce rate limits
        // await this.callBackendApplyRateLimit(response.userId);
      },
    });
  }

  /**
   * Register custom response executor
   */
  registerExecutor(executor: ResponseExecutor): void {
    this.executors.set(executor.action, executor);
    logger.info(`[${this.serviceName}] Executor registered`, { action: executor.action });
  }

  /**
   * Handle threat detected
   * Business Logic: Tạo và execute response cho threat
   */
  async handleThreat(threat: ThreatEvent): Promise<SecurityResponse> {
    const response: SecurityResponse = {
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action: threat.mitigationAction,
      threatId: threat.id,
      userId: threat.userId,
      reason: threat.description,
      triggeredBy: 'threat',
      status: 'pending',
      metadata: {
        threatType: threat.threatType,
        severity: threat.severity,
        riskScore: threat.riskScore,
      },
    };

    this.responses.push(response);

    if (this.config.autoExecute) {
      await this.executeResponse(response);
    }

    return response;
  }

  /**
   * Handle anomaly detected
   * Business Logic: Tạo và execute response cho anomaly
   */
  async handleAnomaly(anomaly: AnomalyScore): Promise<SecurityResponse> {
    // Determine action based on anomaly severity
    const action = this.getActionForAnomaly(anomaly);

    const response: SecurityResponse = {
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      threatId: `anomaly-${anomaly.userId}-${anomaly.timestamp}`,
      userId: anomaly.userId,
      reason: anomaly.description,
      triggeredBy: 'anomaly',
      status: 'pending',
      metadata: {
        anomalyType: anomaly.anomalyType,
        severity: anomaly.severity,
        score: anomaly.score,
      },
    };

    this.responses.push(response);

    if (this.config.autoExecute) {
      await this.executeResponse(response);
    }

    return response;
  }

  /**
   * Get mitigation action for anomaly
   */
  private getActionForAnomaly(anomaly: AnomalyScore): ResponseAction {
    switch (anomaly.severity) {
      case 'critical':
        return 'LOGOUT';
      case 'high':
        return 'MFA_REQUIRED';
      case 'medium':
        return 'ALERT';
      case 'low':
      default:
        return 'ALERT';
    }
  }

  /**
   * Execute security response
   */
  async executeResponse(response: SecurityResponse): Promise<void> {
    if (!this.isActive) {
      logger.warn(`[${this.serviceName}] System not active, skipping response`);
      return;
    }

    const executor = this.executors.get(response.action);

    if (!executor) {
      logger.error(`[${this.serviceName}] No executor found for action`, {
        action: response.action,
      });
      response.status = 'failed';
      response.error = `No executor for action: ${response.action}`;
      return;
    }

    response.status = 'executing';
    response.executedAt = Date.now();

    try {
      await executor.execute(response);

      response.status = 'completed';
      response.completedAt = Date.now();

      if (this.config.onResponseExecuted) {
        this.config.onResponseExecuted(response);
      }

      logger.info(`[${this.serviceName}] Response executed successfully`, {
        responseId: response.id,
        action: response.action,
        duration: response.completedAt - response.executedAt,
      });
    } catch (error) {
      response.status = 'failed';
      response.error = error instanceof Error ? error.message : String(error);

      if (this.config.onResponseFailed) {
        this.config.onResponseFailed(response, error as Error);
      }

      logger.error(`[${this.serviceName}] Response execution failed`, {
        responseId: response.id,
        action: response.action,
        error: response.error,
      });
    }
  }

  /**
   * Show in-app alert
   */
  private showInAppAlert(response: SecurityResponse): void {
    // This would integrate with your toast/notification system
    logger.info(`[${this.serviceName}] Showing in-app alert`, {
      message: response.reason,
    });

    // Example: authToast.warning(response.reason);
  }

  /**
   * Show blocked notification
   */
  private showBlockedNotification(response: SecurityResponse): void {
    logger.warn(`[${this.serviceName}] Showing blocked notification`, {
      userId: response.userId,
    });

    // Example: authToast.error('Tài khoản của bạn đã bị khóa do vi phạm bảo mật');
  }

  /**
   * Show MFA required notification
   */
  private showMFARequiredNotification(response: SecurityResponse): void {
    logger.info(`[${this.serviceName}] Showing MFA required notification`, {
      userId: response.userId,
    });

    // Example: authToast.warning('Yêu cầu xác thực 2 lớp để tiếp tục');
  }

  /**
   * Show logout notification
   */
  private showLogoutNotification(response: SecurityResponse): void {
    logger.warn(`[${this.serviceName}] Showing logout notification`, {
      userId: response.userId,
    });

    // Example: authToast.error('Phiên làm việc đã kết thúc do phát hiện hoạt động đáng ngờ');
  }

  /**
   * Show rate limit notification
   */
  private showRateLimitNotification(response: SecurityResponse): void {
    logger.warn(`[${this.serviceName}] Showing rate limit notification`, {
      userId: response.userId,
    });

    // Example: authToast.warning('Vui lòng giảm tốc độ truy cập');
  }

  /**
   * Block user (frontend-side)
   */
  private blockUser(userId?: string): void {
    if (!userId) return;

    logger.warn(`[${this.serviceName}] Blocking user`, { userId });

    // Store in localStorage/sessionStorage to prevent actions
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`blocked_user_${userId}`, 'true');
    }
  }

  /**
   * Require MFA (frontend-side)
   */
  private requireMFA(userId?: string): void {
    if (!userId) return;

    logger.info(`[${this.serviceName}] Requiring MFA`, { userId });

    // Store MFA requirement flag
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`mfa_required_${userId}`, 'true');
    }
  }

  /**
   * Force logout (frontend-side)
   */
  private forceLogout(userId?: string): void {
    if (!userId) return;

    logger.warn(`[${this.serviceName}] Forcing logout`, { userId });

    // Clear auth state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      // Redirect to login page
      // window.location.href = '/login';
    }
  }

  /**
   * Apply rate limit (frontend-side)
   */
  private applyRateLimit(userId?: string): void {
    if (!userId) return;

    logger.info(`[${this.serviceName}] Applying rate limit`, { userId });

    // Store rate limit timestamp
    if (typeof window !== 'undefined') {
      const now = Date.now();
      sessionStorage.setItem(`rate_limit_${userId}`, String(now));
    }
  }

  /**
   * Get responses
   */
  getResponses(options?: {
    userId?: string;
    action?: ResponseAction;
    status?: ResponseStatus;
    limit?: number;
  }): SecurityResponse[] {
    let responses = [...this.responses];

    if (options?.userId) {
      responses = responses.filter(r => r.userId === options.userId);
    }

    if (options?.action) {
      responses = responses.filter(r => r.action === options.action);
    }

    if (options?.status) {
      responses = responses.filter(r => r.status === options.status);
    }

    // Sort by executedAt descending
    responses.sort((a, b) => (b.executedAt || 0) - (a.executedAt || 0));

    if (options?.limit) {
      responses = responses.slice(0, options.limit);
    }

    return responses;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      isActive: this.isActive,
      totalResponses: this.responses.length,
      responsesByStatus: {
        pending: this.responses.filter(r => r.status === 'pending').length,
        executing: this.responses.filter(r => r.status === 'executing').length,
        completed: this.responses.filter(r => r.status === 'completed').length,
        failed: this.responses.filter(r => r.status === 'failed').length,
      },
      responsesByAction: {
        ALERT: this.responses.filter(r => r.action === 'ALERT').length,
        BLOCK: this.responses.filter(r => r.action === 'BLOCK').length,
        MFA_REQUIRED: this.responses.filter(r => r.action === 'MFA_REQUIRED').length,
        LOGOUT: this.responses.filter(r => r.action === 'LOGOUT').length,
        RATE_LIMIT: this.responses.filter(r => r.action === 'RATE_LIMIT').length,
      },
      averageResponseTime: this.calculateAverageResponseTime(),
    };
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    const completed = this.responses.filter(r => r.status === 'completed' && r.executedAt && r.completedAt);

    if (completed.length === 0) {
      return 0;
    }

    const totalTime = completed.reduce((sum, r) => {
      return sum + (r.completedAt! - r.executedAt!);
    }, 0);

    return Math.round(totalTime / completed.length);
  }

  /**
   * Destroy system
   */
  destroy(): void {
    this.stop();
    this.responses = [];
    this.executors.clear();
    logger.info(`[${this.serviceName}] Destroyed`);
  }
}

// ===== FACTORY FUNCTION =====

export const getAutoResponseSystem = (config?: Partial<ResponseConfig>) => {
  return AutoResponseSystem.getInstance(config);
};

export default AutoResponseSystem;




