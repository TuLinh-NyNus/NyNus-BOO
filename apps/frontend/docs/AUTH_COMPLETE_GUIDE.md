# Complete Authentication Guide - gRPC Implementation

## Overview
This guide covers the complete authentication system implementation using gRPC instead of REST API. All authentication operations are handled through gRPC services.

## ⚠️ Current Status
- **gRPC Auth Services**: Currently using stub implementations
- **Protobuf Generation**: Pending backend protobuf file generation  
- **NextAuth Integration**: Fully functional with Google OAuth
- **Real Implementation**: Will be available once backend provides protobuf files

## Architecture Overview

### Authentication Flow
```
User → NextAuth → gRPC Auth Service → Backend gRPC Server
     ↓
   Frontend Auth Context (gRPC-based)
     ↓
   Protected Components/Pages
```

### Key Components
1. **NextAuth Configuration**: OAuth and session management
2. **gRPC Auth Service**: Communication with backend
3. **Auth Context**: React context for state management
4. **Protected Routes**: Route protection logic

## Service Architecture

### gRPC Auth Service
Located at: `src/services/grpc/auth.service.ts`

```typescript
import { AuthService, AuthHelpers } from '@/services/grpc/auth.service';

// Example usage (currently returns stub data)
const response = await AuthService.login('user@example.com', 'password');
const user = response.getUser();
const accessToken = response.getAccessToken();
```

### Available Methods

#### Login with Email/Password
```typescript
AuthService.login(email: string, password: string): Promise<LoginResponse>
```

#### Register New User
```typescript
AuthService.register(
  email: string,
  password: string,
  name: string,
  role?: number,
  level?: number
): Promise<RegisterResponse>
```

#### Google OAuth Login
```typescript
AuthService.googleLogin(idToken: string): Promise<LoginResponse>
```

#### Refresh Access Token
```typescript
AuthService.refreshToken(refreshToken: string): Promise<RefreshTokenResponse>
```

#### Get Current User
```typescript
AuthService.getCurrentUser(): Promise<GetCurrentUserResponse>
```

### Auth Helper Functions
```typescript
// Save tokens
AuthHelpers.saveTokens(accessToken, refreshToken);

// Get stored tokens
const accessToken = AuthHelpers.getAccessToken();
const refreshToken = AuthHelpers.getRefreshToken();

// Clear tokens (logout)
AuthHelpers.clearTokens();

// Check authentication status
const isAuth = AuthHelpers.isAuthenticated();
```

## Auth Context Usage

### Setup in Your App
The auth context is already configured in `src/providers/app-providers.tsx`:

```tsx
import { AuthProvider } from '@/contexts/auth-context-grpc';

export function AppProviders({ children }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
```

### Using Auth Context in Components
```tsx
'use client';

import { useAuth } from '@/contexts/auth-context-grpc';

export function MyComponent() {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    login, 
    loginWithGoogle, 
    register, 
    logout 
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Authentication Methods

### 1. Email/Password Login
```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context-grpc';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // User will be redirected automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 2. Google OAuth Login
```tsx
'use client';

import { useAuth } from '@/contexts/auth-context-grpc';

export function GoogleLoginButton() {
  const { loginWithGoogle, isLoading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // User will be redirected automatically
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin} 
      disabled={isLoading}
      className="google-login-btn"
    >
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
```

### 3. User Registration
```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context-grpc';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      // User will be redirected automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>First Name:</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Last Name:</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        />
      </div>
      
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

## Route Protection

### Protecting Pages
```tsx
'use client';

import { useAuth } from '@/contexts/auth-context-grpc';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {user?.firstName}!</p>
    </div>
  );
}
```

### Role-Based Access Control
```tsx
'use client';

import { useAuth } from '@/contexts/auth-context-grpc';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || <div>Access denied</div>;
  }

  if (!allowedRoles.includes(user.role)) {
    return fallback || <div>Insufficient permissions</div>;
  }

  return <>{children}</>;
}

// Usage example
export function AdminPanel() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div>Admin-only content</div>
    </RoleGuard>
  );
}
```

## User Data Types

### User Interface
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // 'ADMIN' | 'TEACHER' | 'STUDENT'
  level?: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Auth Context Type
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}
```

## NextAuth Integration

### Configuration
Located at: `src/app/api/auth/[...nextauth]/route.ts`

Key features:
- Google OAuth provider
- JWT strategy  
- Custom callbacks for gRPC integration
- Session persistence

### Session Management
```tsx
'use client';

import { useSession } from 'next-auth/react';

export function SessionInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading session...</div>;
  
  if (status === 'unauthenticated') return <div>Not logged in</div>;

  return (
    <div>
      <p>NextAuth Session: {session?.user?.email}</p>
      <p>Backend Token: {session?.backendAccessToken ? 'Available' : 'Not available'}</p>
    </div>
  );
}
```

