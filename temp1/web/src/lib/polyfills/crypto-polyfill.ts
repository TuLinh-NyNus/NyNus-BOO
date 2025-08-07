/**
 * Crypto Polyfill for Edge Runtime Compatibility
 * 
 * Provides Web Crypto API based implementations for Node.js crypto functions
 * to ensure compatibility with Next.js Edge Runtime
 */

/**
 * Generate random bytes using Web Crypto API
 * Compatible replacement for Node.js crypto.randomBytes
 */
export function randomBytes(size: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use Web Crypto API (available in Edge Runtime)
    const buffer = new Uint8Array(size);
    crypto.getRandomValues(buffer);
    return buffer;
  } else if (typeof require !== 'undefined') {
    // Fallback to Node.js crypto for server-side
    try {
      const nodeCrypto = require('crypto');
      return nodeCrypto.randomBytes(size);
    } catch (error) {
      throw new Error('Crypto not available in this environment');
    }
  } else {
    throw new Error('Crypto not available in this environment');
  }
}

/**
 * Create hash using Web Crypto API
 * Compatible replacement for Node.js crypto.createHash
 */
export async function createHash(algorithm: string, data: string | Uint8Array): Promise<string> {
  // Map Node.js algorithm names to Web Crypto API names
  const algorithmMap: Record<string, string> = {
    'sha256': 'SHA-256',
    'sha1': 'SHA-1',
    'sha512': 'SHA-512',
    'md5': 'MD5' // Note: MD5 is not available in Web Crypto API
  };

  const webCryptoAlgorithm = algorithmMap[algorithm.toLowerCase()];
  
  if (!webCryptoAlgorithm) {
    throw new Error(`Algorithm ${algorithm} not supported in Edge Runtime`);
  }

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Use Web Crypto API (available in Edge Runtime)
    const encoder = new TextEncoder();
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
    
    const hashBuffer = await crypto.subtle.digest(webCryptoAlgorithm, dataBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Convert to hex string
    return Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } else if (typeof require !== 'undefined') {
    // Fallback to Node.js crypto for server-side
    try {
      const nodeCrypto = require('crypto');
      const hash = nodeCrypto.createHash(algorithm);
      hash.update(data);
      return hash.digest('hex');
    } catch (error) {
      throw new Error('Crypto not available in this environment');
    }
  } else {
    throw new Error('Crypto not available in this environment');
  }
}

/**
 * Simple encryption using Web Crypto API
 * Compatible replacement for basic Node.js crypto encryption
 */
export async function encrypt(data: string, key: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Use Web Crypto API (available in Edge Runtime)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes for AES-256
    const dataBuffer = encoder.encode(data);
    
    // Import key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } else if (typeof require !== 'undefined') {
    // Fallback to Node.js crypto for server-side
    try {
      const nodeCrypto = require('crypto');
      const cipher = nodeCrypto.createCipher('aes-256-cbc', key);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      throw new Error('Crypto not available in this environment');
    }
  } else {
    throw new Error('Crypto not available in this environment');
  }
}

/**
 * Simple decryption using Web Crypto API
 * Compatible replacement for basic Node.js crypto decryption
 */
export async function decrypt(encryptedData: string, key: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Use Web Crypto API (available in Edge Runtime)
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes for AES-256
    
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Import key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    return decoder.decode(decrypted);
  } else if (typeof require !== 'undefined') {
    // Fallback to Node.js crypto for server-side
    try {
      const nodeCrypto = require('crypto');
      const decipher = nodeCrypto.createDecipher('aes-256-cbc', key);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Crypto not available in this environment');
    }
  } else {
    throw new Error('Crypto not available in this environment');
  }
}

/**
 * Generate a random UUID v4
 * Compatible replacement for crypto.randomUUID
 */
export function randomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Use Web Crypto API (available in Edge Runtime)
    return crypto.randomUUID();
  } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Manual UUID v4 generation using Web Crypto API
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    
    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    
    // Convert to hex string with dashes
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  } else if (typeof require !== 'undefined') {
    // Fallback to Node.js crypto for server-side
    try {
      const nodeCrypto = require('crypto');
      return nodeCrypto.randomUUID();
    } catch (error) {
      // Manual fallback
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  } else {
    // Manual fallback for environments without crypto
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Check if we're running in Edge Runtime
 */
export function isEdgeRuntime(): boolean {
  return typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis;
}

/**
 * Check if Web Crypto API is available
 */
export function isWebCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
