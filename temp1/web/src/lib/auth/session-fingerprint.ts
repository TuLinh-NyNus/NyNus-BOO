/**
 * Session Fingerprinting Module
 * 
 * Tạo và validate device fingerprints để detect session hijacking
 * và unauthorized access attempts
 */

import { createHash } from '@/lib/polyfills/crypto-polyfill';
import {
  RequestObject,
  isRequestObject,
  hasHeaders,
  hasNextJSHeaders,
  getHeaderValue,
  getAllHeaders,
  normalizeRequest
} from '@/lib/types/request-types';
import logger from '@/lib/utils/logger';

/**
 * Device fingerprint data structure
 */
export interface DeviceFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  connection: string;
  dnt: string; // Do Not Track
  timezone: string;
  screenResolution: string;
  colorDepth: string;
  platform: string;
  cookieEnabled: string;
  timestamp: number;
}

/**
 * Fingerprint validation result
 */
export interface FingerprintValidationResult {
  isValid: boolean;
  confidence: number; // 0-100
  changedFields: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reason?: string;
}

/**
 * Session fingerprint configuration
 */
export const FINGERPRINT_CONFIG = {
  // Confidence thresholds
  HIGH_CONFIDENCE_THRESHOLD: 90,
  MEDIUM_CONFIDENCE_THRESHOLD: 70,
  LOW_CONFIDENCE_THRESHOLD: 50,
  
  // Field weights for confidence calculation
  FIELD_WEIGHTS: {
    userAgent: 30,
    acceptLanguage: 15,
    acceptEncoding: 10,
    connection: 5,
    dnt: 5,
    timezone: 15,
    screenResolution: 10,
    colorDepth: 5,
    platform: 5,
  },
  
  // Maximum age for fingerprint (24 hours)
  MAX_FINGERPRINT_AGE: 24 * 60 * 60 * 1000,
  
  // Fields that can change without high suspicion
  FLEXIBLE_FIELDS: ['connection', 'acceptEncoding'],
  
  // Critical fields that should rarely change
  CRITICAL_FIELDS: ['userAgent', 'platform', 'timezone'],
} as const;

/**
 * Session Fingerprint Service
 */
export class SessionFingerprint {
  
  /**
   * Create device fingerprint từ request headers
   */
  static createFingerprint(headers: Record<string, string | undefined>): DeviceFingerprint {
    return {
      userAgent: headers['user-agent'] || '',
      acceptLanguage: headers['accept-language'] || '',
      acceptEncoding: headers['accept-encoding'] || '',
      connection: headers['connection'] || '',
      dnt: headers['dnt'] || '',
      timezone: headers['x-timezone'] || '',
      screenResolution: headers['x-screen-resolution'] || '',
      colorDepth: headers['x-color-depth'] || '',
      platform: headers['x-platform'] || '',
      cookieEnabled: headers['x-cookie-enabled'] || '',
      timestamp: Date.now(),
    };
  }

  /**
   * Generate fingerprint hash
   */
  static async generateFingerprintHash(fingerprint: DeviceFingerprint): Promise<string> {
    const fingerprintString = [
      fingerprint.userAgent,
      fingerprint.acceptLanguage,
      fingerprint.timezone,
      fingerprint.platform,
      fingerprint.screenResolution,
      fingerprint.colorDepth,
    ].join('|');

    return await createHash('sha256', fingerprintString);
  }

