# CI/CD Pipeline Guide - Exam Bank System

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [Setup Instructions](#setup-instructions)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Workflow Descriptions](#workflow-descriptions)
6. [Local Testing](#local-testing)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🎯 Overview

The exam-bank-system uses **GitHub Actions** for continuous integration and deployment (CI/CD). The pipeline automatically:

- ✅ Runs code quality checks (linting, formatting)
- ✅ Executes comprehensive tests (unit, integration, E2E)
- ✅ Builds Docker images
- ✅ Deploys to staging (automatic on `main` branch)
- ✅ Deploys to production (manual with approval)
- ✅ Provides security scanning
- ✅ Generates coverage reports

---

## 🏗️ Pipeline Architecture

### Workflows Overview

```
┌─────────────────────────────────────────┐
│  Push to main/develop branch            │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
┌─────────┐ ┌────────┐ ┌────────┐
│ Backend │ │Frontend│ │ Mobile │
│   CI    │ │  CI    │ │  CI    │
└────┬────┘ └───┬────┘ └───┬────┘
     │          │          │
     └──────────┼──────────┘
                │
       ┌────────▼────────┐
       │  Build Images   │
       └────────┬────────┘
                │
       ┌────────▼────────┐
       │ Deploy Staging  │ (auto if main)
       └────────┬────────┘
                │
       ┌────────▼────────┐
       │ Run Smoke Tests │
       └────────┬────────┘
                │
       ┌────────▼────────────────┐
       │ Await Manual Approval   │
       │ For Production Deploy   │
       └────────┬────────────────┘
                │
       ┌────────▼────────┐
       │ Blue-Green Deps │
       │ (Production)    │
       └─────────────────┘
```

### Jobs Hierarchy

**Backend CI:**
- Code Quality & Linting (go fmt, go vet, golangci-lint)
- Unit & Integration Tests (with PostgreSQL, Redis)
- Build Verification (multi-arch binaries)
- Docker Build Test
- Security Scan (Gosec, govulncheck)

**Frontend CI:**
- Code Quality & Linting (ESLint, Prettier)
- TypeScript Type Check
- Unit Tests (Jest with coverage)
- Build Verification
- E2E Tests (Playwright, multi-browser)
- Docker Build Test
- Security Scan (npm audit, Snyk)

**Mobile CI:**
- Code Analysis & Linting (Flutter analyze)
- Unit & Widget Tests (with coverage)
- Integration Tests (Android & iOS emulators)
- Android Build (APK generation)
- iOS Build (IPA generation)
- Security Scan

---

## 🚀 Setup Instructions

### 1. Prerequisites

- GitHub repository with Actions enabled
- Docker installed locally
- Node.js 18+ (for testing locally)
- Go 1.23+ (for backend)
- Flutter 3.19.0+ (for mobile)

### 2. Enable GitHub Actions

1. Go to **Settings > Actions > General**
2. Enable "Allow all actions and reusable workflows"
3. Configure runner settings as needed

### 3. Create Environments

Create three GitHub environments for different stages:

```bash
Settings > Environments

1. development
   - No approval required
   - Secrets: DEV_HOST, DEV_SSH_KEY, etc.

2. staging
   - No approval required (for staging deployments)
   - Secrets: AWS credentials, K8s config, etc.

3. production
   - Requires approval (protect branch, require reviewers)
   - Secrets: AWS credentials, K8s config, etc.

4. production-approval
   - Approval required before production
   - For pre-deployment checks
```

### 4. Branch Protection Rules

Set up protection rules for `main` and `develop`:

```
Settings > Branches > Branch Protection Rules

For 'main' branch:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Select: Backend CI, Frontend CI, Mobile CI
- ✅ Require branches to be up to date before merging
- ✅ Require code reviews before merging
- ✅ Require approval from code owners
- ✅ Require conversation resolution before merging
```

---

## 🔐 GitHub Secrets Configuration

### Required Secrets

Create these secrets in **Settings > Secrets and variables > Actions**:

#### Common Secrets

```yaml
# Container Registry
GITHUB_TOKEN: <auto-provided>

# Notifications
SLACK_WEBHOOK_STAGING: https://hooks.slack.com/services/...
SLACK_WEBHOOK_PROD: https://hooks.slack.com/services/...

# Codecov
CODECOV_TOKEN: <from codecov.io>

# Snyk Security
SNYK_TOKEN: <from snyk.io>
```

#### Staging Secrets

```yaml
# Deployment
DEPLOY_METHOD: docker-compose | kubernetes
DEPLOY_SSH_KEY: <base64 encoded private key>
STAGING_HOST: staging.example.com
STAGING_URL: https://staging.example.com
STAGING_API_URL: https://staging-api.example.com

# AWS (if using)
AWS_ACCESS_KEY_ID: <key>
AWS_SECRET_ACCESS_KEY: <secret>
AWS_REGION: us-east-1

# Kubernetes (if using)
KUBE_CONFIG_STAGING: <base64 encoded kubeconfig>
```

#### Production Secrets

```yaml
# Deployment
DEPLOY_METHOD: kubernetes
AWS_ACCESS_KEY_ID: <key>
AWS_SECRET_ACCESS_KEY: <secret>
AWS_REGION: us-east-1

# Kubernetes
KUBE_CONFIG_PROD: <base64 encoded kubeconfig>

# Production URLs
PROD_URL: https://nynus.edu.vn
PROD_API_URL: https://api.nynus.edu.vn

# Monitoring
SENTRY_DSN: <from sentry.io>
DATADOG_API_KEY: <from datadog>
```

### How to Encode Files for Secrets

```bash
# For SSH keys or kubeconfig files
cat ~/.ssh/id_rsa | base64 -w 0
# Or on macOS
cat ~/.ssh/id_rsa | base64

# Then paste the output in GitHub secret
```

---

## 📝 Workflow Descriptions

### 1. Backend CI (`.github/workflows/ci-backend.yml`)

**Triggers:** Push/PR to main or develop (changes in `apps/backend/`)

**Jobs:**
- **lint**: Code formatting and quality checks
- **test**: Unit + integration tests with PostgreSQL/Redis
- **build**: Multi-architecture binary compilation
- **docker**: Docker image build and cache
- **security**: Gosec and govulncheck scanning

**Duration:** ~10-15 minutes

### 2. Frontend CI (`.github/workflows/ci-frontend.yml`)

**Triggers:** Push/PR to main or develop (changes in `apps/frontend/`)

**Jobs:**
- **lint**: ESLint and Prettier checks
- **type-check**: TypeScript strict mode
- **unit-tests**: Jest coverage
- **build**: Next.js production build
- **e2e-tests**: Playwright (chromium, firefox, webkit)
- **docker**: Docker image build
- **security**: npm audit and Snyk

**Duration:** ~15-20 minutes

### 3. Mobile CI (`.github/workflows/ci-mobile.yml`)

**Triggers:** Push/PR to main or develop (changes in `apps/mobile/`)

**Jobs:**
- **analyze**: Flutter analysis and formatting
- **unit-tests**: Unit + widget tests
- **integration-tests-android**: Android emulator tests
- **integration-tests-ios**: iOS simulator tests
- **build-android**: APK generation
- **build-ios**: IPA generation
- **security**: Dependency checking

**Duration:** ~30-45 minutes

### 4. Deploy to Staging (`.github/workflows/cd-staging.yml`)

**Triggers:** Push to main branch (after CI passes)

**Steps:**
1. Build Docker images
2. Push to GitHub Container Registry
3. Deploy to staging environment
4. Run smoke tests
5. Verify accessibility
6. Send Slack notification

**Duration:** ~10-15 minutes

### 5. Deploy to Production (`.github/workflows/cd-production.yml`)

**Triggers:** Manual workflow dispatch

**Options:**
- **Environment**: production or production-canary
- **Strategy**: blue-green, rolling, or canary

**Steps:**
1. Pre-deployment checks (manual approval)
2. Build and push images
3. Deploy to Blue environment
4. Health checks
5. Smoke tests
6. Traffic switch
7. Cleanup Green environment
8. Automatic rollback if needed

**Duration:** ~20-30 minutes

---

## 🧪 Local Testing

### Run All Tests Locally

```bash
# From project root
bash scripts/ci/run-all-tests.sh
```

### Run Backend Tests

```bash
cd apps/backend

# Start services
docker-compose -f ../../docker/compose/docker-compose.yml up -d postgres redis

# Run tests
go test -v -race -coverprofile=coverage.out ./...

# View coverage
go tool cover -html=coverage.out

# Stop services
docker-compose -f ../../docker/compose/docker-compose.yml down
```

### Run Frontend Tests

```bash
cd apps/frontend

# Install
pnpm install

# Lint
pnpm lint

# Type check
pnpm type-check

# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# View Playwright report
pnpm test:e2e:report
```

### Run Mobile Tests

```bash
cd apps/mobile

# Get dependencies
flutter pub get

# Analyze
flutter analyze

# Unit tests
flutter test

# Widget tests
flutter test --tag="widget"
```

---

## 🐛 Troubleshooting

### Backend CI Issues

**Problem**: "go mod tidy" fails
```bash
Solution: Run locally
cd apps/backend
go mod tidy
git add go.mod go.sum
git commit -m "Update Go dependencies"
```

**Problem**: Tests fail with database connection
```bash
Ensure PostgreSQL service has healthcheck configured
Check docker-compose.yml healthcheck settings
```

### Frontend CI Issues

**Problem**: "pnpm install" takes too long
```bash
Solution: GitHub Actions caches by default
But ensure cache key matches pnpm-lock.yaml changes
```

**Problem**: Playwright browser not found
```bash
Solution: Reinstall browsers
cd apps/frontend
pnpm exec playwright install --with-deps
```

### Deployment Issues

**Problem**: "kubectl: command not found"
```bash
Solution: Install kubectl in workflow
- uses: azure/setup-kubectl@v1
  with:
    version: 'v1.28.0'
```

**Problem**: Blue-green deployment stuck
```bash
Manually check deployment status:
kubectl get deployments -n exam-bank-blue
kubectl logs deployment/backend -n exam-bank-blue
```

---

## 📚 Best Practices

### 1. Commit Messages

Use conventional commit format:
```
feat(backend): add new gRPC endpoint
fix(frontend): resolve TypeScript errors
test(mobile): add unit tests for auth
ci(github): update workflow timeout
```

### 2. Pull Request Process

- [ ] All CI checks pass
- [ ] Code review approved
- [ ] Branch up to date with main
- [ ] No merge conflicts

### 3. Branch Naming

```
feature/description     # New features
bugfix/description      # Bug fixes
hotfix/description      # Production hotfixes
chore/description       # Maintenance
docs/description        # Documentation
refactor/description    # Code refactoring
test/description        # Test additions
```

### 4. Code Quality Standards

**Backend:**
- Minimum coverage: 75%
- No security vulnerabilities
- Code passes golangci-lint

**Frontend:**
- Minimum coverage: 70%
- No TypeScript errors
- E2E tests for critical flows
- Responsive design verified

**Mobile:**
- No Flutter analysis warnings
- All tests pass
- Works on Android 28+ and iOS 12+

### 5. Deployment Checklist

Before merging to main:
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Database migrations (if any)
- [ ] Breaking changes documented
- [ ] Performance impact assessed

### 6. Rollback Procedure

If production deployment fails:

```bash
# Automatic rollback (blue-green strategy)
# Manual rollback command:
kubectl rollout undo deployment/backend -n exam-bank-prod

# Check rollback status
kubectl rollout status deployment/backend -n exam-bank-prod
```

---

## 📊 Monitoring & Alerts

### View Workflow Results

1. Go to **Actions** tab
2. Select specific workflow
3. Click run to see details
4. Check job logs for issues

### Slack Notifications

Configured for:
- ✅ Staging deployment success
- ❌ Staging deployment failure
- ✅ Production deployment success  
- ⚠️ Production rollback
- 🔔 Manual approval needed

### Coverage Reports

- Codecov integration enabled
- Reports available on PR comments
- Historical trends tracked

---

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Official Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Go Testing](https://golang.org/pkg/testing/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Flutter Testing](https://flutter.dev/docs/testing)

---

## 📞 Support

For CI/CD issues:
1. Check the workflow logs in GitHub Actions
2. Review this guide's Troubleshooting section
3. Run local tests using provided scripts
4. Contact DevOps team with workflow run URL

**Last Updated**: 2025-01-20  
**Maintained By**: DevOps Team




