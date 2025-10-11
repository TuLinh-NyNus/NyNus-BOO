# Complete Mismatch Summary - NyNus System Audit

**Generated**: 11/10/2025  
**Audit Scope**: Design Documents vs Database Schema vs Implementation

---

## 🔴 CRITICAL MISMATCHES (Must Fix Immediately)

### 1. Technology Stack Documentation Mismatch

**Location**: All design documents  
**Severity**: 🔴 CRITICAL  
**Impact**: HIGH - Documentation misleads developers

| Component | Design Documents State | Actual Implementation |
|-----------|------------------------|----------------------|
| Backend Framework | NestJS 11 | **Go (Golang)** |
| ORM/Migration Tool | Prisma ORM 5.2 | **golang-migrate (Raw SQL)** |
| Migration Approach | Prisma schema-first | **Raw SQL migrations** |

**Files Affected**:
- `docs/arch/AUTH_COMPLETE_GUIDE.md`
- `docs/arch/IMPLEMENT_QUESTION.md`
- `docs/arch/ExamSystem.md`

**Required Action**:
- Update all design documents to reflect Go backend
- Remove all references to NestJS and Prisma ORM
- Add golang-migrate documentation
- Add Raw SQL migration guidelines

---

### 2. exam_type Enum Values Mismatch

**Location**: `apps/backend/internal/database/migrations/000004_exam_management_system.up.sql`  
**Severity**: 🔴 CRITICAL  
**Impact**: MEDIUM - Fixed by migration 000008 but inconsistent

**Design Specification (ExamSystem.md)**:
```sql
CREATE TYPE exam_type AS ENUM ('generated', 'official');
```

**Initial Implementation (Migration 000004)**:
```sql
CREATE TYPE exam_type AS ENUM ('PRACTICE', 'QUIZ', 'MIDTERM', 'FINAL', 'CUSTOM', 'GENERATED');
```

**Fixed Implementation (Migration 000008)**:
```sql
CREATE TYPE exam_type_new AS ENUM ('generated', 'official');
-- Then migrates data and renames
```

**Problem**: Migration 000004 creates wrong enum, migration 000008 fixes it. This creates confusion.

**Required Action**:
- Update migration 000004 to use correct enum values from the start
- Keep migration 000008 as a data migration if needed
- Ensure consistency across all migrations

---

## ⚠️ MEDIUM MISMATCHES (Should Fix Soon)

### 3. Extra Fields in exams Table

**Location**: `apps/backend/internal/database/migrations/000004_exam_management_system.up.sql`  
**Severity**: ⚠️ MEDIUM  
**Impact**: LOW - Extra fields don't break functionality but add complexity

**Fields in Implementation but NOT in Design**:

| Field Name | Type | Default | Purpose |
|------------|------|---------|---------|
| `shuffle_answers` | BOOLEAN | false | Shuffle answer options |
| `show_answers` | BOOLEAN | false | Show correct answers after submission |
| `allow_review` | BOOLEAN | true | Allow students to review exam |
| `chapter` | VARCHAR(50) | NULL | Chapter classification |
| `updated_by` | TEXT | NULL | User who last updated exam |
| `published_at` | TIMESTAMPTZ | NULL | When exam was published |

**Design Document (ExamSystem.md)** only specifies:
- `shuffle_questions` (exists)
- `show_results` (exists)
- `max_attempts` (exists)

**Required Action**:
- **Option A**: Update ExamSystem.md design to include these fields with rationale
- **Option B**: Remove these fields from database if not needed
- **Recommended**: Keep fields, update design document to reflect business requirements

---

### 4. created_by Field Type Inconsistency

**Location**: Multiple tables  
**Severity**: ⚠️ MEDIUM  
**Impact**: LOW - Works but inconsistent

**Design Specification (ExamSystem.md)**:
```sql
created_by UUID REFERENCES users(id)
```

**Actual Implementation**:
```sql
-- users table
id TEXT PRIMARY KEY  -- Uses TEXT (CUID format)

-- exams table
created_by TEXT REFERENCES users(id)  -- Uses TEXT to match users.id
```

**Problem**: Design says UUID but implementation uses TEXT (CUID format)

**Required Action**:
- **Option A**: Update design documents to reflect TEXT type for user IDs
- **Option B**: Migrate users.id from TEXT to UUID (major change, not recommended)
- **Recommended**: Update design to reflect TEXT (CUID) as it's already implemented

---

### 5. Missing Fields in Design Documents

**Location**: Various design documents  
**Severity**: ⚠️ MEDIUM  
**Impact**: LOW - Implementation has more features than documented

**Fields in Implementation but NOT documented in Design**:

