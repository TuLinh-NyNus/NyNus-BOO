# Mockdata Audit & Optimization Report
**Date**: January 15, 2025  
**Version**: 1.0.0  
**Status**: Critical Issues Found - Action Required

## 🔍 **1. Duplicate Definitions Analysis**

### **❌ Critical Duplications Found:**

#### **1.1 Question Interface Duplication**
**Files Affected**: `types.ts`, `questions-enhanced.ts`, `questions.ts`

```typescript
// types.ts - AdminQuestion
export interface AdminQuestion extends Question {
  subcount?: string;
  questionId?: string;
  source?: string;
  rawContent?: string;
  solution?: string;
  // ... more fields
}

// questions-enhanced.ts - EnhancedQuestion  
export interface EnhancedQuestion {
  id: string;
  rawContent: string;
  content: string;
  subcount?: string;
  type: QuestionType;
  source?: string;
  // ... overlapping fields
}
```

**Impact**: 70% field overlap, causing confusion và potential type conflicts.

#### **1.2 Pagination & API Response Duplication**
**Files Affected**: All mockdata files

```typescript
// Repeated in every file:
export interface MockPagination { /* same structure */ }
export interface MockApiResponse<T> { /* same structure */ }
```

**Impact**: 13 files × 2 interfaces = 26 duplicate definitions.

#### **1.3 Helper Function Duplication**
**Pattern Found**: Search, filter, pagination functions repeated across files.

```typescript
// Repeated pattern in 8+ files:
export function searchXXX(query: string): XXX[] {
  const searchTerm = query.toLowerCase();
  return mockXXX.filter(item => /* similar logic */);
}
```

### **1.2 Constants & Enums Duplication**
**Files Affected**: `index.ts`, individual files

```typescript
// Multiple definitions of same constants:
USER_ROLES, QUESTION_TYPES, DIFFICULTY_LEVELS, etc.
```

## 🔄 **2. Database Schema Comparison**

### **❌ Critical Mismatches Found:**

#### **2.1 Question Table Schema Mismatch**
**Database Schema** (from migration):
```sql
CREATE TABLE Question (
    id             TEXT PRIMARY KEY,           -- ✅ Match
    rawContent     TEXT NOT NULL,              -- ✅ Match  
    content        TEXT NOT NULL,              -- ✅ Match
    subcount       VARCHAR(10),                -- ✅ Match
    type           QuestionType NOT NULL,      -- ❌ Enum vs String
    source         TEXT,                       -- ✅ Match
    answers        JSONB,                      -- ❌ any vs JSONB
    correctAnswer  JSONB,                      -- ❌ any vs JSONB
    solution       TEXT,                       -- ✅ Match
    tag            TEXT[] DEFAULT '{}',        -- ❌ tags vs tag
    usageCount     INT DEFAULT 0,              -- ✅ Match
    creator        TEXT DEFAULT 'ADMIN',       -- ✅ Match
    status         QuestionStatus DEFAULT 'ACTIVE', -- ❌ String vs Enum
    feedback       INT DEFAULT 0,              -- ❌ number vs INT
    difficulty     QuestionDifficulty DEFAULT 'MEDIUM', -- ❌ Missing in mockdata
    questionCodeId VARCHAR(7) NOT NULL,        -- ✅ Match
    created_at     TIMESTAMPTZ,                -- ✅ Match
    updated_at     TIMESTAMPTZ                 -- ✅ Match
);
```

**Mockdata Interface**:
```typescript
export interface EnhancedQuestion {
  id: string;                    // ✅ Match
  rawContent: string;            // ✅ Match
  content: string;               // ✅ Match
  subcount?: string;             // ❌ Optional vs Required in DB
  type: QuestionType;            // ❌ Import vs DB Enum
  source?: string;               // ✅ Match
  answers?: any;                 // ❌ Should be JSONB type
  correctAnswer?: any;           // ❌ Should be JSONB type
  solution?: string;             // ✅ Match
  tags: string[];                // ❌ Field name mismatch (tag vs tags)
  usageCount: number;            // ✅ Match
  creator: string;               // ✅ Match
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'ARCHIVED'; // ❌ Should use DB enum
  feedback: number;              // ❌ Should be integer
  // ❌ Missing: difficulty field
  questionCodeId: string;        // ✅ Match
  createdAt: Date;               // ✅ Match
  updatedAt: Date;               // ✅ Match
}
```

#### **2.2 User Table Schema Mismatch**
**Database Schema**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,           -- ❌ UUID vs string
    email VARCHAR(255) UNIQUE,     -- ✅ Match
    password_hash VARCHAR(255),    -- ❌ Missing in mockdata
    first_name VARCHAR(100),       -- ✅ Match (firstName)
    last_name VARCHAR(100),        -- ✅ Match (lastName)
    role VARCHAR(20),              -- ✅ Match
    is_active BOOLEAN,             -- ✅ Match (isActive)
    created_at TIMESTAMPTZ,        -- ✅ Match
    updated_at TIMESTAMPTZ         -- ✅ Match
);
```

**Mockdata Issues**:
- Missing `password_hash` field
- ID type mismatch (string vs UUID)
- Extra fields not in DB schema

#### **2.3 Missing Tables in Mockdata**
**Database Tables Not Represented**:
- `QuestionCode` - ✅ Exists in questions-enhanced.ts
- `QuestionImage` - ✅ Exists in questions-enhanced.ts  
- `QuestionTag` - ✅ Exists in questions-enhanced.ts
- `QuestionFeedback` - ✅ Exists in questions-enhanced.ts

## 📊 **3. Refactored Structure Proposal**

### **3.1 Consolidated Type Definitions**
**New File**: `apps/frontend/src/lib/mockdata/core-types.ts`

```typescript
// Core shared types
export interface MockPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MockApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: MockPagination;
}

