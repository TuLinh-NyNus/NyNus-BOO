// Toast types
type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
}

// Export ToasterToast as alias for Toast
export type ToasterToast = Toast;

// Toast function
export const toast = (props: Omit<Toast, 'id'>) => {
  console.log('Toast:', props);
  // In a real implementation, this would show a toast notification
};

// Simple useToast hook implementation
export function useToast() {
  return {
    toast,
    dismiss: (toastId: string) => {
      console.log('Dismiss toast:', toastId);
    },
    toasts: [] as Toast[]
  };
}
