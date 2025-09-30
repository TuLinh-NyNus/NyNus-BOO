/**
 * Question Store
 * Zustand store for comprehensive question state management
 * Manages questions list, selected question, and integrates with gRPC services
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-21
 */

'use client';

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { 
  type Question, 
  type QuestionDraft,
  type QuestionPagination,
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  type QuestionFilters
} from '@/types/question';

import { QuestionService } from '@/services/grpc/question.service';
import { toast } from 'sonner';
import {
  createGetRequest,
  createUpdateRequest,
  createDeleteRequest,
  createListRequest,
  draftToCreateRequest,
  parseListResponse,
  parseCreateResponse,
  parseGetResponse,
  parseUpdateResponse,
  parseDeleteResponse,
} from '@/lib/adapters/question.adapter';
import { SelectionState, CacheEntry, createInitialSelectionState } from '@/lib/stores/shared/store-patterns';

// ===== STORE INTERFACES =====

export type QuestionViewMode = 'list' | 'grid' | 'detail' | 'preview';

interface QuestionStoreState {
  // Questions data
  questions: Question[];
  selectedQuestion: Question | null;
  draftQuestion: QuestionDraft | null;
  
  // Cache management
  questionCache: Map<string, CacheEntry<Question>>;
  cacheSize: number;
  maxCacheSize: number;

  // Pagination state
  pagination: QuestionPagination;

  // Selection state
  selection: SelectionState<string>;
  
  // View state
  viewMode: QuestionViewMode;
  isDetailPanelOpen: boolean;
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error state
  error: string | null;
  fieldErrors: Record<string, string>;
  
  // Statistics
  statistics: {
    totalQuestions: number;
    activeQuestions: number;
    pendingQuestions: number;
    archivedQuestions: number;
    questionsByType: Record<QuestionType, number>;
    questionsByDifficulty: Record<QuestionDifficulty, number>;
  };
  
  // Search & Filter
  lastAppliedFilters: QuestionFilters | null;
  
  // === ACTIONS ===
  
  // Question CRUD operations
  fetchQuestions: (filters?: QuestionFilters, append?: boolean) => Promise<void>;
  fetchQuestionById: (id: string, forceRefresh?: boolean) => Promise<Question | null>;
  createQuestion: (draft: QuestionDraft) => Promise<Question | null>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<boolean>;
  deleteQuestion: (id: string) => Promise<boolean>;
  deleteMultipleQuestions: (ids: string[]) => Promise<boolean>;
  duplicateQuestion: (id: string) => Promise<Question | null>;
  
  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: QuestionStatus) => Promise<boolean>;
  bulkUpdateDifficulty: (ids: string[], difficulty: QuestionDifficulty) => Promise<boolean>;
  bulkAddTags: (ids: string[], tags: string[]) => Promise<boolean>;
  bulkRemoveTags: (ids: string[], tags: string[]) => Promise<boolean>;
  exportQuestions: (ids?: string[]) => Promise<Blob | null>;
  importQuestions: (file: File) => Promise<number>;
  
  // Selection actions
  selectQuestion: (id: string) => void;
  deselectQuestion: (id: string) => void;
  toggleQuestionSelection: (id: string) => void;
  selectAllQuestions: () => void;
  deselectAllQuestions: () => void;
  toggleSelectAll: () => void;
  selectQuestionRange: (fromId: string, toId: string) => void;
  
  // View actions
  setSelectedQuestion: (question: Question | null) => void;
  setViewMode: (mode: QuestionViewMode) => void;
  toggleDetailPanel: () => void;
  openDetailPanel: (questionId: string) => void;
  closeDetailPanel: () => void;
  
  // Draft actions
  setDraftQuestion: (draft: QuestionDraft | null) => void;
  updateDraftField: <K extends keyof QuestionDraft>(field: K, value: QuestionDraft[K]) => void;
  validateDraft: () => boolean;
  saveDraft: () => Promise<Question | null>;
  discardDraft: () => void;
  
  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Cache actions
  clearCache: () => void;
  pruneCache: () => void;
  setCacheSize: (size: number) => void;
  
  // Utility actions
  refreshQuestions: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldErrors: () => void;
  
  // Search & Sort actions
  applyFilters: (filters: QuestionFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
  sortQuestions: (sortBy: string, direction: 'asc' | 'desc') => void;
}

// ===== CONSTANTS =====

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_CACHE_SIZE = 100;

