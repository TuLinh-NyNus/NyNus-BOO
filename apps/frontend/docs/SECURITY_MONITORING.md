# Security Monitoring Guide - NyNus Frontend
**Version**: 1.0.0  
**Last Updated**: 2025-01-19  
**Status**: ✅ ACTIVE

## Overview

This document describes the automated security monitoring setup for the NyNus Frontend application, including dependency scanning, vulnerability detection, and automated reporting.

## Components

### 1. Dependabot Configuration
**File**: `.github/dependabot.yml`

Automated dependency updates with the following features:
- **Weekly scans**: Every Monday at 9:00 AM Vietnam time
- **Grouped updates**: Security, React ecosystem, UI libraries, dev tools
- **Auto-PR creation**: Automatic pull requests for updates
- **Smart ignoring**: Major version updates require manual review

**Monitored ecosystems**:
- npm (Frontend dependencies)
- gomod (Backend dependencies)
- GitHub Actions
- Docker

### 2. Security Check Script
**File**: `apps/frontend/scripts/security-check.js`

Automated security scanning with customizable thresholds:

```bash
# Run security check
pnpm security:check

# Generate detailed report
pnpm security:report

# Run audit only
pnpm security:audit
```

**Features**:
- Vulnerability severity analysis
- Acceptable vulnerability tracking
- Automated report generation
- Exit code based on thresholds

**Thresholds**:
```javascript
{
  maxCritical: 0,    // No critical vulnerabilities allowed
  maxHigh: 2,        // 2 HIGH allowed (xlsx with mitigation)
  maxModerate: 1,    // 1 MODERATE allowed (prismjs transitive)
  maxLow: 5          // 5 LOW allowed
}
```

### 3. GitHub Actions Workflow
**File**: `.github/workflows/security-scan.yml`

Automated security scanning on:
- **Push** to main/develop branches
- **Pull requests** to main/develop
- **Weekly schedule**: Monday 9:00 AM Vietnam time
- **Manual trigger**: Via GitHub Actions UI

**Jobs**:
1. **security-audit**: Run pnpm audit and security check
2. **dependency-review**: Review dependency changes in PRs
3. **codeql-analysis**: Static code analysis for security issues

## Acceptable Vulnerabilities

The following vulnerabilities are tracked as acceptable with documented mitigation:

### 1. PrismJS DOM Clobbering (CVE-2024-53382)
- **Package**: `prismjs` (via `react-syntax-highlighter`)
- **Severity**: Moderate (CVSS 4.9)
- **Reason**: Transitive dependency, low risk
- **Mitigation**: 
  - DOMPurify sanitization active
  - XSS prevention layer
  - Controlled usage (code display only)

### 2. SheetJS Prototype Pollution (CVE-2023-30533)
- **Package**: `xlsx`
- **Severity**: High (CVSS 7.8)
- **Reason**: Export-only usage, no untrusted file reading
- **Mitigation**:
  - Only used for exporting data
  - No user file uploads processed
  - File validation active

### 3. SheetJS ReDoS (CVE-2024-22363)
- **Package**: `xlsx`
- **Severity**: High (CVSS 7.5)
- **Reason**: Export-only usage, no user-controlled regex
- **Mitigation**:
  - Same as above
  - No regex patterns from user input

## Usage

### Local Development

```bash
# Check security status
cd apps/frontend
pnpm security:check

# Generate detailed report
pnpm security:report

# View audit results
pnpm security:audit
```

### CI/CD Integration

Security checks run automatically on:
- Every push to main/develop
- Every pull request
- Weekly schedule (Monday 9 AM)

**PR Comments**: Security scan results are automatically posted as PR comments.

### Manual Workflow Trigger

1. Go to GitHub Actions
2. Select "Security Scan" workflow
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

## Reports

### Security Check Report
**Location**: `apps/frontend/docs/SECURITY_CHECK_REPORT.md`

Generated automatically by security check script. Contains:
- Vulnerability summary
- Detailed vulnerability information
- Acceptable vulnerabilities list
- Recommendations

### Security Audit Report
**Location**: `apps/frontend/docs/SECURITY_AUDIT_REPORT.md`

Comprehensive security audit with:
- Fixed vulnerabilities
- Remaining vulnerabilities
- Risk assessment
- Mitigation strategies
- Security best practices

