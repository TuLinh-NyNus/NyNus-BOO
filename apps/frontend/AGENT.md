# 🤖 NyNus Frontend - AI Agent Guide
*Essential guide for AI agents working with NyNus Frontend*

## 🎯 **QUICK OVERVIEW FOR AI**

**NyNus Frontend** is a Next.js 15 exam bank system with gRPC-Web communication.

### **Tech Stack (AI Must Know)**
- **Framework**: Next.js 15.4.5 + App Router + TypeScript 5.8.3 (strict)
- **Styling**: Tailwind CSS 4.1.11 + Shadcn UI components
- **Communication**: gRPC-Web (@improbable-eng/grpc-web)
- **Auth**: NextAuth + Custom gRPC Auth (dual system)
- **State**: React Context + TanStack Query + Zustand
- **Port**: 3000 (dev), 8080 (gRPC backend)

## 🏗️ **CRITICAL ARCHITECTURE FOR AI**

### **Directory Structure (AI Implementation Guide)**
```
apps/frontend/src/
├── app/                         # 🚨 Next.js 15 App Router - MAIN ROUTES
│   ├── layout.tsx              # Root layout + providers
│   ├── page.tsx                # Homepage with dynamic imports
│   ├── 3141592654/             # ⚠️ ADMIN PAGES - NEVER DELETE/RENAME
│   ├── questions/              # Question management pages
│   ├── login/register/         # Auth pages
│   └── middleware.ts           # Route protection + role-based access
├── components/                  # 🎨 React Components
│   ├── ui/                     # Shadcn UI base components
│   ├── features/               # Feature-specific components
│   ├── layout/                 # Layout components (navbar, footer)
│   └── [feature]/              # Organized by feature
├── services/grpc/              # 🔌 gRPC-Web Services - CRITICAL
│   ├── auth.service.ts         # Authentication + JWT
│   ├── question.service.ts     # Question CRUD
│   └── [service].service.ts    # Other gRPC services
├── generated/                  # 🤖 Auto-generated protobuf types
│   ├── v1/                     # Service definitions
│   └── common/                 # Shared types
├── contexts/                   # 🔄 React Context Providers
│   ├── auth-context.tsx        # Auth state management
│   └── [context].tsx           # Other contexts
├── hooks/                      # 🪝 Custom React Hooks
├── lib/                        # 🛠️ Utilities + Configurations
└── types/                      # 📝 TypeScript Definitions
```

## ⚠️ **CRITICAL RULES FOR AI IMPLEMENTATION**

### **🚨 NEVER TOUCH THESE**
```bash
# FORBIDDEN ACTIONS
❌ DELETE src/app/3141592654/          # Admin pages directory
❌ RENAME src/app/3141592654/          # Security through obscurity
❌ MODIFY middleware.ts role logic     # Authentication system
❌ DELETE src/generated/               # Auto-generated protobuf
❌ CHANGE gRPC service signatures      # Backend compatibility
```

### **✅ SAFE TO MODIFY**
```bash
# ALLOWED ACTIONS
✅ ADD new pages in src/app/
✅ CREATE new components in src/components/
✅ ADD new hooks in src/hooks/
✅ MODIFY UI components in src/components/ui/
✅ ADD new services (follow existing patterns)
```

## 🚀 **AI DEVELOPMENT COMMANDS**

### **Quick Start (AI Use These)**
```bash
cd apps/frontend
pnpm dev                    # Start development server (port 3000)
pnpm build                  # Production build + search index
pnpm type-check            # Validate TypeScript
pnpm lint                  # Check code quality
```

### **Advanced Commands**
```bash
pnpm dev:fast              # Turbo mode development
pnpm build:analyze         # Bundle analysis
pnpm lint:fix              # Auto-fix ESLint issues
pnpm clean:cache           # Clear Next.js cache
```

## 🔐 **AUTHENTICATION SYSTEM (AI MUST UNDERSTAND)**

