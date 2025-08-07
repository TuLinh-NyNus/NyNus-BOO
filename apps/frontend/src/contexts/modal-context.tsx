'use client';

import React from 'react';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Interface cho Modal configuration
interface ModalConfig {
  id: string;
  title: string;
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
  footer?: ReactNode;
  className?: string;
}

// Interface cho Confirmation Modal
interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// Interface cho Modal Context
interface ModalContextType {
  modals: ModalConfig[];
  openModal: (config: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  // Convenience methods
  showConfirmation: (config: ConfirmationConfig) => Promise<boolean>;
  showAlert: (title: string, message: string) => Promise<void>;
}

// Tạo Context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  // Tạo unique ID cho modal
  const generateId = useCallback(() => {
    return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Mở modal mới
  const openModal = useCallback((config: Omit<ModalConfig, 'id'>) => {
    const id = generateId();
    const newModal: ModalConfig = {
      ...config,
      id,
      size: config.size ?? 'md',
      closable: config.closable ?? true
    };

    setModals(prev => [...prev, newModal]);
    return id;
  }, [generateId]);

  // Đóng modal theo ID
  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id);
      if (modal?.onClose) {
        modal.onClose();
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  // Đóng tất cả modals
  const closeAllModals = useCallback(() => {
    modals.forEach(modal => {
      if (modal.onClose) {
        modal.onClose();
      }
    });
    setModals([]);
  }, [modals]);

  // Show confirmation dialog
  const showConfirmation = useCallback((config: ConfirmationConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = async () => {
        try {
          await config.onConfirm();
          resolve(true);
        } catch (error) {
          console.error('Confirmation action failed:', error);
          resolve(false);
        }
        closeModal(modalId);
      };

      const handleCancel = () => {
        if (config.onCancel) {
          config.onCancel();
        }
        resolve(false);
        closeModal(modalId);
      };

      const modalId = openModal({
        title: config.title,
        content: (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              {config.message}
            </p>
          </div>
        ),
        footer: (
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {config.cancelText ?? 'Hủy'}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                config.type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : config.type === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {config.confirmText ?? 'Xác nhận'}
            </button>
          </div>
        ),
        size: 'sm',
        closable: false
      });
    });
  }, [openModal, closeModal]);

  // Show alert dialog
  const showAlert = useCallback((title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      const handleClose = () => {
        resolve();
        closeModal(modalId);
      };

      const modalId = openModal({
        title,
        content: (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>
        ),
        footer: (
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Đóng
            </button>
          </div>
        ),
        size: 'sm'
      });
    });
  }, [openModal, closeModal]);

  const contextValue: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    showConfirmation,
    showAlert
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
}

// Custom hook để sử dụng Modal Context
export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  
  return context;
}

// Export types
export type { ModalConfig, ConfirmationConfig, ModalContextType };

