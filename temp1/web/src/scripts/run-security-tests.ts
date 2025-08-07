#!/usr/bin/env tsx

/**
 * Security Test Runner for NyNus Authentication
 * 
 * Script để chạy tất cả security tests và generate comprehensive reports
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

import logger from '@/lib/utils/logger';

import { SecurityAssessmentGenerator } from '../tools/security/security-assessment';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

/**
 * Security Test Runner
 */
class SecurityTestRunner {
  private results: TestResult[] = [];

  /**
   * Run all security tests
   */
  async runAllTests(): Promise<void> {
    logger.info('🔐 Starting Comprehensive Security Testing Suite...\n');

    // 1. Run unit security tests
    await this.runUnitSecurityTests();

    // 2. Run integration security tests
    await this.runIntegrationSecurityTests();

    // 3. Run penetration tests
    await this.runPenetrationTests();

    // 4. Run code security audit
    await this.runCodeSecurityAudit();

    // 5. Generate comprehensive assessment
    await this.runSecurityAssessment();

    // 6. Display summary
    this.displaySummary();
  }

  /**
   * Run unit security tests
   */
  private async runUnitSecurityTests(): Promise<void> {
    logger.info('🧪 Running Unit Security Tests...');

    const testCommands = [
      {
        name: 'Authentication Security Tests',
        command: 'pnpm test apps/web/src/__tests__/security/auth-security.test.ts',
        description: 'JWT, rate limiting, CSRF, and cookie security tests'
      },
      {
        name: 'Rate Limiting Tests',
        command: 'pnpm test apps/web/src/lib/auth/__tests__/security-hardening.test.ts',
        description: 'Rate limiting and token blacklisting tests'
      },
      {
        name: 'Simple Security Tests',
        command: 'pnpm test apps/web/src/lib/auth/__tests__/simple-security-test.ts',
        description: 'Basic security functionality tests'
      }
    ];

    for (const test of testCommands) {
      await this.runTest(test.name, test.command, test.description);
    }
  }

  /**
   * Run integration security tests
   */
  private async runIntegrationSecurityTests(): Promise<void> {
    logger.info('\n🔗 Running Integration Security Tests...');

    // Check if server is running
    const isServerRunning = await this.checkServerHealth();
    
    if (!isServerRunning) {
      logger.info('⚠️ Server not running. Starting development server...');
      
      // Start server in background
      try {
        execSync('pnpm dev &', { stdio: 'ignore' });
        
        // Wait for server to start
        logger.info('⏳ Waiting for server to start...');
        await this.waitForServer();
      } catch (error) {
        logger.error('❌ Failed to start server for integration tests');
        this.results.push({
          name: 'Integration Tests Setup',
          success: false,
          duration: 0,
          error: 'Could not start development server'
        });
        return;
      }
    }

    const integrationTests = [
      {
        name: 'API Security Integration Tests',
        command: 'pnpm test:integration --grep="security"',
        description: 'End-to-end API security tests'
      },
      {
        name: 'Authentication Flow Tests',
        command: 'pnpm test:e2e --grep="auth"',
        description: 'Complete authentication flow security tests'
      }
    ];

    for (const test of integrationTests) {
      await this.runTest(test.name, test.command, test.description);
    }
  }