### **Dual Auth Architecture**
```typescript
// NextAuth (Google OAuth) + Custom gRPC Auth
const authFlow = {
  google: "NextAuth → session → user context",
  email: "gRPC → JWT tokens → localStorage → user context"
};
```

### **Role-Based Access Control**
```typescript
// middleware.ts - Route Protection
const ROLE_HIERARCHY = {
  ADMIN: 5,    // Full access
  TEACHER: 4,  // Teaching features
  TUTOR: 3,    // Tutoring features
  STUDENT: 2,  // Learning features
  GUEST: 1     // Public only
};
```

### **Protected Routes (AI Implementation)**
```typescript
// When adding new pages, follow this pattern:
'/admin/*'     → ADMIN only
'/teacher/*'   → TEACHER + ADMIN
'/student/*'   → STUDENT + higher roles
'/profile'     → Any authenticated user
'/'           → Public access
```

## 🔌 **gRPC-WEB INTEGRATION (AI CRITICAL KNOWLEDGE)**

### **Service Pattern (AI Must Follow)**
```typescript
// src/services/grpc/[service].service.ts
import { ServiceClient } from '@/generated/v1/ServiceClientPb';
import { Request, Response } from '@/generated/v1/service_pb';

export class ServiceName {
  private client: ServiceClient;

  constructor() {
    this.client = new ServiceClient(process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080');
  }

  async methodName(params: RequestParams): Promise<ResponseType> {
    const request = new Request();
    // Set request fields

    try {
      const response = await this.client.methodName(request);
      return response;
    } catch (error) {
      throw new Error(this.handleGrpcError(error));
    }
  }
}
```

### **Available Services (AI Can Use)**
```typescript
// Authentication
AuthService.login(email, password)
AuthService.register(userData)
AuthService.getCurrentUser()

// Questions
QuestionService.createQuestion(questionData)
QuestionService.getQuestion(id)
QuestionService.listQuestions(filters)

// Admin
AdminService.listUsers()
AdminService.updateUser(id, userData)
```

### **Generated Types Location**
```bash
src/generated/v1/           # Service clients & messages
src/generated/common/       # Shared types (UserRole, UserStatus)
```

## 🎨 **UI COMPONENTS (AI IMPLEMENTATION GUIDE)**

### **Shadcn UI Base Components (Ready to Use)**
```typescript
// src/components/ui/ - Pre-built components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table } from '@/components/ui/table';
import { Form } from '@/components/ui/form';
```

### **Component Creation Pattern (AI Must Follow)**
```typescript
// src/components/[feature]/ComponentName.tsx
'use client'; // Only if using hooks/state

import { cn } from '@/lib/utils';
import { ComponentProps } from '@/types/component-types';

interface Props extends ComponentProps {
  // Specific props
}

export function ComponentName({ className, ...props }: Props) {
  return (
    <div className={cn("base-classes", className)}>
      {/* Component content */}
    </div>
  );
}
```

### **Styling Rules (AI Must Follow)**
```typescript
// ✅ CORRECT - Use cn() utility
className={cn("flex items-center", isActive && "bg-primary", className)}

// ❌ WRONG - Direct string concatenation
className={`flex items-center ${isActive ? 'bg-primary' : ''} ${className}`}
```

## 🪝 **CUSTOM HOOKS (AI IMPLEMENTATION PATTERNS)**

### **Available Hooks (AI Can Use)**
```typescript
// Authentication
import { useAuth } from '@/contexts/auth-context';
const { user, login, logout, isAuthenticated } = useAuth();

// Debouncing
import { useDebounce } from '@/hooks/useDebounce';
const debouncedValue = useDebounce(searchTerm, 300);

// Question Management
import { useQuestionList } from '@/hooks/useQuestionList';
const { questions, loading, error, refetch } = useQuestionList(filters);

// Toast Notifications
import { useToast } from '@/hooks/use-toast';
const { toast } = useToast();
toast({ title: "Success", description: "Action completed" });
```

