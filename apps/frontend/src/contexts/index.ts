/**
 * Contexts Index
 *
 * Central export file cho tất cả contexts
 */

// Authentication Context
export { AuthProvider, useAuth } from './auth-context-grpc';
export type { User } from '@/lib/types/user';

// Notification Context
export { NotificationProvider, useNotification } from './notification-context';
export type { Notification, NotificationContextType } from './notification-context';

// Modal Context
export { ModalProvider, useModal } from './modal-context';
export type { ModalConfig, ConfirmationConfig, ModalContextType } from './modal-context';
