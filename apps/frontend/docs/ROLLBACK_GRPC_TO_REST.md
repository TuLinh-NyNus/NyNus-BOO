# Rollback Guide: gRPC to REST API

## Overview
This document provides instructions to rollback from gRPC implementation to REST API if needed. This should only be used in emergency situations or if protobuf generation issues cannot be resolved.

## ⚠️ Important Notes
- **This rollback removes gRPC functionality completely**  
- **All gRPC services will be replaced with stub implementations**
- **Real API calls will need to be restored manually**
- **Backup files are available with `.original.ts` extension**

## Prerequisites
- Ensure you have backup of current gRPC implementation
- Have access to terminal/command line
- pnpm installed and configured

## Rollback Steps

### Step 1: Restore Original Service Files
```bash
# Navigate to project root
cd apps/frontend

# Restore original auth service
cp "src/services/grpc/auth.service.original.ts" "src/services/grpc/auth.service.ts"

# Restore original admin service
cp "src/services/grpc/admin.service.original.ts" "src/services/grpc/admin.service.ts"

# Restore original questions API
cp "src/services/api/questions.api.original.ts" "src/services/api/questions.api.ts"

# Restore original admin API  
cp "src/services/api/admin.api.original.ts" "src/services/api/admin.api.ts"
```

### Step 2: Revert Auth Context
```bash
# Replace gRPC auth context with legacy version
cp "src/contexts/auth-context.tsx" "src/contexts/auth-context-grpc.tsx"
```

### Step 3: Update Context Index
Edit `src/contexts/index.ts`:
```typescript
// Change from:
export { AuthProvider, useAuth } from './auth-context-grpc';

// To:
export { AuthProvider, useAuth } from './auth-context';
```

### Step 4: Update Component Imports
Update the following files to use legacy auth context:

**`src/components/layout/auth-modal.tsx`:**
```typescript
// Change from:
import { useAuth } from "@/contexts/auth-context-grpc";

// To:
import { useAuth } from "@/contexts/auth-context";
```

**`src/components/features/admin/dashboard/admin-sidebar.tsx`:**
```typescript  
// Change from:
import { useAuth } from '@/contexts/auth-context-grpc';

// To:
import { useAuth } from '@/contexts/auth-context';
```

### Step 5: Update App Providers
Edit `src/providers/app-providers.tsx`:
```typescript
// Change from:
import { AuthProvider } from '@/contexts/auth-context-grpc';

// To:
import { AuthProvider } from '@/contexts/auth-context';
```

### Step 6: Remove Dynamic Rendering Flags
Remove the following lines from pages that were modified:
- `src/app/careers/page.tsx`
- `src/app/bao-cao-loi/page.tsx`

```typescript
// Remove this line:
export const dynamic = 'force-dynamic';
```

### Step 7: Clean Up Stub Files
```bash
# Remove stub files
rm "src/services/grpc/auth.service.stub.ts"
rm "src/services/grpc/admin.service.stub.ts" 
rm "src/services/api/questions.api.stub.ts"
rm "src/services/api/admin.api.stub.ts"
```

### Step 8: Restore HTTP API Routes
If you need actual API functionality, you'll need to:
1. Create proper API routes in `src/app/api/`
2. Implement backend services
3. Update service implementations to make real HTTP calls

### Step 9: Verify Rollback
```bash
# Run type checking
pnpm type-check

# Run linting  
pnpm lint

# Test build
pnpm build
```

## Files Modified During gRPC Migration
The following files were modified and have `.original.ts` backups:

### Service Files
- `src/services/grpc/auth.service.ts` → `auth.service.original.ts`
- `src/services/grpc/admin.service.ts` → `admin.service.original.ts`  
- `src/services/api/questions.api.ts` → `questions.api.original.ts`
- `src/services/api/admin.api.ts` → `admin.api.original.ts`

### Context Files
- `src/contexts/auth-context-grpc.tsx` (new gRPC context)
- `src/contexts/index.ts` (updated exports)

### Component Files
- `src/components/layout/auth-modal.tsx` (import update)
- `src/components/features/admin/dashboard/admin-sidebar.tsx` (import update)

### Provider Files
- `src/providers/app-providers.tsx` (import update)

### Page Files
- `src/app/careers/page.tsx` (added dynamic flag)
- `src/app/bao-cao-loi/page.tsx` (added dynamic flag)

## Troubleshooting

### Build Errors After Rollback
If you encounter build errors:
1. Clear Next.js cache: `pnpm clean`
2. Reinstall dependencies: `pnpm install`
3. Check for missing imports or type errors
4. Verify all backup files were restored correctly

### protobuf Import Errors
If you see protobuf-related errors:
1. Remove any remaining gRPC imports
2. Check for leftover stub implementations
3. Ensure all services use HTTP calls instead of gRPC

### Authentication Issues
If auth is not working:
1. Verify `auth-context.tsx` is being used (not `auth-context-grpc.tsx`)
2. Check that components import from correct auth context
3. Ensure API routes are implemented for auth endpoints

## Emergency Contacts
- Frontend Lead: [Contact Info]
- DevOps Team: [Contact Info]  
- Backend Team: [Contact Info]

## Post-Rollback Checklist
- [ ] All builds pass without errors
- [ ] Authentication works correctly
- [ ] Admin functionality accessible
- [ ] Questions/admin APIs functional  
- [ ] No gRPC-related imports remain
- [ ] All components use REST API calls
- [ ] Documentation updated to reflect current state

## Prevention
To avoid needing rollbacks in future:
1. Always test gRPC changes in development environment first
2. Ensure protobuf generation works before deploying
3. Keep stub implementations as temporary solutions only
4. Plan backend and frontend gRPC implementation together
5. Have comprehensive test coverage for critical paths