### **Hook Creation Pattern (AI Must Follow)**
```typescript
// src/hooks/useFeatureName.ts
import { useState, useEffect } from 'react';

export function useFeatureName(params: ParamsType) {
  const [state, setState] = useState<StateType>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook logic here

  return { state, loading, error, actions };
}
```

## 📱 **NEXT.JS APP ROUTER (AI PAGE CREATION GUIDE)**

### **Page Creation Pattern (AI Must Follow)**
```typescript
// src/app/[route]/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title - NyNus',
  description: 'Page description for SEO'
};

export default function PageName() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

### **Layout Pattern (AI Can Extend)**
```typescript
// src/app/[route]/layout.tsx
export default function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="route-specific-layout">
      {/* Route-specific navigation/sidebar */}
      <main>{children}</main>
    </div>
  );
}
```

## ⚠️ **COMMON PITFALLS (AI MUST AVOID)**

### **🚨 Critical Mistakes**
```typescript
// ❌ WRONG - Direct protobuf import
import { UserServiceClient } from 'src/generated/v1/user_grpc_web_pb';

// ✅ CORRECT - Use alias
import { UserServiceClient } from '@/generated/v1/UserServiceClientPb';

// ❌ WRONG - Hardcoded URLs
const client = new UserServiceClient('http://localhost:8080');

// ✅ CORRECT - Environment variable
const client = new UserServiceClient(process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080');
```

### **🔧 Performance Rules**
```typescript
// ✅ CORRECT - Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
});

// ✅ CORRECT - Memoization for expensive calculations
const expensiveValue = useMemo(() => calculateExpensive(data), [data]);

// ❌ WRONG - No memoization
const expensiveValue = calculateExpensive(data); // Runs every render
```

## 🚀 **QUICK IMPLEMENTATION CHECKLIST (AI USE THIS)**

### **Before Starting Any Feature**
```bash
✅ Check if similar component exists in src/components/
✅ Verify gRPC service is available in src/services/grpc/
✅ Check authentication requirements in middleware.ts
✅ Review existing types in src/types/ and src/generated/
```

### **When Creating New Pages**
```bash
✅ Add to src/app/[route]/page.tsx
✅ Add metadata for SEO
✅ Check if route needs protection in middleware.ts
✅ Use existing layout components from src/components/layout/
```

### **When Adding gRPC Integration**
```bash
✅ Check if service exists in src/services/grpc/
✅ Use generated types from src/generated/
✅ Handle errors with try/catch
✅ Add loading states for better UX
```

### **Testing Your Implementation**
```bash
pnpm dev          # Start development server
pnpm type-check   # Validate TypeScript
pnpm lint         # Check code quality
pnpm build        # Test production build
```

---

## 🎯 **AI IMPLEMENTATION SUCCESS CRITERIA**

### **✅ Your Implementation is Good If:**
- Uses existing patterns from src/components/, src/hooks/, src/services/
- Follows TypeScript strict mode (no `any` types)
- Implements proper error handling with try/catch
- Uses cn() utility for className merging
- Respects authentication/authorization rules
- Includes loading states for async operations

### **❌ Your Implementation Needs Improvement If:**
- Creates duplicate components instead of reusing existing ones
- Bypasses authentication middleware
- Uses hardcoded URLs instead of environment variables
- Ignores TypeScript errors or uses `any` types
- Doesn't handle loading/error states

---

## 🚀 **QUICK START FOR AI**

```bash
# 1. Navigate to frontend
cd apps/frontend

# 2. Start development
pnpm dev

# 3. Open browser
# http://localhost:3000

# 4. Before committing
pnpm type-check && pnpm lint && pnpm build
```

**🤖 AI Agent Ready! Use this guide to implement features efficiently and safely.**
