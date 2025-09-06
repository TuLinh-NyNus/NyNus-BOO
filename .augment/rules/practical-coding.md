---
type: "always_apply"
---

# Practical Clean Code Rules
## Quy tắc Clean Code Thực tiễn - Bổ sung cho NyNus System

> File này bổ sung cho `coding.md` với focus vào readability, maintainability và Go backend patterns

## 🎯 Priority Levels
- 🔴 **Critical**: Must follow (CI/CD will fail)
- 🟡 **High**: Should follow (Code review required)
- 🟢 **Medium**: Recommended (Best practice)

---

## 🔴 Constants & Magic Numbers

### Loại bỏ Magic Numbers
```typescript
// ❌ BAD - Magic numbers everywhere
function validatePassword(password: string): boolean {
  return password.length >= 8 && password.length <= 128;
}

function retryRequest(attempts: number): boolean {
  return attempts < 3;
}

// ✅ GOOD - Named constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

function validatePassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && 
         password.length <= PASSWORD_MAX_LENGTH;
}

function retryRequest(attempts: number): boolean {
  return attempts < MAX_RETRY_ATTEMPTS;
}
```

### Constants Organization
```typescript
// ✅ GOOD - Grouped constants
export const VALIDATION_LIMITS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_MAX_LENGTH: 255
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 5000,
  UPLOAD: 30000,
  LONG_RUNNING: 60000
} as const;

export const USER_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILED: 'Thông tin đăng nhập không chính xác',
  PASSWORD_TOO_SHORT: `Mật khẩu phải có ít nhất ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} ký tự`
} as const;
```

---

## 🔴 Go Backend Specific Rules

### Error Handling Pattern
```go
// ✅ GOOD - Consistent error handling với Vietnamese messages
func GetUserByID(ctx context.Context, db database.QueryExecer, id string) (*entity.User, error) {
    // Validate input first (fail-fast)
    if strings.TrimSpace(id) == "" {
        return nil, errors.New("ID người dùng không được để trống")
    }

    user, err := userRepo.GetByID(ctx, db, id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, fmt.Errorf("không tìm thấy người dùng với ID: %s", id)
        }
        return nil, fmt.Errorf("lỗi truy vấn cơ sở dữ liệu: %w", err)
    }

    return user, nil
}

// ❌ BAD - Inconsistent error handling
func GetUser(id string) *User {
    if id == "" {
        return nil // ❌ Silent failure
    }
    
    user := db.Find(id)
    return user // ❌ No error handling
}
```

### Interface Design Rules
```go
// ✅ GOOD - Small, focused interfaces
type UserReader interface {
    GetByID(ctx context.Context, db database.QueryExecer, id string) (entity.User, error)
}

type UserWriter interface {
    Create(ctx context.Context, db database.QueryExecer, user *entity.User) error
    Update(ctx context.Context, db database.QueryExecer, user *entity.User) error
}

type UserRepository interface {
    UserReader
    UserWriter
}

// ❌ BAD - Fat interface
type UserService interface {
    GetByID(id string) *User
    Create(user *User) error
    Update(user *User) error  
    Delete(id string) error
    SendEmail(user *User) error    // ❌ Mixed responsibility
    ValidateUser(user *User) bool  // ❌ Mixed responsibility
}
```

### Struct Organization
```go
// ✅ GOOD - Clear struct with validation tags
type CreateUserRequest struct {
    Email     string `json:"email" validate:"required,email" db:"email"`
    FirstName string `json:"first_name" validate:"required,min=2,max=50" db:"first_name"`
    LastName  string `json:"last_name" validate:"required,min=2,max=50" db:"last_name"`
    Password  string `json:"password" validate:"required,min=8,max=128" db:"-"`
}

// Method với receiver pattern rõ ràng
func (r *CreateUserRequest) Validate() error {
    if strings.TrimSpace(r.Email) == "" {
        return errors.New("email không được để trống")
    }
    
    if len(r.Password) < 8 {
        return errors.New("mật khẩu phải có ít nhất 8 ký tự")
    }
    
    return nil
}
```

---

## 🔴 Boolean Parameters & Options Pattern