## Monitoring Dashboard

### NyNus Security Dashboard
**URL**: `/admin/security`

Real-time security monitoring dashboard with:
- **Security Score**: Overall security posture (0-100)
- **Vulnerability Tracking**: Critical, High, Moderate, Low
- **Trend Analysis**: Improving, Stable, Declining
- **Active Alerts**: Real-time vulnerability notifications
- **Auto-refresh**: Configurable refresh interval
- **Export**: Generate security reports

**Features**:
- Real-time metrics visualization
- Severity-based color coding
- CVE information and links
- Mitigation status tracking
- Historical trend analysis

**Access**:
```bash
# Local development
http://localhost:3000/admin/security

# Production
https://nynus.edu.vn/admin/security
```

See [Security Dashboard Documentation](./SECURITY_DASHBOARD.md) for details.

### GitHub Security Tab
View security alerts at: `https://github.com/[org]/[repo]/security`

Features:
- Dependabot alerts
- Code scanning alerts
- Secret scanning alerts

### Dependabot Dashboard
View dependency updates at: `https://github.com/[org]/[repo]/security/dependabot`

Features:
- Open pull requests
- Dismissed alerts
- Update configuration

## Alerting

### Email Notifications
Configure in GitHub Settings → Notifications:
- Dependabot alerts
- Security advisories
- Workflow failures

### Slack Integration
**Status**: ✅ CONFIGURED

Automated Slack notifications are configured for:
- ✅ Security scan failures
- ✅ Security scan successes
- ⚠️ New vulnerabilities detected
- 📊 Weekly security summaries

**Setup Instructions**:

1. **Create Slack Webhook**:
   ```bash
   # Go to Slack App settings
   # Create Incoming Webhook
   # Copy webhook URL
   ```

2. **Add to GitHub Secrets**:
   ```bash
   # Repository Settings → Secrets → Actions
   Name: SLACK_WEBHOOK_URL
   Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. **Test Notification**:
   ```bash
   # Trigger manual workflow run
   # Check Slack channel for notification
   ```

**Notification Format**:

Success notification:
```
✅ Security Scan Passed
Repository: org/repo
Branch: main
All security checks passed successfully
```

Failure notification:
```
🚨 Security Scan Failed
Repository: org/repo
Branch: main
Triggered by: username
Security vulnerabilities detected that require immediate attention
[View Details]
```

## Maintenance

### Weekly Tasks
- [ ] Review Dependabot PRs
- [ ] Check security scan results
- [ ] Update acceptable vulnerabilities list if needed

### Monthly Tasks
- [ ] Review security audit report
- [ ] Update security thresholds if needed
- [ ] Check for new security best practices
- [ ] Update documentation

### Quarterly Tasks
- [ ] Comprehensive security review
- [ ] Update security policies
- [ ] Review and update mitigation strategies
- [ ] Security training for team

## Troubleshooting

### Security Check Fails
1. Check `SECURITY_CHECK_REPORT.md` for details
2. Review unacceptable vulnerabilities
3. Update packages or add to acceptable list with justification
4. Re-run security check

### Dependabot PRs Failing
1. Check CI/CD logs
2. Review breaking changes
3. Update code if needed
4. Merge or close PR with justification

### False Positives
1. Verify vulnerability is false positive
2. Add to acceptable vulnerabilities list
3. Document mitigation strategy
4. Update security check script

## Best Practices

### 1. Regular Updates
- Review and merge Dependabot PRs weekly
- Keep dependencies up-to-date
- Test updates in development first

### 2. Security-First Development
- Run security check before commits
- Review security implications of new dependencies
- Follow secure coding practices

### 3. Documentation
- Document all acceptable vulnerabilities
- Keep mitigation strategies up-to-date
- Update security policies regularly

### 4. Team Communication
- Share security scan results with team
- Discuss security concerns in code reviews
- Conduct security training sessions

## Resources

### Internal Documentation
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Security Check Report](./SECURITY_CHECK_REPORT.md)
- [Clean Code Standards](../../.augment/rules/coding.md)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

## Support

For security concerns or questions:
- **Email**: security@nynus.edu.vn
- **Slack**: #security-team
- **GitHub Issues**: Use `security` label

---

**Maintained by**: NyNus Development Team  
**Next Review**: 2025-02-19

