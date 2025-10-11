/**
 * Authentication Components Barrel Export
 * Central export file for all authentication-related components
 */

// Form Components
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { ForgotPasswordForm } from './ForgotPasswordForm';

// Modal Components
export { AuthModal, useAuthModal } from './AuthModal';

// Protection Components
export { ProtectedRoute, withProtectedRoute, useAccessControl } from './ProtectedRoute';

// Existing Components
export { RoleBadge } from './RoleBadge';
export type { UserRole } from './RoleBadge';
export { LevelIndicator } from './LevelIndicator';

// Re-export auth form types for convenience
export type { LoginFormData, RegisterFormData, ForgotPasswordFormData } from '@/lib/validation/auth-schemas';