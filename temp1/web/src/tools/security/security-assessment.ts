/**
 * Security Assessment Tool for NyNus Authentication
 * 
 * Comprehensive security assessment và vulnerability reporting
 */

import { writeFileSync } from 'fs';

import logger from '@/lib/utils/logger';

import { AuthPenetrationTester, PenTestResult } from './penetration-tester';
import { SecurityAuditScanner, AuditResult } from '../../scripts/security-audit';

export interface SecurityAssessment {
  timestamp: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0-100
  auditResults: AuditResult;
  penTestResults: PenTestResult[];
  recommendations: SecurityRecommendation[];
  complianceStatus: ComplianceStatus;
  summary: string;
}

export interface SecurityRecommendation {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  title: string;
  description: string;
  implementation: string;
  timeline: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ComplianceStatus {
  owasp: {
    score: number;
    issues: string[];
  };
  gdpr: {
    compliant: boolean;
    issues: string[];
  };
  iso27001: {
    score: number;
    issues: string[];
  };
}

/**
 * Security Assessment Generator
 */
export class SecurityAssessmentGenerator {
  /**
   * Run comprehensive security assessment
   */
  async runAssessment(): Promise<SecurityAssessment> {
    logger.info('🔍 Starting Comprehensive Security Assessment...\n');

    // Run code audit
    logger.info('📂 Running code security audit...');
    const scanner = new SecurityAuditScanner();
    const auditResults = await scanner.runAudit();

    // Run penetration tests
    logger.info('\n🔍 Running penetration tests...');
    const penTester = new AuthPenetrationTester();
    const penTestResults = await penTester.runAllTests();

    // Calculate risk assessment
    const riskScore = this.calculateRiskScore(auditResults, penTestResults);
    const overallRisk = this.determineOverallRisk(riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(auditResults, penTestResults);

    // Check compliance status
    const complianceStatus = this.assessCompliance(auditResults, penTestResults);

    // Generate summary
    const summary = this.generateSummary(auditResults, penTestResults, riskScore);

    const assessment: SecurityAssessment = {
      timestamp: new Date().toISOString(),
      overallRisk,
      riskScore,
      auditResults,
      penTestResults,
      recommendations,
      complianceStatus,
      summary
    };

    // Save assessment report
    this.saveAssessmentReport(assessment);

    logger.info('\n✅ Security assessment completed!');
    logger.info(`🎯 Overall Risk: ${overallRisk} (Score: ${riskScore}/100)`);

    return assessment;
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(auditResults: AuditResult, penTestResults: PenTestResult[]): number {
    let score = 0;

    // Code audit scoring (0-50 points)
    const auditWeight = {
      CRITICAL: 15,
      HIGH: 10,
      MEDIUM: 5,
      LOW: 2
    };

    Object.entries(auditResults.issuesBySeverity).forEach(([severity, count]) => {
      score += count * auditWeight[severity as keyof typeof auditWeight];
    });

    // Penetration test scoring (0-50 points)
    const penTestWeight = {
      CRITICAL: 20,
      HIGH: 15,
      MEDIUM: 8,
      LOW: 3
    };

    penTestResults.filter(r => r.success).forEach(result => {
      score += penTestWeight[result.severity];
    });

    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Determine overall risk level
   */
  private determineOverallRisk(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 20) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(auditResults: AuditResult, penTestResults: PenTestResult[]): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // Critical issues first
    const criticalIssues = auditResults.issues.filter(i => i.severity === 'CRITICAL');
    const criticalPenTest = penTestResults.filter(r => r.success && r.severity === 'CRITICAL');

    if (criticalIssues.length > 0 || criticalPenTest.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Critical Vulnerabilities',
        title: 'Fix Critical Security Vulnerabilities',
        description: `${criticalIssues.length + criticalPenTest.length} critical vulnerabilities found that require immediate attention`,
        implementation: 'Review and fix all critical issues identified in the audit and penetration test results',
        timeline: 'Immediate (within 24 hours)',
        effort: 'HIGH'
      });
    }

    // Authentication hardening
    const authIssues = auditResults.issues.filter(i => 
      i.type.toLowerCase().includes('jwt') || 
      i.type.toLowerCase().includes('auth') ||
      i.type.toLowerCase().includes('session')
    );

    if (authIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Authentication Security',
        title: 'Strengthen Authentication Mechanisms',
        description: 'Multiple authentication security issues detected',
        implementation: 'Implement proper JWT validation, secure session management, and strong authentication flows',
        timeline: '1-2 weeks',
        effort: 'MEDIUM'
      });
    }

