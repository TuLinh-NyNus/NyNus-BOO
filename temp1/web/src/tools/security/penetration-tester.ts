/**
 * Penetration Testing Tool for NyNus Authentication
 * 
 * Tool để thực hiện manual penetration testing cho authentication system
 */

import { randomBytes } from '@/lib/polyfills/crypto-polyfill';
import logger from '@/lib/utils/logger';

export interface PenTestResult {
  testName: string;
  success: boolean;
  vulnerability?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation?: string;
  evidence?: Record<string, unknown> | string | number | boolean | null;
}

export interface PenTestConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  userAgent: string;
}

// Interface for request body in security testing
interface SecurityTestBody {
  [key: string]: string | unknown;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Authentication Penetration Tester
 */
export class AuthPenetrationTester {
  private config: PenTestConfig;
  private results: PenTestResult[] = [];

  constructor(config: Partial<PenTestConfig> = {}) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      timeout: 10000,
      maxRetries: 3,
      userAgent: 'NyNus-PenTest/1.0',
      ...config
    };
  }

  /**
   * Run comprehensive penetration tests
   */
  async runAllTests(): Promise<PenTestResult[]> {
    logger.info('🔍 Starting Authentication Penetration Tests...\n');

    this.results = [];

    // Authentication Bypass Tests
    await this.testAuthenticationBypass();
    await this.testJWTManipulation();
    
    // Injection Tests
    await this.testSQLInjection();
    await this.testXSSInjection();
    
    // Brute Force Tests
    await this.testBruteForceProtection();

    // CSRF Tests
    await this.testCSRFProtection();

    logger.info(`\n✅ Penetration testing completed. ${this.results.length} tests executed.`);
    return this.results;
  }

  /**
   * Test Authentication Bypass Vulnerabilities
   */
  private async testAuthenticationBypass(): Promise<void> {
    logger.info('🔐 Testing Authentication Bypass...');

    // Test 1: Direct access to protected endpoints
    await this.testDirectAccess();
    
    // Test 2: Parameter pollution
    await this.testParameterPollution();
    
    // Test 3: HTTP method bypass
    await this.testHTTPMethodBypass();
    
    // Test 4: Path traversal
    await this.testPathTraversal();
  }

  private async testDirectAccess(): Promise<void> {
    const protectedEndpoints = [
      '/api/auth/profile',
      '/api/auth/refresh',
      '/dashboard',
      '/profile',
      '/admin'
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'User-Agent': this.config.userAgent
          }
        });

        if (response.status === 200) {
          this.addResult({
            testName: 'Direct Access to Protected Endpoint',
            success: true,
            vulnerability: 'Authentication Bypass',
            severity: 'CRITICAL',
            description: `Protected endpoint ${endpoint} accessible without authentication`,
            recommendation: 'Implement proper authentication middleware for all protected routes',
            evidence: { endpoint, status: response.status }
          });
        } else {
          this.addResult({
            testName: 'Direct Access Protection',
            success: false,
            severity: 'LOW',
            description: `Protected endpoint ${endpoint} properly secured (${response.status})`,
            evidence: { endpoint, status: response.status }
          });
        }
      } catch (error) {
        logger.error(`Error testing ${endpoint}:`, error);
      }
    }
  }

  private async testParameterPollution(): Promise<void> {
    const pollutionPayloads = [
      { email: ['user@test.com', 'admin@test.com'] },
      { role: ['STUDENT', 'ADMIN'] },
      { userId: ['123', '1'] }
    ];

    for (const payload of pollutionPayloads) {
      try {
        const params = new URLSearchParams();
        Object.entries(payload).forEach(([key, values]) => {
          values.forEach((value: string) => params.append(key, value));
        });

        const response = await fetch(`${this.config.baseUrl}/api/auth/login?${params}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.config.userAgent
          },
          body: JSON.stringify({ password: 'test123' })
        });

        if (response.status === 200) {
          this.addResult({
            testName: 'Parameter Pollution',
            success: true,
            vulnerability: 'Parameter Pollution',
            severity: 'MEDIUM',
            description: 'Application vulnerable to parameter pollution attacks',
            recommendation: 'Implement proper parameter validation and sanitization',
            evidence: { payload, status: response.status }
          });
        }
      } catch (error) {
        // Expected behavior
      }
    }
  }

  private async testHTTPMethodBypass(): Promise<void> {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    const endpoint = '/api/auth/profile';

    for (const method of methods) {
      try {
        const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
          method,
          headers: {
            'User-Agent': this.config.userAgent,
            'X-HTTP-Method-Override': 'GET'
          }
        });

        if (response.status === 200 && method !== 'GET') {
          this.addResult({
            testName: 'HTTP Method Bypass',
            success: true,
            vulnerability: 'HTTP Method Override',
            severity: 'MEDIUM',
            description: `Protected endpoint accessible via ${method} method`,
            recommendation: 'Restrict HTTP methods and disable method override headers',
            evidence: { method, status: response.status }
          });
        }
      } catch (error) {
        // Expected behavior
      }
    }
  }

  private async testPathTraversal(): Promise<void> {
    const traversalPayloads = [
      '../admin',
      '..%2fadmin',
      '..%252fadmin',
      '....//admin',
      '%2e%2e%2fadmin'
    ];

    for (const payload of traversalPayloads) {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/auth/${payload}`, {
          method: 'GET',
          headers: {
            'User-Agent': this.config.userAgent
          }
        });

        if (response.status === 200) {
          this.addResult({
            testName: 'Path Traversal',
            success: true,
            vulnerability: 'Path Traversal',
            severity: 'HIGH',
            description: `Path traversal successful with payload: ${payload}`,
            recommendation: 'Implement proper input validation and path sanitization',
            evidence: { payload, status: response.status }
          });
        }
      } catch (error) {
        // Expected behavior
      }
    }
  }

  /**
   * Test JWT Token Manipulation
   */
  private async testJWTManipulation(): Promise<void> {
    logger.info('🎫 Testing JWT Token Manipulation...');

    // Test JWT algorithm confusion
    await this.testJWTAlgorithmConfusion();
    
    // Test JWT signature bypass
    await this.testJWTSignatureBypass();
    
    // Test JWT claim manipulation
    await this.testJWTClaimManipulation();
  }

  private async testJWTAlgorithmConfusion(): Promise<void> {
    const maliciousTokens = [
      // Algorithm confusion (HS256 -> none)
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTUxNjIzOTAyMn0.',
      
      // Algorithm confusion (RS256 -> HS256)
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTUxNjIzOTAyMn0.invalid-signature'
    ];

    for (const token of maliciousTokens) {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': this.config.userAgent
          }
        });

        if (response.status === 200) {
          this.addResult({
            testName: 'JWT Algorithm Confusion',
            success: true,
            vulnerability: 'JWT Algorithm Confusion',
            severity: 'CRITICAL',
            description: 'JWT algorithm confusion attack successful',
            recommendation: 'Enforce specific JWT algorithms and validate algorithm header',
            evidence: { token: token.substring(0, 50) + '...', status: response.status }
          });
        }
      } catch (error) {
        // Expected behavior
      }
    }
  }

  private async testJWTSignatureBypass(): Promise<void> {
    const bypassAttempts = [
      // Remove signature
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTUxNjIzOTAyMn0',
      
      // Empty signature
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTUxNjIzOTAyMn0.',
      
      // Invalid signature
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTUxNjIzOTAyMn0.invalid'
    ];

    for (const token of bypassAttempts) {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': this.config.userAgent
          }
        });

        if (response.status === 200) {
          this.addResult({
            testName: 'JWT Signature Bypass',
            success: true,
            vulnerability: 'JWT Signature Bypass',
            severity: 'CRITICAL',
            description: 'JWT signature validation bypassed',
            recommendation: 'Implement strict JWT signature validation',
            evidence: { token: token.substring(0, 50) + '...', status: response.status }
          });
        }
      } catch (error) {
        // Expected behavior
      }
    }
  }

  private async testJWTClaimManipulation(): Promise<void> {
    // Test role escalation through JWT claims
    const manipulatedClaims = [
      { role: 'ADMIN' ,
      maxConcurrentIPs: 5},
      { role: 'SUPER_ADMIN' },
      { email: 'admin@nynus.com' },
      { sub: '1' }, // Admin user ID
      { exp: Math.floor(Date.now() / 1000) + 86400 } // Extended expiration
    ];

    for (const claims of manipulatedClaims) {
      try {
        // Create manipulated JWT (this would need proper signing in real test)
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
          sub: '1234567890',
          email: 'test@example.com',
          role: 'STUDENT',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900,
          ...claims
        }));
        const signature = 'fake-signature';
        const token = `${header}.${payload}.${signature}`;

        const response = await fetch(`${this.config.baseUrl}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': this.config.userAgent
          }
        });

        if (response.status === 200) {
          this.addResult({
            testName: 'JWT Claim Manipulation',
            success: true,
            vulnerability: 'JWT Claim Manipulation',
            severity: 'HIGH',
            description: `JWT claim manipulation successful: ${JSON.stringify(claims)}`,
            recommendation: 'Validate JWT claims against database and implement proper authorization',
            evidence: { claims, status: response.status }
          });
        }
      } catch (error) {
        // Expected behavior
      }
    }
  }

  /**
   * Test SQL Injection Vulnerabilities
   */
  private async testSQLInjection(): Promise<void> {
    logger.info('💉 Testing SQL Injection...');

    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1 --",
      "'; INSERT INTO users (email, role) VALUES ('hacker@evil.com', 'ADMIN'); --"
    ];

    const endpoints = [
      { url: '/api/auth/login', method: 'POST', field: 'email' ,
      maxConcurrentIPs: 5},
      { url: '/api/auth/login', method: 'POST', field: 'password' },
      { url: '/api/auth/register', method: 'POST', field: 'email' },
      { url: '/api/auth/forgot-password', method: 'POST', field: 'email' }
    ];

    for (const endpoint of endpoints) {
      for (const payload of sqlPayloads) {
        try {
          const body: SecurityTestBody = {};
          body[endpoint.field] = payload;

          if (endpoint.field !== 'password') {
            body.password = 'test123';
          }
          if (endpoint.field !== 'email') {
            body.email = 'test@example.com';
          }

          const response = await fetch(`${this.config.baseUrl}${endpoint.url}`, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': this.config.userAgent
            },
            body: JSON.stringify(body)
          });

          const responseText = await response.text();

          // Check for SQL error messages
          const sqlErrors = [
            'sql syntax',
            'mysql_fetch',
            'postgresql error',
            'ora-',
            'microsoft ole db',
            'sqlite_',
            'prisma'
          ];

          const hasSQLError = sqlErrors.some(error => 
            responseText.toLowerCase().includes(error)
          );

          if (hasSQLError || response.status === 500) {
            this.addResult({
              testName: 'SQL Injection',
              success: true,
              vulnerability: 'SQL Injection',
              severity: 'CRITICAL',
              description: `SQL injection vulnerability in ${endpoint.url} (${endpoint.field})`,
              recommendation: 'Use parameterized queries and input validation',
              evidence: { 
                endpoint: endpoint.url, 
                field: endpoint.field, 
                payload, 
                status: response.status,
                hasError: hasSQLError
              }
            });
          }
        } catch (error) {
          // Network errors are expected
        }
      }
    }
  }

  /**
   * Test XSS Vulnerabilities
   */
  private async testXSSInjection(): Promise<void> {
    logger.info('🚨 Testing XSS Injection...');

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ];

    const endpoints = [
      { url: '/api/auth/register', method: 'POST', fields: ['firstName', 'lastName', 'email'] },
      { url: '/api/auth/login', method: 'POST', fields: ['email'] }
    ];

    for (const endpoint of endpoints) {
      for (const field of endpoint.fields) {
        for (const payload of xssPayloads) {
          try {
            const body: SecurityTestBody = {
              email: 'test@example.com',
              password: 'test123',
              firstName: 'Test',
              lastName: 'User'
            };
            body[field] = payload;

            const response = await fetch(`${this.config.baseUrl}${endpoint.url}`, {
              method: endpoint.method,
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': this.config.userAgent
              },
              body: JSON.stringify(body)
            });

            const responseText = await response.text();

            // Check if payload is reflected in response
            if (responseText.includes(payload)) {
              this.addResult({
                testName: 'XSS Injection',
                success: true,
                vulnerability: 'Cross-Site Scripting (XSS)',
                severity: 'HIGH',
                description: `XSS vulnerability in ${endpoint.url} (${field})`,
                recommendation: 'Implement proper input sanitization and output encoding',
                evidence: { 
                  endpoint: endpoint.url, 
                  field, 
                  payload, 
                  reflected: true 
                }
              });
            }
          } catch (error) {
            // Expected behavior
          }
        }
      }
    }
  }

  /**
   * Test Brute Force Protection
   */
  private async testBruteForceProtection(): Promise<void> {
    logger.info('🔨 Testing Brute Force Protection...');

    const attempts = 10;
    let successfulAttempts = 0;

    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.config.userAgent
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: `wrong-password-${i}`
          })
        });

        if (response.status !== 429) {
          successfulAttempts++;
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Expected behavior
      }
    }

    if (successfulAttempts >= attempts * 0.8) {
      this.addResult({
        testName: 'Brute Force Protection',
        success: true,
        vulnerability: 'Insufficient Brute Force Protection',
        severity: 'HIGH',
        description: `${successfulAttempts}/${attempts} brute force attempts succeeded`,
        recommendation: 'Implement rate limiting and account lockout mechanisms',
        evidence: { successfulAttempts, totalAttempts: attempts }
      });
    } else {
      this.addResult({
        testName: 'Brute Force Protection',
        success: false,
        severity: 'LOW',
        description: `Brute force protection working (${successfulAttempts}/${attempts} attempts blocked)`,
        evidence: { successfulAttempts, totalAttempts: attempts }
      });
    }
  }

  /**
   * Test CSRF Protection
   */
  private async testCSRFProtection(): Promise<void> {
    logger.info('🛡️ Testing CSRF Protection...');

    try {
      // Attempt CSRF attack without token
      const response = await fetch(`${this.config.baseUrl}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.config.userAgent,
          'Origin': 'https://evil.com'
        },
        body: JSON.stringify({
          firstName: 'Hacked',
          lastName: 'User'
        })
      });

      if (response.status === 200) {
        this.addResult({
          testName: 'CSRF Protection',
          success: true,
          vulnerability: 'Cross-Site Request Forgery (CSRF)',
          severity: 'MEDIUM',
          description: 'CSRF protection missing or insufficient',
          recommendation: 'Implement CSRF tokens and validate Origin/Referer headers',
          evidence: { status: response.status }
        });
      } else {
        this.addResult({
          testName: 'CSRF Protection',
          success: false,
          severity: 'LOW',
          description: 'CSRF protection working correctly',
          evidence: { status: response.status }
        });
      }
    } catch (error) {
      // Expected behavior
    }
  }

  /**
   * Add test result
   */
  private addResult(result: PenTestResult): void {
    this.results.push(result);
    
    const icon = result.success ? '❌' : '✅';
    const severity = result.success ? `[${result.severity}]` : '';
    
    logger.info(`  ${icon} ${result.testName} ${severity}`);
    if (result.success && result.vulnerability) {
      logger.info(`    🔍 ${result.description}`);
    }
  }

  /**
   * Generate penetration test report
   */
  generateReport(): string {
    const vulnerabilities = this.results.filter(r => r.success);
    const passed = this.results.filter(r => !r.success);

    let report = '# 🔍 Authentication Penetration Test Report\n\n';
    report += `**Test Date:** ${new Date().toISOString()}\n`;
    report += `**Total Tests:** ${this.results.length}\n`;
    report += `**Vulnerabilities Found:** ${vulnerabilities.length}\n`;
    report += `**Tests Passed:** ${passed.length}\n\n`;

    if (vulnerabilities.length > 0) {
      report += '## 🚨 Vulnerabilities Found\n\n';
      
      const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL');
      const high = vulnerabilities.filter(v => v.severity === 'HIGH');
      const medium = vulnerabilities.filter(v => v.severity === 'MEDIUM');
      const low = vulnerabilities.filter(v => v.severity === 'LOW');

      if (critical.length > 0) {
        report += `### 🔴 Critical (${critical.length})\n\n`;
        critical.forEach(v => {
          report += `- **${v.testName}**: ${v.description}\n`;
          if (v.recommendation) report += `  - *Recommendation*: ${v.recommendation}\n`;
          report += '\n';
        });
      }

      if (high.length > 0) {
        report += `### 🟠 High (${high.length})\n\n`;
        high.forEach(v => {
          report += `- **${v.testName}**: ${v.description}\n`;
          if (v.recommendation) report += `  - *Recommendation*: ${v.recommendation}\n`;
          report += '\n';
        });
      }

      if (medium.length > 0) {
        report += `### 🟡 Medium (${medium.length})\n\n`;
        medium.forEach(v => {
          report += `- **${v.testName}**: ${v.description}\n`;
          if (v.recommendation) report += `  - *Recommendation*: ${v.recommendation}\n`;
          report += '\n';
        });
      }

      if (low.length > 0) {
        report += `### 🔵 Low (${low.length})\n\n`;
        low.forEach(v => {
          report += `- **${v.testName}**: ${v.description}\n`;
          if (v.recommendation) report += `  - *Recommendation*: ${v.recommendation}\n`;
          report += '\n';
        });
      }
    }

    if (passed.length > 0) {
      report += '## ✅ Tests Passed\n\n';
      passed.forEach(p => {
        report += `- **${p.testName}**: ${p.description}\n`;
      });
      report += '\n';
    }

    report += '## 📋 Summary\n\n';
    if (vulnerabilities.length === 0) {
      report += '🎉 No vulnerabilities found! The authentication system appears to be secure.\n';
    } else {
      report += `⚠️ ${vulnerabilities.length} vulnerabilities found. Please review and fix the issues above.\n`;
    }

    return report;
  }
}
