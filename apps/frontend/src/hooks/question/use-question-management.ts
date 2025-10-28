/**
 * Question Management Hook
 * ========================
 * React hook for managing Question CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Question,
  QuestionDetail,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ListQuestionsRequest,
  ListQuestionsByFilterRequest,
  QuestionType,
  QuestionStatus,
  QuestionDifficulty
} from '@/types/question.types';
import { QuestionService } from '@/services/grpc/question.service';
import { QuestionFilterService } from '@/services/grpc/question-filter.service';

// ========================================
// INTERFACES & TYPES
// ========================================

export interface QuestionFilters {
  // Basic filters
  search?: string;
  type?: QuestionType[];
  status?: QuestionStatus[];
  difficulty?: QuestionDifficulty[];
  creator?: string;
  
  // QuestionCode filters
  grades?: string[];
  subjects?: string[];
  chapters?: string[];
  levels?: string[];
  lessons?: string[];
  
  // Advanced filters
  tags?: string[];
  has_solution?: boolean;
  min_usage_count?: number;
  max_usage_count?: number;
  date_from?: string;
  date_to?: string;
}

export interface QuestionManagementState {
  // Data
  questions: QuestionDetail[];
  selectedQuestion: Question | null;
  totalCount: number;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // UI States
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isImporting: boolean;
  
  // Filters & Search
  filters: QuestionFilters;
  searchQuery: string;
  
  // Error handling
  error: string | null;
}

export interface UseQuestionManagementReturn extends QuestionManagementState {
  // CRUD Operations
  createQuestion: (data: CreateQuestionRequest) => Promise<void>;
  getQuestion: (id: string) => Promise<void>;
  updateQuestion: (data: UpdateQuestionRequest) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  
  // List Operations
  loadQuestions: (request?: ListQuestionsRequest) => Promise<void>;
  refreshQuestions: () => Promise<void>;
  searchQuestions: (query: string) => Promise<void>;
  
  // Filter Operations
  applyFilters: (filters: QuestionFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
  
  // Import Operations
  importQuestions: (csvData: string, upsertMode?: boolean) => Promise<unknown>;
  
  // UI Helpers
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  clearError: () => void;
  resetSelection: () => void;
}

// ========================================
// HOOK IMPLEMENTATION
// ========================================

export function useQuestionManagement(
  initialPageSize: number = 20
): UseQuestionManagementReturn {
  // ===== STATE =====
  const [state, setState] = useState<QuestionManagementState>({
    questions: [],
    selectedQuestion: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: initialPageSize,
    isLoading: false,
    isRefreshing: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isImporting: false,
    filters: {},
    searchQuery: '',
    error: null,
  });
  
  // ===== HELPER FUNCTIONS =====
  
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);
  
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);
  
  const updateState = useCallback((updates: Partial<QuestionManagementState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // ===== LIST OPERATIONS (declare before used by CRUD callbacks) =====
  
  const loadQuestions = useCallback(async (request?: ListQuestionsRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      // MIGRATION: Use QuestionFilterService with proper filter structure
      const filterRequest: ListQuestionsByFilterRequest = {
        page: state.currentPage,
        limit: state.pageSize,
        ...(request || {})
      };
      
      const response = await QuestionFilterService.listQuestionsByFilter(filterRequest);
      
      // Response from QuestionFilterService has different structure
      updateState({
        questions: (response.questions || []).map((q: Record<string, unknown>) => ({
          ...q,
          tags: q.tags || q.tag || [],
          answers: q.answers || '',
          correct_answer: q.correct_answer || q.correctAnswer || '',
        })) as QuestionDetail[],
        totalCount: response.total_count || response.totalCount || 0,
        totalPages: response.total_pages || response.totalPages || 1,
        currentPage: response.page || state.currentPage,
      });
    } catch (error) {
      console.error('Load questions error:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [state.currentPage, state.pageSize, setLoading, setError, updateState]);
  
  // ===== CRUD OPERATIONS =====
  
  const createQuestion = useCallback(async (data: CreateQuestionRequest) => {
    try {
      updateState({ isCreating: true, error: null });
      
      const response = await QuestionService.createQuestion(data);
      
      if (response.success) {
        // Refresh questions list after creation
        await loadQuestions();
      } else {
        throw new Error(response.message || 'Failed to create question');
      }
    } catch (error) {
      console.error('Create question error:', error);
      setError((error as Error).message);
      throw error;
    } finally {
      updateState({ isCreating: false });
    }
  }, [updateState, loadQuestions, setError]);
  
  const getQuestion = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await QuestionService.getQuestion({ id });
      
      if (response.success && response.question) {
        updateState({ selectedQuestion: response.question });
      } else {
        throw new Error(response.message || 'Failed to get question');
      }
    } catch (error) {
      console.error('Get question error:', error);
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);
  
  const updateQuestion = useCallback(async (data: UpdateQuestionRequest) => {
    try {
      updateState({ isUpdating: true, error: null });
      
      const response = await QuestionService.updateQuestion(data);
      
      if (response.success) {
        // Update selected question and refresh list
        if (response.question) {
          updateState({ selectedQuestion: response.question });
        }
        await loadQuestions();
      } else {
        throw new Error(response.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Update question error:', error);
      setError((error as Error).message);
      throw error;
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState, loadQuestions, setError]);
  
  const deleteQuestion = useCallback(async (id: string) => {
    try {
      updateState({ isDeleting: true, error: null });
      
      const response = await QuestionService.deleteQuestion({ id });
      
      if (response.success) {
        // Clear selection if deleted question was selected
        setState(prev => ({
          ...prev,
          selectedQuestion: prev.selectedQuestion?.id === id ? null : prev.selectedQuestion
        }));
        // Refresh questions list
        await loadQuestions();
      } else {
        throw new Error(response.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Delete question error:', error);
      setError((error as Error).message);
      throw error;
    } finally {
      updateState({ isDeleting: false });
    }
  }, [updateState, loadQuestions, setError]);
  
  // ===== LIST OPERATIONS =====
  // (moved earlier above CRUD section to avoid use-before-declare issues)
  
  const refreshQuestions = useCallback(async () => {
    try {
      updateState({ isRefreshing: true });
      await loadQuestions();
    } finally {
      updateState({ isRefreshing: false });
    }
  }, [loadQuestions, updateState]);
  
  const searchQuestions = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      updateState({ searchQuery: query });
      
      if (!query.trim()) {
        await loadQuestions();
        return;
      }
      
      const response = await QuestionFilterService.quickSearch(query, {
        page: state.currentPage,
        limit: state.pageSize,
      });
      
      if (response.success) {
        updateState({
          questions: response.questions,
          totalCount: response.total_count,
          totalPages: response.total_pages,
          currentPage: response.page,
        });
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search questions error:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loadQuestions, state.currentPage, state.pageSize, setLoading, setError, updateState]);
  
  // ===== FILTER OPERATIONS =====
  
  const applyFilters = useCallback(async (filters: QuestionFilters) => {
    try {
      setLoading(true);
      setError(null);
      updateState({ filters, currentPage: 1 });
      
      const request: ListQuestionsByFilterRequest = {
        // questionCodeFilter: { // Not part of ListQuestionsByFilterRequest
        //   grades: filters.grades,
        //   subjects: filters.subjects,
        //   chapters: filters.chapters,
        //   levels: filters.levels,
        //   lessons: filters.lessons,
        // },
        // metadata_filter: { // Not part of ListQuestionsByFilterRequest
        //   types: filters.type,
        //   statuses: filters.status,
        //   difficulties: filters.difficulty,
        //   creators: filters.creator ? [filters.creator] : undefined,
        //   tags: filters.tags,
        //   min_usage_count: filters.min_usage_count,
        //   max_usage_count: filters.max_usage_count,
        // },
        // content_filter: { // Not part of ListQuestionsByFilterRequest
        //   has_solution: filters.has_solution,
        //   content_search: filters.search,
        // },
        // date_filter: filters.date_from || filters.date_to ? { // Not part of ListQuestionsByFilterRequest
        //   created_after: filters.date_from,
        //   created_before: filters.date_to,
        // } : undefined,
        // pagination: { // Not part of ListQuestionsByFilterRequest
        //   page: 1,
        //   limit: state.pageSize,
        //   sort: [{ field: 'created_at', order: 'desc' }],
        // },
      };
      
      const response = await QuestionFilterService.listQuestionsByFilter(request);
      
      if (response.success) {
        updateState({
          questions: response.questions,
          totalCount: response.total_count,
          totalPages: response.total_pages,
          currentPage: response.page,
        });
      } else {
        throw new Error(response.message || 'Filter failed');
      }
    } catch (error) {
      console.error('Apply filters error:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);
  
  const clearFilters = useCallback(async () => {
    updateState({ 
      filters: {}, 
      searchQuery: '', 
      currentPage: 1 
    });
    await loadQuestions();
  }, [loadQuestions, updateState]);
  
  // ===== IMPORT OPERATIONS =====
  
  const importQuestions = useCallback(async (csvData: string, upsertMode: boolean = false) => {
    try {
      updateState({ isImporting: true, error: null });
      
      // Convert CSV data to base64
      const base64Data = btoa(csvData);
      
      const response = await QuestionService.importQuestions({
        csv_data_base64: base64Data,
        upsert_mode: upsertMode,
      });
      
      if (response.success) {
        // Refresh questions list after import
        await loadQuestions();
        return response;
      } else {
        throw new Error(response.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import questions error:', error);
      setError((error as Error).message);
      throw error;
    } finally {
      updateState({ isImporting: false });
    }
  }, [loadQuestions, updateState, setError]);
  
  // ===== UI HELPERS =====
  
  const setSearchQuery = useCallback((query: string) => {
    updateState({ searchQuery: query });
  }, [updateState]);
  
  const setCurrentPage = useCallback((page: number) => {
    updateState({ currentPage: page });
  }, [updateState]);
  
  const setPageSize = useCallback((size: number) => {
    updateState({ pageSize: size, currentPage: 1 });
  }, [updateState]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);
  
  const resetSelection = useCallback(() => {
    updateState({ selectedQuestion: null });
  }, [updateState]);
  
  // ===== EFFECTS =====
  
  // Load initial data
  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPage, state.pageSize]);
  
  // ===== RETURN =====
  
  return {
    // State
    ...state,
    
    // CRUD Operations
    createQuestion,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    
    // List Operations
    loadQuestions,
    refreshQuestions,
    searchQuestions,
    
    // Filter Operations
    applyFilters,
    clearFilters,
    
    // Import Operations
    importQuestions,
    
    // UI Helpers
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    clearError,
    resetSelection,
  };
}