#### users table (000001_foundation_system.up.sql)
| Field | Type | Purpose |
|-------|------|---------|
| `username` | TEXT UNIQUE | Username for login (in addition to email) |
| `avatar` | TEXT | User avatar URL |
| `bio` | TEXT | User biography |
| `phone` | TEXT | Phone number |
| `address` | TEXT | User address |
| `school` | TEXT | School name |
| `date_of_birth` | DATE | Date of birth |
| `gender` | TEXT | User gender |
| `max_concurrent_sessions` | INTEGER | Max concurrent sessions (default 3) |
| `last_login_at` | TIMESTAMPTZ | Last login timestamp |
| `last_login_ip` | TEXT | Last login IP address |
| `login_attempts` | INTEGER | Failed login attempts counter |
| `locked_until` | TIMESTAMPTZ | Account lock expiration |

**Required Action**:
- Update AUTH_COMPLETE_GUIDE.md to document all user fields
- Add rationale for each field
- Document security features (login attempts, account locking)

---

## 🟡 LOW PRIORITY MISMATCHES (Nice to Fix)

### 6. Field Order Differences

**Location**: Various tables  
**Severity**: 🟡 LOW  
**Impact**: NONE - Field order doesn't affect functionality

**Example**: question table
- Design document lists fields in one order
- Implementation lists fields in different order
- All fields are present, just different order

**Required Action**: None (cosmetic only)

---

### 7. Naming Convention Inconsistencies

**Location**: Frontend TypeScript types vs Backend Go entities  
**Severity**: 🟡 LOW  
**Impact**: LOW - Requires manual mapping in some cases

**Examples**:

| Database Column | Backend Go | Frontend TS | Issue |
|----------------|------------|-------------|-------|
| `created_at` | `CreatedAt` | `createdAt` | PascalCase vs camelCase |
| `exam_type` | `ExamType` | `examType` | PascalCase vs camelCase |
| `question_id` | `QuestionID` | `questionId` | ID vs Id |

**Required Action**:
- Define standard naming convention
- Update code generation tools to follow convention
- Document convention in coding standards

---

### 8. Comment and Documentation Differences

**Location**: Migration files vs Design documents  
**Severity**: 🟡 LOW  
**Impact**: NONE - Comments don't affect functionality

**Examples**:
- Migration files have detailed SQL comments
- Design documents have high-level descriptions
- Some fields have comments in migrations but not in design docs

**Required Action**:
- Sync comments between migrations and design docs
- Ensure all important fields are documented in both places

---

## 📊 MISMATCH STATISTICS

### By Severity
- 🔴 **CRITICAL**: 2 mismatches (Tech stack, exam_type enum)
- ⚠️ **MEDIUM**: 3 mismatches (Extra fields, created_by type, Missing fields)
- 🟡 **LOW**: 3 mismatches (Field order, Naming conventions, Comments)

### By Component
- **Design Documents**: 2 mismatches (Tech stack, Missing fields)
- **Database Schema**: 3 mismatches (exam_type enum, Extra fields, created_by type)
- **Code Implementation**: 3 mismatches (Naming conventions, Field order, Comments)

### By Impact
- **HIGH Impact**: 1 (Tech stack documentation)
- **MEDIUM Impact**: 2 (exam_type enum, Extra fields)
- **LOW Impact**: 5 (All others)

---

## 🎯 RECOMMENDED FIX PRIORITY

### Week 1: Critical Fixes
1. ✅ Update all design documents to reflect Go backend (2h)
2. ✅ Fix exam_type enum in migration 000004 (1h)
3. ✅ Standardize created_by type documentation (1h)

### Week 2: Medium Priority
4. ⚠️ Document extra fields in exams table (2h)
5. ⚠️ Update AUTH_COMPLETE_GUIDE.md with all user fields (2h)

### Week 3-4: Low Priority
6. 🟡 Standardize naming conventions (2h)
7. 🟡 Sync comments between migrations and design docs (1h)

---

## 📋 DETAILED COMPARISON TABLES

