/**
 * useLocalStorage Hook
 * Custom hook để quản lý localStorage một cách an toàn và tái sử dụng
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types/question';

/**
 * Custom hook để quản lý localStorage
 * @param key - Key trong localStorage
 * @param initialValue - Giá trị khởi tạo
 * @returns [value, setValue, remove, refresh] - Tuple gồm giá trị, setter, remove function và refresh function
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void, () => void] {
  // State để lưu giá trị
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load initial value from localStorage
  useEffect(() => {
    if (!isClient) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  // Set value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage only on client side
        if (isClient && typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch storage event for other components
          window.dispatchEvent(new Event('storage'));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, isClient]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (isClient && typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, isClient]);

  // Refresh value from localStorage
  const refreshValue = useCallback(() => {
    if (!isClient) return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(`Error refreshing localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue, isClient]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          console.error('Error parsing storage event value');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isClient]);

  return [storedValue, setValue, removeValue, refreshValue];
}

/**
 * Interface cho saved questions data structure
 */
export interface SavedQuestionsData {
  questions: Question[];
  lastUpdated: string;
}

/**
 * Custom hook specifically for managing saved questions
 */
export function useSavedQuestions() {
  const initialData: SavedQuestionsData = {
    questions: [],
    lastUpdated: new Date().toISOString()
  };

  const [data, setData, clearAll, refresh] = useLocalStorage<SavedQuestionsData>(
    'saved_questions',
    initialData
  );

  // Add a question
  const addQuestion = useCallback((question: Question) => {
    setData((prev) => ({
      questions: [...prev.questions, question],
      lastUpdated: new Date().toISOString()
    }));
  }, [setData]);

  // Remove a question by ID
  const removeQuestion = useCallback((questionId: string) => {
    setData((prev) => ({
      questions: prev.questions.filter(q => q.id !== questionId),
      lastUpdated: new Date().toISOString()
    }));
  }, [setData]);

  // Update a question
  const updateQuestion = useCallback((questionId: string, updatedQuestion: Partial<Question>) => {
    setData((prev) => ({
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updatedQuestion } : q
      ),
      lastUpdated: new Date().toISOString()
    }));
  }, [setData]);

  // Export questions to JSON file
  const exportToFile = useCallback(() => {
    try {
      const dataStr = JSON.stringify(data.questions, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `saved-questions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting questions:', error);
      return false;
    }
  }, [data.questions]);

  return {
    questions: data.questions,
    lastUpdated: data.lastUpdated,
    addQuestion,
    removeQuestion,
    updateQuestion,
    clearAll,
    refresh,
    exportToFile
  };
}
