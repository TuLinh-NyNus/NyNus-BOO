# Prisma ORM Usage Guide - NyNus Exam Bank System
*Cập nhật: 2025-01-19*

## ⚠️ QUAN TRỌNG: USAGE RESTRICTIONS

Prisma ORM trong NyNus system có **USAGE RESTRICTIONS** nghiêm ngặt để tránh dual database access anti-pattern.

### ✅ ALLOWED USAGE (Được phép)

Prisma ORM **CHỈ ĐƯỢC PHÉP** sử dụng cho:

1. **Database Seeding** - Populate test data
   - `apps/frontend/prisma/seed.ts`
   - `apps/frontend/prisma/seed-questions-exams.ts`
   - `apps/frontend/prisma/seed-additional-users.ts`
   - `apps/frontend/prisma/seed-custom-users.ts`

2. **Integration Testing** - Test database operations
   - Test files trong `apps/frontend/src/tests/`
   - E2E tests với database

3. **Development Utilities** - Development tools only
   - `apps/frontend/test-prisma-query.mjs` - Connection testing
   - Schema inspection scripts

### ❌ FORBIDDEN USAGE (Cấm sử dụng)

Prisma ORM **TUYỆT ĐỐI KHÔNG ĐƯỢC** sử dụng cho:

1. **Production API Routes** ❌
   - Không dùng trong `apps/frontend/src/app/api/**/*.ts`
   - Phải migrate sang gRPC services

2. **Business Logic** ❌
   - Không dùng trong services, hooks, components
   - Backend (Go) xử lý tất cả business logic

3. **Client-side Code** ❌
   - Prisma Client chỉ chạy server-side
   - Client-side phải dùng gRPC hoặc REST API

## 📊 CURRENT PRISMA USAGE INVENTORY

### Core Files (5 files)

1. **`apps/frontend/prisma/schema.prisma`** (650+ lines)
   - Purpose: Database schema definition
   - Status: ✅ KEEP - Useful for documentation
   - Usage: Reference only, not for code generation

2. **`apps/frontend/src/lib/prisma.ts`** (40 lines)
   - Purpose: Prisma Client singleton
   - Status: ⚠️ RESTRICTED - Added usage warnings
   - Usage: Seeding & testing only

3. **`apps/frontend/src/lib/prisma/error-handler.ts`** (320+ lines)
   - Purpose: Prisma error handling wrapper
   - Status: ⚠️ RESTRICTED - Added usage warnings
   - Usage: Seeding & testing only

4. **`apps/frontend/package.json`**
   - Dependencies: `@prisma/client: 6.16.3`, `prisma: 6.16.3`
   - Scripts: `prisma:generate`, `prisma:seed`, `prisma:studio`
   - Status: ✅ KEEP - Needed for seeding

5. **`apps/frontend/test-prisma-query.mjs`**
   - Purpose: Connection testing
   - Status: ✅ KEEP - Development utility

### Seed Scripts (5 files) - ✅ LEGITIMATE USE

1. **`apps/frontend/prisma/seed.ts`** (550+ lines)
   - Main seed script
   - Creates users, tokens, sessions, notifications
   - Status: ✅ CORRECT USAGE

2. **`apps/frontend/prisma/seed-questions-exams.ts`**
   - Seeds questions and exams
   - Status: ✅ CORRECT USAGE

3. **`apps/frontend/prisma/seed-additional-users.ts`**
   - Seeds additional users
   - Status: ✅ CORRECT USAGE

4. **`apps/frontend/prisma/seed-custom-users.ts`**
   - Seeds custom users (admins, teachers, students)
   - Status: ✅ CORRECT USAGE

5. **`apps/frontend/prisma/seed-100-students.sql`**
   - SQL seed for 100 students
   - Status: ✅ CORRECT USAGE

### API Routes (3 files) - ⚠️ NEEDS MIGRATION

1. **`apps/frontend/src/app/api/users/route.ts`**
   - Uses: `prisma.users.findMany()`, `prisma.users.create()`
   - Status: ⚠️ DEPRECATED - Added migration warnings
   - TODO: Migrate to gRPC UserService

2. **`apps/frontend/src/app/api/users/[id]/route.ts`**
   - Uses: `prisma.users.findUnique()`, `prisma.users.update()`, `prisma.users.delete()`
   - Status: ⚠️ DEPRECATED - Added migration warnings
   - TODO: Migrate to gRPC UserService

3. **`apps/frontend/src/app/api/exams/route.ts`**
   - Uses: `prisma.exams.findMany()`, `prisma.exams.create()`
   - Status: ⚠️ DEPRECATED - Added migration warnings
   - TODO: Migrate to gRPC ExamService

## 🚨 WHY DUAL DATABASE ACCESS IS BAD

### Security Risks

1. **Bypasses Backend Security Layers**
   - Frontend có direct database access
   - Không qua authentication/authorization của Backend
   - Có thể bị exploit nếu frontend bị compromise