### Tránh Boolean Parameters
```typescript
// ❌ BAD - Boolean parameters gây confusion
function processUser(userData: UserData, shouldSendEmail: boolean, shouldLogActivity: boolean) {
    // Implementation
}

// Gọi hàm khó hiểu
processUser(userData, true, false); // ❌ Không rõ ý nghĩa

// ✅ GOOD - Options object pattern
interface ProcessUserOptions {
    sendEmail?: boolean;
    logActivity?: boolean;
    validateInput?: boolean;
}

function processUser(userData: UserData, options: ProcessUserOptions = {}) {
    const { sendEmail = false, logActivity = true, validateInput = true } = options;
    // Implementation
}

// Gọi hàm rõ ràng
processUser(userData, { 
    sendEmail: true, 
    logActivity: false 
}); // ✅ Dễ hiểu
```

### Enum thay cho Multiple Booleans
```typescript
// ❌ BAD - Multiple boolean flags
interface QuestionFilter {
    includeActive: boolean;
    includeInactive: boolean;
    includeDraft: boolean;
}

// ✅ GOOD - Enum states
enum QuestionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive', 
    DRAFT = 'draft',
    ALL = 'all'
}

interface QuestionFilter {
    status: QuestionStatus;
    difficulty?: DifficultyLevel;
    category?: string;
}
```

---

## 🟡 Comments & Documentation Rules

### Comment Guidelines - Giải thích WHY không phải WHAT
```typescript
// ❌ BAD - Comments giải thích code rõ ràng
function calculateDiscount(price: number): number {
    // Nhân price với 0.1
    return price * 0.1;
}

// ✅ GOOD - Comments giải thích business logic
function calculateDiscount(price: number): number {
    // Áp dụng giảm giá 10% cho tất cả sản phẩm trong chương trình khuyến mãi tết
    // Business rule: Discount chỉ áp dụng từ 15/1 đến 15/2
    return price * 0.1;
}

// ✅ GOOD - Complex algorithm explanation
function calculateExamScore(answers: Answer[]): number {
    // Thuật toán tính điểm:
    // 1. Câu đúng: +1 điểm  
    // 2. Câu sai: -0.25 điểm (tránh đoán bừa)
    // 3. Không trả lời: 0 điểm
    return answers.reduce((total, answer) => {
        if (answer.isCorrect) return total + 1;
        if (answer.isAnswered && !answer.isCorrect) return total - 0.25;
        return total; // Không trả lời
    }, 0);
}
```

### TODO Comments Format
```typescript
// ✅ GOOD - Structured TODO comments
// TODO(anhphan): Implement email verification after user registration
// FIXME(team): Race condition in concurrent user creation - needs mutex
// HACK(anhphan): Temporary workaround for API rate limiting - remove after v2.0
// NOTE(team): Business rule changed - keep this logic for backward compatibility

// ❌ BAD - Vague TODOs
// TODO: fix this
// FIXME: bug here
// TODO: optimize
```

---

## 🟡 Import Organization & File Structure

### Import Order (TypeScript/React)
```typescript
// 1. Node modules (external dependencies)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';

// 2. Internal modules (newline separation)
import { UserService } from '@/services/user';
import { validateEmail, formatName } from '@/lib/utils';
import { Button, Input, Modal } from '@/components/ui';

// 3. Relative imports
import { useUserContext } from '../contexts/user-context';
import './user-profile.styles.css';

// 4. Type-only imports (nếu cần)
import type { User, UserRole } from '@/types/user';
import type { ComponentProps } from 'react';
```

### Go Import Organization
```go
package user

import (
    // 1. Standard library
    "context"
    "fmt"
    "strings"
    "time"
    
    // 2. Third-party packages
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
    
    // 3. Internal packages (grouped by domain)
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
    "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)
```

### File Naming Conventions
```bash
# ✅ GOOD - Consistent naming
user-service.go         # Go: kebab-case
user_service_test.go    # Go test: snake_case with _test
UserService.ts          # TypeScript class: PascalCase
user-service.ts         # TypeScript module: kebab-case
user-profile.component.tsx  # React component: kebab-case.component
user-profile.styles.css     # Styles: kebab-case.styles
user-profile.test.tsx       # Tests: kebab-case.test

# ❌ BAD - Inconsistent naming
userservice.go          # No separation
UserService.go          # Wrong case for Go
user_service.ts         # Wrong case for TS
UserProfile.css         # Wrong case for CSS
```

