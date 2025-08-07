/**
 * Device Fingerprinting Service
 * 
 * Tạo unique fingerprint cho devices để enhance session security
 * và detect suspicious login activities.
 */

import { createHash } from '@/lib/polyfills/crypto-polyfill';
import logger from '@/lib/utils/logger';

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  timestamp: number;
  ipAddress?: string;
  headers: Record<string, string>;
}

export interface TrustedDevice {
  fingerprintId: string;
  deviceName: string;
  lastSeen: number;
  trustLevel: 'high' | 'medium' | 'low';
  location?: string;
  isTrusted: boolean;
}

/**
 * Server-side Device Fingerprinting
 */
export class ServerDeviceFingerprinting {
  /**
   * Generate device fingerprint từ request headers
   */
  static generateFingerprint(request: Request, ipAddress?: string): DeviceFingerprint {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const accept = request.headers.get('accept') || '';
    const dnt = request.headers.get('dnt') || '';

    // Extract platform info từ User-Agent
    const platform = this.extractPlatform(userAgent);
    const language = acceptLanguage.split(',')[0] || 'unknown';

    // Create fingerprint data
    const fingerprintData = {
      userAgent: userAgent.slice(0, 200), // Limit length
      platform,
      language,
      timezone: 'server-unknown', // Will be updated by client
      screenResolution: 'server-unknown', // Will be updated by client
      colorDepth: 0, // Will be updated by client
      cookieEnabled: true, // Assume true on server
      doNotTrack: dnt === '1',
      timestamp: Date.now(),
      ipAddress,
      headers: {
        'accept-language': acceptLanguage,
        'accept-encoding': acceptEncoding,
        'accept': accept,
        'user-agent': userAgent.slice(0, 100),
      },
    };

    // Generate unique ID
    const id = this.hashFingerprintSync(fingerprintData);

    return {
      id,
      ...fingerprintData,
    };
  }

  /**
   * Extract platform từ User-Agent
   */
  private static extractPlatform(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return 'Unknown';
  }

  /**
   * Hash fingerprint data để create unique ID (async version)
   */
  private static async hashFingerprint(data: Omit<DeviceFingerprint, 'id'>): Promise<string> {
    const fingerprintString = JSON.stringify({
      userAgent: data.userAgent,
      platform: data.platform,
      language: data.language,
      headers: data.headers,
    });

    return await createHash('sha256', fingerprintString);
  }

  /**
   * Synchronous hash for server-side (simple hash)
   */
  private static hashFingerprintSync(data: Omit<DeviceFingerprint, 'id'>): string {
    const fingerprintString = JSON.stringify({
      userAgent: data.userAgent,
      platform: data.platform,
      language: data.language,
      headers: data.headers,
    });

    // Simple hash for server-side
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36); // Convert to base36 string
  }

  /**
   * Compare fingerprints để detect changes
   */
  static compareFingerprints(
    current: DeviceFingerprint, 
    stored: DeviceFingerprint
  ): { similarity: number; suspicious: boolean; changes: string[] } {
    const changes: string[] = [];
    let matches = 0;
    let total = 0;

    // Check critical fields
    const criticalFields = ['userAgent', 'platform', 'language'];
    
    for (const field of criticalFields) {
      total++;
      if (current[field as keyof DeviceFingerprint] === stored[field as keyof DeviceFingerprint]) {
        matches++;
      } else {
        changes.push(field);
      }
    }

    // Check headers
    total++;
    const headerSimilarity = this.compareHeaders(current.headers, stored.headers);
    if (headerSimilarity > 0.8) {
      matches++;
    } else {
      changes.push('headers');
    }

    const similarity = matches / total;
    const suspicious = similarity < 0.7; // Less than 70% similarity is suspicious

    return { similarity, suspicious, changes };
  }

  /**
   * Compare headers similarity
   */
  private static compareHeaders(current: Record<string, string>, stored: Record<string, string>): number {
    const currentKeys = Object.keys(current);
    const storedKeys = Object.keys(stored);
    const allKeys = new Set([...currentKeys, ...storedKeys]);

    let matches = 0;
    for (const key of allKeys) {
      if (current[key] === stored[key]) {
        matches++;
      }
    }

    return matches / allKeys.size;
  }
}

/**
 * Client-side Device Fingerprinting
 */