  /**
   * Validate current fingerprint against stored fingerprint
   */
  static validateFingerprint(
    currentFingerprint: DeviceFingerprint,
    storedFingerprint: DeviceFingerprint
  ): FingerprintValidationResult {
    
    // Check if stored fingerprint is too old
    const age = Date.now() - storedFingerprint.timestamp;
    if (age > FINGERPRINT_CONFIG.MAX_FINGERPRINT_AGE) {
      return {
        isValid: false,
        confidence: 0,
        changedFields: ['timestamp'],
        riskLevel: 'HIGH',
        reason: 'Fingerprint too old'
      };
    }

    const changedFields: string[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    // Compare each field
    Object.entries(FINGERPRINT_CONFIG.FIELD_WEIGHTS).forEach(([field, weight]) => {
      totalWeight += weight;
      
      const currentValue = currentFingerprint[field as keyof DeviceFingerprint];
      const storedValue = storedFingerprint[field as keyof DeviceFingerprint];
      
      if (currentValue === storedValue) {
        matchedWeight += weight;
      } else {
        changedFields.push(field);
      }
    });

    // Calculate confidence score
    const confidence = Math.round((matchedWeight / totalWeight) * 100);

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    
    // Check for critical field changes
    const criticalFieldsChanged = changedFields.some(field =>
      FINGERPRINT_CONFIG.CRITICAL_FIELDS.includes(field as any)
    );
    
    if (criticalFieldsChanged) {
      riskLevel = 'HIGH';
    } else if (confidence < FINGERPRINT_CONFIG.MEDIUM_CONFIDENCE_THRESHOLD) {
      riskLevel = 'MEDIUM';
    }

    // Determine validity
    const isValid = confidence >= FINGERPRINT_CONFIG.LOW_CONFIDENCE_THRESHOLD && 
                   riskLevel !== 'HIGH';

    return {
      isValid,
      confidence,
      changedFields,
      riskLevel,
      reason: !isValid ? `Low confidence (${confidence}%) or critical fields changed` : undefined
    };
  }

  /**
   * Create fingerprint từ Next.js request
   */
  static createFingerprintFromRequest(request: RequestObject): DeviceFingerprint {
    const headers: Record<string, string | undefined> = {};

    // Extract headers using safe type guards
    if (hasHeaders(request)) {
      if (hasNextJSHeaders(request)) {
        // NextRequest object with Headers interface
        headers['user-agent'] = getHeaderValue(request, 'user-agent') || undefined;
        headers['accept-language'] = getHeaderValue(request, 'accept-language') || undefined;
        headers['accept-encoding'] = getHeaderValue(request, 'accept-encoding') || undefined;
        headers['connection'] = getHeaderValue(request, 'connection') || undefined;
        headers['dnt'] = getHeaderValue(request, 'dnt') || undefined;
        headers['x-timezone'] = getHeaderValue(request, 'x-timezone') || undefined;
        headers['x-screen-resolution'] = getHeaderValue(request, 'x-screen-resolution') || undefined;
        headers['x-color-depth'] = getHeaderValue(request, 'x-color-depth') || undefined;
        headers['x-platform'] = getHeaderValue(request, 'x-platform') || undefined;
        headers['x-cookie-enabled'] = getHeaderValue(request, 'x-cookie-enabled') || undefined;
      } else {
        // Regular headers object - use getAllHeaders for safe extraction
        const allHeaders = getAllHeaders(request);
        Object.assign(headers, allHeaders);
      }
    }

    return this.createFingerprint(headers);
  }

  /**
   * Serialize fingerprint for storage
   */
  static serializeFingerprint(fingerprint: DeviceFingerprint): string {
    return Buffer.from(JSON.stringify(fingerprint)).toString('base64');
  }

  /**
   * Deserialize fingerprint from storage
   */
  static deserializeFingerprint(serialized: string): DeviceFingerprint | null {
    try {
      const json = Buffer.from(serialized, 'base64').toString('utf8');
      return JSON.parse(json) as DeviceFingerprint;
    } catch (error) {
      logger.error('❌ SessionFingerprint: Failed to deserialize fingerprint:', error);
      return null;
    }
  }

  /**
   * Check if fingerprint indicates suspicious activity
   */
  static isSuspiciousActivity(
    currentFingerprint: DeviceFingerprint,
    storedFingerprint: DeviceFingerprint
  ): boolean {
    const validation = this.validateFingerprint(currentFingerprint, storedFingerprint);
    
    return validation.riskLevel === 'HIGH' || 
           validation.confidence < FINGERPRINT_CONFIG.LOW_CONFIDENCE_THRESHOLD;
  }

  /**
   * Generate security score based on fingerprint consistency
   */
  static calculateSecurityScore(
    currentFingerprint: DeviceFingerprint,
    storedFingerprint: DeviceFingerprint
  ): number {
    const validation = this.validateFingerprint(currentFingerprint, storedFingerprint);
    
    let score = validation.confidence;
    
    // Penalize critical field changes
    const criticalChanges = validation.changedFields.filter(field =>
      FINGERPRINT_CONFIG.CRITICAL_FIELDS.includes(field as any)
    ).length;
    
    score -= criticalChanges * 20;
    
    // Bonus for stable fingerprint
    const age = Date.now() - storedFingerprint.timestamp;
    if (age < 60 * 60 * 1000) { // Less than 1 hour
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Utility functions
 */

/**
 * Create and store fingerprint in cookie
 */
export function createSessionFingerprint(request: RequestObject): string {
  const fingerprint = SessionFingerprint.createFingerprintFromRequest(request);
  return SessionFingerprint.serializeFingerprint(fingerprint);
}

/**
 * Validate session fingerprint
 */
export function validateSessionFingerprint(
  currentRequest: RequestObject,
  storedFingerprintData: string
): FingerprintValidationResult {
  const currentFingerprint = SessionFingerprint.createFingerprintFromRequest(currentRequest);
  const storedFingerprint = SessionFingerprint.deserializeFingerprint(storedFingerprintData);

  if (!storedFingerprint) {
    return {
      isValid: false,
      confidence: 0,
      changedFields: ['all'],
      riskLevel: 'HIGH',
      reason: 'Invalid stored fingerprint'
    };
  }

  return SessionFingerprint.validateFingerprint(currentFingerprint, storedFingerprint);
}

/**
 * Check for suspicious session activity
 */
export function detectSuspiciousSession(
  currentRequest: RequestObject,
  storedFingerprintData: string
): boolean {
  const storedFingerprint = SessionFingerprint.deserializeFingerprint(storedFingerprintData);

  if (!storedFingerprint) {
    return true; // No fingerprint is suspicious
  }

  const currentFingerprint = SessionFingerprint.createFingerprintFromRequest(currentRequest);
  return SessionFingerprint.isSuspiciousActivity(currentFingerprint, storedFingerprint);
}

// Safe wrapper functions for unknown request objects
export function safeCreateSessionFingerprint(request: unknown): string {
  if (!isRequestObject(request)) {
    logger.warn('❌ SessionFingerprint: Invalid request object for fingerprint creation');
    // Return empty fingerprint for invalid requests
    const emptyFingerprint = SessionFingerprint.createFingerprint({});
    return SessionFingerprint.serializeFingerprint(emptyFingerprint);
  }
  return createSessionFingerprint(request);
}

export function safeValidateSessionFingerprint(
  currentRequest: unknown,
  storedFingerprintData: string
): FingerprintValidationResult {
  if (!isRequestObject(currentRequest)) {
    logger.warn('❌ SessionFingerprint: Invalid request object for fingerprint validation');
    return {
      isValid: false,
      confidence: 0,
      changedFields: ['all'],
      riskLevel: 'HIGH',
      reason: 'Invalid request object'
    };
  }
  return validateSessionFingerprint(currentRequest, storedFingerprintData);
}

export function safeDetectSuspiciousSession(
  currentRequest: unknown,
  storedFingerprintData: string
): boolean {
  if (!isRequestObject(currentRequest)) {
    logger.warn('❌ SessionFingerprint: Invalid request object for suspicious session detection');
    return true; // Invalid request is suspicious
  }
  return detectSuspiciousSession(currentRequest, storedFingerprintData);
}

export default SessionFingerprint;
