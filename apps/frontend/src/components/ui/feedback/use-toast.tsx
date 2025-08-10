'use client';

// NyNus Toast hook implementation (single source of truth)
// Technical comments are in English; UI text elsewhere remains Vietnamese per standards

import * as React from 'react';
import type { ToastActionElement } from '@/components/ui/feedback/toast';

// Toaster toast shape used internally by the store
export interface ToasterToast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  // presentation
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  className?: string;
  // state flags
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Constants
const TOAST_LIMIT = 3; // Max number of concurrent toasts
const TOAST_REMOVE_DELAY = 10000; // Auto-dismiss after 10s

// Store action types
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

// ID generator
let count = 0;
function generateId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Toast store state
interface State {
  toasts: ToasterToast[];
}

// Toast store actions
type Action =
  | { type: typeof actionTypes.ADD_TOAST; toast: ToasterToast }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: Partial<ToasterToast> & { id: string } }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId?: string }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId?: string };

// Reducer to manipulate state
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.ADD_TOAST: {
      const nextToasts = [action.toast, ...state.toasts];
      return { toasts: nextToasts.slice(0, TOAST_LIMIT) };
    }
    case actionTypes.UPDATE_TOAST: {
      return {
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };
    }
    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;
      return {
        toasts: state.toasts.map((t) => (toastId && t.id !== toastId ? t : { ...t, open: false })),
      };
    }
    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action;
      return { toasts: toastId ? state.toasts.filter((t) => t.id !== toastId) : [] };
    }
    default:
      return state;
  }
}

// Simple pub/sub to sync all hook instances
let memoryState: State = { toasts: [] };
const listeners = new Set<(state: State) => void>();

function dispatch(action: Action): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

// Public API: toast creator
interface ToastPayload {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  action?: ToastActionElement;
  className?: string;
}

export function toast(props: ToastPayload): { id: string; dismiss: () => void; update: (next: ToasterToast) => void } {
  const id = generateId();

  const update = (next: ToasterToast) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...next, id } });

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  // Auto close timer
  const timer = setTimeout(() => {
    dismiss();
  }, props.duration ?? TOAST_REMOVE_DELAY);

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          clearTimeout(timer);
          dismiss();
        }
      },
    },
  });

  return { id, dismiss, update };
}

// Public API: hook to subscribe to toasts
export function useToast(): { toasts: ToasterToast[]; toast: typeof toast; dismiss: (toastId?: string) => void } {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
    // Physically remove after small delay so exit animation can play
    setTimeout(() => dispatch({ type: actionTypes.REMOVE_TOAST, toastId }), 200);
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
  };
}