const INITIAL_STATISTICS = {
  totalQuestions: 0,
  activeQuestions: 0,
  pendingQuestions: 0,
  archivedQuestions: 0,
  questionsByType: {} as Record<QuestionType, number>,
  questionsByDifficulty: {} as Record<QuestionDifficulty, number>,
};

const INITIAL_PAGINATION: QuestionPagination = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

// ===== UTILITY FUNCTIONS =====

function isCacheValid(entry: CacheEntry<Question>): boolean {
  return entry.expiresAt ? Date.now() < entry.expiresAt : !entry.isStale;
}

function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

function sortQuestionsArray(
  questions: Question[], 
  sortBy: string, 
  direction: 'asc' | 'desc'
): Question[] {
  return [...questions].sort((a, b) => {
    let aVal: unknown = a[sortBy as keyof Question];
    let bVal: unknown = b[sortBy as keyof Question];
    
    // Handle undefined values
    if (aVal === undefined) aVal = '';
    if (bVal === undefined) bVal = '';
    
    // Handle date strings
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    }
    
    // Compare values
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      // Numeric comparison
      if (aNum < bNum) return direction === 'asc' ? -1 : 1;
      if (aNum > bNum) return direction === 'asc' ? 1 : -1;
      return 0;
    } else {
      // String comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    }
  });
}

// ===== STORE IMPLEMENTATION =====

