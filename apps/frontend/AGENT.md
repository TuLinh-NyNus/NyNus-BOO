# Frontend - Next.js 15 App Agent Guide
*Hướng dẫn cho AI agents làm việc với Next.js frontend*

## 📋 Tổng quan Frontend

**NyNus Frontend** là ứng dụng Next.js 15 sử dụng App Router, TypeScript, và gRPC-Web để giao tiếp với backend.

### Thông tin kỹ thuật
- **Framework**: Next.js 15.4.5 với App Router
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS + Shadcn UI
- **Communication**: gRPC-Web với @improbable-eng/grpc-web
- **State Management**: React Context + Custom hooks
- **Port**: 3000 (development)

## 🏗️ Cấu trúc Frontend

```
apps/frontend/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── admin/               # Admin dashboard
│   │   ├── login/               # Authentication pages
│   │   ├── questions/           # Question management
│   │   └── api/                 # API routes (if any)
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── auth/                # Authentication components
│   │   ├── admin/               # Admin-specific components
│   │   ├── question/            # Question-related components
│   │   └── layout/              # Layout components
│   ├── services/grpc/           # gRPC-Web client services
│   │   ├── auth.service.ts      # Authentication service
│   │   ├── question.service.ts  # Question service
│   │   └── admin.service.ts     # Admin service
│   ├── generated/               # Generated protobuf code
│   │   ├── user.ts              # User service types
│   │   ├── common.ts            # Common types
│   │   └── v1/                  # API version 1 types
│   ├── contexts/                # React contexts
│   │   ├── auth-context.tsx     # Authentication context
│   │   └── modal-context.tsx    # Modal management
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities & configurations
│   └── types/                   # TypeScript type definitions
├── package.json                 # Dependencies & scripts
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
└── tsconfig.json               # TypeScript config
```

## 🚀 Development Commands

### Development Server
```bash
cd apps/frontend

# Development modes
pnpm dev                    # Standard development (port 3000)
pnpm dev:fast              # With Turbo mode
pnpm dev:verbose           # With detailed logs
pnpm dev:debug             # With Node.js inspector
pnpm dev:clean             # Clean cache + fast dev
```

### Build & Production
```bash
pnpm build                 # Production build
pnpm build:fast           # Fast build (no lint)
pnpm build:analyze        # Build with bundle analyzer
pnpm start                # Start production server
```

### Code Quality
```bash
pnpm lint                 # ESLint check
pnpm lint:fix            # Auto-fix ESLint issues
pnpm type-check          # TypeScript validation
pnpm type-check:watch    # Watch mode type checking

# Specific linting
pnpm lint:components     # Lint components only
pnpm lint:hooks         # Lint hooks only
pnpm lint:api           # Lint API routes only
```

### Performance & Optimization
```bash
pnpm clean               # Clean build artifacts
pnpm clean:cache        # Clean Next.js cache
pnpm perf:build         # Measure build performance
pnpm perf:dev           # Measure dev startup time
```

## 🔧 gRPC-Web Integration

### Service Generation
```powershell
# Generate TypeScript code from proto files
../../scripts/development/gen-proto-web.ps1
```

### gRPC Client Services (src/services/grpc/)

#### Authentication Service (auth.service.ts)
```typescript
import { UserServiceClient } from '@/generated/v1/user_grpc_web_pb';
import { LoginRequest, LoginResponse } from '@/generated/v1/user_pb';

class AuthService {
  private client: UserServiceClient;

  constructor() {
    this.client = new UserServiceClient('http://localhost:8080');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const request = new LoginRequest();
    request.setEmail(email);
    request.setPassword(password);

    return new Promise((resolve, reject) => {
      this.client.login(request, {}, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }
}
```

#### Question Service (question.service.ts)
```typescript
import { QuestionServiceClient } from '@/generated/v1/question_grpc_web_pb';
import { CreateQuestionRequest, GetQuestionRequest } from '@/generated/v1/question_pb';

class QuestionService {
  private client: QuestionServiceClient;

  constructor() {
    this.client = new QuestionServiceClient('http://localhost:8080');
  }

  async createQuestion(questionData: CreateQuestionRequest): Promise<Question> {
    // Implementation with proper error handling
  }

  async getQuestion(id: string): Promise<Question> {
    // Implementation with proper error handling
  }
}
```

