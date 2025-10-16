/**
 * Security Metrics API Route
 * Provides security metrics data for the dashboard
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Security metrics interface
interface SecurityMetrics {
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  moderateVulnerabilities: number;
  lowVulnerabilities: number;
  acceptableVulnerabilities: number;
  securityScore: number;
  previousScore: number;
  totalDependencies: number;
  outdatedDependencies: number;
  deprecatedDependencies: number;
  lastScanDate: string;
  nextScanDate: string;
  scanStatus: 'success' | 'warning' | 'error';
  trend: 'improving' | 'stable' | 'declining';
}

interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  title: string;
  description: string;
  package: string;
  cve?: string;
  status: 'open' | 'mitigated' | 'resolved';
  createdAt: string;
}

/**
 * GET /api/security/metrics
 * Fetch current security metrics
 */
export async function GET(_request: NextRequest) {
  try {
    // Run security check script
    const scriptPath = path.join(process.cwd(), 'scripts', 'security-check.js');
    const { stdout } = await execAsync(`node "${scriptPath}" --json`);
    
    // Parse security audit data
    const auditData = JSON.parse(stdout);
    
    // Calculate security score
    const securityScore = calculateSecurityScore(auditData);
    
    // Get previous score from cache (if exists)
    const previousScore = await getPreviousScore();
    
    // Determine trend
    const trend = determineTrend(securityScore, previousScore);
    
    // Get dependency stats
    const dependencyStats = await getDependencyStats();
    
    // Build metrics response
    const metrics: SecurityMetrics = {
      totalVulnerabilities: auditData.metadata?.vulnerabilities?.total || 0,
      criticalVulnerabilities: auditData.metadata?.vulnerabilities?.critical || 0,
      highVulnerabilities: auditData.metadata?.vulnerabilities?.high || 0,
      moderateVulnerabilities: auditData.metadata?.vulnerabilities?.moderate || 0,
      lowVulnerabilities: auditData.metadata?.vulnerabilities?.low || 0,
      acceptableVulnerabilities: auditData.acceptableCount || 0,
      securityScore,
      previousScore,
      totalDependencies: dependencyStats.total,
      outdatedDependencies: dependencyStats.outdated,
      deprecatedDependencies: dependencyStats.deprecated,
      lastScanDate: new Date().toISOString(),
      nextScanDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      scanStatus: auditData.passed ? 'success' : 'warning',
      trend,
    };
    
    // Get security alerts
    const alerts = buildSecurityAlerts(auditData);
    
    // Cache current score for next comparison
    await cacheCurrentScore(securityScore);
    
    return NextResponse.json({
      success: true,
      data: {
        metrics,
        alerts,
      },
    });
  } catch (error) {
    console.error('Failed to fetch security metrics:', error);
    
    // Return fallback data
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch security metrics',
      data: {
        metrics: getFallbackMetrics(),
        alerts: getFallbackAlerts(),
      },
    }, { status: 500 });
  }
}

/**
 * Calculate security score based on vulnerabilities
 */
