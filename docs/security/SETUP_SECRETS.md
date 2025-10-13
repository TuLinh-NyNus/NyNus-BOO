# Quick Setup Guide - Secrets Management
**For Developers**: How to setup secrets for local development

---

## 🚀 Quick Start (5 minutes)

### Step 1: Copy Example File

```bash
# From workspace root
cp .env.example .env.local
```

### Step 2: Generate Strong Secrets

**On Linux/Mac**:
```bash
# Generate all secrets at once
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env.local
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 64)" >> .env.local
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64)" >> .env.local
```

**On Windows (PowerShell)**:
```powershell
# Generate NEXTAUTH_SECRET
$nextAuthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Add-Content -Path .env.local -Value "NEXTAUTH_SECRET=$nextAuthSecret"

# Generate JWT_SECRET
$jwtSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Add-Content -Path .env.local -Value "JWT_SECRET=$jwtSecret"

# Generate JWT_ACCESS_SECRET
$jwtAccessSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Add-Content -Path .env.local -Value "JWT_ACCESS_SECRET=$jwtAccessSecret"

# Generate JWT_REFRESH_SECRET
$jwtRefreshSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Add-Content -Path .env.local -Value "JWT_REFRESH_SECRET=$jwtRefreshSecret"
```

### Step 3: Update Database Password

Edit `.env.local` and replace:
```bash
# Change this:
DB_PASSWORD=CHANGE_ME_IN_ENV_LOCAL
POSTGRES_PASSWORD=CHANGE_ME_IN_ENV_LOCAL

# To something strong (or keep default for development):
DB_PASSWORD=exam_bank_password_dev_$(openssl rand -hex 8)
POSTGRES_PASSWORD=exam_bank_password_dev_$(openssl rand -hex 8)
```

### Step 4: Update Redis Password (Optional)

```bash
# Change this:
REDIS_PASSWORD=CHANGE_ME_IN_ENV_LOCAL

# To:
REDIS_PASSWORD=redis_password_dev_$(openssl rand -hex 8)
```

### Step 5: Verify Setup

```bash
# Check that .env.local exists and has secrets
cat .env.local | grep "SECRET"

# Should show:
# NEXTAUTH_SECRET=<random-base64-string>
# JWT_SECRET=<random-base64-string>
# JWT_ACCESS_SECRET=<random-base64-string>
# JWT_REFRESH_SECRET=<random-base64-string>
```

---

## ✅ Verification Checklist

- [ ] `.env.local` file created
- [ ] `NEXTAUTH_SECRET` is 32+ characters
- [ ] `JWT_SECRET` is 64+ characters
- [ ] `JWT_ACCESS_SECRET` is 64+ characters
- [ ] `JWT_REFRESH_SECRET` is 64+ characters
- [ ] Database passwords updated
- [ ] Redis password updated (if using Redis)
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets committed to Git

---

## 🔒 Google OAuth Setup (Optional)

If you want to use Google OAuth for login:

1. **Go to Google Cloud Console**:
   - https://console.cloud.google.com/

2. **Create OAuth 2.0 Credentials**:
   - APIs & Services > Credentials
   - Create OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

3. **Update `.env.local`**:
```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

See `docs/setup/GOOGLE_OAUTH_SETUP_GUIDE.md` for detailed instructions.

---

## 🚨 Common Issues

### Issue 1: "NEXTAUTH_SECRET must be at least 32 characters"

**Solution**: Generate a longer secret
```bash
openssl rand -base64 48
```

### Issue 2: "Database connection failed"

**Solution**: Make sure database password in `.env.local` matches Docker compose
```bash
# Check Docker compose password
cat docker/compose/.env | grep POSTGRES_PASSWORD

# Update .env.local to match
```

### Issue 3: ".env.local not found"

**Solution**: Create from example
```bash
cp .env.example .env.local
```

---

## 📚 Additional Resources

- [Full Secrets Management Guide](./secrets-management.md)
- [Google OAuth Setup Guide](../setup/GOOGLE_OAUTH_SETUP_GUIDE.md)
- [Production Deployment Guide](../deployment/production-deployment-guide.md)

---

## 🆘 Need Help?

1. Check [secrets-management.md](./secrets-management.md) for detailed documentation
2. Ask in team chat
3. Create an issue in the repository

---

**Quick Setup Time**: ~5 minutes  
**Difficulty**: Easy  
**Prerequisites**: None (just copy-paste commands)

