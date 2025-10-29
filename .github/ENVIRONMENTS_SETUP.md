# GitHub Environments Setup Guide

## 🌍 Overview

This guide helps you set up GitHub Environments for managing secrets and deployment approvals across different stages.

**Environments to Create:**
- development
- staging
- production-approval
- production

**Setup Time:** 10 minutes

---

## 📋 Environment Structure

```
Repository Secrets (Global)
├── GITHUB_TOKEN
├── SLACK_WEBHOOK_STAGING
├── SLACK_WEBHOOK_PROD
├── CODECOV_TOKEN
└── SNYK_TOKEN

Environments
├── development
│   ├── Approval: None (auto-deploy)
│   └── Secrets: DEV_HOST, DEPLOY_SSH_KEY, etc.
├── staging
│   ├── Approval: None (auto-deploy)
│   └── Secrets: AWS credentials, K8s config, URLs
├── production-approval
│   ├── Approval: 1 reviewer (gatekeeping)
│   └── Secrets: Pre-deployment check credentials
└── production
    ├── Approval: 2+ reviewers (protected)
    └── Secrets: AWS credentials, K8s config, monitoring keys
```

---

## 🔧 Step 1: Create Development Environment

### Navigate to Environment Settings

```
GitHub Repository > Settings > Environments > New environment
```

### Create Environment: "development"

```
Name: development
Description: Development environment for continuous testing
```

### Configure Protection Rules

```
☐ Required reviewers
   └─ Leave empty (auto-deploy on develop branch)
   
☑️ Deployment branches and environments
   └─ Only allow deployments from specific branches
   └─ Include deployment environments: develop

☐ Prevent self-review (not needed for dev)

☐ Allow administrators to bypass required protection rules
```

### Add Environment Secrets

Navigate to **Environment secrets** and add:

```
Secrets:
1. DEV_HOST
   Value: dev.example.com
   
2. DEV_SSH_USER
   Value: ubuntu
   
3. DEPLOY_SSH_KEY
   Value: <base64 encoded SSH key>
   
4. DOCKER_REGISTRY_URL
   Value: ghcr.io
   
5. DOCKER_REGISTRY_USERNAME
   Value: <github_username>
```

### Create Environment

Click **"Save protection rules"**

---

## 🎯 Step 2: Create Staging Environment

### Create Environment: "staging"

```
Name: staging
Description: Staging environment for pre-production testing
```

### Configure Protection Rules

```
☐ Required reviewers
   └─ Leave empty (auto-deploy on main branch)
   
☑️ Deployment branches and environments
   └─ Only allow deployments from specific branches
   └─ Include deployment environments: main

☐ Prevent self-review

☑️ Allow administrators to bypass required protection rules
   └─ For emergency hotfixes
```

### Add Environment Secrets

Navigate to **Environment secrets** and add:

```
Infrastructure Secrets:
1. AWS_ACCESS_KEY_ID
   Value: <staging AWS access key>
   
2. AWS_SECRET_ACCESS_KEY
   Value: <staging AWS secret key>
   
3. AWS_REGION
   Value: us-east-1

Kubernetes Secrets:
4. KUBE_CONFIG_STAGING
   Value: <base64 encoded kubeconfig>

Deployment URLs:
5. STAGING_HOST
   Value: staging.example.com
   
6. STAGING_URL
   Value: https://staging.example.com
   
7. STAGING_API_URL
   Value: https://api-staging.example.com

Deployment Method:
8. DEPLOY_METHOD
   Value: kubernetes  # or docker-compose
```

### Create Environment

Click **"Save protection rules"**

---

## 🔐 Step 3: Create Production-Approval Environment

This environment acts as a gatekeeper before production deployment.

### Create Environment: "production-approval"

```
Name: production-approval
Description: Pre-deployment approval and checks for production
```

### Configure Protection Rules

```
☑️ Required reviewers
   └─ Minimum reviewers: 1
   └─ Reviewers list:
       • @devops-lead (can be a GitHub team)
   
☑️ Deployment branches and environments
   └─ Only allow deployments from specific branches
   └─ Include deployment environments: main, release/*

☐ Prevent self-review

☑️ Allow administrators to bypass required protection rules
   └─ Only for critical emergencies
```

### Add Environment Secrets

```
Pre-deployment Check Secrets:
1. DOCKER_REGISTRY_TOKEN
   Value: <GitHub token for pulling images>
   
2. DEPLOYMENT_CHECKER_KEY
   Value: <key for pre-deployment validation>
```

### Create Environment

Click **"Save protection rules"**

---

## 🚀 Step 4: Create Production Environment

### Create Environment: "production"

```
Name: production
Description: Production environment - requires strict approval
```

