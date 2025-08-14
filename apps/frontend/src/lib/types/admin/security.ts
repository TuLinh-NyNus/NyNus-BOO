/**
 * Admin Security Types
 * Consolidated security types for admin interface
 */

// ===== AUDIT LOG INTERFACES =====

/**
 * Audit Log Entry Interface
 * Interface cho audit log entries
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Audit Log Filter Interface
 * Interface cho audit log filtering
 */
export interface AuditLogFilter {
  userId?: string;
  userRole?: string;
  action?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  success?: boolean;
  search?: string;
}

// ===== SECURITY EVENT INTERFACES =====

/**
 * Security Event Interface
 * Interface cho security events
 */
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Security Event Type
 * Type cho security event types
 */
export type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_activity'
  | 'unauthorized_access'
  | 'data_breach'
  | 'malware_detected'
  | 'ddos_attack'
  | 'privilege_escalation'
  | 'account_lockout'
  | 'password_reset'
  | 'session_hijack';

/**
 * Security Severity
 * Type cho security severity levels
 */
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

// ===== PERMISSION INTERFACES =====

/**
 * Permission Interface
 * Interface cho permissions
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Permission Condition Interface
 * Interface cho permission conditions
 */
export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

/**
 * Role Interface
 * Interface cho roles
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== SESSION INTERFACES =====

/**
 * User Session Interface
 * Interface cho user sessions
 */
export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  location?: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  isRevoked: boolean;
  revokedBy?: string;
  revokedAt?: Date;
  revokeReason?: string;
}

/**
 * Session Filter Interface
 * Interface cho session filtering
 */
export interface SessionFilter {
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  isActive?: boolean;
  isRevoked?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// ===== SECURITY SETTINGS INTERFACES =====

/**
 * Security Settings Interface
 * Interface cho security settings
 */
export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionPolicy: SessionPolicy;
  loginPolicy: LoginPolicy;
  auditPolicy: AuditPolicy;
  encryptionSettings: EncryptionSettings;
}

/**
 * Password Policy Interface
 * Interface cho password policy
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expiryDays: number;
  warningDays: number;
}

/**
 * Session Policy Interface
 * Interface cho session policy
 */
export interface SessionPolicy {
  maxDuration: number;
  idleTimeout: number;
  maxConcurrentSessions: number;
  requireReauth: boolean;
  reauthTimeout: number;
}

/**
 * Login Policy Interface
 * Interface cho login policy
 */
export interface LoginPolicy {
  maxAttempts: number;
  lockoutDuration: number;
  requireTwoFactor: boolean;
  allowedIpRanges?: string[];
  blockedIpRanges?: string[];
  requireCaptcha: boolean;
}

/**
 * Audit Policy Interface
 * Interface cho audit policy
 */
export interface AuditPolicy {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'minimal' | 'standard' | 'detailed';
  includeSuccessfulLogins: boolean;
  includeFailedLogins: boolean;
  includeDataChanges: boolean;
  includeSystemEvents: boolean;
}

/**
 * Encryption Settings Interface
 * Interface cho encryption settings
 */
export interface EncryptionSettings {
  algorithm: string;
  keyLength: number;
  saltRounds: number;
  encryptSensitiveData: boolean;
  encryptAuditLogs: boolean;
}

// ===== SECURITY DASHBOARD INTERFACES =====

/**
 * Security Dashboard Metrics Interface
 * Interface cho security dashboard metrics
 */
export interface SecurityDashboardMetrics {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  activeThreats: number;
  blockedIPs: number;
  failedLogins: number;
  suspiciousActivities: number;
  riskScore: number;
}

/**
 * Security Alert Interface
 * Interface cho security alerts
 */
export interface SecurityAlert {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  autoResolved: boolean;
  metadata?: Record<string, unknown>;
}

// ===== SECURITY STATE & ACTIONS =====

/**
 * Security State Interface
 * Interface cho security state
 */
export interface SecurityState {
  events: SecurityEvent[];
  alerts: SecurityAlert[];
  sessions: UserSession[];
  auditLogs: AuditLogEntry[];
  metrics: SecurityDashboardMetrics | null;
  settings: SecuritySettings | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Security Actions Interface
 * Interface cho security actions
 */
export interface SecurityActions {
  loadEvents: (filter?: Partial<AuditLogFilter>) => Promise<void>;
  loadAlerts: () => Promise<void>;
  loadSessions: (filter?: Partial<SessionFilter>) => Promise<void>;
  loadAuditLogs: (filter?: Partial<AuditLogFilter>) => Promise<void>;
  loadMetrics: () => Promise<void>;
  loadSettings: () => Promise<void>;
  resolveEvent: (eventId: string, notes?: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  revokeSession: (sessionId: string, reason?: string) => Promise<void>;
  updateSettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  clearError: () => void;
}

// ===== HOOK RETURN TYPES =====

/**
 * Use Security Hook Return
 * Return type cho useSecurity hook
 */
export interface UseSecurityReturn {
  state: SecurityState;
  actions: SecurityActions;
}
