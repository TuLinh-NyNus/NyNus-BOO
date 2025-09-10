#!/usr/bin/env node

/**
 * Development Cache Manager
 * Manage development caches cho optimal performance theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ===== CONFIGURATION =====

const CONFIG = {
  cacheDirectories: [
    '.next/cache',
    '.next/static',
    '.next/server',
    'node_modules/.cache',
    '.turbo',
    '.swc'
  ],
  preserveDirectories: [
    '.next/cache/webpack',
    '.next/cache/swc',
    'node_modules/.cache/turbopack'
  ],
  logFile: '.next/cache/cache-manager.log',
  enableLogging: !process.env.QUIET_MODE
};

// ===== CACHE MANAGER CLASS =====

class CacheManager {
  constructor() {
    this.ensureDirectories();
  }

  /**
   * Ensure cache directories exist
   */
  ensureDirectories() {
    const cacheDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
  }

  /**
   * Log message
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    if (!process.env.QUIET_MODE) {
      console.log(logMessage);
    }
    
    if (CONFIG.enableLogging) {
      fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
    }
  }

  /**
   * Get directory size
   */
  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    } catch (error) {
      this.log(`⚠️  Warning: Could not read directory ${dirPath}: ${error.message}`);
    }
    
    return totalSize;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Remove directory recursively
   */
  removeDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      return false;
    }

    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      this.log(`❌ Error removing directory ${dirPath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Clean all caches
   */
  cleanAll() {
    this.log('🧹 Starting cache cleanup...');
    
    let totalSizeBefore = 0;
    let totalSizeAfter = 0;
    let cleanedCount = 0;

    CONFIG.cacheDirectories.forEach(cacheDir => {
      const sizeBefore = this.getDirectorySize(cacheDir);
      totalSizeBefore += sizeBefore;

      if (sizeBefore > 0) {
        this.log(`📁 Cleaning ${cacheDir} (${this.formatBytes(sizeBefore)})`);
        
        if (this.removeDirectory(cacheDir)) {
          cleanedCount++;
          this.log(`✅ Cleaned ${cacheDir}`);
        }
      } else {
        this.log(`ℹ️  ${cacheDir} is already clean`);
      }

      const sizeAfter = this.getDirectorySize(cacheDir);
      totalSizeAfter += sizeAfter;
    });

    const spaceSaved = totalSizeBefore - totalSizeAfter;
    
    this.log(`🎉 Cache cleanup completed!`);
    this.log(`📊 Directories cleaned: ${cleanedCount}`);
    this.log(`💾 Space saved: ${this.formatBytes(spaceSaved)}`);
  }

  /**
   * Clean selective caches (preserve important ones)
   */
  cleanSelective() {
    this.log('🧹 Starting selective cache cleanup...');
    
    const directoriesToClean = CONFIG.cacheDirectories.filter(
      dir => !CONFIG.preserveDirectories.includes(dir)
    );

    let totalSizeBefore = 0;
    let totalSizeAfter = 0;
    let cleanedCount = 0;

    directoriesToClean.forEach(cacheDir => {
      const sizeBefore = this.getDirectorySize(cacheDir);
      totalSizeBefore += sizeBefore;

      if (sizeBefore > 0) {
        this.log(`📁 Cleaning ${cacheDir} (${this.formatBytes(sizeBefore)})`);
        
        if (this.removeDirectory(cacheDir)) {
          cleanedCount++;
          this.log(`✅ Cleaned ${cacheDir}`);
        }
      }

      const sizeAfter = this.getDirectorySize(cacheDir);
      totalSizeAfter += sizeAfter;
    });

    CONFIG.preserveDirectories.forEach(preserveDir => {
      const size = this.getDirectorySize(preserveDir);
      if (size > 0) {
        this.log(`🔒 Preserved ${preserveDir} (${this.formatBytes(size)})`);
      }
    });

    const spaceSaved = totalSizeBefore - totalSizeAfter;
    
    this.log(`🎉 Selective cache cleanup completed!`);
    this.log(`📊 Directories cleaned: ${cleanedCount}`);
    this.log(`💾 Space saved: ${this.formatBytes(spaceSaved)}`);
  }

  /**
   * Show cache status
   */
  showStatus() {
    this.log('📊 Cache Status Report');
    this.log('=====================');
    
    let totalSize = 0;
    
    CONFIG.cacheDirectories.forEach(cacheDir => {
      const size = this.getDirectorySize(cacheDir);
      totalSize += size;
      
      const status = fs.existsSync(cacheDir) ? '✅' : '❌';
      this.log(`${status} ${cacheDir}: ${this.formatBytes(size)}`);
    });
    
    this.log('=====================');
    this.log(`📦 Total cache size: ${this.formatBytes(totalSize)}`);
  }

  /**
   * Optimize caches
   */
  optimize() {
    this.log('⚡ Optimizing development caches...');
    
    // Clean old caches but preserve recent ones
    this.cleanSelective();
    
    // Ensure important cache directories exist
    CONFIG.preserveDirectories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`📁 Created cache directory: ${dir}`);
      }
    });
    
    this.log('⚡ Cache optimization completed!');
  }
}

// ===== COMMAND LINE INTERFACE =====

const cacheManager = new CacheManager();

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'clean':
    cacheManager.cleanAll();
    break;

  case 'clean-selective':
    cacheManager.cleanSelective();
    break;

  case 'status':
    cacheManager.showStatus();
    break;

  case 'optimize':
    cacheManager.optimize();
    break;

  case 'help':
  default:
    console.log('Development Cache Manager');
    console.log('Usage:');
    console.log('  node cache-manager.js clean           - Clean all caches');
    console.log('  node cache-manager.js clean-selective - Clean non-essential caches');
    console.log('  node cache-manager.js status          - Show cache status');
    console.log('  node cache-manager.js optimize        - Optimize caches');
    console.log('  node cache-manager.js help            - Show this help');
    break;
}

// Export for programmatic use
module.exports = CacheManager;