### Configure Protection Rules (CRITICAL)

```
☑️ Required reviewers
   └─ Minimum reviewers: 2
   └─ Reviewers list:
       • @devops-lead
       • @backend-lead
   └─ Dismiss stale deployment reviews: checked
   └─ Require new approvals for new commits: checked
   
☑️ Deployment branches and environments
   └─ Only allow deployments from specific branches
   └─ Include deployment environments: main, release/*

☐ Prevent self-review (allow team leads to approve own)

☑️ Allow administrators to bypass required protection rules
   └─ Only for absolutely critical emergency hotfixes
   └─ Log all bypass usage
```

### Add Environment Secrets

Navigate to **Environment secrets** and add:

```
Infrastructure:
1. AWS_ACCESS_KEY_ID
   Value: <production AWS access key>
   
2. AWS_SECRET_ACCESS_KEY
   Value: <production AWS secret key>
   
3. AWS_REGION
   Value: us-east-1

Kubernetes:
4. KUBE_CONFIG_PROD
   Value: <base64 encoded kubeconfig>

Deployment URLs:
5. PROD_URL
   Value: https://nynus.edu.vn
   
6. PROD_API_URL
   Value: https://api.nynus.edu.vn

Monitoring & Error Tracking:
7. SENTRY_DSN
   Value: <from sentry.io>
   
8. DATADOG_API_KEY
   Value: <from datadog>

Database:
9. PROD_DB_HOST
   Value: prod-db.example.com
   
10. PROD_DB_PASSWORD
    Value: <strong password>

Security:
11. JWT_SECRET_PROD
    Value: <long random string from openssl rand -hex 32>
```

### Create Environment

Click **"Save protection rules"**

---

## 📊 Environment Configuration Matrix

