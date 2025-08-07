/**
 * Loading State Manager
 * 
 * Quản lý trạng thái loading toàn diện cho ứng dụng
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface LoadingState {
  id: string;
  message: string;
  progress?: number;
  canCancel?: boolean;
  onCancel?: () => void;
  startTime: number;
  timeout?: number;
}

interface LoadingStore {
  // State
  loadingStates: Map<string, LoadingState>;
  globalLoading: boolean;
  
  // Actions
  startLoading: (id: string, message: string, options?: Partial<LoadingState>) => void;
  updateLoading: (id: string, updates: Partial<LoadingState>) => void;
  stopLoading: (id: string) => void;
  stopAllLoading: () => void;
  isLoading: (id?: string) => boolean;
  getLoadingState: (id: string) => LoadingState | undefined;
  getAllLoadingStates: () => LoadingState[];
}

/**
 * Loading State Store
 */
export const useLoadingStore = create<LoadingStore>()(
  subscribeWithSelector((set, get) => ({
    loadingStates: new Map(),
    globalLoading: false,

    startLoading: (id, message, options = {}) => {
      set((state) => {
        const newStates = new Map(state.loadingStates);
        
        const loadingState: LoadingState = {
          id,
          message,
          startTime: Date.now(),
          progress: options.progress,
          canCancel: options.canCancel,
          onCancel: options.onCancel,
          timeout: options.timeout
        };

        newStates.set(id, loadingState);

        // Setup timeout if specified
        if (options.timeout) {
          setTimeout(() => {
            get().stopLoading(id);
          }, options.timeout);
        }

        return {
          loadingStates: newStates,
          globalLoading: newStates.size > 0
        };
      });
    },

    updateLoading: (id, updates) => {
      set((state) => {
        const newStates = new Map(state.loadingStates);
        const existingState = newStates.get(id);
        
        if (existingState) {
          newStates.set(id, { ...existingState, ...updates });
        }

        return {
          loadingStates: newStates
        };
      });
    },

    stopLoading: (id) => {
      set((state) => {
        const newStates = new Map(state.loadingStates);
        newStates.delete(id);

        return {
          loadingStates: newStates,
          globalLoading: newStates.size > 0
        };
      });
    },

    stopAllLoading: () => {
      set({
        loadingStates: new Map(),
        globalLoading: false
      });
    },

    isLoading: (id) => {
      const state = get();
      if (id) {
        return state.loadingStates.has(id);
      }
      return state.globalLoading;
    },

    getLoadingState: (id) => {
      return get().loadingStates.get(id);
    },

    getAllLoadingStates: () => {
      return Array.from(get().loadingStates.values());
    }
  }))
);

/**
 * Loading Manager Class
 */
export class LoadingManager {
  private static instance: LoadingManager;
  
  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  /**
   * Start loading với auto-generated ID
   */
  start(message: string, options?: Partial<LoadingState>): string {
    const id = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    useLoadingStore.getState().startLoading(id, message, options);
    return id;
  }

  /**
   * Start loading với custom ID
   */
  startWithId(id: string, message: string, options?: Partial<LoadingState>): void {
    useLoadingStore.getState().startLoading(id, message, options);
  }

  /**
   * Update loading progress
   */
  updateProgress(id: string, progress: number, message?: string): void {
    const updates: Partial<LoadingState> = { progress };
    if (message) updates.message = message;
    
    useLoadingStore.getState().updateLoading(id, updates);
  }

  /**
   * Update loading message
   */
  updateMessage(id: string, message: string): void {
    useLoadingStore.getState().updateLoading(id, { message });
  }

  /**
   * Stop loading
   */
  stop(id: string): void {
    useLoadingStore.getState().stopLoading(id);
  }

  /**
   * Stop all loading
   */
  stopAll(): void {
    useLoadingStore.getState().stopAllLoading();
  }

  /**
   * Check if loading
   */
  isLoading(id?: string): boolean {
    return useLoadingStore.getState().isLoading(id);
  }