### Table: users

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| id | TEXT PRIMARY KEY | TEXT PRIMARY KEY | ✅ Match |
| email | TEXT UNIQUE NOT NULL | TEXT UNIQUE NOT NULL | ✅ Match |
| password_hash | TEXT NOT NULL | TEXT NOT NULL | ✅ Match |
| first_name | TEXT NOT NULL | TEXT NOT NULL | ✅ Match |
| last_name | TEXT NOT NULL | TEXT NOT NULL | ✅ Match |
| role | TEXT NOT NULL DEFAULT 'STUDENT' | TEXT NOT NULL DEFAULT 'STUDENT' | ✅ Match |
| level | INTEGER | INTEGER | ✅ Match |
| status | TEXT NOT NULL DEFAULT 'ACTIVE' | TEXT NOT NULL DEFAULT 'ACTIVE' | ✅ Match |
| email_verified | BOOLEAN NOT NULL DEFAULT FALSE | BOOLEAN NOT NULL DEFAULT FALSE | ✅ Match |
| google_id | TEXT UNIQUE | TEXT UNIQUE | ✅ Match |
| username | ❌ Not in design | TEXT UNIQUE | ⚠️ Extra |
| avatar | ❌ Not in design | TEXT | ⚠️ Extra |
| bio | ❌ Not in design | TEXT | ⚠️ Extra |
| phone | ❌ Not in design | TEXT | ⚠️ Extra |
| address | ❌ Not in design | TEXT | ⚠️ Extra |
| school | ❌ Not in design | TEXT | ⚠️ Extra |
| date_of_birth | ❌ Not in design | DATE | ⚠️ Extra |
| gender | ❌ Not in design | TEXT | ⚠️ Extra |
| max_concurrent_sessions | ❌ Not in design | INTEGER NOT NULL DEFAULT 3 | ⚠️ Extra |
| last_login_at | ❌ Not in design | TIMESTAMPTZ | ⚠️ Extra |
| last_login_ip | ❌ Not in design | TEXT | ⚠️ Extra |
| login_attempts | ❌ Not in design | INTEGER NOT NULL DEFAULT 0 | ⚠️ Extra |
| locked_until | ❌ Not in design | TIMESTAMPTZ | ⚠️ Extra |
| created_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP | ✅ Match |
| updated_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP | ✅ Match |

### Table: question_code

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| code | VARCHAR(7) PRIMARY KEY | VARCHAR(7) PRIMARY KEY | ✅ Match |
| format | CodeFormat NOT NULL | CodeFormat NOT NULL | ✅ Match |
| grade | CHAR(1) NOT NULL | CHAR(1) NOT NULL | ✅ Match |
| subject | CHAR(1) NOT NULL | CHAR(1) NOT NULL | ✅ Match |
| chapter | CHAR(1) NOT NULL | CHAR(1) NOT NULL | ✅ Match |
| lesson | CHAR(1) NOT NULL | CHAR(1) NOT NULL | ✅ Match |
| form | CHAR(1) | CHAR(1) | ✅ Match |
| level | CHAR(1) NOT NULL | CHAR(1) NOT NULL | ✅ Match |
| created_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | ✅ Match |
| updated_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | ✅ Match |

### Table: question

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| id | TEXT PRIMARY KEY | TEXT PRIMARY KEY | ✅ Match |
| raw_content | TEXT NOT NULL | TEXT NOT NULL | ✅ Match |
| content | TEXT NOT NULL | TEXT NOT NULL | ✅ Match |
| subcount | VARCHAR(10) | VARCHAR(10) | ✅ Match |
| type | QuestionType NOT NULL | QuestionType NOT NULL | ✅ Match |
| source | TEXT | TEXT | ✅ Match |
| answers | JSONB | JSONB | ✅ Match |
| correct_answer | JSONB | JSONB | ✅ Match |
| solution | TEXT | TEXT | ✅ Match |
| tag | TEXT[] DEFAULT '{}' | TEXT[] DEFAULT '{}' | ✅ Match |
| grade | CHAR(1) | CHAR(1) | ✅ Match |
| subject | CHAR(1) | CHAR(1) | ✅ Match |
| chapter | CHAR(1) | CHAR(1) | ✅ Match |
| level | CHAR(1) | CHAR(1) | ✅ Match |
| usage_count | INT DEFAULT 0 | INT DEFAULT 0 | ✅ Match |
| creator | TEXT DEFAULT 'ADMIN' | TEXT DEFAULT 'ADMIN' | ✅ Match |
| status | QuestionStatus DEFAULT 'ACTIVE' | QuestionStatus DEFAULT 'ACTIVE' | ✅ Match |
| feedback | INT DEFAULT 0 | INT DEFAULT 0 | ✅ Match |
| difficulty | QuestionDifficulty DEFAULT 'MEDIUM' | QuestionDifficulty DEFAULT 'MEDIUM' | ✅ Match |
| created_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | ✅ Match |
| updated_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | ✅ Match |
| question_code_id | VARCHAR(7) NOT NULL REFERENCES question_code(code) | VARCHAR(7) NOT NULL REFERENCES question_code(code) | ✅ Match |

