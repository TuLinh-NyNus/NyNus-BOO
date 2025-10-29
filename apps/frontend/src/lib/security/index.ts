/**
 * Security Module Index
 * =====================
 *
 * Exports all security components for easy import
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 4 Enhanced Security
 */

// Threat Detection Engine
export {
  ThreatDetectionEngine,
  getThreatDetectionEngine,
  type ThreatType,
  type ThreatSeverity,
  type MitigationAction,
  type DetectionRule,
  type RuleCondition,
  type ThreatEvent,
  type ThreatAnalysis,
  type UserBehaviorProfile,
  type DetectionEngineConfig,
} from './threat-detection-engine';

// Anomaly Detector
export {
  AnomalyDetector,
  getAnomalyDetector,
  type AnomalyType,
  type BehaviorBaseline,
  type AnomalyScore,
  type PatternDeviation,
  type AnomalyDetectionConfig,
} from './anomaly-detector';

// Auto Response System
export {
  AutoResponseSystem,
  getAutoResponseSystem,
  type ResponseAction,
  type ResponseStatus,
  type SecurityResponse,
  type NotificationConfig,
  type ResponseConfig,
  type ResponseExecutor,
} from './auto-response-system';

// Browser Security (existing)
export {
  BrowserSecurityService,
  defaultExamSecurityConfig,
  DEFAULT_MAX_VIOLATIONS,
  SECURITY_CHECK_INTERVALS,
  BLOCKED_KEY_COMBINATIONS,
  type SecurityEvent,
  type SecurityEventType,
  type SecuritySeverity,
  type BrowserSecurityConfig,
} from './browser-security';




