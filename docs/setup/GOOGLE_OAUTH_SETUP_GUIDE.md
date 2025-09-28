# 🔐 Google OAuth Setup Guide
**NyNus Exam Bank System - Complete OAuth Configuration**

## 📋 Overview

This guide provides step-by-step instructions to configure Google OAuth for the NyNus Exam Bank System. OAuth is required for Google login functionality in both development and production environments.

## 🎯 Prerequisites

- Google account with access to Google Cloud Console
- NyNus project cloned and set up locally
- Basic understanding of OAuth 2.0 flow

## 🚀 Step 1: Google Cloud Console Setup

### 1.1 Create/Select Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project** (or select existing)
   ```
   Project Name: NyNus Exam Bank System
   Project ID: nynus-exam-bank-[random-id]
   Organization: (Optional)
   ```

3. **Enable Required APIs**
   - Navigate to: **APIs & Services > Library**
   - Search and enable these APIs:
     - ✅ **Google+ API** (for OAuth user info)
     - ✅ **People API** (for profile data)
     - ✅ **Identity and Access Management (IAM) API**

### 1.2 Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - Go to: **APIs & Services > OAuth consent screen**

2. **Choose User Type**
   - **Internal**: For organization-only access
   - **External**: For public access (recommended for NyNus)

3. **Fill App Information**
   ```
   App name: NyNus - Exam Bank System
   User support email: support@nynus.edu.vn
   Developer contact: your-email@domain.com
   
   App domain (Production):
   - Homepage: https://app.nynus.edu.vn
   - Privacy policy: https://app.nynus.edu.vn/privacy
   - Terms of service: https://app.nynus.edu.vn/terms
   
   Authorized domains:
   - nynus.edu.vn (production)
   - localhost (development)
   ```

4. **Scopes Configuration**
   - Add these scopes:
     - `openid`
     - `email`
     - `profile`

5. **Test Users** (for External apps in testing)
   - Add your test email addresses
   - Add team member emails

### 1.3 Create OAuth 2.0 Client ID

1. **Navigate to Credentials**
   - Go to: **APIs & Services > Credentials**
   - Click: **+ CREATE CREDENTIALS > OAuth 2.0 Client ID**

2. **Application Type**
   - Select: **Web application**

3. **Configure Client**
   ```
   Name: NyNus Web Client
   
   Authorized JavaScript origins:
   - http://localhost:3000 (development)
   - http://localhost:3001 (development alternative)
   - https://app.nynus.edu.vn (production)
   
   Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (development)
   - http://localhost:3001/api/auth/callback/google (development alternative)
   - https://app.nynus.edu.vn/api/auth/callback/google (production)
   ```

4. **Download Credentials**
   - Click **CREATE**
   - Download the JSON file (keep it secure!)
   - Note the **Client ID** and **Client Secret**

## 🔧 Step 2: Environment Configuration

### 2.1 Development Environment

1. **Update Frontend `.env.local`**
   ```bash
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
   
   # Redirect URI (must match Google Console)
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
   ```

2. **Update Backend `.env`**
   ```bash
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
   
   # JWT Configuration (generate secure secrets)
   JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
   JWT_ACCESS_SECRET=your-access-secret-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
   ```

### 2.2 Production Environment

1. **Production Frontend Environment**
   ```bash
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   
   # NextAuth Configuration
   NEXTAUTH_URL=https://app.nynus.edu.vn
   NEXTAUTH_SECRET=your-production-nextauth-secret-min-32-chars
   
   # Redirect URI (production)
   GOOGLE_REDIRECT_URI=https://app.nynus.edu.vn/api/auth/callback/google
   ```

2. **Production Backend Environment**
   ```bash
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://app.nynus.edu.vn/api/auth/callback/google
   
   # JWT Configuration (use strong secrets)
   JWT_SECRET=your-production-jwt-secret-min-64-chars
   JWT_ACCESS_SECRET=your-production-access-secret-min-64-chars
   JWT_REFRESH_SECRET=your-production-refresh-secret-min-64-chars
   ```

## 🧪 Step 3: Testing OAuth Integration

### 3.1 Development Testing

1. **Start Services**
   ```bash
   # Terminal 1: Start Backend
   cd apps/backend
   go run cmd/main.go
   
   # Terminal 2: Start Frontend
   cd apps/frontend
   pnpm dev
   ```

