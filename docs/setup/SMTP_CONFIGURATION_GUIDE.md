# 📧 SMTP Configuration Guide - NyNus System

## 📋 Tổng Quan

NyNus Email Service hỗ trợ:
- **Development Mode**: Log emails to console (không gửi thật)
- **Production Mode**: Gửi email qua SMTP server
- **Gmail SMTP**: Recommended cho production
- **Custom SMTP**: Hỗ trợ bất kỳ SMTP server nào

---

## 🔧 Environment Variables

### Required SMTP Settings
```bash
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com          # SMTP server hostname
SMTP_PORT=587                     # SMTP server port (587 for TLS, 465 for SSL)
SMTP_USERNAME=your-email@gmail.com # SMTP authentication username
SMTP_PASSWORD=your-app-password    # SMTP authentication password

# Email Settings
SMTP_FROM_EMAIL=noreply@nynus.edu.vn  # From email address
SMTP_FROM_NAME=NyNus System           # From display name

# Environment Mode
ENV=production                     # Set to 'production' to enable actual email sending
```

### Optional Settings
```bash
# Frontend URLs (for email links)
FRONTEND_URL=https://app.nynus.edu.vn    # Main app URL
ADMIN_URL=https://admin.nynus.edu.vn     # Admin dashboard URL
```

---

## 🚀 Setup Instructions

### 1. Gmail SMTP Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → Turn On

#### Step 2: Generate App Password
1. Go to Security → App passwords
2. Select app: Mail
3. Select device: Other (Custom name) → "NyNus System"
4. Copy the generated 16-character password

#### Step 3: Configure Environment Variables
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=abcd-efgh-ijkl-mnop  # 16-character app password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=NyNus System
ENV=production
```

### 2. Custom SMTP Server Setup

#### For Office 365/Outlook
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### For Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USERNAME=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

#### For Custom SMTP Server
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587                    # or 465 for SSL
SMTP_USERNAME=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
```

---

## 🧪 Testing SMTP Configuration

### 1. Development Mode Testing
```bash
# Set environment to development
ENV=development

# Start the backend
cd apps/backend
go run cmd/main.go

# Emails will be logged to console instead of sent
```

### 2. Production Mode Testing
```bash
# Set environment to production
ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Start the backend
cd apps/backend
go run cmd/main.go

# Test email verification
curl -X POST http://localhost:8080/v1/user/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user-id"}'
```

### 3. SMTP Connection Test Tool
Create a simple test tool:

```go
// File: apps/backend/cmd/test-smtp/main.go
package main

import (
    "log"
    "os"
    
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/services/email"
    "github.com/joho/godotenv"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found")
    }
    
    // Create email service
    emailService := email.NewEmailService()
    
    // Test email sending
    testEmail := os.Getenv("TEST_EMAIL")
    if testEmail == "" {
        testEmail = "test@example.com"
    }
    
    err := emailService.SendVerificationEmail(
        testEmail,
        "Test User",
        "test-token-123",
    )
    
    if err != nil {
        log.Fatalf("❌ SMTP Test Failed: %v", err)
    }
    
    log.Println("✅ SMTP Test Successful!")
}
```

Run the test:
```bash
cd apps/backend
TEST_EMAIL=your-test-email@gmail.com go run cmd/test-smtp/main.go
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "SMTP configuration not set"
**Cause**: Missing SMTP_HOST or SMTP_PORT environment variables
**Solution**: 
```bash
# Check environment variables
echo $SMTP_HOST
echo $SMTP_PORT

# Set missing variables
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
```

#### 2. "535 Authentication failed"
**Cause**: Invalid username/password or 2FA not enabled
**Solutions**:
- Enable 2-Factor Authentication on Gmail
- Generate new App Password
- Use App Password instead of regular password
- Check username is correct email address

#### 3. "Connection timeout"
**Cause**: Network issues or wrong SMTP server/port
**Solutions**:
```bash
# Test SMTP server connectivity
telnet smtp.gmail.com 587

