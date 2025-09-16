# 🔍 **HTTP CALLS ANALYSIS SCRIPT**
**Purpose**: Identify all HTTP/REST API calls in frontend for gRPC migration  
**Created**: September 16, 2025  

---

## 📊 **ANALYSIS RESULTS** 

### **🔴 CRITICAL FILES (Must migrate first)**

#### **1. Core HTTP Client**
```
File: src/lib/api/client.ts
Type: HTTP Client Core
References: 15+ API_BASE_URL, fetch() calls
Priority: CRITICAL
Action: Replace entire file with gRPC client wrapper
```

#### **2. Auth API Service** 
```
File: src/lib/services/api/auth.api.ts  
Type: Auth HTTP/gRPC Mix
References: 4+ HTTP fallbacks
Priority: CRITICAL
Action: Remove all HTTP calls, use pure gRPC
```

#### **3. Auth Context**
```
File: src/contexts/auth-context-grpc.tsx
Type: Auth Context 
References: Potentially HTTP fallbacks
Priority: CRITICAL
Action: Verify pure gRPC, remove any HTTP
```

### **🟡 HIGH PRIORITY FILES**

#### **4. Questions API Service**
```
File: src/lib/services/api/questions.api.ts
Type: Feature Service HTTP/gRPC Mix  
References: 4+ HTTP/API references
Priority: HIGH
Action: Convert all HTTP calls to gRPC calls
```

#### **5. Admin API Service**
```
File: src/lib/services/api/admin.api.ts
Type: Admin HTTP Service
References: Multiple admin HTTP endpoints
Priority: HIGH
Action: Replace with gRPC admin service calls
```

#### **6. gRPC Services Verification**
```
Files: 
- src/services/grpc/auth.service.ts
- src/services/grpc/question.service.ts
- src/services/grpc/question-filter.service.ts
- src/services/grpc/admin.service.ts

Type: gRPC Services
Action: Verify no HTTP fallbacks exist
```

### **🟢 MEDIUM PRIORITY FILES**

#### **7. Public Questions Service**
```
File: src/lib/services/public/questions.service.ts
Type: Public Service
References: 3 HTTP references
Priority: MEDIUM
Action: Convert to gRPC public endpoints
```

#### **8. Admin Hooks**
```
File: src/hooks/admin/use-admin-user-management.ts
Type: Admin Hook
References: 1 HTTP reference
Priority: MEDIUM
Action: Update to use gRPC admin service
```

#### **9. HTTP Mappers**
```
Files:
- src/lib/services/api/mappers/question-filter.mapper.ts
- src/lib/services/api/mappers/question.mapper.ts

Type: HTTP to Domain Mappers
Action: Convert to gRPC mappers or remove if unnecessary
```

#### **10. Analytics**
```
File: src/lib/analytics.ts
Type: Analytics Service
References: 1 HTTP reference
Priority: MEDIUM
Action: Review if gRPC conversion needed
```

### **🔵 LOW PRIORITY / REVIEW NEEDED**

#### **11. Next.js API Routes**
```
Files:
- src/app/api/contact/route.ts
- src/app/api/auth/[...nextauth]/route.ts
- src/app/api/newsletter/subscribe/route.ts

Type: Next.js API Routes
Action: Keep as Next.js APIs (server-side), not frontend HTTP calls
```

#### **12. UI Components with HTTP References**
```
Files: 20+ component files
Types: Various UI components
References: Mostly external links, static content
Priority: LOW
Action: Review each, most likely no action needed
```

---

## 🗂️ **MIGRATION SEQUENCE**

### **Sequence 1: Foundation** 
1. `src/lib/api/client.ts` - HTTP client removal
2. `src/services/grpc/client.ts` - gRPC client enhancement
3. `src/lib/grpc/errors.ts` - Error handling setup

### **Sequence 2: Authentication**
4. `src/lib/services/api/auth.api.ts` - Auth service migration
5. `src/contexts/auth-context-grpc.tsx` - Auth context cleanup
6. Auth-related hooks and components

### **Sequence 3: Core Features**
7. `src/lib/services/api/questions.api.ts` - Questions service
8. `src/lib/services/api/admin.api.ts` - Admin service
9. `src/lib/services/public/questions.service.ts` - Public service