  /**
   * Run penetration tests
   */
  private async runPenetrationTests(): Promise<void> {
    logger.info('\n🔍 Running Penetration Tests...');

    try {
      const startTime = Date.now();
      
      // Import and run penetration tester
      const { AuthPenetrationTester } = await import('../tools/security/penetration-tester');
      
      const penTester = new AuthPenetrationTester({
        baseUrl: 'http://localhost:3000',
        timeout: 10000
      });

      const results = await penTester.runAllTests();
      const duration = Date.now() - startTime;

      const vulnerabilities = results.filter(r => r.success);
      const success = vulnerabilities.length === 0;

      this.results.push({
        name: 'Penetration Tests',
        success,
        duration,
        output: `${results.length} tests run, ${vulnerabilities.length} vulnerabilities found`
      });

      // Generate penetration test report
      const report = penTester.generateReport();
      logger.info('\n📄 Penetration test report generated');

    } catch (error) {
      this.results.push({
        name: 'Penetration Tests',
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Run code security audit
   */
  private async runCodeSecurityAudit(): Promise<void> {
    logger.info('\n📂 Running Code Security Audit...');

    try {
      const startTime = Date.now();
      
      // Import and run security audit
      const { SecurityAuditScanner } = await import('./security-audit');
      
      const scanner = new SecurityAuditScanner();
      const auditResults = await scanner.runAudit();
      const duration = Date.now() - startTime;

      const success = auditResults.totalIssues === 0;

      this.results.push({
        name: 'Code Security Audit',
        success,
        duration,
        output: `${auditResults.totalFiles} files scanned, ${auditResults.totalIssues} issues found`
      });

    } catch (error) {
      this.results.push({
        name: 'Code Security Audit',
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Run comprehensive security assessment
   */
  private async runSecurityAssessment(): Promise<void> {
    logger.info('\n📊 Running Comprehensive Security Assessment...');

    try {
      const startTime = Date.now();
      
      const assessmentGenerator = new SecurityAssessmentGenerator();
      const assessment = await assessmentGenerator.runAssessment();
      const duration = Date.now() - startTime;

      const success = assessment.overallRisk === 'LOW';

      this.results.push({
        name: 'Security Assessment',
        success,
        duration,
        output: `Risk Level: ${assessment.overallRisk}, Score: ${assessment.riskScore}/100`
      });

      logger.info(`\n📄 Comprehensive security assessment completed`);
      logger.info(`🎯 Overall Risk: ${assessment.overallRisk}`);
      logger.info(`📊 Risk Score: ${assessment.riskScore}/100`);

    } catch (error) {
      this.results.push({
        name: 'Security Assessment',
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Run individual test
   */
  private async runTest(name: string, command: string, description: string): Promise<void> {
    logger.info(`  🧪 ${name}: ${description}`);
    
    const startTime = Date.now();
    
    try {
      const output = execSync(command, { 
        encoding: 'utf-8',
        timeout: 60000, // 1 minute timeout
        stdio: 'pipe'
      });
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        success: true,
        duration,
        output: output.trim()
      });
      
      logger.info(`    ✅ Passed (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      logger.info(`    ❌ Failed (${duration}ms)`);
      if (error instanceof Error) {
        logger.info(`    Error: ${error.message}`);
      }
    }
  }

  /**
   * Check if server is running
   */
  private async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for server to start
   */
  private async waitForServer(maxWait: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (await this.checkServerHealth()) {
        logger.info('✅ Server is ready');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    logger.info('❌ Server failed to start within timeout');
    return false;
  }

  /**
   * Display test summary
   */
  private displaySummary(): void {
    logger.info('\n' + '='.repeat(60));
    logger.info('🔐 SECURITY TESTING SUMMARY');
    logger.info('='.repeat(60));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    logger.info(`\n📊 Overall Results:`);
    logger.info(`   Total Tests: ${totalTests}`);
    logger.info(`   Passed: ${passedTests} ✅`);
    logger.info(`   Failed: ${failedTests} ❌`);
    logger.info(`   Total Duration: ${totalDuration}ms`);

    if (failedTests > 0) {
      logger.info(`\n❌ Failed Tests:`);
      this.results.filter(r => !r.success).forEach(result => {
        logger.info(`   - ${result.name}: ${result.error || 'Unknown error'}`);
      });
    }

    logger.info(`\n🎯 Security Status:`);
    if (failedTests === 0) {
      logger.info(`   🟢 All security tests passed! The system appears secure.`);
    } else if (failedTests <= 2) {
      logger.info(`   🟡 Minor security issues detected. Review failed tests.`);
    } else {
      logger.info(`   🔴 Multiple security issues detected. Immediate attention required.`);
    }

    logger.info(`\n📄 Reports Generated:`);
    logger.info(`   - Security audit report`);
    logger.info(`   - Penetration test report`);
    logger.info(`   - Comprehensive security assessment`);

    logger.info(`\n🚀 Next Steps:`);
    if (failedTests > 0) {
      logger.info(`   1. Review failed test results`);
      logger.info(`   2. Fix identified security issues`);
      logger.info(`   3. Re-run security tests`);
      logger.info(`   4. Implement additional security measures`);
    } else {
      logger.info(`   1. Review security reports for recommendations`);
      logger.info(`   2. Schedule regular security testing`);
      logger.info(`   3. Monitor for new security threats`);
      logger.info(`   4. Keep security tools updated`);
    }

    logger.info('\n' + '='.repeat(60));
  }
}

/**
 * Main execution
 */
async function main() {
  const runner = new SecurityTestRunner();
  await runner.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(logger.error);
}

export { SecurityTestRunner };