## 🎨 UI Components & Styling

### Shadcn UI Components (src/components/ui/)
- `button.tsx` - Button component
- `input.tsx` - Input field
- `modal.tsx` - Modal dialog
- `table.tsx` - Data table
- `form.tsx` - Form components

### Component Structure
```typescript
// Example component structure
interface ComponentProps {
  // Props definition
}

export function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
}
```

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

## 🔐 Authentication System

### Auth Context (src/contexts/auth-context.tsx)
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Authentication logic with gRPC
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Protected Routes
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Route protection logic
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*']
};
```

## 📱 App Router Structure

### Layout System
```typescript
// app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Page Structure
```typescript
// app/admin/dashboard/page.tsx
export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1>Admin Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

## 🪝 Custom Hooks

### Common Hooks (src/hooks/)
- `useAuth()` - Authentication state
- `useDebounce()` - Debounced values
- `useLocalStorage()` - Local storage management
- `useQuestionFilters()` - Question filtering logic
- `useToast()` - Toast notifications

### Example Hook
```typescript
// hooks/useQuestionFilters.ts
export function useQuestionFilters() {
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const applyFilters = useCallback(async (newFilters: QuestionFilters) => {
    setLoading(true);
    try {
      // gRPC call to filter questions
      const result = await questionService.filterQuestions(newFilters);
      setQuestions(result.questions);
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { filters, questions, loading, applyFilters };
}
```

## 🔧 Configuration Files

### Next.js Configuration (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
  webpack: (config) => {
    // Custom webpack configuration for gRPC-Web
    return config;
  },
};

module.exports = nextConfig;
```

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## ⚠️ Common Issues & Solutions

### 1. gRPC-Web Generation Issues
```powershell
# Regenerate TypeScript code
../../scripts/development/gen-proto-web.ps1

# Check generated files
ls src/generated/
```

### 2. Next.js Build Issues
```bash
# Clear cache and rebuild
pnpm clean:cache
pnpm build

# Check for TypeScript errors
pnpm type-check
```

### 3. Styling Issues
```bash
# Rebuild Tailwind CSS
pnpm dev  # Tailwind rebuilds automatically in dev mode

# Check Tailwind configuration
npx tailwindcss --help
```

### 4. Authentication Issues
```typescript
// Check auth context provider
// Ensure AuthProvider wraps the app
// Verify token storage and retrieval
```

## 🧪 Testing

### Test Structure (Planned)
```bash
# Unit tests
src/components/__tests__/
src/hooks/__tests__/
src/services/__tests__/

# E2E tests
tests/e2e/
```

### Testing Commands
```bash
pnpm test              # Jest unit tests (when implemented)
pnpm test:e2e         # Playwright E2E tests (when implemented)
pnpm test:watch       # Watch mode testing
```

## 🔍 Debugging

### Development Tools
```bash
# Next.js debugging
pnpm dev:debug        # Start with Node.js inspector

# Performance monitoring
pnpm perf:monitor     # Monitor performance metrics
pnpm perf:report      # Generate performance report
```

### Browser DevTools
- React DevTools extension
- Network tab for gRPC-Web requests
- Console for error logging

## 📊 Performance Optimization

### Next.js Optimizations
- Use `next/image` for optimized images
- Implement code splitting with dynamic imports
- Use `next/font` for font optimization
- Enable compression and caching

### React Optimizations
- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()` for expensive calculations
- Lazy load components with `React.lazy()`

---

**🚀 Quick Development Setup:**
1. `cd apps/frontend`
2. `pnpm install`
3. `pnpm dev`
4. Open http://localhost:3000

**🔧 Before Committing:**
1. `pnpm type-check` - Validate TypeScript
2. `pnpm lint` - Check code quality
3. `pnpm build` - Test production build
4. Test key user flows manually