2. **Test OAuth Flow**
   - Open: http://localhost:3000/login
   - Click "Đăng nhập với Google" button
   - Should redirect to Google OAuth consent screen
   - After consent, should redirect back to app
   - Check browser console for any errors

3. **Verify Backend Integration**
   ```bash
   # Check backend logs for OAuth requests
   # Should see successful token validation logs
   ```

### 3.2 Frontend Integration Verification

1. **Check NextAuth Session**
   ```javascript
   // In browser console at localhost:3000
   import { getSession } from 'next-auth/react';
   const session = await getSession();
   console.log('NextAuth Session:', session);
   ```

2. **Verify gRPC Integration**
   ```javascript
   // Check if backend tokens are available
   console.log('Backend Access Token:', session?.backendAccessToken);
   console.log('User Data:', session?.user);
   ```

### 3.3 Backend Token Validation

1. **Test gRPC GoogleLogin Endpoint**
   ```bash
   # Use grpcurl or similar tool
   grpcurl -plaintext -d '{"id_token":"your-google-id-token"}' \
     localhost:50051 v1.UserService/GoogleLogin
   ```

2. **Check Database Records**
   ```sql
   -- Verify user creation
   SELECT id, email, first_name, last_name, google_id 
   FROM users 
   WHERE email = 'your-test-email@gmail.com';
   
   -- Check OAuth account linking
   SELECT * FROM oauth_accounts 
   WHERE user_id = 'your-user-id';
   ```

## 🔍 Step 4: Troubleshooting

### 4.1 Common Issues

#### **Error: "redirect_uri_mismatch"**
```
Solution:
1. Check Google Console > Credentials > OAuth 2.0 Client
2. Ensure redirect URI exactly matches: http://localhost:3000/api/auth/callback/google
3. No trailing slashes, exact protocol (http vs https)
4. Wait 5-10 minutes after changes for Google to propagate
```

#### **Error: "invalid_client"**
```
Solution:
1. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
2. Check for extra spaces or newlines in environment variables
3. Ensure client secret hasn't been regenerated in Google Console
```

#### **Error: "access_denied"**
```
Solution:
1. Check OAuth consent screen configuration
2. Ensure user email is added to test users (for External apps)
3. Verify required scopes are configured
```

#### **Error: "Token validation failed"**
```
Solution:
1. Check backend GOOGLE_CLIENT_ID matches frontend
2. Verify system clock is synchronized
3. Check network connectivity to Google APIs
```

### 4.2 Debug Steps

1. **Enable Debug Logging**
   ```bash
   # Frontend
   NEXTAUTH_DEBUG=true pnpm dev
   
   # Backend
   LOG_LEVEL=debug go run cmd/main.go
   ```

2. **Check Network Requests**
   - Open browser DevTools > Network tab
   - Look for requests to `/api/auth/` endpoints
   - Check for 4xx/5xx errors

3. **Verify Environment Variables**
   ```bash
   # Check if variables are loaded
   echo $GOOGLE_CLIENT_ID
   echo $NEXTAUTH_URL
   ```

## 🛡️ Step 5: Security Best Practices

### 5.1 Client Secret Management

- ✅ **Never commit secrets to version control**
- ✅ **Use environment variables or secret management**
- ✅ **Rotate secrets regularly in production**
- ✅ **Use different credentials for dev/staging/prod**

### 5.2 Redirect URI Security

- ✅ **Use HTTPS in production**
- ✅ **Whitelist exact URIs (no wildcards)**
- ✅ **Validate state parameter to prevent CSRF**
- ✅ **Use secure, httpOnly cookies for sessions**

### 5.3 Production Considerations

- ✅ **Enable OAuth consent screen verification**
- ✅ **Set up monitoring for OAuth failures**
- ✅ **Implement rate limiting for auth endpoints**
- ✅ **Use secure JWT secrets (64+ characters)**
- ✅ **Enable audit logging for authentication events**

## ✅ Verification Checklist

- [ ] Google Cloud project created and configured
- [ ] OAuth consent screen completed
- [ ] OAuth 2.0 Client ID created with correct redirect URIs
- [ ] Environment variables configured for dev/prod
- [ ] Frontend OAuth flow tested successfully
- [ ] Backend token validation working
- [ ] User creation/linking verified in database
- [ ] Error handling tested
- [ ] Security best practices implemented
- [ ] Documentation updated for team

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide first
2. Review Google Cloud Console audit logs
3. Check application logs (frontend & backend)
4. Contact development team with specific error messages

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: NyNus Development Team
