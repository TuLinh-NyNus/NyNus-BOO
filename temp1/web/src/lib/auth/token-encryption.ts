/**
 * Token Encryption Module
 *
 * Cung cấp mã hóa AES-256-CBC cho JWT tokens trước khi lưu vào cookies
 * Đảm bảo tokens được bảo vệ ngay cả khi cookies bị compromise
 */

import { createCipheriv, createDecipheriv } from 'crypto';

import { randomBytes, encrypt, decrypt } from '@/lib/polyfills/crypto-polyfill';
import logger from '@/lib/utils/logger';

/**
 * Encryption configuration
 */
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-cbc',
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16,  // 128 bits
  SALT_LENGTH: 32, // 256 bits
} as const;

/**
 * Encrypted token data structure
 */
export interface EncryptedTokenData {
  encryptedData: string;
  iv: string;
  salt: string;
  timestamp: number;
}

/**
 * Token encryption result
 */
export interface TokenEncryptionResult {
  success: boolean;
  encryptedToken?: string;
  error?: string;
}

/**
 * Token decryption result
 */
export interface TokenDecryptionResult {
  success: boolean;
  decryptedToken?: string;
  error?: string;
}

/**
 * Token Encryption Service
 *
 * Sử dụng AES-256-CBC để mã hóa tokens với:
 * - Unique IV cho mỗi encryption
 * - Salt để strengthen key derivation
 * - Timestamp để track encryption time
 */
export class TokenEncryption {
  private static readonly MASTER_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'nynus_token_encryption_master_key_2025_secure';

  /**
   * Derive encryption key từ master key và salt
   */
  private static deriveKey(salt: Uint8Array | Buffer): Buffer {
    const crypto = require('crypto');
    // Convert Uint8Array to Buffer if needed
    const saltBuffer = salt instanceof Buffer ? salt : Buffer.from(salt);
    return crypto.pbkdf2Sync(
      this.MASTER_KEY,
      saltBuffer,
      100000, // iterations
      ENCRYPTION_CONFIG.KEY_LENGTH,
      'sha256'
    );
  }

  /**
   * Encrypt JWT token
   * 
   * @param token - JWT token cần mã hóa
   * @returns Encrypted token data hoặc error
   */
  static encryptToken(token: string): TokenEncryptionResult {
    try {
      if (!token || typeof token !== 'string') {
        return {
          success: false,
          error: 'Invalid token provided for encryption'
        };
      }

      // Generate random salt và IV
      const salt = randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH);
      const iv = randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);

      // Derive encryption key
      const key = this.deriveKey(salt);

      // Create cipher
      const cipher = createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);

      // Encrypt token
      let encrypted = cipher.update(token, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Create encrypted data structure
      const encryptedData: EncryptedTokenData = {
        encryptedData: encrypted,
        iv: Buffer.from(iv).toString('base64'),
        salt: Buffer.from(salt).toString('base64'),
        timestamp: Date.now()
      };

      // Serialize to base64 string
      const serialized = Buffer.from(JSON.stringify(encryptedData)).toString('base64');

      return {
        success: true,
        encryptedToken: serialized
      };

    } catch (error) {
      logger.error('❌ TokenEncryption: Encryption failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed'
      };
    }
  }

  /**
   * Decrypt JWT token
   * 
   * @param encryptedToken - Encrypted token string
   * @returns Decrypted token hoặc error
   */
  static decryptToken(encryptedToken: string): TokenDecryptionResult {
    try {
      if (!encryptedToken || typeof encryptedToken !== 'string') {
        return {
          success: false,
          error: 'Invalid encrypted token provided'
        };
      }

      // Parse encrypted data
      const serializedData = Buffer.from(encryptedToken, 'base64').toString('utf8');
      const encryptedData: EncryptedTokenData = JSON.parse(serializedData);

      // Validate structure
      if (!encryptedData.encryptedData || !encryptedData.iv || !encryptedData.salt) {
        return {
          success: false,
          error: 'Invalid encrypted token structure'
        };
      }

      // Convert from base64
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const salt = Buffer.from(encryptedData.salt, 'base64');

      // Derive decryption key
      const key = this.deriveKey(salt);

      // Create decipher
      const decipher = createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);

      // Decrypt token
      let decrypted = decipher.update(encryptedData.encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return {
        success: true,
        decryptedToken: decrypted
      };

    } catch (error) {
      logger.error('❌ TokenEncryption: Decryption failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      };
    }
  }

  /**
   * Validate encrypted token structure
   * 
   * @param encryptedToken - Token để validate
   * @returns Boolean indicating validity
   */
  static isValidEncryptedToken(encryptedToken: string): boolean {
    try {
      if (!encryptedToken || typeof encryptedToken !== 'string') {
        return false;
      }

      const serializedData = Buffer.from(encryptedToken, 'base64').toString('utf8');
      const encryptedData: EncryptedTokenData = JSON.parse(serializedData);

      return !!(
        encryptedData.encryptedData &&
        encryptedData.iv &&
        encryptedData.salt &&
        encryptedData.timestamp &&
        typeof encryptedData.timestamp === 'number'
      );

    } catch (error) {
      return false;
    }
  }

  /**
   * Get encryption timestamp từ encrypted token
   * 
   * @param encryptedToken - Encrypted token
   * @returns Timestamp hoặc null
   */
  static getEncryptionTimestamp(encryptedToken: string): number | null {
    try {
      if (!this.isValidEncryptedToken(encryptedToken)) {
        return null;
      }

      const serializedData = Buffer.from(encryptedToken, 'base64').toString('utf8');
      const encryptedData: EncryptedTokenData = JSON.parse(serializedData);

      return encryptedData.timestamp;

    } catch (error) {
      return null;
    }
  }

  /**
   * Check if encrypted token is expired based on encryption time
   * 
   * @param encryptedToken - Encrypted token
   * @param maxAgeMs - Maximum age in milliseconds
   * @returns Boolean indicating if expired
   */
  static isEncryptedTokenExpired(encryptedToken: string, maxAgeMs: number): boolean {
    const timestamp = this.getEncryptionTimestamp(encryptedToken);
    
    if (!timestamp) {
      return true; // Invalid token is considered expired
    }

    return (Date.now() - timestamp) > maxAgeMs;
  }
}

/**
 * Utility functions cho token encryption
 */

/**
 * Encrypt token với error handling
 */
export function encryptTokenSafe(token: string): string | null {
  const result = TokenEncryption.encryptToken(token);
  return result.success ? result.encryptedToken! : null;
}

/**
 * Decrypt token với error handling
 */
export function decryptTokenSafe(encryptedToken: string): string | null {
  const result = TokenEncryption.decryptToken(encryptedToken);
  return result.success ? result.decryptedToken! : null;
}

/**
 * Check if token is encrypted
 */
export function isEncryptedToken(token: string): boolean {
  return TokenEncryption.isValidEncryptedToken(token);
}

export default TokenEncryption;