| Setting | Development | Staging | Production-Approval | Production |
|---------|-------------|---------|-------------------|-----------|
| **Approval Required** | No | No | 1 reviewer | 2+ reviewers |
| **Reviewers List** | - | - | @devops-lead | @devops-lead, @backend-lead |
| **Allowed Branches** | develop | main | main, release/* | main, release/* |
| **Stale Review Dismiss** | No | No | Yes | Yes |
| **Admin Bypass** | Yes | Yes | Yes | Yes (emergency only) |
| **Self-Review** | Allowed | Allowed | Allowed | Allowed (team leads) |

---

## ✅ Verification Checklist

### Development Environment

```
☐ Environment created: development
☐ No approval required
☐ Deploys from: develop branch
☐ Secrets added:
   ☐ DEV_HOST
   ☐ DEV_SSH_USER
   ☐ DEPLOY_SSH_KEY
   ☐ DOCKER_REGISTRY_URL
   ☐ DOCKER_REGISTRY_USERNAME
```

### Staging Environment

```
☐ Environment created: staging
☐ No approval required
☐ Deploys from: main branch
☐ Secrets added:
   ☐ AWS_ACCESS_KEY_ID
   ☐ AWS_SECRET_ACCESS_KEY
   ☐ AWS_REGION
   ☐ KUBE_CONFIG_STAGING
   ☐ STAGING_HOST
   ☐ STAGING_URL
   ☐ STAGING_API_URL
   ☐ DEPLOY_METHOD
```

### Production-Approval Environment

```
☐ Environment created: production-approval
☐ Required reviewers: 1
☐ Reviewer: @devops-lead
☐ Deploys from: main, release/* branches
☐ Secrets added:
   ☐ DOCKER_REGISTRY_TOKEN
   ☐ DEPLOYMENT_CHECKER_KEY
```

### Production Environment

```
☐ Environment created: production
☐ Required reviewers: 2+
☐ Reviewers: @devops-lead, @backend-lead
☐ Deploys from: main, release/* branches
☐ Stale reviews dismissed: Yes
☐ Secrets added:
   ☐ AWS_ACCESS_KEY_ID
   ☐ AWS_SECRET_ACCESS_KEY
   ☐ AWS_REGION
   ☐ KUBE_CONFIG_PROD
   ☐ PROD_URL
   ☐ PROD_API_URL
   ☐ SENTRY_DSN
   ☐ DATADOG_API_KEY
   ☐ PROD_DB_HOST
   ☐ PROD_DB_PASSWORD
   ☐ JWT_SECRET_PROD
```

---

## 🧪 Testing Environments

### Test 1: Verify Secret Access

```bash
# Create test workflow to verify secrets
name: Test Environment Secrets
on: workflow_dispatch
jobs:
  test:
    runs-on: ubuntu-latest
    environment: staging  # Change to test different environments
    steps:
      - name: Check secrets
        run: |
          if [ -z "${{ secrets.STAGING_URL }}" ]; then
            echo "❌ STAGING_URL not found"
            exit 1
          fi
          echo "✅ Secrets accessible in staging environment"
```

### Test 2: Verify Approval Flow

```bash
# 1. Create PR to main
git checkout -b feature/test
echo "test" >> README.md
git add README.md
git commit -m "feat: test approval flow"
git push origin feature/test

# 2. Create PR and merge to main
# 3. Watch deployment workflows:
#    - Check staging deploys automatically
#    - Check production requires approval
```

### Test 3: Verify Branch Restrictions

```bash
# Try deploying from wrong branch (should fail)
git checkout feature/test

# Try to manually trigger production deployment
# Expected: Error - deployment not allowed from this branch
```

---

## 🔒 Security Best Practices for Environments

### 1. Principle of Least Privilege

```
Development:
✅ Broad permissions
✅ Anyone can deploy

Staging:
✅ Moderate permissions
✅ Auto-deploy from main

Production-Approval:
✅ Restricted permissions
✅ 1 reviewer approval

Production:
✅ Highly restricted
✅ 2+ reviewer approval
✅ Only from release branches
```

### 2. Secret Rotation Schedule

```
Development:
- SSH Keys: Every 6 months
- Credentials: When rotated

Staging:
- AWS Credentials: Every 90 days
- Kubeconfig: Every 6 months

Production:
- AWS Credentials: Every 60 days
- Kubeconfig: Every 3 months
- Database Passwords: Every 90 days
- JWT Secrets: Every 30 days
```

### 3. Access Audit

```yaml
# Monthly audit checklist
- Who has access to each environment?
- Which secrets were used this month?
- Any failed authentication attempts?
- Review GitHub audit log
- Check IAM user activity (if AWS)
```

---

## 🚨 Troubleshooting

### Issue: "Environment secret not found"

**Solution:**
1. Verify secret name matches exactly in workflow
2. Check secret is in correct environment
3. Verify workflow uses correct environment:
   ```yaml
   jobs:
     deploy:
       environment: production  # Must match environment name
   ```

### Issue: "Approval required but not showing"

**Solution:**
1. Verify required reviewers configured
2. Check deployment branch matches allowed branches
3. Verify GitHub teams exist and are configured

### Issue: "Cannot access production environment"

**Solution:**
1. Verify you're in the reviewer list
2. Check branch protection rules don't conflict
3. Verify minimum reviewer count is met

### Issue: "Workflow stuck waiting for approval"

**Solution:**
1. Go to Actions > [workflow run] > Review pending deployments
2. Click "Approve and deploy"
3. Add review comment if required
4. Click "Approve"

---

## 📈 Environment Workflow

### Development Deploy Flow

```
Push to develop
    ↓
GitHub Actions triggered
    ↓
Run CI (lint, test, build)
    ↓
Auto-deploy to development
    ↓
Run smoke tests
    ↓
✅ Done
```

### Staging Deploy Flow

```
PR created and merged to main
    ↓
GitHub Actions triggered
    ↓
Run full CI (all tests, security)
    ↓
Auto-deploy to staging
    ↓
Run comprehensive tests
    ↓
Send Slack notification
    ↓
✅ Done
```

### Production Deploy Flow

```
Manually trigger deployment
    ↓
Pre-deployment checks
    ↓
⏳ Await 1 approval (production-approval env)
    ↓
Pre-deployment verified
    ↓
⏳ Await 2+ approvals (production env)
    ↓
Approvals received
    ↓
Deploy (blue-green strategy)
    ↓
Health checks
    ↓
Traffic switch
    ↓
✅ Deployment complete
```

---

## 📚 Reference

### GitHub Environment Variables

Each environment automatically provides:

```
GITHUB_ENVIRONMENT: Name of environment
GITHUB_ENVIRONMENT_URL: URL set in environment (if configured)
GITHUB_ACTION_REF: Reference of the action
GITHUB_ACTION_REPOSITORY: Repository of the action
GITHUB_ACTIONS: Always true in Actions
```

### Access Environment Configuration

```yaml
# In workflow
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com  # Shows "View deployment" button
    steps:
      - name: Deploy
        run: echo "Deploying to ${{ github.environment }}"
```

### Link Deployments to URLs

```yaml
environment:
  name: production
  url: https://nynus.edu.vn
```

This automatically:
- Shows deployment in GitHub UI
- Links to live environment
- Tracks deployment history per URL
- Sends webhook to environment URL

---

## 🔗 Related Documentation

- [GitHub Environments Docs](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Environment Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)
- [Required Reviewers](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-deployment-branches-and-environments#required-reviewers)
- [Deployment Branches](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-deployment-branches-and-environments)

---

**Last Updated:** 2025-01-20  
**Maintained By:** DevOps Team