// Database-aligned enums
export enum QuestionType {
  MC = 'MC',
  TF = 'TF', 
  SA = 'SA',
  ES = 'ES',
  MA = 'MA'
}

export enum QuestionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}
```

### **3.2 Database-Aligned Interfaces**
**Updated File**: `apps/frontend/src/lib/mockdata/database-types.ts`

```typescript
// Exact database schema representation
export interface DatabaseQuestion {
  id: string;                           // TEXT PRIMARY KEY
  rawContent: string;                   // TEXT NOT NULL
  content: string;                      // TEXT NOT NULL
  subcount: string | null;              // VARCHAR(10)
  type: QuestionType;                   // QuestionType ENUM
  source: string | null;                // TEXT
  answers: any;                         // JSONB
  correctAnswer: any;                   // JSONB
  solution: string | null;              // TEXT
  tag: string[];                        // TEXT[] (note: 'tag' not 'tags')
  usageCount: number;                   // INT DEFAULT 0
  creator: string;                      // TEXT DEFAULT 'ADMIN'
  status: QuestionStatus;               // QuestionStatus ENUM
  feedback: number;                     // INT DEFAULT 0
  difficulty: QuestionDifficulty;       // QuestionDifficulty ENUM
  questionCodeId: string;               // VARCHAR(7) NOT NULL
  created_at: Date;                     // TIMESTAMPTZ
  updated_at: Date;                     // TIMESTAMPTZ
}

export interface DatabaseUser {
  id: string;                           // UUID (as string in TS)
  email: string;                        // VARCHAR(255) UNIQUE
  password_hash: string;                // VARCHAR(255) NOT NULL
  first_name: string;                   // VARCHAR(100)
  last_name: string;                    // VARCHAR(100)
  role: string;                         // VARCHAR(20)
  is_active: boolean;                   // BOOLEAN
  created_at: Date;                     // TIMESTAMPTZ
  updated_at: Date;                     // TIMESTAMPTZ
}
```

### **3.3 Unified Helper Functions**
**New File**: `apps/frontend/src/lib/mockdata/utils.ts`

```typescript
// Generic helper functions to avoid duplication
export class MockDataUtils {
  static paginate<T>(items: T[], page: number, limit: number): {
    items: T[];
    pagination: MockPagination;
  } {
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  static searchInFields<T>(
    items: T[], 
    query: string, 
    fields: (keyof T)[]
  ): T[] {
    const searchTerm = query.toLowerCase();
    return items.filter(item =>
      fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm);
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(searchTerm)
          );
        }
        return false;
      })
    );
  }

  static createMockResponse<T>(
    data: T, 
    message?: string, 
    success: boolean = true
  ): MockApiResponse<T> {
    return {
      success,
      data,
      message: message || (success ? 'Data retrieved successfully' : 'Error occurred'),
    };
  }
}
```

## 🎯 **4. Action Plan**

### **Phase 1: Critical Fixes (Week 1)**
1. **✅ Create consolidated type files**
   - `core-types.ts` - Shared interfaces và enums
   - `database-types.ts` - Database-aligned interfaces
   - `utils.ts` - Unified helper functions

2. **✅ Fix database schema mismatches**
   - Update Question interface to match DB exactly
   - Add missing fields (difficulty, password_hash)
   - Fix field name mismatches (tag vs tags)
   - Align enum values với database

3. **✅ Remove duplications**
   - Consolidate pagination interfaces
   - Merge similar helper functions
   - Remove redundant type definitions

### **Phase 2: Refactoring (Week 2)**
1. **Update all mockdata files**
   - Import from consolidated types
   - Use unified helper functions
   - Align với database schema

2. **Update index.ts**
   - Clean exports
   - Remove duplicate constants
   - Organize by functionality

### **Phase 3: Validation (Week 3)**
1. **TypeScript validation**
   - Ensure no type conflicts
   - Verify all imports work
   - Test build process

2. **Database alignment testing**
   - Verify mockdata matches DB schema
   - Test data migration scenarios
   - Validate enum consistency

## 🚨 **5. Immediate Actions Required**

### **Critical Priority (Fix Today)**
1. **Question interface mismatch** - Breaks question management
2. **Enum inconsistencies** - Causes type errors
3. **Missing database fields** - Incomplete data representation

### **High Priority (Fix This Week)**
1. **Duplicate type definitions** - Code maintainability
2. **Helper function consolidation** - DRY principle
3. **Database schema alignment** - Production readiness

### **Medium Priority (Fix Next Week)**
1. **File organization optimization** - Developer experience
2. **Documentation updates** - Team knowledge sharing
3. **Performance optimization** - Large dataset handling

---

**Status**: 🔴 **CRITICAL ISSUES FOUND**  
**Recommendation**: 🚨 **IMMEDIATE ACTION REQUIRED**  
**Risk Level**: **HIGH** - Current mockdata không align với production database  
**Timeline**: 3 weeks to full resolution
