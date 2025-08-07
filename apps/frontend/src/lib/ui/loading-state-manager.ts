'use client';

import { useState, useEffect } from 'react';

// Loading state manager for UI components
export interface LoadingState {
  id: string;
  isLoading: boolean;
  message?: string;
  progress?: number;
  startTime: number;
  timeout?: number;
  canCancel?: boolean;
  onCancel?: () => void;
}

export class LoadingStateManager {
  private static instance: LoadingStateManager;
  private loadingStates: Map<string, LoadingState> = new Map();
  private listeners: Set<(states: Map<string, LoadingState>) => void> = new Set();

  static getInstance(): LoadingStateManager {
    if (!LoadingStateManager.instance) {
      LoadingStateManager.instance = new LoadingStateManager();
    }
    return LoadingStateManager.instance;
  }

  setLoading(key: string, state: LoadingState): void {
    this.loadingStates.set(key, state);
    this.notifyListeners();
  }

  getLoading(key: string): LoadingState | undefined {
    return this.loadingStates.get(key);
  }

  clearLoading(key: string): void {
    this.loadingStates.delete(key);
    this.notifyListeners();
  }

  subscribe(listener: (states: Map<string, LoadingState>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.loadingStates));
  }
}

export const loadingStateManager = LoadingStateManager.getInstance();

// React hook for using loading state
export function useLoadingStore() {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());

  useEffect(() => {
    const unsubscribe = loadingStateManager.subscribe((states) => {
      setLoadingStates(new Map(states));
    });

    return unsubscribe;
  }, []);

  const startLoading = (id: string, options: Partial<LoadingState> = {}) => {
    const state: LoadingState = {
      id,
      isLoading: true,
      startTime: Date.now(),
      ...options,
    };
    loadingStateManager.setLoading(id, state);
  };

  const stopLoading = (id: string) => {
    loadingStateManager.clearLoading(id);
  };

  const updateLoading = (id: string, updates: Partial<LoadingState>) => {
    const currentState = loadingStateManager.getLoading(id);
    if (currentState) {
      loadingStateManager.setLoading(id, { ...currentState, ...updates });
    }
  };

  const globalLoading = loadingStates.size > 0;

  return {
    loadingStates: Array.from(loadingStates.values()),
    globalLoading,
    startLoading,
    stopLoading,
    updateLoading,
  };
}
