# Mockdata vs Database Schema Comparison Matrix
**Date**: January 15, 2025  
**Version**: 1.0.0  
**Status**: Analysis Complete - Action Items Identified

## 📊 **Comparison Summary**

| Table | Mockdata Status | Schema Match | Critical Issues | Action Required |
|-------|----------------|--------------|-----------------|-----------------|
| `users` | ✅ Exists | ✅ **FIXED** | ✅ Added password_hash | 🟢 Complete |
| `Question` | ✅ Exists | ✅ **FIXED** | ✅ Fixed field names, types | 🟢 Complete |
| `QuestionCode` | ✅ Exists | ✅ Match | None | 🟢 Good |
| `QuestionImage` | ✅ Exists | ✅ Match | None | 🟢 Good |
| `QuestionTag` | ✅ Exists | ✅ Match | None | 🟢 Good |
| `QuestionFeedback` | ✅ Exists | ✅ Match | None | 🟢 Good |
| `user_sessions` | ✅ Exists | ❌ No Table | Need migration | 🟡 Medium |
| `oauth_accounts` | ✅ Exists | ❌ No Table | Need migration | 🟡 Medium |
| `resource_access` | ✅ Exists | ❌ No Table | Need migration | 🟡 Medium |
| `user_preferences` | ✅ Exists | ❌ No Table | Need migration | 🟡 Medium |
| `audit_logs` | ✅ Exists | ❌ No Table | Need migration | 🟡 Medium |
| `notifications` | ✅ Exists | ❌ No Table | Need migration | 🟡 Medium |

## 🔍 **Detailed Field-by-Field Analysis**

### **1. Users Table**

| Field | Database Schema | Mockdata Interface | Status | Notes |
|-------|----------------|-------------------|--------|-------|
| `id` | `UUID PRIMARY KEY` | `string` | ⚠️ Type Mismatch | UUID vs string representation |
| `email` | `VARCHAR(255) UNIQUE NOT NULL` | `string` | ✅ Match | |
| `password_hash` | `VARCHAR(255) NOT NULL` | ❌ Missing | 🔴 Critical | Security field missing |
| `first_name` | `VARCHAR(100) NOT NULL` | `firstName: string` | ✅ Match | Naming convention difference |
| `last_name` | `VARCHAR(100) NOT NULL` | `lastName: string` | ✅ Match | Naming convention difference |
| `role` | `VARCHAR(20) NOT NULL DEFAULT 'student'` | `UserRole enum` | ✅ Match | |
| `is_active` | `BOOLEAN NOT NULL DEFAULT true` | `isActive: boolean` | ✅ Match | |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | `createdAt: Date` | ✅ Match | |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | `updatedAt: Date` | ✅ Match | |

**Additional Mockdata Fields (not in DB):**
- `avatar?: string`
- `phone?: string`
- `bio?: string`
- `adminNotes?: string`
- `maxConcurrentIPs?: number`
- `lastLoginAt?: Date`
- `profile?: object`
- `stats?: object`

### **2. Question Table**

| Field | Database Schema | Mockdata Interface | Status | Notes |
|-------|----------------|-------------------|--------|-------|
| `id` | `TEXT PRIMARY KEY` | `string` | ✅ Match | |
| `rawContent` | `TEXT NOT NULL` | `string` | ✅ Match | |
| `content` | `TEXT NOT NULL` | `string` | ✅ Match | |
| `subcount` | `VARCHAR(10)` | `string \| undefined` | ⚠️ Nullability | DB allows null, TS uses undefined |
| `type` | `QuestionType NOT NULL` | `QuestionType` | ⚠️ Enum Source | Different enum definitions |
| `source` | `TEXT` | `string \| undefined` | ⚠️ Nullability | DB allows null, TS uses undefined |
| `answers` | `JSONB` | `any` | ⚠️ Type Safety | Should use proper typing |
| `correctAnswer` | `JSONB` | `any` | ⚠️ Type Safety | Should use proper typing |
| `solution` | `TEXT` | `string \| undefined` | ⚠️ Nullability | DB allows null, TS uses undefined |
| `tag` | `TEXT[] DEFAULT '{}'` | `tags: string[]` | 🔴 Field Name | **Critical**: `tag` vs `tags` |
| `usageCount` | `INT DEFAULT 0` | `number` | ✅ Match | |
| `creator` | `TEXT DEFAULT 'ADMIN'` | `string` | ✅ Match | |
| `status` | `QuestionStatus DEFAULT 'ACTIVE'` | `string union` | ⚠️ Enum Source | Different enum definitions |
| `feedback` | `INT DEFAULT 0` | `number` | ✅ Match | |
| `difficulty` | `QuestionDifficulty DEFAULT 'MEDIUM'` | ❌ Missing | 🔴 Critical | Missing field in mockdata |
| `questionCodeId` | `VARCHAR(7) NOT NULL` | `string` | ✅ Match | |
| `created_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `createdAt: Date` | ✅ Match | |
| `updated_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `updatedAt: Date` | ✅ Match | |

### **3. QuestionCode Table**

| Field | Database Schema | Mockdata Interface | Status | Notes |
|-------|----------------|-------------------|--------|-------|
| `code` | `VARCHAR(7) PRIMARY KEY` | `string` | ✅ Match | |
| `format` | `CodeFormat NOT NULL` | `CodeFormat` | ✅ Match | |
| `grade` | `CHAR(1) NOT NULL` | `string` | ✅ Match | |
| `subject` | `CHAR(1) NOT NULL` | `string` | ✅ Match | |
| `chapter` | `CHAR(1) NOT NULL` | `string` | ✅ Match | |
| `lesson` | `CHAR(1) NOT NULL` | `string` | ✅ Match | |
| `form` | `CHAR(1)` | `string \| undefined` | ✅ Match | |
| `level` | `CHAR(1) NOT NULL` | `string` | ✅ Match | |
| `created_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `createdAt: Date` | ✅ Match | |
| `updated_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `updatedAt: Date` | ✅ Match | |