    // Input validation
    const inputIssues = auditResults.issues.filter(i => 
      i.type.toLowerCase().includes('injection') || 
      i.type.toLowerCase().includes('validation') ||
      i.type.toLowerCase().includes('xss')
    );

    if (inputIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Input Security',
        title: 'Implement Comprehensive Input Validation',
        description: 'Input validation vulnerabilities detected',
        implementation: 'Add input sanitization, validation schemas, and output encoding',
        timeline: '1-2 weeks',
        effort: 'MEDIUM'
      });
    }

    // Security headers and configuration
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Security Configuration',
      title: 'Implement Security Headers and Configuration',
      description: 'Enhance security through proper headers and configuration',
      implementation: 'Add CSP, HSTS, X-Frame-Options, and other security headers',
      timeline: '3-5 days',
      effort: 'LOW'
    });

    // Rate limiting and brute force protection
    const rateLimitIssues = penTestResults.filter(r => 
      r.testName.toLowerCase().includes('brute') || 
      r.testName.toLowerCase().includes('rate')
    );

    if (rateLimitIssues.some(r => r.success)) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Rate Limiting',
        title: 'Enhance Rate Limiting and Brute Force Protection',
        description: 'Insufficient protection against automated attacks',
        implementation: 'Implement comprehensive rate limiting, account lockout, and CAPTCHA',
        timeline: '1 week',
        effort: 'MEDIUM'
      });
    }

    // Monitoring and logging
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Security Monitoring',
      title: 'Implement Security Monitoring and Alerting',
      description: 'Add comprehensive security monitoring and incident response',
      implementation: 'Set up security event logging, monitoring dashboards, and alerting',
      timeline: '2-3 weeks',
      effort: 'HIGH'
    });

    // Security testing automation
    recommendations.push({
      priority: 'LOW',
      category: 'Security Testing',
      title: 'Automate Security Testing',
      description: 'Integrate security testing into CI/CD pipeline',
      implementation: 'Add automated security scans, dependency checks, and penetration testing',
      timeline: '2-4 weeks',
      effort: 'MEDIUM'
    });

    return recommendations;
  }

  /**
   * Assess compliance status
   */
  private assessCompliance(auditResults: AuditResult, penTestResults: PenTestResult[]): ComplianceStatus {
    // OWASP Top 10 compliance
    const owaspIssues: string[] = [];
    const criticalCount = auditResults.issuesBySeverity.CRITICAL || 0;
    const highCount = auditResults.issuesBySeverity.HIGH || 0;

    if (criticalCount > 0) owaspIssues.push('A01:2021 – Broken Access Control');
    if (auditResults.issues.some(i => i.type.includes('Injection'))) owaspIssues.push('A03:2021 – Injection');
    if (auditResults.issues.some(i => i.type.includes('XSS'))) owaspIssues.push('A03:2021 – Injection (XSS)');
    if (auditResults.issues.some(i => i.type.includes('Authentication'))) owaspIssues.push('A07:2021 – Identification and Authentication Failures');

    const owaspScore = Math.max(0, 100 - (owaspIssues.length * 20));

    // GDPR compliance
    const gdprIssues: string[] = [];
    if (auditResults.issues.some(i => i.type.includes('Information Disclosure'))) {
      gdprIssues.push('Data protection measures insufficient');
    }
    if (auditResults.issues.some(i => i.type.includes('Session'))) {
      gdprIssues.push('Session management may not comply with data minimization');
    }

    // ISO 27001 compliance
    const iso27001Issues: string[] = [];
    if (criticalCount > 0) iso27001Issues.push('Critical vulnerabilities present');
    if (highCount > 5) iso27001Issues.push('Multiple high-severity issues');
    if (!auditResults.issues.some(i => i.type.includes('Audit'))) {
      iso27001Issues.push('Insufficient security monitoring');
    }

    const iso27001Score = Math.max(0, 100 - (iso27001Issues.length * 15));

    return {
      owasp: {
        score: owaspScore,
        issues: owaspIssues
      },
      gdpr: {
        compliant: gdprIssues.length === 0,
        issues: gdprIssues
      },
      iso27001: {
        score: iso27001Score,
        issues: iso27001Issues
      }
    };
  }

  /**
   * Generate assessment summary
   */
  private generateSummary(auditResults: AuditResult, penTestResults: PenTestResult[], riskScore: number): string {
    const totalVulns = auditResults.totalIssues + penTestResults.filter(r => r.success).length;
    const criticalCount = auditResults.issuesBySeverity.CRITICAL + penTestResults.filter(r => r.success && r.severity === 'CRITICAL').length;

    let summary = `Security assessment completed for NyNus Authentication System.\n\n`;
    summary += `**Risk Score:** ${riskScore}/100\n`;
    summary += `**Total Vulnerabilities:** ${totalVulns}\n`;
    summary += `**Critical Issues:** ${criticalCount}\n\n`;

    if (criticalCount > 0) {
      summary += `⚠️ **URGENT ACTION REQUIRED**: ${criticalCount} critical vulnerabilities found that require immediate attention.\n\n`;
    }

    if (riskScore >= 80) {
      summary += `🔴 **CRITICAL RISK**: The authentication system has significant security vulnerabilities that pose a high risk to the application and user data.\n\n`;
    } else if (riskScore >= 50) {
      summary += `🟠 **HIGH RISK**: Multiple security issues detected that should be addressed promptly.\n\n`;
    } else if (riskScore >= 20) {
      summary += `🟡 **MEDIUM RISK**: Some security improvements needed to strengthen the system.\n\n`;
    } else {
      summary += `🟢 **LOW RISK**: The authentication system appears to be relatively secure with minor issues to address.\n\n`;
    }

    summary += `**Next Steps:**\n`;
    summary += `1. Review and prioritize the security recommendations\n`;
    summary += `2. Fix critical vulnerabilities immediately\n`;
    summary += `3. Implement security improvements based on priority\n`;
    summary += `4. Schedule regular security assessments\n`;

    return summary;
  }

  /**
   * Save comprehensive assessment report
   */
  private saveAssessmentReport(assessment: SecurityAssessment): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `security-assessment-${timestamp}.md`;

    let report = '# 🔍 Comprehensive Security Assessment Report\n\n';
    report += `**Assessment Date:** ${assessment.timestamp}\n`;
    report += `**Overall Risk:** ${assessment.overallRisk}\n`;
    report += `**Risk Score:** ${assessment.riskScore}/100\n\n`;

    // Executive Summary
    report += '## 📋 Executive Summary\n\n';
    report += assessment.summary + '\n\n';

    // Risk Assessment
    report += '## 🎯 Risk Assessment\n\n';
    report += `**Overall Risk Level:** ${assessment.overallRisk}\n`;
    report += `**Risk Score:** ${assessment.riskScore}/100\n\n`;

    const riskColor = assessment.overallRisk === 'CRITICAL' ? '🔴' : 
                     assessment.overallRisk === 'HIGH' ? '🟠' : 
                     assessment.overallRisk === 'MEDIUM' ? '🟡' : '🟢';
    
    report += `${riskColor} **Risk Level Explanation:**\n`;
    if (assessment.riskScore >= 80) {
      report += 'Critical security vulnerabilities present that require immediate action.\n\n';
    } else if (assessment.riskScore >= 50) {
      report += 'Significant security issues that should be addressed promptly.\n\n';
    } else if (assessment.riskScore >= 20) {
      report += 'Moderate security concerns that should be improved.\n\n';
    } else {
      report += 'Low security risk with minor improvements recommended.\n\n';
    }

    // Recommendations
    report += '## 🛡️ Security Recommendations\n\n';
    assessment.recommendations.forEach((rec, index) => {
      const priorityIcon = rec.priority === 'CRITICAL' ? '🔴' : 
                          rec.priority === 'HIGH' ? '🟠' : 
                          rec.priority === 'MEDIUM' ? '🟡' : '🔵';
      
      report += `### ${index + 1}. ${priorityIcon} ${rec.title}\n\n`;
      report += `**Priority:** ${rec.priority}\n`;
      report += `**Category:** ${rec.category}\n`;
      report += `**Timeline:** ${rec.timeline}\n`;
      report += `**Effort:** ${rec.effort}\n\n`;
      report += `**Description:** ${rec.description}\n\n`;
      report += `**Implementation:** ${rec.implementation}\n\n`;
      report += '---\n\n';
    });

    // Compliance Status
    report += '## 📊 Compliance Status\n\n';
    report += `### OWASP Top 10\n`;
    report += `**Score:** ${assessment.complianceStatus.owasp.score}/100\n`;
    if (assessment.complianceStatus.owasp.issues.length > 0) {
      report += `**Issues:**\n`;
      assessment.complianceStatus.owasp.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
    }
    report += '\n';

    report += `### GDPR Compliance\n`;
    report += `**Status:** ${assessment.complianceStatus.gdpr.compliant ? '✅ Compliant' : '❌ Non-Compliant'}\n`;
    if (assessment.complianceStatus.gdpr.issues.length > 0) {
      report += `**Issues:**\n`;
      assessment.complianceStatus.gdpr.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
    }
    report += '\n';

    report += `### ISO 27001\n`;
    report += `**Score:** ${assessment.complianceStatus.iso27001.score}/100\n`;
    if (assessment.complianceStatus.iso27001.issues.length > 0) {
      report += `**Issues:**\n`;
      assessment.complianceStatus.iso27001.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
    }
    report += '\n';

    // Detailed Results
    report += '## 📋 Detailed Assessment Results\n\n';
    report += `### Code Audit Results\n`;
    report += `- **Files Scanned:** ${assessment.auditResults.totalFiles}\n`;
    report += `- **Total Issues:** ${assessment.auditResults.totalIssues}\n`;
    report += `- **Critical:** ${assessment.auditResults.issuesBySeverity.CRITICAL}\n`;
    report += `- **High:** ${assessment.auditResults.issuesBySeverity.HIGH}\n`;
    report += `- **Medium:** ${assessment.auditResults.issuesBySeverity.MEDIUM}\n`;
    report += `- **Low:** ${assessment.auditResults.issuesBySeverity.LOW}\n\n`;

    report += `### Penetration Test Results\n`;
    const penTestVulns = assessment.penTestResults.filter(r => r.success);
    report += `- **Total Tests:** ${assessment.penTestResults.length}\n`;
    report += `- **Vulnerabilities Found:** ${penTestVulns.length}\n`;
    report += `- **Critical:** ${penTestVulns.filter(r => r.severity === 'CRITICAL').length}\n`;
    report += `- **High:** ${penTestVulns.filter(r => r.severity === 'HIGH').length}\n`;
    report += `- **Medium:** ${penTestVulns.filter(r => r.severity === 'MEDIUM').length}\n`;
    report += `- **Low:** ${penTestVulns.filter(r => r.severity === 'LOW').length}\n\n`;

    // Next Steps
    report += '## 🚀 Next Steps\n\n';
    report += '1. **Immediate Actions** (Critical Priority)\n';
    const criticalRecs = assessment.recommendations.filter(r => r.priority === 'CRITICAL');
    if (criticalRecs.length > 0) {
      criticalRecs.forEach(rec => {
        report += `   - ${rec.title}\n`;
      });
    } else {
      report += '   - No critical actions required\n';
    }
    report += '\n';

    report += '2. **Short-term Actions** (High Priority - 1-2 weeks)\n';
    const highRecs = assessment.recommendations.filter(r => r.priority === 'HIGH');
    highRecs.forEach(rec => {
      report += `   - ${rec.title}\n`;
    });
    report += '\n';

    report += '3. **Medium-term Actions** (Medium Priority - 2-4 weeks)\n';
    const mediumRecs = assessment.recommendations.filter(r => r.priority === 'MEDIUM');
    mediumRecs.forEach(rec => {
      report += `   - ${rec.title}\n`;
    });
    report += '\n';

    report += '4. **Long-term Actions** (Low Priority - 1-3 months)\n';
    const lowRecs = assessment.recommendations.filter(r => r.priority === 'LOW');
    lowRecs.forEach(rec => {
      report += `   - ${rec.title}\n`;
    });
    report += '\n';

    report += '## 📞 Support\n\n';
    report += 'For questions about this security assessment or implementation guidance, please contact the security team.\n\n';
    report += '---\n\n';
    report += `*Report generated on ${new Date().toLocaleString()} by NyNus Security Assessment Tool*\n`;

    writeFileSync(reportPath, report);
    logger.info(`📄 Comprehensive security assessment report saved to: ${reportPath}`);
  }
}
