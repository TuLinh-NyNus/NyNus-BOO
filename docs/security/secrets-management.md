# Secrets Management Guide - NyNus System
**Version**: 1.0.0  
**Last Updated**: 2025-01-19

---

## 📋 Overview

This document outlines the secrets management strategy for NyNus Exam Bank System across different environments.

---

## 🔐 Security Principles

1. **Never commit secrets to Git**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly**
4. **Use strong, randomly generated secrets**
5. **Limit access to production secrets**

---

## 🛠️ Development Environment

### Setup

1. **Copy example file**:
```bash
cp .env.example .env.local
```

2. **Generate strong secrets**:
```bash
# Generate NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 64

# Generate JWT_ACCESS_SECRET
openssl rand -base64 64

# Generate JWT_REFRESH_SECRET
openssl rand -base64 64
```

3. **Update `.env.local`** with generated secrets

4. **Verify gitignore**:
```bash
# .env.local should be in .gitignore
cat .gitignore | grep ".env.local"
```

### Development Secrets Checklist

- [ ] `.env.local` created from `.env.example`
- [ ] All secrets replaced with strong random values
- [ ] `.env.local` added to `.gitignore`
- [ ] No secrets committed to Git
- [ ] Google OAuth credentials configured (if using OAuth)

---

## 🏭 Production Environment

### Option 1: Environment Variables (Recommended for Docker/K8s)

**Docker Compose**:
```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
```

**Set via shell**:
```bash
export DB_PASSWORD="$(openssl rand -base64 32)"
export JWT_SECRET="$(openssl rand -base64 64)"
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

### Option 2: AWS Secrets Manager (Recommended for AWS)

**1. Create secrets**:
```bash
# Database credentials
aws secretsmanager create-secret \
  --name nynus/database/credentials \
  --secret-string '{
    "username":"exam_bank_user",
    "password":"STRONG_RANDOM_PASSWORD",
    "host":"postgres-prod.nynus.edu.vn",
    "port":"5432",
    "database":"exam_bank_db"
  }'

# JWT secrets
aws secretsmanager create-secret \
  --name nynus/jwt/secrets \
  --secret-string '{
    "secret":"STRONG_JWT_SECRET",
    "access_secret":"STRONG_ACCESS_SECRET",
    "refresh_secret":"STRONG_REFRESH_SECRET"
  }'

# NextAuth secret
aws secretsmanager create-secret \
  --name nynus/nextauth/secret \
  --secret-string "STRONG_NEXTAUTH_SECRET"
```

**2. Load secrets in application**:
```go
// apps/backend/internal/config/secrets.go
package config

import (
    "encoding/json"
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/secretsmanager"
)

type DatabaseSecrets struct {
    Username string `json:"username"`
    Password string `json:"password"`
    Host     string `json:"host"`
    Port     string `json:"port"`
    Database string `json:"database"`
}

func LoadDatabaseSecrets() (*DatabaseSecrets, error) {
    sess := session.Must(session.NewSession())
    svc := secretsmanager.New(sess)
    
    input := &secretsmanager.GetSecretValueInput{
        SecretId: aws.String("nynus/database/credentials"),
    }
    
    result, err := svc.GetSecretValue(input)
    if err != nil {
        return nil, err
    }
    
    var secrets DatabaseSecrets
    err = json.Unmarshal([]byte(*result.SecretString), &secrets)
    return &secrets, err
}
```

---

### Option 3: HashiCorp Vault (Recommended for Multi-Cloud)

**1. Setup Vault**:
```bash
# Start Vault server
vault server -dev

# Set Vault address
export VAULT_ADDR='http://127.0.0.1:8200'

# Login
vault login <root-token>
```

**2. Store secrets**:
```bash
# Database credentials
vault kv put secret/nynus/database \
  username=exam_bank_user \
  password=STRONG_PASSWORD \
  host=postgres-prod.nynus.edu.vn \
  port=5432 \
  database=exam_bank_db