export const useQuestionStore = create<QuestionStoreState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        questions: [],
        selectedQuestion: null,
        draftQuestion: null,
        
        questionCache: new Map(),
        cacheSize: 0,
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        
        pagination: { ...INITIAL_PAGINATION },
        
        selection: createInitialSelectionState<string>(),
        
        viewMode: 'list',
        isDetailPanelOpen: false,
        
        isLoading: false,
        isLoadingMore: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        
        error: null,
        fieldErrors: {},
        
        statistics: { ...INITIAL_STATISTICS },
        
        lastAppliedFilters: null,
        
        // === ACTIONS IMPLEMENTATION ===
        
        // Fetch questions with filters
        fetchQuestions: async (filters, append = false) => {
          const { pagination } = get();
          
          set((state) => {
            state.isLoading = !append;
            state.isLoadingMore = append;
            state.error = null;
          });
          
          try {
            const request = createListRequest(filters, filters?.page || pagination.page, filters?.pageSize || pagination.pageSize);
            const response = await QuestionService.listQuestions(request);
            
            if (response && response.success) {
              const parsed = parseListResponse(response);
              set((state) => {
                state.questions = append 
                  ? [...state.questions, ...parsed.questions]
                  : parsed.questions;
                state.pagination = {
                  page: parsed.page,
                  pageSize: parsed.pageSize,
                  total: parsed.total,
                  totalPages: calculateTotalPages(parsed.total, parsed.pageSize),
                };
                state.lastAppliedFilters = filters || null;
                state.isLoading = false;
                state.isLoadingMore = false;
              });
              
              // Update statistics
              get().refreshStatistics();
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch questions';
            set((state) => {
              state.error = errorMessage;
              state.isLoading = false;
              state.isLoadingMore = false;
            });
            toast.error(errorMessage);
          }
        },
        
        // Fetch single question by ID
        fetchQuestionById: async (id, forceRefresh = false) => {
          const { questionCache } = get();
          
          // Check cache first
          if (!forceRefresh) {
            const cached = questionCache.get(id);
            if (cached && isCacheValid(cached)) {
              return cached.data;
            }
          }
          
          try {
            const request = createGetRequest(id);
            const response = await QuestionService.getQuestion(request);
            const question = response ? parseGetResponse(response) : null;
            
            if (question) {
              // Update cache
              set((state) => {
                state.questionCache.set(id, {
                  data: question,
                  timestamp: Date.now(),
                  expiresAt: Date.now() + DEFAULT_CACHE_TTL,
                });
                state.cacheSize = state.questionCache.size;
                
                // Update in questions list if exists
                const index = state.questions.findIndex((q: Question) => q.id === id);
                if (index !== -1) {
                  state.questions[index] = question;
                }
              });
              
              // Prune cache if needed
              if (get().cacheSize > get().maxCacheSize) {
                get().pruneCache();
              }
              
              return question;
            }
            return null;
          } catch (error) {
            console.error('Failed to fetch question:', error);
            return null;
          }
        },
        
        // Create new question
        createQuestion: async (draft) => {
          set((state) => {
            state.isCreating = true;
            state.error = null;
            state.fieldErrors = {};
          });
          
          try {
            const request = draftToCreateRequest(draft);
            const response = await QuestionService.createQuestion(request);
            const question = response ? parseCreateResponse(response) : null;
            
            if (question) {
              set((state) => {
                state.questions.unshift(question);
                state.pagination.total += 1;
                state.pagination.totalPages = calculateTotalPages(
                  state.pagination.total,
                  state.pagination.pageSize
                );
                state.draftQuestion = null;
                state.isCreating = false;
              });
              
              toast.success('Question created successfully');
              return question;
            }
            
            throw new Error('Failed to create question');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create question';
            set((state) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            toast.error(errorMessage);
            return null;
          }
        },
        
        // Update existing question
        updateQuestion: async (id, updates) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });
          
          try {
            const request = createUpdateRequest(id, updates);
            const response = await QuestionService.updateQuestion(request);
            const updated = response ? parseUpdateResponse(response) : null;
            
            if (updated) {
              set((state) => {
                const index = state.questions.findIndex((q: Question) => q.id === id);
                if (index !== -1) {
                  state.questions[index] = updated;
                }
                
                // Update cache
                state.questionCache.set(id, {
                  data: updated,
                  timestamp: Date.now(),
                  expiresAt: Date.now() + DEFAULT_CACHE_TTL,
                });
                
                // Update selected question if it's the same
                if (state.selectedQuestion?.id === id) {
                  state.selectedQuestion = updated;
                }
                
                state.isUpdating = false;
              });
              
              toast.success('Question updated successfully');
              return true;
            }
            
            throw new Error('Failed to update question');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update question';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },
        
        // Delete question
        deleteQuestion: async (id) => {
          set((state) => {
            state.isDeleting = true;
            state.error = null;
          });
          
          try {
            const request = createDeleteRequest(id);
            const response = await QuestionService.deleteQuestion(request);
            const success = response ? parseDeleteResponse(response) : false;
            
            if (success) {
              set((state) => {
                state.questions = state.questions.filter((q: Question) => q.id !== id);
                state.questionCache.delete(id);
                state.selection.selectedIds.delete(id);
                
                if (state.selectedQuestion?.id === id) {
                  state.selectedQuestion = null;
                }
                
                state.pagination.total -= 1;
                state.pagination.totalPages = calculateTotalPages(
                  state.pagination.total,
                  state.pagination.pageSize
                );
                
                state.isDeleting = false;
              });
              
              toast.success('Question deleted successfully');
              return true;
            }
            
            throw new Error('Failed to delete question');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete question';
            set((state) => {
              state.error = errorMessage;
              state.isDeleting = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },
        
        // Delete multiple questions
        deleteMultipleQuestions: async (ids) => {
          set((state) => {
            state.isDeleting = true;
            state.error = null;
          });
          
          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                const request = createDeleteRequest(id);
                const response = await QuestionService.deleteQuestion(request);
                return response ? parseDeleteResponse(response) : false;
              })
            );
            
            const successCount = results.filter(Boolean).length;
            
            if (successCount > 0) {
              set((state) => {
                state.questions = state.questions.filter((q: Question) => !ids.includes(q.id));
                ids.forEach(id => {
                  state.questionCache.delete(id);
                  state.selection.selectedIds.delete(id);
                });
                
                if (state.selectedQuestion && ids.includes(state.selectedQuestion.id)) {
                  state.selectedQuestion = null;
                }
                
                state.pagination.total -= successCount;
                state.pagination.totalPages = calculateTotalPages(
                  state.pagination.total,
                  state.pagination.pageSize
                );
                
                state.isDeleting = false;
              });
              
              toast.success(`${successCount} questions deleted successfully`);
              return true;
            }
            
            throw new Error('Failed to delete questions');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete questions';
            set((state) => {
              state.error = errorMessage;
              state.isDeleting = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },
        
        // Duplicate question
        duplicateQuestion: async (id) => {
          try {
            const original = await get().fetchQuestionById(id);
            if (!original) {
              throw new Error('Question not found');
            }
            
            const draft: QuestionDraft = {
              content: original.content,
              rawContent: original.rawContent,
              type: original.type,
              difficulty: original.difficulty,
              tags: original.tag,
              timeLimit: original.timeLimit,
              points: original.points,
              explanation: original.explanation,
              answers: original.answers,
              correctAnswer: original.correctAnswer,
              source: original.source,
            };
            
            const duplicated = await get().createQuestion(draft);
            return duplicated;
          } catch (error) {
            console.error('Failed to duplicate question:', error);
            toast.error('Failed to duplicate question');
            return null;
          }
        },
        
        // Bulk status update
        bulkUpdateStatus: async (ids, status) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });
          
          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                const request = createUpdateRequest(id, { status });
                const response = await QuestionService.updateQuestion(request);
                return response ? parseUpdateResponse(response) : null;
              })
            );
            
            const successCount = results.filter(Boolean).length;
            
            if (successCount > 0) {
              set((state) => {
                state.questions = state.questions.map((q: Question) => 
                  ids.includes(q.id) ? { ...q, status } : q
                );
                state.isUpdating = false;
              });
              
              toast.success(`Updated status for ${successCount} questions`);
              return true;
            }
            
            throw new Error('Failed to update status');
          } catch (error) {
            console.error('Failed to update status:', error);
            set((state) => {
              state.error = 'Failed to update status';
              state.isUpdating = false;
            });
            toast.error('Failed to update status');
            return false;
          }
        },
        
        // Bulk difficulty update
        bulkUpdateDifficulty: async (ids, difficulty) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });
          
          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                const request = createUpdateRequest(id, { difficulty });
                const response = await QuestionService.updateQuestion(request);
                return response ? parseUpdateResponse(response) : null;
              })
            );
            
            const successCount = results.filter(Boolean).length;
            
            if (successCount > 0) {
              set((state) => {
                state.questions = state.questions.map((q: Question) => 
                  ids.includes(q.id) ? { ...q, difficulty } : q
                );
                state.isUpdating = false;
              });
              
              toast.success(`Updated difficulty for ${successCount} questions`);
              return true;
            }
            
            throw new Error('Failed to update difficulty');
          } catch (error) {
            console.error('Failed to update difficulty:', error);
            set((state) => {
              state.error = 'Failed to update difficulty';
              state.isUpdating = false;
            });
            toast.error('Failed to update difficulty');
            return false;
          }
        },
        
        // Bulk add tags
        bulkAddTags: async (ids, tags) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });
          
          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                const question = get().questions.find((q: Question) => q.id === id);
                if (!question) return false;
                
                const newTags = Array.from(new Set([...question.tag, ...tags]));
                const request = createUpdateRequest(id, { tag: newTags });
                const response = await QuestionService.updateQuestion(request);
                return response ? parseUpdateResponse(response) : null;
              })
            );
            
            const successCount = results.filter(Boolean).length;
            
            if (successCount > 0) {
              await get().fetchQuestions(get().lastAppliedFilters || undefined);
              
              toast.success(`Added tags to ${successCount} questions`);
              return true;
            }
            
            throw new Error('Failed to add tags');
          } catch (error) {
            console.error('Failed to add tags:', error);
            set((state) => {
              state.error = 'Failed to add tags';
              state.isUpdating = false;
            });
            toast.error('Failed to add tags');
            return false;
          }
        },
        
        // Bulk remove tags
        bulkRemoveTags: async (ids, tags) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });
          
          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                const question = get().questions.find((q: Question) => q.id === id);
                if (!question) return false;
                
                const newTags = question.tag.filter(t => !tags.includes(t));
                const request = createUpdateRequest(id, { tag: newTags });
                const response = await QuestionService.updateQuestion(request);
                return response ? parseUpdateResponse(response) : null;
              })
            );
            
            const successCount = results.filter(Boolean).length;
            
            if (successCount > 0) {
              await get().fetchQuestions(get().lastAppliedFilters || undefined);
              
              toast.success(`Removed tags from ${successCount} questions`);
              return true;
            }
            
            throw new Error('Failed to remove tags');
          } catch (error) {
            console.error('Failed to remove tags:', error);
            set((state) => {
              state.error = 'Failed to remove tags';
              state.isUpdating = false;
            });
            toast.error('Failed to remove tags');
            return false;
          }
        },
        
        // Export questions
        exportQuestions: async (ids) => {
          try {
            const questionsToExport = ids 
              ? get().questions.filter((q: Question) => ids.includes(q.id))
              : get().questions;
            
            if (questionsToExport.length === 0) {
              toast.error('No questions to export');
              return null;
            }
            
            const dataStr = JSON.stringify(questionsToExport, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            
            toast.success(`Exported ${questionsToExport.length} questions`);
            return blob;
          } catch (error) {
            console.error('Failed to export questions:', error);
            toast.error('Failed to export questions');
            return null;
          }
        },
        
        // Import questions
        importQuestions: async (file) => {
          set((state) => {
            state.isCreating = true;
            state.error = null;
          });
          
          try {
            const text = await file.text();
            const questions = JSON.parse(text) as Question[];
            
            if (!Array.isArray(questions)) {
              throw new Error('Invalid file format');
            }
            
            const results = await Promise.all(
              questions.map(async (q) => {
                const draft: QuestionDraft = {
                  content: q.content,
                  rawContent: q.rawContent,
                  type: q.type,
                  difficulty: q.difficulty,
                  tags: q.tag,
                  timeLimit: q.timeLimit,
                  points: q.points,
                  explanation: q.explanation,
                  answers: q.answers,
                  correctAnswer: q.correctAnswer,
                  source: q.source,
                  questionCodeId: q.questionCodeId,
                };
                const request = draftToCreateRequest(draft);
                const response = await QuestionService.createQuestion(request);
                return response ? parseCreateResponse(response) : null;
              })
            );
            
            const successCount = results.filter(Boolean).length;
            
            set((state) => {
              state.isCreating = false;
            });
            
            if (successCount > 0) {
              await get().fetchQuestions();
              toast.success(`Imported ${successCount} questions`);
            }
            
            return successCount;
          } catch (error) {
            console.error('Failed to import questions:', error);
            set((state) => {
              state.error = 'Failed to import questions';
              state.isCreating = false;
            });
            toast.error('Failed to import questions');
            return 0;
          }
        },
        
        // Selection actions
        selectQuestion: (id) => {
          set((state) => {
            state.selection.selectedIds.add(id);
            state.selection.lastSelectedId = id;
          });
        },
        
        deselectQuestion: (id) => {
          set((state) => {
            state.selection.selectedIds.delete(id);
            if (state.selection.lastSelectedId === id) {
              state.selection.lastSelectedId = null;
            }
          });
        },
        
        toggleQuestionSelection: (id) => {
          const { selection } = get();
          if (selection.selectedIds.has(id)) {
            get().deselectQuestion(id);
          } else {
            get().selectQuestion(id);
          }
        },
        
        selectAllQuestions: () => {
          set((state) => {
            state.selection.selectedIds = new Set(state.questions.map((q: Question) => q.id));
            state.selection.isAllSelected = true;
          });
        },
        
        deselectAllQuestions: () => {
          set((state) => {
            state.selection.selectedIds.clear();
            state.selection.isAllSelected = false;
            state.selection.lastSelectedId = null;
          });
        },
        
        toggleSelectAll: () => {
          const { selection } = get();
          if (selection.isAllSelected) {
            get().deselectAllQuestions();
          } else {
            get().selectAllQuestions();
          }
        },
        
        selectQuestionRange: (fromId, toId) => {
          const { questions } = get();
          const fromIndex = questions.findIndex((q: Question) => q.id === fromId);
          const toIndex = questions.findIndex((q: Question) => q.id === toId);
          
          if (fromIndex === -1 || toIndex === -1) return;
          
          const start = Math.min(fromIndex, toIndex);
          const end = Math.max(fromIndex, toIndex);
          
          set((state) => {
            for (let i = start; i <= end; i++) {
              state.selection.selectedIds.add(questions[i].id);
            }
            state.selection.lastSelectedId = toId;
          });
        },
        
        // View actions
        setSelectedQuestion: (question) => {
          set((state) => {
            state.selectedQuestion = question;
          });
        },
        
        setViewMode: (mode) => {
          set((state) => {
            state.viewMode = mode;
          });
        },
        
        toggleDetailPanel: () => {
          set((state) => {
            state.isDetailPanelOpen = !state.isDetailPanelOpen;
          });
        },
        
        openDetailPanel: async (questionId) => {
          const question = await get().fetchQuestionById(questionId);
          if (question) {
            set((state) => {
              state.selectedQuestion = question;
              state.isDetailPanelOpen = true;
            });
          }
        },
        
        closeDetailPanel: () => {
          set((state) => {
            state.isDetailPanelOpen = false;
          });
        },
        
        // Draft actions
        setDraftQuestion: (draft) => {
          set((state) => {
            state.draftQuestion = draft;
            state.fieldErrors = {};
          });
        },
        
        updateDraftField: (field, value) => {
          set((state) => {
            if (state.draftQuestion) {
              state.draftQuestion[field] = value;
              // Clear field error when field is updated
              delete state.fieldErrors[field];
            }
          });
        },
        
        validateDraft: () => {
          const { draftQuestion } = get();
          if (!draftQuestion) return false;
          
          const errors: Record<string, string> = {};
          
          if (!draftQuestion.content?.trim()) {
            errors.content = 'Question content is required';
          }
          
          if (!draftQuestion.type) {
            errors.type = 'Question type is required';
          }
          
          if (draftQuestion.type === 'MC' || draftQuestion.type === 'TF') {
            if (!draftQuestion.answers || draftQuestion.answers.length < 2) {
              errors.answers = 'At least 2 answer options are required';
            }
            
            if (!draftQuestion.correctAnswer) {
              errors.correctAnswer = 'Correct answer is required';
            }
          }
          
          if (Object.keys(errors).length > 0) {
            set((state) => {
              state.fieldErrors = errors;
            });
            return false;
          }
          
          return true;
        },
        
        saveDraft: async () => {
          const { draftQuestion } = get();
          if (!draftQuestion) return null;
          
          if (!get().validateDraft()) {
            toast.error('Please fix validation errors');
            return null;
          }
          
          return await get().createQuestion(draftQuestion);
        },
        
        discardDraft: () => {
          set((state) => {
            state.draftQuestion = null;
            state.fieldErrors = {};
          });
        },
        
        // Pagination actions
        setPage: (page) => {
          set((state) => {
            state.pagination.page = Math.max(1, Math.min(page, state.pagination.totalPages || 1));
          });
          get().fetchQuestions(get().lastAppliedFilters || undefined);
        },
        
        setPageSize: (pageSize) => {
          set((state) => {
            state.pagination.pageSize = Math.max(1, Math.min(100, pageSize));
            state.pagination.page = 1; // Reset to first page
            state.pagination.totalPages = calculateTotalPages(
              state.pagination.total,
              pageSize
            );
          });
          get().fetchQuestions(get().lastAppliedFilters || undefined);
        },
        
        nextPage: () => {
          const { pagination } = get();
          if (pagination.page < (pagination.totalPages || 1)) {
            get().setPage(pagination.page + 1);
          }
        },
        
        previousPage: () => {
          const { pagination } = get();
          if (pagination.page > 1) {
            get().setPage(pagination.page - 1);
          }
        },
        
        goToFirstPage: () => {
          get().setPage(1);
        },
        
        goToLastPage: () => {
          const { pagination } = get();
          get().setPage(pagination.totalPages || 1);
        },
        
        // Cache actions
        clearCache: () => {
          set((state) => {
            state.questionCache.clear();
            state.cacheSize = 0;
          });
        },
        
        pruneCache: () => {
          set((state) => {
            const validEntries: [string, CacheEntry<Question>][] = [];

            state.questionCache.forEach((entry: CacheEntry<Question>, id: string) => {
              if (isCacheValid(entry)) {
                validEntries.push([id, entry]);
              }
            });
            
            // Sort by timestamp (oldest first) and keep only maxCacheSize entries
            validEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const entriesToKeep = validEntries.slice(-state.maxCacheSize);
            
            state.questionCache.clear();
            entriesToKeep.forEach(([id, entry]) => {
              state.questionCache.set(id, entry);
            });
            
            state.cacheSize = state.questionCache.size;
          });
        },
        
        setCacheSize: (size) => {
          set((state) => {
            state.maxCacheSize = Math.max(10, Math.min(1000, size));
          });
          get().pruneCache();
        },
        
        // Utility actions
        refreshQuestions: async () => {
          const { lastAppliedFilters } = get();
          await get().fetchQuestions(lastAppliedFilters || undefined);
        },
        
        refreshStatistics: async () => {
          const { questions } = get();
          
          const statistics = {
            totalQuestions: questions.length,
            activeQuestions: questions.filter((q: Question) => q.status === QuestionStatus.ACTIVE).length,
            pendingQuestions: questions.filter((q: Question) => q.status === QuestionStatus.PENDING).length,
            archivedQuestions: questions.filter((q: Question) => q.status === QuestionStatus.ARCHIVED).length,
            questionsByType: {} as Record<QuestionType, number>,
            questionsByDifficulty: {} as Record<QuestionDifficulty, number>,
          };
          
          // Count by type
          Object.values(QuestionType).forEach(type => {
            statistics.questionsByType[type] = questions.filter((q: Question) => q.type === type).length;
          });
          
          // Count by difficulty
          Object.values(QuestionDifficulty).forEach(difficulty => {
            statistics.questionsByDifficulty[difficulty] = questions.filter((q: Question) => q.difficulty === difficulty).length;
          });
          
          set((state) => {
            state.statistics = statistics;
          });
        },
        
        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },
        
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
        
        setFieldError: (field, error) => {
          set((state) => {
            state.fieldErrors[field] = error;
          });
        },
        
        clearFieldErrors: () => {
          set((state) => {
            state.fieldErrors = {};
          });
        },
        
        // Filter & Sort actions
        applyFilters: async (filters) => {
          set((state) => {
            state.pagination.page = 1; // Reset to first page when applying filters
          });
          await get().fetchQuestions(filters);
        },
        
        clearFilters: async () => {
          set((state) => {
            state.lastAppliedFilters = null;
            state.pagination.page = 1;
          });
          await get().fetchQuestions();
        },
        
        sortQuestions: (sortBy, direction) => {
          set((state) => {
            state.questions = sortQuestionsArray(state.questions, sortBy, direction);
          });
        },
      }))
    ),
    {
      name: 'QuestionStore',
    }
  )
);

