/**
 * Contexts Index
 *
 * Central export file cho tất cả contexts
 */

// Authentication Context
export { AuthProvider, useAuth } from './auth-context';
export type { User, AuthContextType } from './auth-context';

// Notification Context
export { NotificationProvider, useNotification } from './notification-context';
export type { Notification, NotificationContextType } from './notification-context';

// Modal Context
export { ModalProvider, useModal } from './modal-context';
export type { ModalConfig, ConfirmationConfig, ModalContextType } from './modal-context';
