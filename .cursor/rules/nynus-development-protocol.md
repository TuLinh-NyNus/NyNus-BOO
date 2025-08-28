---
type: "always_apply"
---

# NyNus Development Protocol - Enhanced Version
## RIPER-5 + Monorepo Architecture + NyNus Tech Stack

## Table of Contents
- [NyNus Project Overview](#nynus-project-overview)
- [RIPER-5 Methodology](#riper-5-methodology)
- [Implementation Guidelines](#implementation-guidelines)
- [Quick Reference](#quick-reference)

## NyNus Project Overview

### **Monorepo Architecture**
```
d:\0.WEB\25.6\16.6.2025\
├── apps/
│   ├── web/          # Next.js 14 frontend
│   ├── api/          # NestJS backend
│   └── admin/        # Admin dashboard
├── packages/
│   └── utils/        # Shared utilities
├── docs/
│   └── work-tracking/ # Task management with BOO
├── configs/          # Shared configurations
└── docker/           # Docker setup
```

### **Tech Stack**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5.5, Tailwind CSS, Shadcn UI
- **Backend**: NestJS 11, Prisma ORM 5.2, PostgreSQL 15, JWT Authentication
- **Infrastructure**: Docker, Turborepo, PNPM workspaces
- **Testing**: Jest (unit), Playwright (E2E), Supertest (API)

### **Core Principles**
1. **Always verify location**: `pwd` must be workspace root
2. **Respect monorepo structure**: Only work within apps/, packages/, docs/
3. **Consistent language**: English for code, Vietnamese for UI text
4. **TypeScript strict mode**: Required for all packages
5. **Prisma ORM**: Exclusive for database operations

## RIPER-5 Methodology

### **Mode 1: RESEARCH**
**Purpose**: Gather information and understand NyNus codebase

**Allowed**:
- Read files using codebase-retrieval tool
- Ask clarifying questions about requirements
- Analyze system architecture within monorepo
- Create task file in `docs/work-tracking/active/main-task-XXX/`

**Forbidden**:
- Give recommendations or suggestions
- Implement any changes
- Planning specific solutions

**Output**: `[MODE: RESEARCH]` + observations about NyNus codebase

### **Mode 2: INNOVATE**
**Purpose**: Brainstorm approaches suitable for NyNus architecture

**Allowed**:
- Discuss multiple solution ideas
- Evaluate pros/cons within monorepo constraints
- Explore architectural alternatives
- Update "Proposed Solution" section in task file

**Forbidden**:
- Specific planning or implementation details
- Code writing or modification
- Commit to specific solution without user input

**Output**: `[MODE: INNOVATE]` + possibilities and considerations

### **Mode 3: PLAN**
**Purpose**: Create detailed technical specifications for NyNus

**Allowed**:
- Detailed plans with exact file paths in monorepo
- Precise function names and signatures
- Complete architectural overview
- Database schema changes with Prisma ORM

**Forbidden**:
- Any implementation or code writing
- Skipping or simplifying specifications

**Required**: Convert plan to numbered checklist

**Output**: `[MODE: PLAN]` + specifications and implementation checklist

### **Mode 4: EXECUTE**
**Purpose**: Implement plan from Mode 3 in NyNus monorepo

**Allowed**:
- Implement only what is detailed in approved plan
- Follow numbered checklist strictly
- Minor deviation corrections (must report first)
- Update "Task Progress" section after each step

**Forbidden**:
- Any unreported deviation
- Improvements or feature additions not in plan
- Major logical or structural changes

**Output**: `[MODE: EXECUTE]` + implementation code + progress update

### **Mode 5: REVIEW**
**Purpose**: Validate implementation against final plan

**Allowed**:
- Line-by-line comparison between plan and implementation
- Technical validation of implemented code
- Check for errors, bugs, unexpected behavior
- Complete "Final Review" section in task file

**Required**:
- Flag any deviations between implementation and plan
- Verify all checklist items completed correctly
- Check security implications and maintainability

**Output**: `[MODE: REVIEW]` + systematic comparison and clear judgment

## Implementation Guidelines

### **Code Quality Standards**
```typescript
// ✅ GOOD - Vietnamese comments for business logic
interface QuestionCardProps {
  // Loại câu hỏi trong NyNus
  questionType: 'multiple-choice' | 'essay' | 'coding';
  question: Question;
  onAnswer: (answer: string) => void;
}

// ✅ GOOD - English comments for technical details
export function QuestionCard({ questionType, question, onAnswer }: QuestionCardProps) {
  // Handle question rendering based on type
  const renderQuestionContent = () => {
    switch (questionType) {
      case 'multiple-choice':
        return <MultipleChoiceQuestion question={question} />;
      // ... other cases
    }
  };
}
```

### **File Structure Guidelines**
- **Frontend**: `apps/web/src/components/` for React components
- **Backend**: `apps/api/src/modules/` for NestJS modules
- **Shared**: `packages/utils/src/` for shared utilities
- **Types**: `packages/utils/src/types/` for shared TypeScript interfaces
- **Database**: `apps/api/prisma/schema.prisma` for Prisma schema

### **Testing Requirements**
1. **Unit Tests**: 80%+ coverage for core business logic
2. **Integration Tests**: API endpoints with real database
3. **E2E Tests**: Complete user workflows with Playwright
4. **Performance**: API <200ms, Frontend <1s load time

### **Performance Targets**
- **API Response**: <200ms simple, <500ms complex queries
- **Frontend**: <1s page load, <2s complex dashboards
- **Database**: <100ms simple queries, <300ms analytics
- **Concurrent Users**: 100+ simultaneous learners

### **Security Standards**
- JWT authentication with refresh token flow
- Input validation with class-validator
- XSS prevention, HTTPS, CSP headers
- Rate limiting: 5 attempts/15min login, 3 attempts/hour password reset

## Quick Reference

### **Pre-Work Checklist**
```bash
# Verify location
pwd  # Must be: d:\0.WEB\25.6\16.6.2025

# Check structure
ls apps/     # Should show: web, api, admin
ls packages/ # Should show: utils
ls docs/work-tracking/ # Should show: active, completed, archived

# Verify environment
node --version  # Compatible with NyNus requirements
pnpm --version  # Latest stable
docker --version # Available for containers
```

### **Task File Template**
```markdown
# Context
Filename: [Task Filename.md]
Created On: [DateTime]
NyNus Version: [Current version]
Monorepo Location: d:\0.WEB\25.6\16.6.2025\

# Task Description
[User requirements for NyNus NyNus]

# Analysis (RESEARCH mode)
[Codebase investigation results]

# Proposed Solution (INNOVATE mode)
[Different approaches discussed]

# Implementation Plan (PLAN mode)
[Final checklist with detailed steps]

# Task Progress (EXECUTE mode)
[Step-by-step progress updates]

# Final Review (REVIEW mode)
[Implementation compliance assessment]
```

### **Emergency Protocols**
- **Wrong directory**: Stop immediately, navigate to correct location
- **Breaking changes**: Revert and return to PLAN mode
- **Auth system affected**: Halt work, seek explicit approval
- **Database integrity risk**: Stop Prisma operations, verify schema
- **Monorepo dependencies broken**: Fix workspace issues before continuing

### **BOO Integration**
```
BOO, tạo task mới →
RESEARCH (understand context) →
INNOVATE (explore solutions) →
PLAN (detailed specs) →
EXECUTE (implementation) →
REVIEW (validation) →
Archive to completed/YYYY-qX/
```

---

**Protocol Version**: 3.0.0 - Enhanced and Optimized
**Last Updated**: 2025-07-12
**Status**: Production Ready - Optimized for NyNus Development
**Reduced from**: 1222 lines → 246 lines (80% reduction)
