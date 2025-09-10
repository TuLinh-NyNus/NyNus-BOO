'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

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

interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// 🔥 OPTIMIZATION: Split thành State và Actions
interface ModalState {
  modals: Map<string, ModalConfig>;
  hasModals: boolean;
  modalCount: number;
}

interface ModalActions {
  openModal: (config: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  showConfirmation: (config: ConfirmationConfig) => Promise<boolean>;
  showAlert: (title: string, message: string) => Promise<void>;
}

const ModalStateContext = createContext<ModalState | undefined>(undefined);
const ModalActionsContext = createContext<ModalActions | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  // 🔥 OPTIMIZATION: Sử dụng Map thay vì Array cho O(1) operations
  const [modals, setModals] = useState<Map<string, ModalConfig>>(new Map());
  const [modalCounter, setModalCounter] = useState<number>(0);

  // 🔥 OPTIMIZATION: Memoize state để prevent unnecessary re-renders
  const modalState = useMemo((): ModalState => ({
    modals,
    hasModals: modals.size > 0,
    modalCount: modals.size
  }), [modals]);

  // Stable ID generation
  const generateId = useCallback(() => {
    const id = `modal-${modalCounter}`;
    setModalCounter(prev => prev + 1);
    return id;
  }, [modalCounter]);

  // 🔥 OPTIMIZATION: Memoize actions với stable references
  const modalActions = useMemo((): ModalActions => {
    const openModal = (config: Omit<ModalConfig, 'id'>): string => {
      const id = generateId();
      const newModal: ModalConfig = {
        ...config,
        id,
        size: config.size ?? 'md',
        closable: config.closable ?? true
      };

      // 🔥 OPTIMIZATION: Immutable update với Map
      setModals(prev => {
        const next = new Map(prev);
        next.set(id, newModal);
        return next;
      });
      
      return id;
    };

    const closeModal = (id: string): void => {
      setModals(prev => {
        // Call onClose callback trước khi remove
        const modal = prev.get(id);
        if (modal?.onClose) {
          try {
            modal.onClose();
          } catch (error) {
            console.error('Error in modal onClose callback:', error);
          }
        }

        // 🔥 OPTIMIZATION: Early return nếu modal không exist
        if (!prev.has(id)) return prev;

        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    };

    const closeAllModals = (): void => {
      // Call tất cả onClose callbacks trước
      modals.forEach(modal => {
        if (modal.onClose) {
          try {
            modal.onClose();
          } catch (error) {
            console.error('Error in modal onClose callback:', error);
          }
        }
      });

      setModals(new Map());
    };

    const showConfirmation = (config: ConfirmationConfig): Promise<boolean> => {
      return new Promise((resolve) => {
        // eslint-disable-next-line prefer-const
        let modalId: string;

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

        modalId = openModal({
          title: config.title,
          content: (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {config.message}
              </p>
            </div>
          ),
          footer: (
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
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
    };

    const showAlert = (title: string, message: string): Promise<void> => {
      return new Promise((resolve) => {
        const handleClose = (id: string) => {
          resolve();
          closeModal(id);
        };

        const modalId = openModal({
          title,
          content: (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
          ),
          footer: (
            <div className="flex justify-end">
              <button
                onClick={() => handleClose(modalId)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Đóng
              </button>
            </div>
          ),
          size: 'sm'
        });
      });
    };

    return {
      openModal,
      closeModal,
      closeAllModals,
      showConfirmation,
      showAlert
    };
  }, [generateId, modals]);

  return (
    <ModalStateContext.Provider value={modalState}>
      <ModalActionsContext.Provider value={modalActions}>
        {children}
      </ModalActionsContext.Provider>
    </ModalStateContext.Provider>
  );
}

// Separate hooks cho better performance
export function useModalState(): ModalState {
  const context = useContext(ModalStateContext);
  if (context === undefined) {
    throw new Error('useModalState must be used within a ModalProvider');
  }
  return context;
}

export function useModalActions(): ModalActions {
  const context = useContext(ModalActionsContext);
  if (context === undefined) {
    throw new Error('useModalActions must be used within a ModalProvider');
  }
  return context;
}

// Backwards compatibility
export function useModal() {
  const state = useModalState();
  const actions = useModalActions();
  return { 
    modals: Array.from(state.modals.values()), // Convert Map to Array cho backwards compatibility
    hasModals: state.hasModals,
    modalCount: state.modalCount,
    ...actions 
  };
}

export type { ModalConfig, ConfirmationConfig, ModalState, ModalActions };