### **Sequence 4: Components & Hooks**
10. Admin hooks (`use-admin-user-management.ts`)
11. Question-related components
12. Admin components

### **Sequence 5: Cleanup**
13. Remove HTTP mappers
14. Clean up unused HTTP utilities
15. Update imports and dependencies

---

## 🔍 **DETAILED ANALYSIS COMMANDS**

### **Find all HTTP API calls:**
```bash
# In frontend directory
cd apps/frontend

# Find fetch() calls
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx"

# Find axios calls (if any)
grep -r "axios" src/ --include="*.ts" --include="*.tsx"

# Find API_BASE_URL references
grep -r "API_BASE_URL" src/ --include="*.ts" --include="*.tsx"

# Find HTTP/HTTPS URLs
grep -r "http://" src/ --include="*.ts" --include="*.tsx"
grep -r "https://" src/ --include="*.ts" --include="*.tsx"

# Find /api/ endpoint references
grep -r "/api/" src/ --include="*.ts" --include="*.tsx"
```

### **gRPC Service Verification:**
```bash
# Check gRPC service files exist
ls -la src/services/grpc/

# Verify no HTTP in gRPC services
grep -r "fetch\|axios\|http://" src/services/grpc/ --include="*.ts"

# Check proto generation
ls -la src/generated/ # or wherever proto files are generated
```

### **Dependency Analysis:**
```bash
# Check package.json for HTTP-related dependencies
cat package.json | grep -E "(axios|fetch|superagent|request)"

# Check for HTTP client imports
grep -r "import.*axios\|import.*fetch" src/ --include="*.ts" --include="*.tsx"
```

---

## 📋 **MIGRATION CHECKLIST TEMPLATE**

### **For Each File:**
- [ ] **Identify all HTTP calls** - List each HTTP endpoint used
- [ ] **Find corresponding gRPC service** - Map to existing gRPC methods  
- [ ] **Plan migration approach** - Direct replacement or refactoring needed
- [ ] **Check dependencies** - What components depend on this file
- [ ] **Test migration** - Verify functionality after migration
- [ ] **Update imports** - Fix any broken imports
- [ ] **Remove dead code** - Clean up unused HTTP utilities

### **File Migration Template:**
```
File: [FILE_PATH]
Status: [ ] Not Started / [ ] In Progress / [ ] Complete
HTTP Calls Found: [LIST_OF_CALLS]
gRPC Replacement: [GRPC_SERVICE.METHOD]
Dependencies: [DEPENDENT_FILES]
Migration Notes: [NOTES]
Testing Status: [ ] Not Tested / [ ] Tested / [ ] Issues Found
```

---

## 🎯 **SUCCESS CRITERIA**

### **Zero HTTP Calls Found:**
```bash
# These commands should return zero results after migration:
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "// External API"
grep -r "API_BASE_URL" src/ --include="*.ts" --include="*.tsx"
grep -r "/api/v1/" src/ --include="*.ts" --include="*.tsx"
```

### **Build Success:**
```bash
pnpm type-check  # No TypeScript errors
pnpm lint        # No linting errors  
pnpm build       # Successful production build
```

### **Runtime Verification:**
```bash
# Start development server
pnpm dev

# Check browser console for:
# - No HTTP API calls in Network tab (except Next.js APIs)
# - No HTTP-related JavaScript errors
# - All features working correctly
```

---

## 📊 **MIGRATION TRACKING**

### **Progress Dashboard:**
```
Total Files Identified: ~35
Critical Files: 3/3 ⏳
High Priority: 6/6 ⏳  
Medium Priority: 7/7 ⏳
Low Priority: 20+/20+ ⏳

Overall Progress: 0% ⏳
Estimated Time: 15-20 hours
Target Completion: Sep 20, 2025
```

### **Daily Standup Template:**
```
Yesterday: [What was completed]
Today: [What will be worked on]  
Blockers: [Any impediments]
Risk Level: [LOW/MEDIUM/HIGH]
```

---

**📝 Status**: Analysis Complete  
**🎯 Next Action**: Execute Phase 1 of migration plan  
**📊 Confidence**: HIGH - Well-defined scope and approach  

---

*This analysis provides the foundation for systematic HTTP to gRPC migration.*