# JWT secrets
vault kv put secret/nynus/jwt \
  secret=STRONG_JWT_SECRET \
  access_secret=STRONG_ACCESS_SECRET \
  refresh_secret=STRONG_REFRESH_SECRET

# NextAuth secret
vault kv put secret/nynus/nextauth \
  secret=STRONG_NEXTAUTH_SECRET
```

**3. Load secrets in application**:
```go
// apps/backend/internal/config/vault.go
package config

import (
    vault "github.com/hashicorp/vault/api"
)

func LoadSecretsFromVault() (*Config, error) {
    client, err := vault.NewClient(vault.DefaultConfig())
    if err != nil {
        return nil, err
    }
    
    // Read database secrets
    dbSecret, err := client.Logical().Read("secret/data/nynus/database")
    if err != nil {
        return nil, err
    }
    
    data := dbSecret.Data["data"].(map[string]interface{})
    
    return &Config{
        Database: DatabaseConfig{
            Host:     data["host"].(string),
            Port:     data["port"].(string),
            User:     data["username"].(string),
            Password: data["password"].(string),
            Name:     data["database"].(string),
        },
    }, nil
}
```

---

## 🔄 Secrets Rotation

### Rotation Schedule

| Secret Type | Rotation Frequency | Priority |
|-------------|-------------------|----------|
| Database Password | Every 90 days | High |
| JWT Secrets | Every 180 days | High |
| NextAuth Secret | Every 180 days | High |
| OAuth Secrets | When compromised | Critical |
| API Keys | Every 90 days | Medium |

### Rotation Process

1. **Generate new secret**:
```bash
NEW_SECRET=$(openssl rand -base64 64)
```

2. **Update in secrets manager**:
```bash
# AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id nynus/jwt/secrets \
  --secret-string "{\"secret\":\"$NEW_SECRET\"}"

# HashiCorp Vault
vault kv put secret/nynus/jwt secret=$NEW_SECRET
```

3. **Deploy new secret**:
```bash
# Restart services to pick up new secret
kubectl rollout restart deployment/nynus-backend
```

4. **Verify**:
```bash
# Test authentication with new secret
curl -X POST http://api.nynus.edu.vn/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## ✅ Security Checklist

### Development
- [ ] `.env.local` created and configured
- [ ] Strong secrets generated (32+ characters)
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in Git history
- [ ] Team members have their own `.env.local`

### Production
- [ ] Secrets stored in secrets manager (AWS/Vault)
- [ ] Different secrets for each environment
- [ ] Secrets rotation schedule defined
- [ ] Access to secrets limited (IAM/RBAC)
- [ ] Secrets encrypted at rest
- [ ] Audit logging enabled
- [ ] Backup secrets stored securely

### CI/CD
- [ ] Secrets injected via environment variables
- [ ] No secrets in CI/CD logs
- [ ] Secrets masked in output
- [ ] Temporary secrets cleaned up after use

---

## 🚨 Emergency Procedures

### If Secrets Are Compromised

1. **Immediate Actions**:
   - Rotate all affected secrets immediately
   - Revoke compromised credentials
   - Review access logs for unauthorized access
   - Notify security team

2. **Investigation**:
   - Identify how secrets were exposed
   - Check Git history for committed secrets
   - Review CI/CD logs
   - Audit access logs

3. **Remediation**:
   - Remove secrets from Git history (if committed)
   - Update all affected systems
   - Implement additional security measures
   - Document incident and lessons learned

### Remove Secrets from Git History

```bash
# Using BFG Repo-Cleaner (recommended)
bfg --replace-text passwords.txt

# Using git filter-branch (alternative)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - coordinate with team)
git push origin --force --all
```

---

## 📚 References

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [HashiCorp Vault Documentation](https://www.vaultproject.io/docs)
- [12-Factor App: Config](https://12factor.net/config)

---

**Document Version**: 1.0.0  
**Maintained by**: NyNus Security Team  
**Next Review**: 2025-04-19