export class ClientDeviceFingerprinting {
  /**
   * Generate comprehensive client-side fingerprint
   */
  static generateFingerprint(): DeviceFingerprint {
    const nav = typeof navigator !== 'undefined' ? navigator : {} as any;
    const screen = typeof window !== 'undefined' && window.screen ? window.screen : {} as any;

    const fingerprintData = {
      userAgent: nav.userAgent || '',
      platform: nav.platform || '',
      language: nav.language || nav.userLanguage || '',
      timezone: this.getTimezone(),
      screenResolution: `${screen.width || 0}x${screen.height || 0}`,
      colorDepth: screen.colorDepth || 0,
      cookieEnabled: nav.cookieEnabled || false,
      doNotTrack: nav.doNotTrack === '1' || nav.doNotTrack === 'yes',
      timestamp: Date.now(),
      headers: {}, // Will be populated by server
    };

    // Generate unique ID
    const id = this.hashFingerprintSync(fingerprintData);

    return {
      id,
      ...fingerprintData,
    };
  }

  /**
   * Get timezone
   */
  private static getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Synchronous hash for client-side
   */
  private static hashFingerprintSync(data: Omit<DeviceFingerprint, 'id'>): string {
    const fingerprintString = JSON.stringify({
      userAgent: data.userAgent,
      platform: data.platform,
      language: data.language,
      timezone: data.timezone,
      screenResolution: data.screenResolution,
      colorDepth: data.colorDepth,
    });

    // Simple hash for client-side (crypto.subtle would be async)
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Send fingerprint to server
   */
  static async sendFingerprint(): Promise<void> {
    try {
      const fingerprint = this.generateFingerprint();

      const response = await fetch('/api/auth/device-fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(fingerprint),
      });

      if (!response.ok) {
        throw new Error(`Failed to send fingerprint: ${response.status}`);
      }

      logger.debug('Device fingerprint sent successfully');
    } catch (error) {
      logger.error('Failed to send device fingerprint', error);
    }
  }
}

/**
 * Trusted Device Manager
 */
export class TrustedDeviceManager {
  private static readonly STORAGE_KEY = 'nynus_trusted_devices';
  private static readonly MAX_TRUSTED_DEVICES = 5;

  /**
   * Get trusted devices từ localStorage
   */
  static getTrustedDevices(): TrustedDevice[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add device to trusted list
   */
  static addTrustedDevice(device: TrustedDevice): void {
    if (typeof window === 'undefined') return;

    try {
      const devices = this.getTrustedDevices();
      
      // Remove existing device with same fingerprint
      const filtered = devices.filter(d => d.fingerprintId !== device.fingerprintId);
      
      // Add new device
      filtered.unshift(device);
      
      // Keep only max devices
      const limited = filtered.slice(0, this.MAX_TRUSTED_DEVICES);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
      
      logger.info('Device added to trusted list', { 
        deviceName: device.deviceName,
        fingerprintId: device.fingerprintId.slice(0, 8) + '...'
      });
    } catch (error) {
      logger.error('Failed to add trusted device', error);
    }
  }

  /**
   * Check if device is trusted
   */
  static isDeviceTrusted(fingerprintId: string): boolean {
    const devices = this.getTrustedDevices();
    const device = devices.find(d => d.fingerprintId === fingerprintId);
    
    if (!device) return false;
    
    // Check if device trust hasn't expired (30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return device.lastSeen > thirtyDaysAgo && device.isTrusted;
  }

  /**
   * Update device last seen
   */
  static updateDeviceLastSeen(fingerprintId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const devices = this.getTrustedDevices();
      const device = devices.find(d => d.fingerprintId === fingerprintId);
      
      if (device) {
        device.lastSeen = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(devices));
      }
    } catch (error) {
      logger.error('Failed to update device last seen', error);
    }
  }

  /**
   * Remove trusted device
   */
  static removeTrustedDevice(fingerprintId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const devices = this.getTrustedDevices();
      const filtered = devices.filter(d => d.fingerprintId !== fingerprintId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      
      logger.info('Device removed from trusted list', { 
        fingerprintId: fingerprintId.slice(0, 8) + '...'
      });
    } catch (error) {
      logger.error('Failed to remove trusted device', error);
    }
  }

  /**
   * Clear all trusted devices
   */
  static clearTrustedDevices(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      logger.info('All trusted devices cleared');
    } catch (error) {
      logger.error('Failed to clear trusted devices', error);
    }
  }
}
