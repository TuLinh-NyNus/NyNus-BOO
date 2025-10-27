#!/usr/bin/env node

/**
 * Script to create .env.local file with default development values
 * Run: node create-env-local.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# ====================================
# Frontend Environment Variables
# Created on: ${new Date().toISOString()}
# ====================================

# Environment
NODE_ENV=development
APP_ENV=development

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
# Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET=development-secret-key-change-in-production-abcd1234567890

# Backend API URLs (REQUIRED)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRPC_URL=http://localhost:8080
NEXT_PUBLIC_USE_GRPC_PROXY=true

# JWT Configuration
JWT_SECRET=development-jwt-secret-key

# Database (Prisma) - REQUIRED
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/exam_bank"

# Google OAuth (optional - uncomment to enable)
# Get credentials from: https://console.cloud.google.com/
# GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_LATEX_PARSER=true
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true

# Development Settings
SKIP_TYPE_CHECK=false
ENABLE_STANDALONE=false
`;

const envPath = path.join(__dirname, '.env.local');

// Check if file already exists
if (fs.existsSync(envPath)) {
  console.log('❌ .env.local file already exists!');
  console.log('   If you want to recreate it, delete the existing file first.');
  process.exit(1);
}

// Create .env.local file
try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Created .env.local file successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Edit .env.local and update the values as needed');
  console.log('2. Generate a secure NEXTAUTH_SECRET:');
  console.log('   openssl rand -base64 32');
  console.log('3. Make sure PostgreSQL is running on port 5432');
  console.log('4. Make sure backend is running on port 8080');
  console.log('5. Run: pnpm dev');
  console.log('');
  console.log('⚠️  Important: Never commit .env.local to git!');
} catch (error) {
  console.error('❌ Failed to create .env.local:', error.message);
  process.exit(1);
}