  /**
   * Get loading state
   */
  getState(id: string): LoadingState | undefined {
    return useLoadingStore.getState().getLoadingState(id);
  }

  /**
   * Execute function với loading state
   */
  async withLoading<T>(
    message: string,
    fn: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>,
    options?: Partial<LoadingState>
  ): Promise<T> {
    const id = this.start(message, options);
    
    try {
      const updateProgress = (progress: number, newMessage?: string) => {
        this.updateProgress(id, progress, newMessage);
      };

      const result = await fn(updateProgress);
      return result;
    } finally {
      this.stop(id);
    }
  }

  /**
   * Execute function với loading state và custom ID
   */
  async withLoadingId<T>(
    id: string,
    message: string,
    fn: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>,
    options?: Partial<LoadingState>
  ): Promise<T> {
    this.startWithId(id, message, options);
    
    try {
      const updateProgress = (progress: number, newMessage?: string) => {
        this.updateProgress(id, progress, newMessage);
      };

      const result = await fn(updateProgress);
      return result;
    } finally {
      this.stop(id);
    }
  }
}

// Global loading manager instance
export const loadingManager = LoadingManager.getInstance();

/**
 * React Hook để sử dụng loading manager
 */
export function useLoadingManager():  {
  isGlobalLoading: boolean;
  loadingStates: LoadingState[];
  startLoading: (message: string, options?: Partial<LoadingState>) => string;
  startLoadingWithId: (id: string, message: string, options?: Partial<LoadingState>) => void;
  updateProgress: (id: string, progress: number, message?: string) => void;
  updateMessage: (id: string, message: string) => void;
  stopLoading: (id: string) => void;
  stopAllLoading: () => void;
  isLoading: (id?: string) => boolean;
  getLoadingState: (id: string) => LoadingState | undefined;
  withLoading: <T>(message: string, fn: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>, options?: Partial<LoadingState>) => Promise<T>;
  withLoadingId: <T>(id: string, message: string, fn: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>, options?: Partial<LoadingState>) => Promise<T>;
} {
  const store = useLoadingStore();
  
  return {
    // State
    isGlobalLoading: store.globalLoading,
    loadingStates: store.getAllLoadingStates(),
    
    // Actions
    startLoading: (message: string, options?: Partial<LoadingState>) => 
      loadingManager.start(message, options),
    
    startLoadingWithId: (id: string, message: string, options?: Partial<LoadingState>) => 
      loadingManager.startWithId(id, message, options),
    
    updateProgress: (id: string, progress: number, message?: string) => 
      loadingManager.updateProgress(id, progress, message),
    
    updateMessage: (id: string, message: string) => 
      loadingManager.updateMessage(id, message),
    
    stopLoading: (id: string) => loadingManager.stop(id),
    
    stopAllLoading: () => loadingManager.stopAll(),
    
    isLoading: (id?: string) => loadingManager.isLoading(id),
    
    getLoadingState: (id: string) => loadingManager.getState(id),
    
    withLoading: <T>(
      message: string,
      fn: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>,
      options?: Partial<LoadingState>
    ) => loadingManager.withLoading(message, fn, options),
    
    withLoadingId: <T>(
      id: string,
      message: string,
      fn: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>,
      options?: Partial<LoadingState>
    ) => loadingManager.withLoadingId(id, message, fn, options)
  };
}

/**
 * Predefined loading contexts cho auth operations
 */
export const AuthLoadingContexts = {
  LOGIN: 'auth-login',
  REGISTER: 'auth-register',
  LOGOUT: 'auth-logout',
  REFRESH_TOKEN: 'auth-refresh',
  PASSWORD_RESET: 'auth-password-reset',
  EMAIL_VERIFICATION: 'auth-email-verification',
  PROFILE_UPDATE: 'auth-profile-update'
} as const;

export type AuthLoadingContext = typeof AuthLoadingContexts[keyof typeof AuthLoadingContexts];