2. **Exposes Database Credentials**
   - `DATABASE_URL` phải có trong frontend environment
   - Credentials có thể leak qua client-side code

3. **No Audit Trail**
   - Database operations từ frontend không được log
   - Khó track ai làm gì, khi nào

### Architectural Problems

1. **Violates Single Responsibility**
   - Backend (Go) dùng raw SQL
   - Frontend (Next.js) dùng Prisma ORM
   - Hai cách access khác nhau → inconsistency

2. **Maintenance Nightmare**
   - Schema changes phải update cả 2 nơi
   - Migration scripts phải maintain 2 systems
   - Testing phải cover cả 2 approaches

3. **Performance Issues**
   - Prisma ORM overhead
   - N+1 query problems
   - Không optimize được như raw SQL

## 📋 MIGRATION PLAN

### Phase 1: Add Warnings (✅ COMPLETED)

- [x] Add deprecation warnings to `src/lib/prisma.ts`
- [x] Add deprecation warnings to `src/lib/prisma/error-handler.ts`
- [x] Add deprecation warnings to API routes
- [x] Create this documentation

### Phase 2: Implement gRPC Services (TODO)

1. **Backend (Go) - Create gRPC Services**
   - [ ] Implement `UserService` with all CRUD operations
   - [ ] Implement `ExamService` with all CRUD operations
   - [ ] Add authentication/authorization middleware
   - [ ] Add audit logging

2. **Frontend (Next.js) - Create gRPC Clients**
   - [ ] Generate TypeScript clients from .proto files
   - [ ] Create wrapper functions for gRPC calls
   - [ ] Add error handling for gRPC errors
   - [ ] Add retry logic and circuit breaker

### Phase 3: Migrate API Routes (TODO)

1. **Migrate `/api/users` routes**
   - [ ] Replace `prisma.users.findMany()` with `UserService.ListUsers()`
   - [ ] Replace `prisma.users.create()` with `UserService.CreateUser()`
   - [ ] Update tests
   - [ ] Deploy and verify

2. **Migrate `/api/users/[id]` routes**
   - [ ] Replace `prisma.users.findUnique()` with `UserService.GetUser()`
   - [ ] Replace `prisma.users.update()` with `UserService.UpdateUser()`
   - [ ] Replace `prisma.users.delete()` with `UserService.DeleteUser()`
   - [ ] Update tests
   - [ ] Deploy and verify

3. **Migrate `/api/exams` routes**
   - [ ] Replace `prisma.exams.findMany()` with `ExamService.ListExams()`
   - [ ] Replace `prisma.exams.create()` with `ExamService.CreateExam()`
   - [ ] Update tests
   - [ ] Deploy and verify

### Phase 4: Cleanup (TODO)

- [ ] Remove Prisma imports from API routes
- [ ] Move `@prisma/client` to devDependencies
- [ ] Remove `prisma:studio` script (already deprecated)
- [ ] Update documentation
- [ ] Final testing

## 🎯 BEST PRACTICES

### For Seeding Scripts

```typescript
// ✅ CORRECT: Use Prisma in seed scripts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  await prisma.users.create({
    data: {
      email: 'admin@nynus.com',
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
  });
}
```

### For API Routes (Current - DEPRECATED)

```typescript
// ❌ DEPRECATED: Direct Prisma usage in API routes
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.users.findMany(); // BAD!
  return Response.json(users);
}
```

### For API Routes (Target - FUTURE)

```typescript
// ✅ CORRECT: Use gRPC services
import { userServiceClient } from '@/services/grpc/user-service';

export async function GET() {
  const response = await userServiceClient.ListUsers({
    page: 1,
    limit: 10,
  });
  return Response.json(response.users);
}
```

## 📚 RELATED DOCUMENTATION

- **pgAdmin 4 Setup**: `docs/database/PGADMIN_SETUP.md`
- **Dual Database Access Analysis**: `docs/report/dual-database-access-analysis.md`
- **Architecture Document**: `docs/report/arch.md`
- **Development Guide**: `docker/DEVELOPMENT_GUIDE.md`

## 🔗 USEFUL COMMANDS

```bash
# Seed database (ALLOWED)
pnpm --filter @nynus/web prisma:seed

# Generate Prisma Client (for seeding only)
pnpm --filter @nynus/web prisma:generate

# Test Prisma connection (development only)
node apps/frontend/test-prisma-query.mjs

# Use pgAdmin 4 for database management (RECOMMENDED)
.\scripts\pgadmin.ps1 start
```

## ⚠️ FINAL REMINDER

**Prisma ORM trong NyNus chỉ dùng cho SEEDING & TESTING!**

- ✅ Database seeding: OK
- ✅ Integration testing: OK
- ✅ Development utilities: OK
- ❌ Production API routes: FORBIDDEN
- ❌ Business logic: FORBIDDEN
- ❌ Client-side code: FORBIDDEN

**Mọi database operations trong production phải đi qua Backend (Go + gRPC)!**