### **4. QuestionImage Table**

| Field | Database Schema | Mockdata Interface | Status | Notes |
|-------|----------------|-------------------|--------|-------|
| `id` | `TEXT PRIMARY KEY` | `string` | ✅ Match | |
| `questionId` | `TEXT NOT NULL REFERENCES Question(id)` | `string` | ✅ Match | |
| `imageType` | `ImageType NOT NULL` | `ImageType` | ✅ Match | |
| `imagePath` | `TEXT` | `string \| undefined` | ✅ Match | |
| `driveUrl` | `TEXT` | `string \| undefined` | ✅ Match | |
| `driveFileId` | `VARCHAR(100)` | `string \| undefined` | ✅ Match | |
| `status` | `ImageStatus DEFAULT 'PENDING'` | `ImageStatus` | ✅ Match | |
| `created_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `createdAt: Date` | ✅ Match | |
| `updated_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `updatedAt: Date` | ✅ Match | |

### **5. QuestionTag Table**

| Field | Database Schema | Mockdata Interface | Status | Notes |
|-------|----------------|-------------------|--------|-------|
| `id` | `TEXT PRIMARY KEY` | `string` | ✅ Match | |
| `questionId` | `TEXT NOT NULL REFERENCES Question(id)` | `string` | ✅ Match | |
| `tagName` | `VARCHAR(100) NOT NULL` | `string` | ✅ Match | |
| `created_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `createdAt: Date` | ✅ Match | |

**Note**: No `updated_at` field in database for this table.

### **6. QuestionFeedback Table**

| Field | Database Schema | Mockdata Interface | Status | Notes |
|-------|----------------|-------------------|--------|-------|
| `id` | `TEXT PRIMARY KEY` | `string` | ✅ Match | |
| `questionId` | `TEXT NOT NULL REFERENCES Question(id)` | `string` | ✅ Match | |
| `userId` | `TEXT` | `string \| undefined` | ✅ Match | |
| `feedbackType` | `FeedbackType NOT NULL` | `FeedbackType` | ✅ Match | |
| `content` | `TEXT` | `string \| undefined` | ✅ Match | |
| `rating` | `INT` | `number \| undefined` | ✅ Match | |
| `created_at` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | `createdAt: Date` | ✅ Match | |

**Note**: No `updated_at` field in database for this table.

## ✅ **Critical Issues - RESOLVED**

### **1. Question Table Field Name Mismatch - ✅ FIXED**
```sql
-- Database uses 'tag' (singular)
tag TEXT[] DEFAULT '{}'

-- Mockdata now uses 'tag' (aligned)
tag: string[]
```
**Status**: ✅ **RESOLVED** - Field name aligned with database
**Files Updated**: `questions-enhanced.ts`, all question interfaces

### **2. Missing Difficulty Field - ✅ FIXED**
```sql
-- Database has difficulty field
difficulty QuestionDifficulty DEFAULT 'MEDIUM'

-- Mockdata now includes this field
difficulty: QuestionDifficulty
```
**Status**: ✅ **RESOLVED** - Field added to all question interfaces
**Files Updated**: `questions-enhanced.ts`, all mock questions

### **3. Missing Password Hash - ✅ FIXED**
```sql
-- Database has password security
password_hash VARCHAR(255) NOT NULL

-- Mockdata now includes this field
password_hash: string
```
**Status**: ✅ **RESOLVED** - Security field added to all users
**Files Updated**: `users.ts`, `types.ts`, all mock users

### **4. Enum Definition Inconsistency**
```typescript
// Mockdata uses imported enums
import { QuestionType } from '@/types';

// Database defines its own enums
CREATE TYPE QuestionType AS ENUM ('MC', 'TF', 'SA', 'ES', 'MA');
```
**Impact**: 🟡 **MEDIUM** - Type safety issues  
**Solution**: Align enum definitions with database

## 📋 **Action Plan**

### **Phase 1: Critical Fixes (This Week)**

1. **Fix Question table field mismatch**
   ```typescript
   // Change from:
   tags: string[]
   // To:
   tag: string[]
   ```

2. **Add missing difficulty field**
   ```typescript
   interface EnhancedQuestion {
     // ... existing fields
     difficulty: QuestionDifficulty;
   }
   ```

3. **Add password_hash to user mockdata**
   ```typescript
   interface DatabaseUser {
     // ... existing fields
     password_hash: string;
   }
   ```

### **Phase 2: Enum Alignment (Next Week)**

1. **Use database-aligned enums**
   - Import from `core-types.ts` instead of `@/types`
   - Ensure enum values match database exactly

2. **Update all mockdata files**
   - Replace string unions with proper enums
   - Ensure type safety across all interfaces

### **Phase 3: Database Migrations (Future)**

1. **Create missing tables**
   - `user_sessions`
   - `oauth_accounts`
   - `resource_access`
   - `user_preferences`
   - `audit_logs`
   - `notifications`

2. **Add missing fields to existing tables**
   - User table extensions (phone, bio, avatar, etc.)

## 🎯 **Success Criteria**

- [ ] All mockdata interfaces match database schema exactly
- [ ] No field name mismatches
- [ ] All required fields present
- [ ] Enum definitions aligned
- [ ] Type safety maintained
- [ ] Backward compatibility preserved

---

**Status**: 🔴 **CRITICAL ISSUES IDENTIFIED**  
**Priority**: 🚨 **IMMEDIATE ACTION REQUIRED**  
**Timeline**: 1 week for critical fixes, 2 weeks for complete alignment
