#!/usr/bin/env tsx

/**
 * Security Audit Script for NyNus Authentication System
 * 
 * Automated security vulnerability scanner cho authentication codebase
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

import logger from '@/lib/utils/logger';

import { AuthPenetrationTester } from '../tools/security/penetration-tester';

interface SecurityIssue {
  file: string;
  line: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  description: string;
  recommendation: string;
  code?: string;
}

interface AuditResult {
  totalFiles: number;
  totalIssues: number;
  issuesBySeverity: Record<string, number>;
  issues: SecurityIssue[];
  summary: string;
}

/**
 * Security Audit Scanner
 */
class SecurityAuditScanner {
  private issues: SecurityIssue[] = [];
  private scannedFiles = 0;

  /**
   * Run comprehensive security audit
   */
  async runAudit(): Promise<AuditResult> {
    logger.info('🔍 Starting Security Audit for NyNus Authentication System...\n');

    // Scan codebase for security issues
    await this.scanCodebase();

    // Run penetration tests
    await this.runPenetrationTests();

    // Generate audit report
    const result = this.generateAuditResult();
    
    // Save report to file
    this.saveAuditReport(result);

    logger.info('\n✅ Security audit completed!');
    logger.info(`📊 Total issues found: ${result.totalIssues}`);
    logger.info(`📁 Files scanned: ${result.totalFiles}`);

    return result;
  }

  /**
   * Scan codebase for security vulnerabilities
   */
  private async scanCodebase(): Promise<void> {
    logger.info('📂 Scanning codebase for security issues...');

    const authDirs = [
      'apps/web/src/lib/auth',
      'apps/web/src/components/auth',
      'apps/web/src/middleware.ts',
      'apps/api/src/modules/auth'
    ];

    for (const dir of authDirs) {
      await this.scanDirectory(dir);
    }
  }

