#!/usr/bin/env node

/**
 * Development Performance Monitor
 * Monitor và report development workflow performance theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// ===== CONFIGURATION =====

const CONFIG = {
  logFile: path.join(__dirname, '../../.next/cache/performance.log'),
  metricsFile: path.join(__dirname, '../../.next/cache/metrics.json'),
  enableLogging: true,
  enableMetrics: true,
  targets: {
    devServerStartup: 10000, // 10 seconds
    hotReload: 3000,         // 3 seconds
    typeCheck: 5000,         // 5 seconds
    build: 32000,            // 32 seconds (20% improvement from 40s)
  }
};

// ===== PERFORMANCE MONITOR CLASS =====

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.startTimes = {};
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
   * Start timing a process
   */
  startTimer(processName) {
    this.startTimes[processName] = performance.now();
    this.log(`⏱️  Started: ${processName}`);
  }

  /**
   * End timing a process
   */
  endTimer(processName) {
    if (!this.startTimes[processName]) {
      this.log(`❌ Error: No start time found for ${processName}`);
      return null;
    }

    const duration = performance.now() - this.startTimes[processName];
    const target = CONFIG.targets[processName];
    const status = target ? (duration <= target ? '✅' : '⚠️') : 'ℹ️';
    
    this.metrics[processName] = {
      duration,
      target,
      timestamp: new Date().toISOString(),
      status: duration <= target ? 'PASS' : 'SLOW'
    };

    this.log(`${status} Completed: ${processName} - ${duration.toFixed(2)}ms ${target ? `(target: ${target}ms)` : ''}`);
    
    delete this.startTimes[processName];
    this.saveMetrics();
    
    return duration;
  }

  /**
   * Log message
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log(logMessage);
    
    if (CONFIG.enableLogging) {
      fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
    }
  }

  /**
   * Save metrics to file
   */
  saveMetrics() {
    if (CONFIG.enableMetrics) {
      fs.writeFileSync(CONFIG.metricsFile, JSON.stringify(this.metrics, null, 2));
    }
  }

  /**
   * Get performance report
   */
  getReport() {
    const report = {
      summary: {},
      details: this.metrics,
      targets: CONFIG.targets,
      timestamp: new Date().toISOString()
    };

    // Calculate summary statistics
    Object.keys(this.metrics).forEach(processName => {
      const metric = this.metrics[processName];
      report.summary[processName] = {
        duration: `${metric.duration.toFixed(2)}ms`,
        target: metric.target ? `${metric.target}ms` : 'N/A',
        status: metric.status,
        improvement: metric.target ? 
          `${(((metric.target - metric.duration) / metric.target) * 100).toFixed(1)}%` : 'N/A'
      };
    });

    return report;
  }

  /**
   * Print performance report
   */
  printReport() {
    const report = this.getReport();
    
    console.log('\n📊 Development Performance Report');
    console.log('=====================================');
    
    Object.keys(report.summary).forEach(processName => {
      const summary = report.summary[processName];
      const statusIcon = summary.status === 'PASS' ? '✅' : '⚠️';
      
      console.log(`${statusIcon} ${processName}:`);
      console.log(`   Duration: ${summary.duration}`);
      console.log(`   Target: ${summary.target}`);
      console.log(`   Status: ${summary.status}`);
      if (summary.improvement !== 'N/A') {
        console.log(`   Performance: ${summary.improvement} ${summary.status === 'PASS' ? 'under target' : 'over target'}`);
      }
      console.log('');
    });

    console.log('=====================================\n');
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = {};
    this.startTimes = {};
    
    if (fs.existsSync(CONFIG.logFile)) {
      fs.unlinkSync(CONFIG.logFile);
    }
    
    if (fs.existsSync(CONFIG.metricsFile)) {
      fs.unlinkSync(CONFIG.metricsFile);
    }
    
    this.log('🧹 Metrics cleared');
  }
}

// ===== COMMAND LINE INTERFACE =====

const monitor = new PerformanceMonitor();

// Handle command line arguments
const command = process.argv[2];
const processName = process.argv[3];

switch (command) {
  case 'start':
    if (!processName) {
      console.error('❌ Error: Process name required for start command');
      process.exit(1);
    }
    monitor.startTimer(processName);
    break;

  case 'end':
    if (!processName) {
      console.error('❌ Error: Process name required for end command');
      process.exit(1);
    }
    monitor.endTimer(processName);
    break;

  case 'report':
    monitor.printReport();
    break;

  case 'clear':
    monitor.clearMetrics();
    break;

  case 'help':
  default:
    console.log('Development Performance Monitor');
    console.log('Usage:');
    console.log('  node performance-monitor.js start <process-name>');
    console.log('  node performance-monitor.js end <process-name>');
    console.log('  node performance-monitor.js report');
    console.log('  node performance-monitor.js clear');
    console.log('');
    console.log('Available process names:');
    console.log('  - devServerStartup');
    console.log('  - hotReload');
    console.log('  - typeCheck');
    console.log('  - build');
    break;
}

// Export for programmatic use
module.exports = PerformanceMonitor;