---

## 🟢 Advanced Patterns

### Early Return Pattern
```typescript
// ✅ GOOD - Early returns, less nesting
function processQuestionSubmission(submission: QuestionSubmission): Result {
    // Guard clauses first
    if (!submission) {
        throw new ValidationError('Submission không được để trống');
    }
    
    if (!submission.answers?.length) {
        throw new ValidationError('Phải có ít nhất một câu trả lời');
    }
    
    if (!submission.userId) {
        throw new ValidationError('User ID không hợp lệ');
    }
    
    // Main business logic after validation
    const validAnswers = validateAnswers(submission.answers);
    const score = calculateScore(validAnswers);
    const result = createResult(submission.userId, score);
    
    return saveResult(result);
}

// ❌ BAD - Nested conditions
function processQuestionSubmission(submission: QuestionSubmission): Result {
    if (submission) {
        if (submission.answers && submission.answers.length > 0) {
            if (submission.userId) {
                const validAnswers = validateAnswers(submission.answers);
                const score = calculateScore(validAnswers);
                const result = createResult(submission.userId, score);
                return saveResult(result);
            } else {
                throw new ValidationError('User ID không hợp lệ');
            }
        } else {
            throw new ValidationError('Phải có ít nhất một câu trả lời');
        }
    } else {
        throw new ValidationError('Submission không được để trống');
    }
}
```

### Type-Safe Configuration
```typescript
// ✅ GOOD - Type-safe config với validation
const AppConfig = z.object({
    database: z.object({
        host: z.string().min(1),
        port: z.number().int().positive(),
        name: z.string().min(1)
    }),
    api: z.object({
        timeout: z.number().positive().default(5000),
        maxRetries: z.number().int().min(0).default(3)
    }),
    features: z.object({
        enableEmailVerification: z.boolean().default(true),
        enablePasswordReset: z.boolean().default(true)
    })
});

export type AppConfigType = z.infer<typeof AppConfig>;

export function loadConfig(): AppConfigType {
    const rawConfig = {
        database: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            name: process.env.DB_NAME
        },
        api: {
            timeout: parseInt(process.env.API_TIMEOUT || '5000'),
            maxRetries: parseInt(process.env.MAX_RETRIES || '3')
        },
        features: {
            enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
            enablePasswordReset: process.env.ENABLE_PASSWORD_RESET !== 'false'
        }
    };
    
    return AppConfig.parse(rawConfig);
}
```

---

## 🔴 Pre-commit Checklist (Bổ sung)

### Code Readability
- [ ] Không có magic numbers (đã thay bằng named constants)
- [ ] Không có boolean parameters (đã dùng options object)
- [ ] Comments giải thích WHY không phải WHAT
- [ ] Import statements được organize theo thứ tự
- [ ] File names follow naming conventions

### Go-specific Checks  
- [ ] Error messages bằng Tiếng Việt cho user-facing errors
- [ ] Interface design nhỏ và focused
- [ ] Struct có validation tags đầy đủ
- [ ] Context được pass đúng cách

### TypeScript-specific Checks
- [ ] Enum được dùng thay cho multiple booleans
- [ ] Type-safe configuration
- [ ] Import organization đúng thứ tự
- [ ] Early return pattern được áp dụng

---

## 📚 Quick Reference

### Constants Naming
```typescript
// Formats
const SNAKE_CASE = 'for constants';
const camelCase = 'for variables';  
const PascalCase = 'for classes/types';
const kebab-case = 'for files/css';
```

### Error Message Languages
```typescript
// User-facing: Vietnamese
throw new ValidationError('Email không hợp lệ');

// Internal/Developer: English  
console.error('Database connection failed');
```

### File Extensions Guide
```bash
.service.ts     # Business logic services
.repository.ts  # Data access layer
.types.ts       # Type definitions only
.utils.ts       # Pure utility functions
.config.ts      # Configuration files
.test.ts        # Unit tests
.e2e.ts         # End-to-end tests
```

---

**Practical Clean Code Rules Features:**
- ✅ Magic numbers elimination
- ✅ Go backend specific patterns
- ✅ Boolean parameters alternatives  
- ✅ Comment quality guidelines
- ✅ Import organization standards
- ✅ File naming conventions
- ✅ Type-safe configurations
- ✅ Early return patterns