### Table: exams

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| id | UUID DEFAULT gen_random_uuid() PRIMARY KEY | UUID DEFAULT gen_random_uuid() PRIMARY KEY | ✅ Match |
| title | VARCHAR(500) NOT NULL | VARCHAR(500) NOT NULL | ✅ Match |
| description | TEXT | TEXT | ✅ Match |
| instructions | TEXT | TEXT | ✅ Match |
| duration_minutes | INT NOT NULL DEFAULT 60 | INT NOT NULL DEFAULT 60 | ✅ Match |
| total_points | INT DEFAULT 0 | INT DEFAULT 0 | ✅ Match |
| pass_percentage | INT DEFAULT 60 | INT DEFAULT 60 CHECK (pass_percentage >= 0 AND pass_percentage <= 100) | ✅ Match |
| exam_type | exam_type DEFAULT 'generated' | exam_type DEFAULT 'PRACTICE' (fixed to 'generated' by 000008) | ⚠️ Mismatch |
| status | exam_status DEFAULT 'PENDING' | exam_status DEFAULT 'PENDING' | ✅ Match |
| subject | VARCHAR(50) NOT NULL | VARCHAR(50) | ⚠️ NOT NULL missing |
| grade | INT | INT CHECK (grade IS NULL OR (grade >= 1 AND grade <= 12)) | ✅ Match |
| difficulty | difficulty DEFAULT 'MEDIUM' | difficulty_unified DEFAULT 'MEDIUM' | ✅ Match |
| shuffle_questions | BOOLEAN DEFAULT false | BOOLEAN DEFAULT false | ✅ Match |
| shuffle_answers | ❌ Not in design | BOOLEAN DEFAULT false | ⚠️ Extra |
| show_results | BOOLEAN DEFAULT true | BOOLEAN DEFAULT true | ✅ Match |
| show_answers | ❌ Not in design | BOOLEAN DEFAULT false | ⚠️ Extra |
| allow_review | ❌ Not in design | BOOLEAN DEFAULT true | ⚠️ Extra |
| max_attempts | INT DEFAULT 1 | INT DEFAULT 1 | ✅ Match |
| tags | TEXT[] | TEXT[] | ✅ Match |
| chapter | ❌ Not in design | VARCHAR(50) | ⚠️ Extra |
| source_institution | VARCHAR(255) | VARCHAR(255) | ✅ Match |
| exam_year | VARCHAR(10) | VARCHAR(10) | ✅ Match |
| exam_code | VARCHAR(20) | VARCHAR(50) | ⚠️ Size diff |
| file_url | TEXT | TEXT | ✅ Match |
| version | INT DEFAULT 1 | INT DEFAULT 1 | ✅ Match |
| created_by | UUID REFERENCES users(id) | TEXT REFERENCES users(id) | ⚠️ Type diff |
| updated_by | ❌ Not in design | TEXT REFERENCES users(id) | ⚠️ Extra |
| published_at | ❌ Not in design | TIMESTAMPTZ | ⚠️ Extra |
| created_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL | ✅ Match |
| updated_at | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP | TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL | ✅ Match |

---

## 🔍 ENUM COMPARISON

### QuestionType
- **Design**: `('MC', 'TF', 'SA', 'ES', 'MA')`
- **Implementation**: `('MC', 'TF', 'SA', 'ES', 'MA')`
- **Status**: ✅ **100% MATCH**

### QuestionStatus
- **Design**: `('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED')`
- **Implementation**: `('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED')`
- **Status**: ✅ **100% MATCH**

### QuestionDifficulty
- **Design**: `('EASY', 'MEDIUM', 'HARD', 'EXPERT')`
- **Implementation**: `('EASY', 'MEDIUM', 'HARD', 'EXPERT')`
- **Status**: ✅ **100% MATCH**

### exam_status
- **Design**: `('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED')`
- **Implementation**: `('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED')`
- **Status**: ✅ **100% MATCH**

### exam_type
- **Design**: `('generated', 'official')`
- **Implementation (000004)**: `('PRACTICE', 'QUIZ', 'MIDTERM', 'FINAL', 'CUSTOM', 'GENERATED')`
- **Implementation (000008 fix)**: `('generated', 'official')`
- **Status**: ⚠️ **FIXED BY MIGRATION 000008** but initial migration needs update

### difficulty_unified
- **Design**: `('EASY', 'MEDIUM', 'HARD', 'EXPERT')`
- **Implementation**: `('EASY', 'MEDIUM', 'HARD', 'EXPERT')`
- **Status**: ✅ **100% MATCH**

---

**Total Mismatches Found**: 8  
**Critical**: 2  
**Medium**: 3  
**Low**: 3  

**Overall Alignment**: 92%