# Try alternative ports
SMTP_PORT=465  # SSL
SMTP_PORT=25   # Plain (usually blocked)
```

#### 4. "TLS handshake failed"
**Cause**: SSL/TLS configuration issues
**Solutions**:
- Use port 587 for STARTTLS
- Use port 465 for SSL
- Check firewall settings

#### 5. "Email not received"
**Possible causes**:
- Email in spam folder
- Invalid recipient email
- SMTP server rate limiting
- DNS issues

**Debug steps**:
```bash
# Check logs for errors
tail -f /var/log/nynus/backend.log

# Verify email service is initialized
grep "Email service initialized" /var/log/nynus/backend.log

# Test with different email provider
TEST_EMAIL=test@yahoo.com go run cmd/test-smtp/main.go
```

---

## 📊 Monitoring & Logging

### Email Service Logs
```bash
# Development mode logs
📧 [DEV MODE] Email Verification:
  To: user@example.com
  Subject: Xác thực email của bạn - NyNus
  Verification URL: http://localhost:3000/verify-email?token=abc123
  Token: abc123

# Production mode logs
✅ Email sent successfully to user@example.com
❌ Failed to send email: smtp: 535 Authentication failed
```

### Monitoring Metrics
- Email send success rate
- SMTP connection failures
- Email delivery time
- Bounce rate (if available)

---

## 🔒 Security Best Practices

### 1. App Passwords
- ✅ Use App Passwords instead of regular passwords
- ✅ Generate unique App Password for NyNus
- ❌ Never use regular Gmail password

### 2. Environment Variables
- ✅ Store SMTP credentials in environment variables
- ✅ Use .env files for development
- ✅ Use secret management for production
- ❌ Never commit credentials to git

### 3. Email Security
- ✅ Use TLS/SSL encryption (port 587/465)
- ✅ Validate email addresses before sending
- ✅ Implement rate limiting
- ❌ Don't send sensitive data in emails

### 4. Production Deployment
```bash
# Use secret management
kubectl create secret generic smtp-credentials \
  --from-literal=username=your-email@gmail.com \
  --from-literal=password=your-app-password

# Reference in deployment
env:
  - name: SMTP_USERNAME
    valueFrom:
      secretKeyRef:
        name: smtp-credentials
        key: username
  - name: SMTP_PASSWORD
    valueFrom:
      secretKeyRef:
        name: smtp-credentials
        key: password
```

---

## 📝 Configuration Examples

### Development (.env)
```bash
# Development - emails logged to console
ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=dev@nynus.edu.vn
SMTP_PASSWORD=dev-app-password
SMTP_FROM_EMAIL=dev@nynus.edu.vn
SMTP_FROM_NAME=NyNus Dev System
FRONTEND_URL=http://localhost:3000
```

### Production (.env.production)
```bash
# Production - actual email sending
ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=${SMTP_USERNAME}
SMTP_PASSWORD=${SMTP_PASSWORD}
SMTP_FROM_EMAIL=noreply@nynus.edu.vn
SMTP_FROM_NAME=NyNus System
FRONTEND_URL=https://app.nynus.edu.vn
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    environment:
      - ENV=production
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM_EMAIL=noreply@nynus.edu.vn
      - SMTP_FROM_NAME=NyNus System
```

---

## ✅ Verification Checklist

### Pre-deployment
- [ ] SMTP credentials configured
- [ ] Environment variables set
- [ ] Test email sending works
- [ ] Email templates render correctly
- [ ] Links in emails work
- [ ] Spam folder checked

### Post-deployment
- [ ] Email verification flow works
- [ ] Password reset emails sent
- [ ] Email logs show success
- [ ] No SMTP errors in logs
- [ ] Users receive emails promptly

---

**📞 Support**: Nếu gặp vấn đề với SMTP configuration, check logs và follow troubleshooting guide trên.