  /**
   * Scan directory recursively
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const items = readdirSync(dirPath);

      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (this.shouldScanFile(fullPath)) {
          await this.scanFile(fullPath);
        }
      }
    } catch (error) {
      logger.warn(`⚠️ Could not scan directory: ${dirPath}`);
    }
  }

  /**
   * Check if file should be scanned
   */
  private shouldScanFile(filePath: string): boolean {
    const ext = extname(filePath);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext) && 
           !filePath.includes('node_modules') &&
           !filePath.includes('.test.') &&
           !filePath.includes('.spec.');
  }

  /**
   * Scan individual file for security issues
   */
  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      this.scannedFiles++;

      // Check for various security issues
      this.checkHardcodedSecrets(filePath, lines);
      this.checkInsecureRandomness(filePath, lines);
      this.checkSQLInjection(filePath, lines);
      this.checkXSSVulnerabilities(filePath, lines);
      this.checkInsecureHeaders(filePath, lines);
      this.checkWeakCrypto(filePath, lines);
      this.checkInputValidation(filePath, lines);
      this.checkAuthenticationIssues(filePath, lines);
      this.checkSessionManagement(filePath, lines);
      this.checkErrorHandling(filePath, lines);

    } catch (error) {
      logger.warn(`⚠️ Could not scan file: ${filePath}`);
    }
  }

  /**
   * Check for hardcoded secrets
   */
  private checkHardcodedSecrets(filePath: string, lines: string[]): void {
    const secretPatterns = [
      { pattern: /password\s*[:=]\s*['"`][^'"`\s]{8,}['"`]/i, type: 'Hardcoded Password' },
      { pattern: /secret\s*[:=]\s*['"`][^'"`\s]{16,}['"`]/i, type: 'Hardcoded Secret' },
      { pattern: /api[_-]?key\s*[:=]\s*['"`][^'"`\s]{16,}['"`]/i, type: 'Hardcoded API Key' },
      { pattern: /token\s*[:=]\s*['"`][^'"`\s]{20,}['"`]/i, type: 'Hardcoded Token' },
      { pattern: /jwt[_-]?secret\s*[:=]\s*['"`][^'"`\s]{16,}['"`]/i, type: 'Hardcoded JWT Secret' }
    ];

    lines.forEach((line, index) => {
      secretPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(line) && !line.includes('process.env') && !line.includes('config')) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity: 'CRITICAL',
            type,
            description: `Hardcoded secret found in source code`,
            recommendation: 'Move secrets to environment variables or secure configuration',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for insecure randomness
   */
  private checkInsecureRandomness(filePath: string, lines: string[]): void {
    const insecurePatterns = [
      /Math\.random\(\)/,
      /new Date\(\)\.getTime\(\)/,
      /Date\.now\(\)/
    ];

    lines.forEach((line, index) => {
      insecurePatterns.forEach(pattern => {
        if (pattern.test(line) && (line.includes('token') || line.includes('session') || line.includes('id'))) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity: 'HIGH',
            type: 'Insecure Randomness',
            description: 'Using insecure random number generation for security-sensitive operations',
            recommendation: 'Use crypto.randomBytes() or crypto.randomUUID() for security-sensitive randomness',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for SQL injection vulnerabilities
   */
  private checkSQLInjection(filePath: string, lines: string[]): void {
    const sqlPatterns = [
      /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i,
      /['"`]\s*\+\s*.*\+\s*['"`].*(?:SELECT|INSERT|UPDATE|DELETE)/i,
      /query\s*\(\s*['"`][^'"`]*\$\{/i
    ];

    lines.forEach((line, index) => {
      sqlPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity: 'CRITICAL',
            type: 'SQL Injection',
            description: 'Potential SQL injection vulnerability detected',
            recommendation: 'Use parameterized queries or ORM methods',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for XSS vulnerabilities
   */
  private checkXSSVulnerabilities(filePath: string, lines: string[]): void {
    const xssPatterns = [
      /dangerouslySetInnerHTML/,
      /innerHTML\s*=\s*.*\$\{/,
      /document\.write\s*\(/,
      /eval\s*\(/
    ];

    lines.forEach((line, index) => {
      xssPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity: 'HIGH',
            type: 'XSS Vulnerability',
            description: 'Potential Cross-Site Scripting vulnerability detected',
            recommendation: 'Sanitize user input and use safe DOM manipulation methods',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for insecure headers
   */
  private checkInsecureHeaders(filePath: string, lines: string[]): void {
    const headerIssues = [
      { pattern: /secure:\s*false/i, type: 'Insecure Cookie', severity: 'MEDIUM' as const },
      { pattern: /httpOnly:\s*false/i, type: 'Non-HttpOnly Cookie', severity: 'MEDIUM' as const },
      { pattern: /sameSite:\s*['"`]none['"`]/i, type: 'Insecure SameSite', severity: 'MEDIUM' as const }
    ];

    lines.forEach((line, index) => {
      headerIssues.forEach(({ pattern, type, severity }) => {
        if (pattern.test(line)) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity,
            type,
            description: `Insecure cookie configuration detected`,
            recommendation: 'Use secure cookie settings (secure: true, httpOnly: true, sameSite: lax/strict)',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for weak cryptography
   */
  private checkWeakCrypto(filePath: string, lines: string[]): void {
    const weakCryptoPatterns = [
      { pattern: /md5/i, type: 'Weak Hash Algorithm (MD5)' },
      { pattern: /sha1/i, type: 'Weak Hash Algorithm (SHA1)' },
      { pattern: /des/i, type: 'Weak Encryption (DES)' },
      { pattern: /rc4/i, type: 'Weak Encryption (RC4)' }
    ];

    lines.forEach((line, index) => {
      weakCryptoPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(line)) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity: 'HIGH',
            type,
            description: 'Weak cryptographic algorithm detected',
            recommendation: 'Use strong cryptographic algorithms (SHA-256, AES, bcrypt)',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for input validation issues
   */
  private checkInputValidation(filePath: string, lines: string[]): void {
    const validationPatterns = [
      /req\.body\.[a-zA-Z]+.*(?:query|exec|find)/,
      /params\.[a-zA-Z]+.*(?:query|exec|find)/,
      /query\.[a-zA-Z]+.*(?:query|exec|find)/
    ];

    lines.forEach((line, index) => {
      validationPatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('validate') && !line.includes('sanitize')) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity: 'MEDIUM',
            type: 'Missing Input Validation',
            description: 'User input used without validation',
            recommendation: 'Validate and sanitize all user inputs',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for authentication issues
   */
  private checkAuthenticationIssues(filePath: string, lines: string[]): void {
    const authPatterns = [
      { pattern: /ignoreExpiration:\s*true/i, type: 'JWT Expiration Ignored', severity: 'CRITICAL' as const },
      { pattern: /verify.*secret.*null/i, type: 'Missing JWT Secret', severity: 'CRITICAL' as const },
      { pattern: /algorithm:\s*['"`]none['"`]/i, type: 'JWT Algorithm None', severity: 'CRITICAL' as const }
    ];

    lines.forEach((line, index) => {
      authPatterns.forEach(({ pattern, type, severity }) => {
        if (pattern.test(line)) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity,
            type,
            description: 'Authentication security issue detected',
            recommendation: 'Fix authentication configuration to ensure security',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for session management issues
   */
  private checkSessionManagement(filePath: string, lines: string[]): void {
    const sessionPatterns = [
      { pattern: /maxAge:\s*(?:Infinity|Number\.MAX_VALUE)/i, type: 'Infinite Session', severity: 'HIGH' as const },
      { pattern: /regenerate.*false/i, type: 'Session Not Regenerated', severity: 'MEDIUM' as const }
    ];

    lines.forEach((line, index) => {
      sessionPatterns.forEach(({ pattern, type, severity }) => {
        if (pattern.test(line)) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity,
            type,
            description: 'Session management security issue detected',
            recommendation: 'Implement proper session management with appropriate timeouts',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Check for error handling issues
   */
  private checkErrorHandling(filePath: string, lines: string[]): void {
    const errorPatterns = [
      /console\.log\(.*error.*\)/i,
      /console\.error\(.*stack.*\)/i,
      /throw.*error\.message/i
    ];

    lines.forEach((line, index) => {
      errorPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          this.addIssue({
            file: filePath,
            line: index + 1,
            severity: 'LOW',
            type: 'Information Disclosure in Errors',
            description: 'Error information may be exposed to users',
            recommendation: 'Use generic error messages in production and log detailed errors securely',
            code: line.trim()
          });
        }
      });
    });
  }

  /**
   * Run penetration tests
   */
  private async runPenetrationTests(): Promise<void> {
    logger.info('\n🔍 Running penetration tests...');

    try {
      const penTester = new AuthPenetrationTester({
        baseUrl: 'http://localhost:3000',
        timeout: 5000
      });

      const penTestResults = await penTester.runAllTests();

      // Convert pen test results to security issues
      penTestResults.forEach(result => {
        if (result.success && result.vulnerability) {
          this.addIssue({
            file: 'Penetration Test',
            line: 0,
            severity: result.severity,
            type: result.vulnerability,
            description: result.description,
            recommendation: result.recommendation || 'Fix the identified vulnerability'
          });
        }
      });

    } catch (error) {
      logger.warn('⚠️ Could not run penetration tests (server may not be running)');
    }
  }

  /**
   * Add security issue
   */
  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  /**
   * Generate audit result
   */
  private generateAuditResult(): AuditResult {
    const issuesBySeverity = {
      CRITICAL: this.issues.filter(i => i.severity === 'CRITICAL').length,
      HIGH: this.issues.filter(i => i.severity === 'HIGH').length,
      MEDIUM: this.issues.filter(i => i.severity === 'MEDIUM').length,
      LOW: this.issues.filter(i => i.severity === 'LOW').length
    };

    const summary = this.generateSummary(issuesBySeverity);

    return {
      totalFiles: this.scannedFiles,
      totalIssues: this.issues.length,
      issuesBySeverity,
      issues: this.issues,
      summary
    };
  }

  /**
   * Generate summary
   */
  private generateSummary(issuesBySeverity: Record<string, number>): string {
    const total = Object.values(issuesBySeverity).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return '🎉 No security issues found! The authentication system appears to be secure.';
    }

    let summary = `⚠️ ${total} security issues found:\n`;
    if (issuesBySeverity.CRITICAL > 0) summary += `🔴 ${issuesBySeverity.CRITICAL} Critical\n`;
    if (issuesBySeverity.HIGH > 0) summary += `🟠 ${issuesBySeverity.HIGH} High\n`;
    if (issuesBySeverity.MEDIUM > 0) summary += `🟡 ${issuesBySeverity.MEDIUM} Medium\n`;
    if (issuesBySeverity.LOW > 0) summary += `🔵 ${issuesBySeverity.LOW} Low\n`;

    return summary;
  }

  /**
   * Save audit report to file
   */
  private saveAuditReport(result: AuditResult): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `security-audit-report-${timestamp}.md`;

    let report = '# 🔍 Security Audit Report - NyNus Authentication\n\n';
    report += `**Audit Date:** ${new Date().toISOString()}\n`;
    report += `**Files Scanned:** ${result.totalFiles}\n`;
    report += `**Total Issues:** ${result.totalIssues}\n\n`;

    report += '## 📊 Summary\n\n';
    report += result.summary + '\n\n';

    if (result.totalIssues > 0) {
      report += '## 🚨 Security Issues\n\n';

      const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      
      severityOrder.forEach(severity => {
        const issues = result.issues.filter(i => i.severity === severity);
        if (issues.length > 0) {
          const icon = severity === 'CRITICAL' ? '🔴' : severity === 'HIGH' ? '🟠' : severity === 'MEDIUM' ? '🟡' : '🔵';
          report += `### ${icon} ${severity} (${issues.length})\n\n`;

          issues.forEach((issue, index) => {
            report += `#### ${index + 1}. ${issue.type}\n\n`;
            report += `**File:** ${issue.file}\n`;
            if (issue.line > 0) report += `**Line:** ${issue.line}\n`;
            report += `**Description:** ${issue.description}\n`;
            report += `**Recommendation:** ${issue.recommendation}\n`;
            if (issue.code) report += `**Code:** \`${issue.code}\`\n`;
            report += '\n---\n\n';
          });
        }
      });
    }

    report += '## 🛡️ Security Recommendations\n\n';
    report += '1. **Fix Critical Issues First**: Address all critical vulnerabilities immediately\n';
    report += '2. **Implement Security Headers**: Ensure proper security headers are set\n';
    report += '3. **Input Validation**: Validate and sanitize all user inputs\n';
    report += '4. **Secure Configuration**: Review and secure all configuration settings\n';
    report += '5. **Regular Audits**: Perform security audits regularly\n';
    report += '6. **Security Testing**: Implement automated security testing in CI/CD\n';
    report += '7. **Code Review**: Conduct security-focused code reviews\n';
    report += '8. **Security Training**: Ensure development team has security training\n\n';

    writeFileSync(reportPath, report);
    logger.info(`📄 Security audit report saved to: ${reportPath}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const scanner = new SecurityAuditScanner();
  await scanner.runAudit();
}

// Run if called directly
if (require.main === module) {
  main().catch(logger.error);
}

export { SecurityAuditScanner };
export type { SecurityIssue, AuditResult };
