# GitHub Secrets Setup Guide

## 🔐 Overview

This guide helps you configure all required secrets for the exam-bank-system CI/CD pipeline.

**Total Secrets to Configure: 25+**
**Time Estimate: 15-20 minutes**

## 📋 Table of Contents

1. [Repository Secrets (Global)](#repository-secrets)
2. [Development Environment Secrets](#development-secrets)
3. [Staging Environment Secrets](#staging-secrets)
4. [Production Environment Secrets](#production-secrets)
5. [Validation Checklist](#validation-checklist)

---

## 🏪 Repository Secrets (Global)

These secrets are available to all environments and workflows.

### Access Location
**Settings > Secrets and variables > Actions > Repository secrets**

### 1. Container Registry Token

```
Name: GITHUB_TOKEN
Value: <auto-provided by GitHub>
Description: GitHub token for container registry access
Visibility: Repository secret
```

**Note:** This is automatically provided by GitHub Actions. No need to create manually.

### 2. Slack Webhook URLs

```
Name: SLACK_WEBHOOK_STAGING
Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Description: Slack webhook for staging deployment notifications
Visibility: Repository secret
```

**How to get:**
1. Go to your Slack workspace
2. Install "Incoming Webhooks" app
3. Create new webhook
4. Copy webhook URL

Repeat for production:

```
Name: SLACK_WEBHOOK_PROD
Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Description: Slack webhook for production deployment notifications
```

### 3. Code Coverage Token

```
Name: CODECOV_TOKEN
Value: <from codecov.io>
Description: Codecov token for uploading coverage reports
Visibility: Repository secret
```

**How to get:**
1. Go to [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Select your repository
4. Go to Settings > Repository Token
5. Copy the token

### 4. Security Scanning Token

```
Name: SNYK_TOKEN
Value: <from snyk.io>
Description: Snyk token for vulnerability scanning
Visibility: Repository secret
```

**How to get:**
1. Go to [snyk.io](https://snyk.io)
2. Sign up/Sign in
3. Go to Account Settings > Auth Token
4. Copy the token

---

## 🔧 Development Environment Secrets

These secrets are for development environment deployments.

### Access Location
**Settings > Environments > development > Environment secrets**

### 1. SSH Deployment Key

```
Name: DEPLOY_SSH_KEY
Value: <base64 encoded private key>
Description: SSH private key for deploying to dev server
Visibility: Environment secret
```

**How to generate:**

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_dev -C "exam-bank-dev"

# Encode for GitHub secret
cat ~/.ssh/id_ed25519_dev | base64 -w 0 > /tmp/ssh_key_b64.txt

# Copy output to GitHub secret
```

### 2. Development Server Details

```
Name: DEV_HOST
Value: dev.example.com
Description: Development server hostname/IP
Visibility: Environment secret
```

```
Name: DEV_SSH_USER
Value: ubuntu
Description: SSH username for dev server
Visibility: Environment secret
```

### 3. Docker Registry (Optional)

```
Name: DOCKER_REGISTRY_URL
Value: ghcr.io
Description: Container registry URL
Visibility: Environment secret
```

```
Name: DOCKER_REGISTRY_USERNAME
Value: <github_username>
Description: Container registry username
Visibility: Environment secret
```

---

## 🎯 Staging Environment Secrets

These secrets are for staging environment deployments.

### Access Location
**Settings > Environments > staging > Environment secrets**

### 1. AWS Credentials (if using AWS)

```
Name: AWS_ACCESS_KEY_ID
Value: <your_aws_access_key>
Description: AWS access key for staging deployment
Visibility: Environment secret
```

```
Name: AWS_SECRET_ACCESS_KEY
Value: <your_aws_secret_key>
Description: AWS secret key for staging deployment
Visibility: Environment secret
Sensitive: ✓ Checked
```

```
Name: AWS_REGION
Value: us-east-1
Description: AWS region for staging
Visibility: Environment secret
```

**How to get AWS credentials:**
1. Go to AWS Console
2. IAM > Users > Create User
3. Attach policy: `AmazonEC2FullAccess`, `AmazonECSTaskExecutionRolePolicy`
4. Create access key
5. Copy Access Key ID and Secret Access Key

### 2. Kubernetes Config (if using K8s)

```
Name: KUBE_CONFIG_STAGING
Value: <base64 encoded kubeconfig>
Description: Kubernetes config for staging deployment
Visibility: Environment secret
Sensitive: ✓ Checked
```

**How to encode kubeconfig:**

```bash
# Assuming your kubeconfig is at ~/.kube/config-staging
cat ~/.kube/config-staging | base64 -w 0 > /tmp/kubeconfig_b64.txt

# Copy output to GitHub secret
cat /tmp/kubeconfig_b64.txt
```

### 3. Staging URLs

```
Name: STAGING_HOST
Value: staging.example.com
Description: Staging server hostname
Visibility: Environment secret
```

```
Name: STAGING_URL
Value: https://staging.example.com
Description: Staging application URL
Visibility: Environment secret
```

```
Name: STAGING_API_URL
Value: https://api-staging.example.com
Description: Staging API URL
Visibility: Environment secret
```

### 4. Deployment Method

```
Name: DEPLOY_METHOD
Value: kubernetes
Description: Deployment method (docker-compose or kubernetes)
Visibility: Environment secret
```

### 5. SSH Key for Docker Compose (if using)

```
Name: DEPLOY_SSH_KEY
Value: <base64 encoded private key>
Description: SSH key for staging deployment via docker-compose
Visibility: Environment secret
Sensitive: ✓ Checked
```

---

## 🚀 Production Environment Secrets

These secrets are for production environment deployments.

### Access Location
**Settings > Environments > production > Environment secrets**

**⚠️ CRITICAL**: Enable environment protection rules:
- ✓ Required reviewers (minimum 2)
- ✓ Dismiss stale deployment reviews

### 1. AWS Credentials

```
Name: AWS_ACCESS_KEY_ID
Value: <production_aws_access_key>
Description: AWS access key for production
Visibility: Environment secret
```

```
Name: AWS_SECRET_ACCESS_KEY
Value: <production_aws_secret_key>
Description: AWS secret key for production
Visibility: Environment secret
Sensitive: ✓ Checked
```

```
Name: AWS_REGION
Value: us-east-1
Description: AWS region for production
Visibility: Environment secret
```

### 2. Kubernetes Config

```
Name: KUBE_CONFIG_PROD
Value: <base64 encoded kubeconfig>
Description: Kubernetes config for production
Visibility: Environment secret
Sensitive: ✓ Checked
```

### 3. Production URLs

```
Name: PROD_URL
Value: https://nynus.edu.vn
Description: Production application URL
Visibility: Environment secret
```

```
Name: PROD_API_URL
Value: https://api.nynus.edu.vn
Description: Production API URL
Visibility: Environment secret
```

### 4. Monitoring & Error Tracking

```
Name: SENTRY_DSN
Value: https://xxxxx@sentry.io/xxxxx
Description: Sentry DSN for error tracking
Visibility: Environment secret
```

**How to get Sentry DSN:**
1. Go to [sentry.io](https://sentry.io)
2. Create new project
3. Select platform (Go, React, Flutter)
4. Copy DSN

```
Name: DATADOG_API_KEY
Value: <your_datadog_api_key>
Description: Datadog API key for monitoring
Visibility: Environment secret
Sensitive: ✓ Checked
```

### 5. Database Credentials

```
Name: PROD_DB_HOST
Value: prod-db.example.com
Description: Production database host
Visibility: Environment secret
```

```
Name: PROD_DB_PASSWORD
Value: <strong_password>
Description: Production database password
Visibility: Environment secret
Sensitive: ✓ Checked
```

### 6. Security Keys

```
Name: JWT_SECRET_PROD
Value: <long_random_string>
Description: JWT secret key for production
Visibility: Environment secret
Sensitive: ✓ Checked
```

**Generate strong JWT secret:**

```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

---

## 🔍 Validation Checklist

### Before Deployment

Use this checklist to verify all secrets are configured correctly:

```bash
# 1. Check Repository Secrets (all workflows see these)
☐ GITHUB_TOKEN - Auto-provided
☐ SLACK_WEBHOOK_STAGING - Valid webhook URL
☐ SLACK_WEBHOOK_PROD - Valid webhook URL
☐ CODECOV_TOKEN - Valid codecov token
☐ SNYK_TOKEN - Valid snyk token

# 2. Check Development Environment
☐ DEV_HOST - Correct hostname
☐ DEV_SSH_USER - Correct username
☐ DEPLOY_SSH_KEY - Valid base64 encoded key

# 3. Check Staging Environment
☐ AWS_ACCESS_KEY_ID - Valid AWS credentials
☐ AWS_SECRET_ACCESS_KEY - Valid AWS credentials
☐ AWS_REGION - Correct region
☐ KUBE_CONFIG_STAGING - Valid kubeconfig
☐ STAGING_URL - Correct URL
☐ STAGING_API_URL - Correct API URL
☐ DEPLOY_METHOD - "kubernetes" or "docker-compose"

# 4. Check Production Environment
☐ AWS_ACCESS_KEY_ID - Valid AWS credentials
☐ AWS_SECRET_ACCESS_KEY - Valid AWS credentials
☐ KUBE_CONFIG_PROD - Valid kubeconfig
☐ PROD_URL - Correct production URL
☐ PROD_API_URL - Correct API URL
☐ SENTRY_DSN - Valid Sentry DSN
☐ DATADOG_API_KEY - Valid Datadog API key
☐ JWT_SECRET_PROD - Strong secret key
```

### Test Secret Access

```bash
# Run a test workflow to verify secrets are accessible
git checkout -b test/secrets-validation
git push origin test/secrets-validation

# Check GitHub Actions tab for workflow execution
# Verify no "secret not found" errors
```

---

## 🔒 Security Best Practices

### 1. Secret Rotation

Review and rotate secrets quarterly:

```
Production Secrets Rotation Schedule:
- AWS Credentials: Every 90 days
- JWT Secrets: Every 60 days
- SSH Keys: Every 6 months
- Database Passwords: Every 90 days
```

### 2. Principle of Least Privilege

When creating AWS IAM users for CI/CD:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:GetInstanceUserData"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": "arn:aws:ecr:*:*:repository/exam-bank-*"
    }
  ]
}
```

### 3. Secret Audit Trail

- All secret access is logged in GitHub
- Review logs monthly
- Alert on unusual access patterns

### 4. Do's and Don'ts

✅ DO:
- Use strong, random secrets
- Rotate secrets regularly
- Use environment-specific secrets
- Protect secret variables with sensitive flag
- Use branch protection for production

❌ DON'T:
- Commit secrets to repository
- Use weak or predictable secrets
- Share secrets in Slack/email
- Use same secret for multiple environments
- Store secrets in plain text

---

## 🧪 Testing Secret Configuration

### Test 1: Verify Secret Access in Workflow

Create a test workflow:

```yaml
name: Test Secrets
on:
  workflow_dispatch:
jobs:
  test:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Test secret access
        run: |
          if [ -z "${{ secrets.STAGING_URL }}" ]; then
            echo "❌ STAGING_URL not found"
            exit 1
          fi
          echo "✅ Secrets accessible"
```

### Test 2: Validate Credentials

```bash
# Test AWS credentials
aws sts get-caller-identity --region us-east-1

# Test Kubernetes config
kubectl cluster-info --kubeconfig <(echo $KUBE_CONFIG_STAGING | base64 -d)

# Test SSH key
ssh -i <ssh_key> ubuntu@$DEV_HOST "echo OK"
```

---

## 📞 Troubleshooting

### Issue: "Secret not found" error

**Solution:**
1. Verify secret name exactly matches in workflow
2. Check secret is in correct environment
3. Ensure workflow runs in correct environment

### Issue: "Access denied" with AWS credentials

**Solution:**
1. Verify IAM user has correct permissions
2. Check AWS region is correct
3. Verify credentials haven't expired

### Issue: SSH key authentication fails

**Solution:**
1. Verify public key is on server at ~/.ssh/authorized_keys
2. Check SSH key permissions: `chmod 600`
3. Test locally: `ssh -i <key> user@host`

---

## 📚 Reference

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS IAM Best Practices](https://docs.aws.org/IAM/latest/UserGuide/best-practices.html)
- [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)

---

**Last Updated:** 2025-01-20  
**Maintained By:** DevOps Team