// ===== STORE SELECTORS =====

export const questionSelectors = {
  // Data selectors
  questions: (state: QuestionStoreState) => state.questions,
  selectedQuestion: (state: QuestionStoreState) => state.selectedQuestion,
  draftQuestion: (state: QuestionStoreState) => state.draftQuestion,
  
  // Pagination selectors
  pagination: (state: QuestionStoreState) => state.pagination,
  currentPage: (state: QuestionStoreState) => state.pagination.page,
  totalPages: (state: QuestionStoreState) => state.pagination.totalPages || 0,
  hasNextPage: (state: QuestionStoreState) => 
    state.pagination.page < (state.pagination.totalPages || 1),
  hasPreviousPage: (state: QuestionStoreState) => state.pagination.page > 1,
  
  // Selection selectors
  selectedIds: (state: QuestionStoreState) => Array.from(state.selection.selectedIds),
  selectedCount: (state: QuestionStoreState) => state.selection.selectedIds.size,
  isAllSelected: (state: QuestionStoreState) => state.selection.isAllSelected,
  isQuestionSelected: (id: string) => (state: QuestionStoreState) => 
    state.selection.selectedIds.has(id),
  
  // View selectors
  viewMode: (state: QuestionStoreState) => state.viewMode,
  isDetailPanelOpen: (state: QuestionStoreState) => state.isDetailPanelOpen,
  
  // Loading selectors
  isLoading: (state: QuestionStoreState) => state.isLoading,
  isLoadingMore: (state: QuestionStoreState) => state.isLoadingMore,
  isProcessing: (state: QuestionStoreState) => 
    state.isCreating || state.isUpdating || state.isDeleting,
  
  // Error selectors
  error: (state: QuestionStoreState) => state.error,
  fieldErrors: (state: QuestionStoreState) => state.fieldErrors,
  hasError: (state: QuestionStoreState) => !!state.error,
  hasFieldErrors: (state: QuestionStoreState) => Object.keys(state.fieldErrors).length > 0,
  
  // Statistics selectors
  statistics: (state: QuestionStoreState) => state.statistics,
  totalQuestions: (state: QuestionStoreState) => state.statistics.totalQuestions,
  
  // Filter selectors
  lastAppliedFilters: (state: QuestionStoreState) => state.lastAppliedFilters,
  hasActiveFilters: (state: QuestionStoreState) => !!state.lastAppliedFilters,
  
  // Cache selectors
  cacheSize: (state: QuestionStoreState) => state.cacheSize,
  cacheUtilization: (state: QuestionStoreState) => 
    (state.cacheSize / state.maxCacheSize) * 100,
  
  // Computed selectors
  questionById: (id: string) => (state: QuestionStoreState) => 
    state.questions.find((q: Question) => q.id === id),
  
  selectedQuestions: (state: QuestionStoreState) => 
    state.questions.filter((q: Question) => state.selection.selectedIds.has(q.id)),
  
  questionsCount: (state: QuestionStoreState) => ({
    total: state.pagination.total,
    current: state.questions.length,
    selected: state.selection.selectedIds.size,
  }),
};