## Error Handling

### gRPC Authentication Errors
```typescript
import { isGrpcError, getGrpcErrorMessage } from '@/lib/grpc-error-handler';

try {
  await AuthService.login(email, password);
} catch (error) {
  if (isGrpcError(error)) {
    switch (error.code) {
      case 16: // UNAUTHENTICATED
        setError('Invalid email or password');
        break;
      case 6: // ALREADY_EXISTS
        setError('User already exists');
        break;
      case 7: // PERMISSION_DENIED
        setError('Account is disabled');
        break;
      default:
        setError(getGrpcErrorMessage(error));
    }
  } else {
    setError('An unexpected error occurred');
  }
}
```

### Common Error Scenarios
1. **Invalid Credentials**: User provides wrong email/password
2. **Account Disabled**: User account is deactivated
3. **Token Expired**: Access token needs refresh
4. **Network Error**: gRPC connection failed
5. **Server Error**: Backend service unavailable

## Security Best Practices

### Token Management
```typescript
// Always check token expiration
const isTokenValid = () => {
  const token = AuthHelpers.getAccessToken();
  if (!token) return false;
  
  // Add token expiration check logic here
  return true;
};

// Automatic token refresh
const ensureValidToken = async () => {
  if (!isTokenValid()) {
    const refreshToken = AuthHelpers.getRefreshToken();
    if (refreshToken) {
      try {
        const response = await AuthService.refreshToken(refreshToken);
        AuthHelpers.saveTokens(
          response.getAccessToken(), 
          response.getRefreshToken()
        );
      } catch (error) {
        // Refresh failed, redirect to login
        AuthHelpers.clearTokens();
        window.location.href = '/login';
      }
    }
  }
};
```

### Secure Storage
- Access tokens stored in `localStorage` (for development)
- Production should use secure HTTP-only cookies
- Sensitive data never stored in client-side storage
- Automatic token cleanup on logout

## Testing

### Unit Tests for Auth Service
```typescript
import { AuthService } from '@/services/grpc/auth.service';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const response = await AuthService.login('test@example.com', 'password');
    
    expect(response.getAccessToken()).toBeTruthy();
    expect(response.getUser()).toBeTruthy();
  });

  it('should handle login errors', async () => {
    try {
      await AuthService.login('invalid@example.com', 'wrongpassword');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should register new user', async () => {
    const response = await AuthService.register(
      'new@example.com',
      'password',
      'John Doe'
    );
    
    expect(response.getSuccess()).toBe(true);
  });
});
```

### Integration Tests
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/auth-context-grpc';

function TestComponent() {
  const { login, user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (user) return <div>Welcome {user.firstName}</div>;
  
  return (
    <button onClick={() => login('test@example.com', 'password')}>
      Login
    </button>
  );
}

test('auth context provides login functionality', async () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  // Test implementation here
});
```

## Migration Notes

### From REST to gRPC
1. **Service Layer**: Use `AuthService` instead of HTTP fetch calls
2. **Error Handling**: Use gRPC error codes instead of HTTP status codes
3. **Data Types**: Updated to match protobuf definitions
4. **Token Management**: Same localStorage approach for now

### Stub Implementation Notice
Currently using stub implementations because:
- Protobuf files not yet generated
- Backend gRPC auth services in development
- Allows frontend development to continue

### Next Steps for Real Implementation
1. Backend provides protobuf definitions
2. Generate TypeScript types from protobuf
3. Replace stub methods with real gRPC calls  
4. Update error handling for actual responses
5. Test end-to-end authentication flow

## Troubleshooting

### Common Issues

#### "useAuth must be used within an AuthProvider"
- Ensure component is wrapped in `AuthProvider`
- Check that `AuthProvider` is in your component tree
- Verify imports are from correct auth context file

#### Build errors with protobuf imports
- Currently expected due to missing protobuf files
- Using stub implementations to prevent build failures
- Will be resolved when backend provides protobuf files

#### Google OAuth not working
- Check NextAuth configuration
- Verify Google OAuth credentials
- Ensure proper redirect URLs configured

#### Token refresh failures
- Check refresh token validity
- Verify gRPC service connectivity
- Implement proper error handling for expired tokens

## Related Documentation
- [gRPC Migration Guide](./MIGRATION_REST_TO_GRPC_COMPLETE.md)
- [Question System Guide](./IMPLEMENT_QUESTION.md)
- [Rollback Guide](./ROLLBACK_GRPC_TO_REST.md)
- [Error Handling Guide](./ERROR_HANDLING.md)