function calculateSecurityScore(auditData: {
  metadata?: { vulnerabilities?: Record<string, number> };
  acceptableCount?: number;
}): number {
  const vulnerabilities = auditData.metadata?.vulnerabilities || {};

  // Base score
  let score = 100;

  // Deduct points based on severity
  score -= (vulnerabilities.critical || 0) * 25; // -25 per critical
  score -= (vulnerabilities.high || 0) * 10;     // -10 per high
  score -= (vulnerabilities.moderate || 0) * 5;  // -5 per moderate
  score -= (vulnerabilities.low || 0) * 1;       // -1 per low

  // Add points for acceptable vulnerabilities with mitigation
  const acceptableCount = auditData.acceptableCount || 0;
  score += acceptableCount * 2; // +2 per mitigated vulnerability

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get previous security score from cache
 */
async function getPreviousScore(): Promise<number> {
  try {
    const cachePath = path.join(process.cwd(), '.cache', 'security-score.json');
    const data = await fs.readFile(cachePath, 'utf-8');
    const cache = JSON.parse(data);
    return cache.score || 80;
  } catch {
    return 80; // Default previous score
  }
}

/**
 * Cache current security score
 */
async function cacheCurrentScore(score: number): Promise<void> {
  try {
    const cacheDir = path.join(process.cwd(), '.cache');
    const cachePath = path.join(cacheDir, 'security-score.json');
    
    // Ensure cache directory exists
    await fs.mkdir(cacheDir, { recursive: true });
    
    // Write cache
    await fs.writeFile(cachePath, JSON.stringify({
      score,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to cache security score:', error);
  }
}

/**
 * Determine security trend
 */
function determineTrend(currentScore: number, previousScore: number): 'improving' | 'stable' | 'declining' {
  const diff = currentScore - previousScore;
  
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

/**
 * Get dependency statistics
 */
async function getDependencyStats(): Promise<{ total: number; outdated: number; deprecated: number }> {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    return {
      total: Object.keys(dependencies).length,
      outdated: 35, // TODO: Implement real outdated check
      deprecated: 3, // TODO: Implement real deprecated check
    };
  } catch {
    return {
      total: 1343,
      outdated: 35,
      deprecated: 3,
    };
  }
}

interface VulnerabilityData {
  severity?: string;
  title?: string;
  description?: string;
  package?: string;
  version?: string;
  fixedIn?: string;
  cve?: string;
  acceptable?: boolean;
}

interface AuditData {
  vulnerabilities?: VulnerabilityData[];
}

/**
 * Build security alerts from audit data
 */
function buildSecurityAlerts(auditData: AuditData): SecurityAlert[] {
  const alerts: SecurityAlert[] = [];

  if (auditData.vulnerabilities) {
    auditData.vulnerabilities.forEach((vuln: VulnerabilityData, index: number) => {
      // Map medium to moderate for consistency
      const severityMap: Record<string, 'critical' | 'high' | 'moderate' | 'low'> = {
        'critical': 'critical',
        'high': 'high',
        'medium': 'moderate',
        'moderate': 'moderate',
        'low': 'low'
      };
      const severity = severityMap[vuln.severity || 'low'] || 'low';

      alerts.push({
        id: String(index + 1),
        severity,
        title: vuln.title || 'Unknown Vulnerability',
        description: vuln.description || 'No description available',
        package: vuln.package || 'unknown',
        cve: vuln.cve,
        status: vuln.acceptable ? 'mitigated' : 'open',
        createdAt: new Date().toISOString(),
      });
    });
  }
  
  return alerts;
}

/**
 * Get fallback metrics when API fails
 */
function getFallbackMetrics(): SecurityMetrics {
  return {
    totalVulnerabilities: 3,
    criticalVulnerabilities: 0,
    highVulnerabilities: 2,
    moderateVulnerabilities: 1,
    lowVulnerabilities: 0,
    acceptableVulnerabilities: 3,
    securityScore: 85,
    previousScore: 80,
    totalDependencies: 1343,
    outdatedDependencies: 35,
    deprecatedDependencies: 3,
    lastScanDate: new Date().toISOString(),
    nextScanDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    scanStatus: 'success',
    trend: 'improving',
  };
}

/**
 * Get fallback alerts when API fails
 */
function getFallbackAlerts(): SecurityAlert[] {
  return [
    {
      id: '1',
      severity: 'high',
      title: 'SheetJS Prototype Pollution',
      description: 'Export-only usage. No untrusted file reading.',
      package: 'xlsx',
      cve: 'CVE-2023-30533',
      status: 'mitigated',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      severity: 'high',
      title: 'SheetJS ReDoS',
      description: 'Export-only usage. No user-controlled regex.',
      package: 'xlsx',
      cve: 'CVE-2024-22363',
      status: 'mitigated',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      severity: 'moderate',
      title: 'PrismJS DOM Clobbering',
      description: 'Transitive dependency. DOMPurify sanitization active.',
      package: 'prismjs',
      cve: 'CVE-2024-53382',
      status: 'mitigated',
      createdAt: new Date().toISOString(),
    },
  ];
}

