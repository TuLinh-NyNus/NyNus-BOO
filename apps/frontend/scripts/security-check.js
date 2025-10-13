#!/usr/bin/env node

/**
 * Security Check Script for NyNus Frontend
 * Automated security scanning and reporting
 * 
 * Usage:
 *   node scripts/security-check.js
 *   node scripts/security-check.js --fix
 *   node scripts/security-check.js --report
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====

const CONFIG = {
  // Severity thresholds
  maxCritical: 0,
  maxHigh: 2, // Allow 2 HIGH (xlsx vulnerabilities with low risk)
  maxModerate: 1, // Allow 1 MODERATE (prismjs transitive dependency)
  maxLow: 5,
  
  // Acceptable vulnerabilities (with justification)
  acceptableVulnerabilities: [
    {
      id: 1105770,
      package: 'prismjs',
      reason: 'Transitive dependency via react-syntax-highlighter. Low risk due to DOMPurify sanitization.',
      severity: 'moderate'
    },
    {
      id: 1108110,
      package: 'xlsx',
      reason: 'Export-only usage. No untrusted file reading. Very low risk.',
      severity: 'high'
    },
    {
      id: 1108111,
      package: 'xlsx',
      reason: 'Export-only usage. No user-controlled regex. Very low risk.',
      severity: 'high'
    }
  ],
  
  // Report output
  reportDir: path.join(__dirname, '../docs'),
  reportFile: 'SECURITY_CHECK_REPORT.md'
};

// ===== UTILITY FUNCTIONS =====

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'
  };
  
  const icons = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗'
  };
  
  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

function execCommand(command, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr
    };
  }
}

// ===== SECURITY CHECKS =====

function runAudit() {
  log('Running security audit...', 'info');
  
  const result = execCommand('pnpm audit --json', true);
  
  if (!result.success) {
    // pnpm audit returns exit code 1 if vulnerabilities found
    // Parse the JSON output anyway
    try {
      const auditData = JSON.parse(result.output);
      return auditData;
    } catch (e) {
      log('Failed to parse audit output', 'error');
      return null;
    }
  }
  
  try {
    return JSON.parse(result.output);
  } catch (e) {
    log('Failed to parse audit output', 'error');
    return null;
  }
}

function analyzeVulnerabilities(auditData) {
  if (!auditData || !auditData.metadata) {
    log('No audit data available', 'error');
    return null;
  }
  
  const { vulnerabilities } = auditData.metadata;
  const { advisories, actions } = auditData;
  
  const analysis = {
    total: vulnerabilities.critical + vulnerabilities.high + 
           vulnerabilities.moderate + vulnerabilities.low,
    critical: vulnerabilities.critical,
    high: vulnerabilities.high,
    moderate: vulnerabilities.moderate,
    low: vulnerabilities.low,
    acceptable: 0,
    unacceptable: 0,
    details: [],
    recommendations: []
  };
  
  // Analyze each advisory
  Object.values(advisories || {}).forEach(advisory => {
    const isAcceptable = CONFIG.acceptableVulnerabilities.some(
      v => v.id === advisory.id
    );
    
    if (isAcceptable) {
      analysis.acceptable++;
    } else {
      analysis.unacceptable++;
    }
    
    analysis.details.push({
      id: advisory.id,
      package: advisory.module_name,
      severity: advisory.severity,
      title: advisory.title,
      cves: advisory.cves,
      acceptable: isAcceptable,
      recommendation: advisory.recommendation
    });
  });
  
  // Generate recommendations
  if (analysis.critical > CONFIG.maxCritical) {
    analysis.recommendations.push({
      severity: 'critical',
      message: `${analysis.critical} CRITICAL vulnerabilities found. Immediate action required!`
    });
  }
  
  if (analysis.unacceptable > 0) {
    analysis.recommendations.push({
      severity: 'high',
      message: `${analysis.unacceptable} unacceptable vulnerabilities found. Review and fix.`
    });
  }
  
  return analysis;
}

function generateReport(analysis, auditData) {
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleDateString('vi-VN');
  
  let report = `# Security Check Report - NyNus Frontend\n`;
  report += `**Date**: ${date}\n`;
  report += `**Timestamp**: ${timestamp}\n`;
  report += `**Status**: ${analysis.unacceptable === 0 ? '✅ PASS' : '❌ FAIL'}\n\n`;
  
  report += `## Summary\n\n`;
  report += `| Severity | Count | Threshold | Status |\n`;
  report += `|----------|-------|-----------|--------|\n`;
  report += `| Critical | ${analysis.critical} | ${CONFIG.maxCritical} | ${analysis.critical <= CONFIG.maxCritical ? '✅' : '❌'} |\n`;
  report += `| High | ${analysis.high} | ${CONFIG.maxHigh} | ${analysis.high <= CONFIG.maxHigh ? '✅' : '❌'} |\n`;
  report += `| Moderate | ${analysis.moderate} | ${CONFIG.maxModerate} | ${analysis.moderate <= CONFIG.maxModerate ? '✅' : '❌'} |\n`;
  report += `| Low | ${analysis.low} | ${CONFIG.maxLow} | ${analysis.low <= CONFIG.maxLow ? '✅' : '❌'} |\n`;
  report += `| **Total** | **${analysis.total}** | - | - |\n\n`;
  
  report += `**Acceptable**: ${analysis.acceptable} vulnerabilities (with mitigation)\n`;
  report += `**Unacceptable**: ${analysis.unacceptable} vulnerabilities (require action)\n\n`;
  
  if (analysis.details.length > 0) {
    report += `## Vulnerability Details\n\n`;
    
    analysis.details.forEach((detail, index) => {
      report += `### ${index + 1}. ${detail.title}\n`;
      report += `- **Package**: \`${detail.package}\`\n`;
      report += `- **Severity**: ${detail.severity.toUpperCase()}\n`;
      report += `- **CVE**: ${detail.cves.join(', ')}\n`;
      report += `- **Status**: ${detail.acceptable ? '✅ Acceptable (mitigated)' : '❌ Requires action'}\n`;
      if (detail.recommendation && detail.recommendation !== 'None') {
        report += `- **Recommendation**: ${detail.recommendation}\n`;
      }
      report += `\n`;
    });
  }
  
  if (analysis.recommendations.length > 0) {
    report += `## Recommendations\n\n`;
    analysis.recommendations.forEach((rec, index) => {
      report += `${index + 1}. **[${rec.severity.toUpperCase()}]** ${rec.message}\n`;
    });
    report += `\n`;
  }
  
  report += `## Acceptable Vulnerabilities\n\n`;
  CONFIG.acceptableVulnerabilities.forEach((vuln, index) => {
    report += `${index + 1}. **${vuln.package}** (ID: ${vuln.id})\n`;
    report += `   - Severity: ${vuln.severity}\n`;
    report += `   - Reason: ${vuln.reason}\n\n`;
  });
  
  report += `---\n`;
  report += `*Generated by NyNus Security Check Script*\n`;
  
  return report;
}

function saveReport(report) {
  const reportPath = path.join(CONFIG.reportDir, CONFIG.reportFile);
  
  try {
    fs.writeFileSync(reportPath, report, 'utf-8');
    log(`Report saved to: ${reportPath}`, 'success');
    return true;
  } catch (error) {
    log(`Failed to save report: ${error.message}`, 'error');
    return false;
  }
}

// ===== MAIN EXECUTION =====

function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const shouldReport = args.includes('--report');
  const jsonOutput = args.includes('--json');

  if (!jsonOutput) {
    log('NyNus Security Check', 'info');
    log('===================\n', 'info');
  }

  // Run audit
  const auditData = runAudit();

  if (!auditData) {
    if (jsonOutput) {
      console.log(JSON.stringify({ error: 'Security audit failed' }));
    } else {
      log('Security audit failed', 'error');
    }
    process.exit(1);
  }

  // Analyze vulnerabilities
  const analysis = analyzeVulnerabilities(auditData);

  if (!analysis) {
    if (jsonOutput) {
      console.log(JSON.stringify({ error: 'Vulnerability analysis failed' }));
    } else {
      log('Vulnerability analysis failed', 'error');
    }
    process.exit(1);
  }

  // JSON output mode
  if (jsonOutput) {
    const jsonResult = {
      passed: analysis.unacceptable === 0,
      metadata: auditData.metadata,
      acceptableCount: analysis.acceptable,
      unacceptableCount: analysis.unacceptable,
      vulnerabilities: analysis.details,
      timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(jsonResult, null, 2));
    process.exit(analysis.unacceptable > 0 ? 1 : 0);
  }

  // Display results
  log(`\nVulnerabilities Found:`, 'info');
  log(`  Critical: ${analysis.critical}`, analysis.critical > 0 ? 'error' : 'success');
  log(`  High: ${analysis.high}`, analysis.high > CONFIG.maxHigh ? 'warning' : 'success');
  log(`  Moderate: ${analysis.moderate}`, analysis.moderate > CONFIG.maxModerate ? 'warning' : 'success');
  log(`  Low: ${analysis.low}`, analysis.low > CONFIG.maxLow ? 'warning' : 'success');
  log(`  Total: ${analysis.total}\n`, 'info');

  log(`Acceptable: ${analysis.acceptable}`, 'success');
  log(`Unacceptable: ${analysis.unacceptable}`, analysis.unacceptable > 0 ? 'error' : 'success');

  // Generate and save report
  if (shouldReport || analysis.unacceptable > 0) {
    log('\nGenerating security report...', 'info');
    const report = generateReport(analysis, auditData);
    saveReport(report);
  }

  // Exit with appropriate code
  if (analysis.unacceptable > 0) {
    log('\n❌ Security check FAILED', 'error');
    log(`${analysis.unacceptable} unacceptable vulnerabilities found`, 'error');
    process.exit(1);
  } else {
    log('\n✅ Security check PASSED', 'success');
    log('All vulnerabilities are acceptable or mitigated', 'success');
    process.exit(0);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { runAudit, analyzeVulnerabilities, generateReport };

