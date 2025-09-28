/**
 * Exam Store
 * Zustand store for comprehensive exam state management
 * Manages exams list, selected exam, exam taking state, and integrates with gRPC services
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

'use client';

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import {
  type Exam,
  type ExamFormData,
  type ExamFilters,
  type ExamAttempt,
  type ExamResult,

  ExamStatus,
  ExamType
} from '@/lib/types/exam';

import { QuestionDifficulty } from '@/lib/types/question';
import { ExamService } from '@/services/grpc/exam.service';
import { toast } from 'sonner';

// ===== STORE INTERFACES =====

export type ExamViewMode = 'list' | 'grid' | 'detail' | 'preview';

interface ExamSelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  lastSelectedId: string | null;
}

interface ExamCacheEntry {
  exam: Exam;
  timestamp: number;
  ttl: number;
}

interface ExamTakingState {
  currentAttempt: ExamAttempt | null;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  timeRemaining: number; // seconds
  isTimerActive: boolean;
  lastSaveTime: number;
  autoSaveInterval: number; // seconds
}

interface ExamStatistics {
  totalExams: number;
  activeExams: number;
  pendingExams: number;
  archivedExams: number;
  examsByType: Record<ExamType, number>;
  examsByDifficulty: Record<QuestionDifficulty, number>;
  examsBySubject: Record<string, number>;
}

interface ExamPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ExamStoreState {
  // Exams data
  exams: Exam[];
  selectedExam: Exam | null;
  draftExam: ExamFormData | null;
  
  // Cache management
  examCache: Map<string, ExamCacheEntry>;
  cacheSize: number;
  maxCacheSize: number;
  
  // Pagination state
  pagination: ExamPagination;
  
  // Selection state
  selection: ExamSelectionState;
  
  // View state
  viewMode: ExamViewMode;
  isDetailPanelOpen: boolean;
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPublishing: boolean;
  
  // Exam taking state
  examTaking: ExamTakingState;
  
  // Results state
  examResults: ExamResult[];
  currentResult: ExamResult | null;
  
  // Error state
  error: string | null;
  fieldErrors: Record<string, string>;
  
  // Statistics
  statistics: ExamStatistics;
  
  // Search & Filter
  lastAppliedFilters: ExamFilters | null;
  
  // === ACTIONS ===
  
  // Exam CRUD operations
  fetchExams: (filters?: ExamFilters, append?: boolean) => Promise<void>;
  fetchExamById: (id: string, forceRefresh?: boolean) => Promise<Exam | null>;
  createExam: (draft: ExamFormData) => Promise<Exam | null>;
  updateExam: (id: string, updates: Partial<ExamFormData>) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  deleteMultipleExams: (ids: string[]) => Promise<boolean>;
  duplicateExam: (id: string) => Promise<Exam | null>;
  
  // Exam workflow operations
  publishExam: (id: string) => Promise<boolean>;
  archiveExam: (id: string) => Promise<boolean>;
  
  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: ExamStatus) => Promise<boolean>;
  bulkUpdateDifficulty: (ids: string[], difficulty: QuestionDifficulty) => Promise<boolean>;
  bulkAddTags: (ids: string[], tags: string[]) => Promise<boolean>;
  bulkRemoveTags: (ids: string[], tags: string[]) => Promise<boolean>;
  exportExams: (ids?: string[]) => Promise<Blob | null>;
  
  // Question management
  addQuestionToExam: (examId: string, questionId: string, orderNumber?: number) => Promise<boolean>;
  removeQuestionFromExam: (examId: string, questionId: string) => Promise<boolean>;
  reorderExamQuestions: (examId: string, questionIds: string[]) => Promise<boolean>;
  
  // Exam taking operations
  startExam: (examId: string) => Promise<ExamAttempt | null>;
  saveAnswer: (questionId: string, answer: unknown) => Promise<boolean>;
  submitExam: () => Promise<ExamResult | null>;
  pauseExam: () => void;
  resumeExam: () => void;
  
  // Timer management
  startTimer: (durationMinutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateTimeRemaining: (seconds: number) => void;
  
  // Selection actions
  selectExam: (id: string) => void;
  deselectExam: (id: string) => void;
  toggleExamSelection: (id: string) => void;
  selectAllExams: () => void;
  deselectAllExams: () => void;
  toggleSelectAll: () => void;
  selectExamRange: (fromId: string, toId: string) => void;
  
  // View actions
  setSelectedExam: (exam: Exam | null) => void;
  setViewMode: (mode: ExamViewMode) => void;
  toggleDetailPanel: () => void;
  openDetailPanel: (examId: string) => void;
  closeDetailPanel: () => void;
  
  // Draft actions
  setDraftExam: (draft: ExamFormData | null) => void;
  updateDraftField: <K extends keyof ExamFormData>(field: K, value: ExamFormData[K]) => void;
  validateDraft: () => boolean;
  saveDraft: () => Promise<Exam | null>;
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
  refreshExams: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldErrors: () => void;
  
  // Search & Sort actions
  applyFilters: (filters: ExamFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
  sortExams: (sortBy: keyof Exam, direction: 'asc' | 'desc') => void;
  
  // Results actions
  fetchExamResults: (attemptId: string) => Promise<ExamResult | null>;
  fetchExamStatistics: (examId: string) => Promise<any>;
}

// ===== CONSTANTS =====

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_CACHE_SIZE = 100;
const AUTO_SAVE_INTERVAL = 30; // seconds

const INITIAL_STATISTICS: ExamStatistics = {
  totalExams: 0,
  activeExams: 0,
  pendingExams: 0,
  archivedExams: 0,
  examsByType: {} as Record<ExamType, number>,
  examsByDifficulty: {} as Record<QuestionDifficulty, number>,
  examsBySubject: {},
};

const INITIAL_PAGINATION: ExamPagination = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

const INITIAL_EXAM_TAKING: ExamTakingState = {
  currentAttempt: null,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  isTimerActive: false,
  lastSaveTime: 0,
  autoSaveInterval: AUTO_SAVE_INTERVAL,
};

// ===== UTILITY FUNCTIONS =====

function isCacheValid(entry: ExamCacheEntry): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

function validateExamDraft(draft: ExamFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!draft.title?.trim()) {
    errors.title = 'Tiêu đề đề thi là bắt buộc';
  }
  
  if (!draft.subject?.trim()) {
    errors.subject = 'Môn học là bắt buộc';
  }
  
  if (draft.durationMinutes <= 0) {
    errors.durationMinutes = 'Thời gian làm bài phải lớn hơn 0';
  }
  
  if (draft.passPercentage < 0 || draft.passPercentage > 100) {
    errors.passPercentage = 'Điểm đạt phải từ 0 đến 100';
  }
  
  if (draft.maxAttempts <= 0) {
    errors.maxAttempts = 'Số lần làm bài phải lớn hơn 0';
  }
  
  // Official exam validation
  if (draft.examType === ExamType.OFFICIAL) {
    if (!draft.sourceInstitution?.trim()) {
      errors.sourceInstitution = 'Tên trường/sở là bắt buộc cho đề thi chính thức';
    }
    if (!draft.examYear?.trim()) {
      errors.examYear = 'Năm thi là bắt buộc cho đề thi chính thức';
    }
  }
  
  return errors;
}

// ===== STORE IMPLEMENTATION =====

export const useExamStore = create<ExamStoreState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        exams: [],
        selectedExam: null,
        draftExam: null,
        
        examCache: new Map(),
        cacheSize: 0,
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        
        pagination: { ...INITIAL_PAGINATION },
        
        selection: {
          selectedIds: new Set(),
          isAllSelected: false,
          lastSelectedId: null,
        },
        
        viewMode: 'list',
        isDetailPanelOpen: false,
        
        isLoading: false,
        isLoadingMore: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        isPublishing: false,
        
        examTaking: { ...INITIAL_EXAM_TAKING },
        
        examResults: [],
        currentResult: null,
        
        error: null,
        fieldErrors: {},
        
        statistics: { ...INITIAL_STATISTICS },
        
        lastAppliedFilters: null,
        
        // === ACTIONS IMPLEMENTATION ===
        
        // Fetch exams with filters and pagination
        fetchExams: async (filters, append = false) => {
          set((state) => {
            if (append) {
              state.isLoadingMore = true;
            } else {
              state.isLoading = true;
              state.exams = [];
            }
            state.error = null;
          });
          
          try {
            const response = await ExamService.listExams(filters);
            
            set((state) => {
              if (append) {
                state.exams.push(...response.exams);
                state.isLoadingMore = false;
              } else {
                state.exams = response.exams;
                state.isLoading = false;
              }
              
              state.pagination.total = response.total;
              state.pagination.totalPages = calculateTotalPages(
                response.total,
                state.pagination.pageSize
              );
              state.lastAppliedFilters = filters || null;
            });
            
            // Update statistics
            get().refreshStatistics();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch exams';
            set((state) => {
              state.error = errorMessage;
              state.isLoading = false;
              state.isLoadingMore = false;
            });
            toast.error(errorMessage);
          }
        },

        // Fetch single exam by ID
        fetchExamById: async (id, forceRefresh = false) => {
          const { examCache } = get();

          // Check cache first
          if (!forceRefresh) {
            const cached = examCache.get(id);
            if (cached && isCacheValid(cached)) {
              return cached.exam;
            }
          }

          try {
            const exam = await ExamService.getExam(id);

            if (exam) {
              // Update cache
              set((state) => {
                state.examCache.set(id, {
                  exam,
                  timestamp: Date.now(),
                  ttl: DEFAULT_CACHE_TTL,
                });
                state.cacheSize = state.examCache.size;

                // Update in exams list if exists
                const index = state.exams.findIndex((e: Exam) => e.id === id);
                if (index !== -1) {
                  state.exams[index] = exam;
                }
              });

              // Prune cache if needed
              if (get().cacheSize > get().maxCacheSize) {
                get().pruneCache();
              }

              return exam;
            }
            return null;
          } catch (error) {
            console.error('Failed to fetch exam:', error);
            return null;
          }
        },

        // Create new exam
        createExam: async (draft) => {
          set((state) => {
            state.isCreating = true;
            state.error = null;
            state.fieldErrors = {};
          });

          try {
            const exam = await ExamService.createExam(draft);

            if (exam) {
              set((state) => {
                state.exams.unshift(exam);
                state.pagination.total += 1;
                state.pagination.totalPages = calculateTotalPages(
                  state.pagination.total,
                  state.pagination.pageSize
                );
                state.draftExam = null;
                state.isCreating = false;
              });

              toast.success('Đề thi đã được tạo thành công');
              return exam;
            }

            throw new Error('Failed to create exam');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create exam';
            set((state) => {
              state.error = errorMessage;
              state.isCreating = false;
            });
            toast.error(errorMessage);
            return null;
          }
        },

        // Update exam
        updateExam: async (id, updates) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });

          try {
            const updatedExam = await ExamService.updateExam(id, updates);

            set((state) => {
              const index = state.exams.findIndex((e: Exam) => e.id === id);
              if (index !== -1) {
                state.exams[index] = updatedExam;
              }

              // Update cache
              state.examCache.set(id, {
                exam: updatedExam,
                timestamp: Date.now(),
                ttl: DEFAULT_CACHE_TTL,
              });

              // Update selected exam if it's the same
              if (state.selectedExam?.id === id) {
                state.selectedExam = updatedExam;
              }

              state.isUpdating = false;
            });

            toast.success('Đề thi đã được cập nhật');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update exam';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        // Delete exam
        deleteExam: async (id) => {
          set((state) => {
            state.isDeleting = true;
            state.error = null;
          });

          try {
            await ExamService.deleteExam(id);

            set((state) => {
              state.exams = state.exams.filter((e: Exam) => e.id !== id);
              state.examCache.delete(id);
              state.cacheSize = state.examCache.size;
              state.pagination.total -= 1;
              state.pagination.totalPages = calculateTotalPages(
                state.pagination.total,
                state.pagination.pageSize
              );

              // Clear selection if deleted exam was selected
              if (state.selectedExam?.id === id) {
                state.selectedExam = null;
              }

              state.selection.selectedIds.delete(id);
              state.isDeleting = false;
            });

            toast.success('Đề thi đã được xóa');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete exam';
            set((state) => {
              state.error = errorMessage;
              state.isDeleting = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        // Delete multiple exams
        deleteMultipleExams: async (ids) => {
          set((state) => {
            state.isDeleting = true;
            state.error = null;
          });

          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                try {
                  await ExamService.deleteExam(id);
                  return true;
                } catch {
                  return false;
                }
              })
            );

            const successCount = results.filter(Boolean).length;

            set((state) => {
              // Remove successfully deleted exams
              state.exams = state.exams.filter((e: Exam) => !ids.includes(e.id));

              // Clear from cache
              ids.forEach(id => state.examCache.delete(id));
              state.cacheSize = state.examCache.size;

              // Update pagination
              state.pagination.total -= successCount;
              state.pagination.totalPages = calculateTotalPages(
                state.pagination.total,
                state.pagination.pageSize
              );

              // Clear selections
              ids.forEach(id => state.selection.selectedIds.delete(id));
              state.selection.isAllSelected = false;

              state.isDeleting = false;
            });

            if (successCount === ids.length) {
              toast.success(`Đã xóa ${successCount} đề thi`);
            } else {
              toast.warning(`Đã xóa ${successCount}/${ids.length} đề thi`);
            }

            return successCount === ids.length;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete exams';
            set((state) => {
              state.error = errorMessage;
              state.isDeleting = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        // Duplicate exam
        duplicateExam: async (id) => {
          try {
            const originalExam = await get().fetchExamById(id);
            if (!originalExam) {
              throw new Error('Exam not found');
            }

            const duplicateData: ExamFormData = {
              title: `${originalExam.title} (Copy)`,
              description: originalExam.description,
              instructions: originalExam.instructions,
              durationMinutes: originalExam.durationMinutes,
              totalPoints: originalExam.totalPoints,
              passPercentage: originalExam.passPercentage,
              examType: originalExam.examType,
              status: ExamStatus.PENDING,
              subject: originalExam.subject,
              grade: originalExam.grade,
              difficulty: originalExam.difficulty,
              tags: [...originalExam.tags],
              shuffleQuestions: originalExam.shuffleQuestions,
              showResults: originalExam.showResults,
              maxAttempts: originalExam.maxAttempts,
              sourceInstitution: originalExam.sourceInstitution,
              examYear: originalExam.examYear,
              examCode: originalExam.examCode,
              questionIds: [...originalExam.questionIds],
            };

            return await get().createExam(duplicateData);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate exam';
            toast.error(errorMessage);
            return null;
          }
        },

        // Publish exam
        publishExam: async (id) => {
          set((state) => {
            state.isPublishing = true;
            state.error = null;
          });

          try {
            const publishedExam = await ExamService.publishExam(id);

            set((state) => {
              const index = state.exams.findIndex((e: Exam) => e.id === id);
              if (index !== -1) {
                state.exams[index] = publishedExam;
              }

              // Update cache
              state.examCache.set(id, {
                exam: publishedExam,
                timestamp: Date.now(),
                ttl: DEFAULT_CACHE_TTL,
              });

              // Update selected exam if it's the same
              if (state.selectedExam?.id === id) {
                state.selectedExam = publishedExam;
              }

              state.isPublishing = false;
            });

            toast.success('Đề thi đã được xuất bản');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish exam';
            set((state) => {
              state.error = errorMessage;
              state.isPublishing = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        // Archive exam
        archiveExam: async (id) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });

          try {
            const archivedExam = await ExamService.archiveExam(id);

            set((state) => {
              const index = state.exams.findIndex((e: Exam) => e.id === id);
              if (index !== -1) {
                state.exams[index] = archivedExam;
              }

              // Update cache
              state.examCache.set(id, {
                exam: archivedExam,
                timestamp: Date.now(),
                ttl: DEFAULT_CACHE_TTL,
              });

              // Update selected exam if it's the same
              if (state.selectedExam?.id === id) {
                state.selectedExam = archivedExam;
              }

              state.isUpdating = false;
            });

            toast.success('Đề thi đã được lưu trữ');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to archive exam';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        // Bulk operations
        bulkUpdateStatus: async (ids, status) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });

          try {
            // Mock implementation - in real app, this would be a single API call
            const results = await Promise.all(
              ids.map(async (id) => {
                try {
                  await ExamService.updateExam(id, { status });
                  return true;
                } catch {
                  return false;
                }
              })
            );

            const successCount = results.filter(Boolean).length;

            set((state) => {
              // Update exams in state
              state.exams.forEach((exam: Exam) => {
                if (ids.includes(exam.id)) {
                  exam.status = status;
                  exam.updatedAt = new Date().toISOString();
                }
              });

              // Update cache
              ids.forEach(id => {
                const cached = state.examCache.get(id);
                if (cached) {
                  cached.exam.status = status;
                  cached.exam.updatedAt = new Date().toISOString();
                  cached.timestamp = Date.now();
                }
              });

              state.isUpdating = false;
            });

            if (successCount === ids.length) {
              toast.success(`Đã cập nhật trạng thái ${successCount} đề thi`);
            } else {
              toast.warning(`Đã cập nhật ${successCount}/${ids.length} đề thi`);
            }

            return successCount === ids.length;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update exam status';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        bulkUpdateDifficulty: async (ids, difficulty) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });

          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                try {
                  await ExamService.updateExam(id, { difficulty });
                  return true;
                } catch {
                  return false;
                }
              })
            );

            const successCount = results.filter(Boolean).length;

            set((state) => {
              // Update exams in state
              state.exams.forEach((exam: Exam) => {
                if (ids.includes(exam.id)) {
                  exam.difficulty = difficulty;
                  exam.updatedAt = new Date().toISOString();
                }
              });

              // Update cache
              ids.forEach(id => {
                const cached = state.examCache.get(id);
                if (cached) {
                  cached.exam.difficulty = difficulty;
                  cached.exam.updatedAt = new Date().toISOString();
                  cached.timestamp = Date.now();
                }
              });

              state.isUpdating = false;
            });

            toast.success(`Đã cập nhật độ khó ${successCount} đề thi`);
            return successCount === ids.length;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update difficulty';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        bulkAddTags: async (ids, tags) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });

          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                try {
                  const exam = await get().fetchExamById(id);
                  if (exam) {
                    const newTags = [...new Set([...exam.tags, ...tags])];
                    await ExamService.updateExam(id, { tags: newTags });
                    return true;
                  }
                  return false;
                } catch {
                  return false;
                }
              })
            );

            const successCount = results.filter(Boolean).length;

            set((state) => {
              state.isUpdating = false;
            });

            toast.success(`Đã thêm tags cho ${successCount} đề thi`);
            return successCount === ids.length;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add tags';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        bulkRemoveTags: async (ids, tags) => {
          set((state) => {
            state.isUpdating = true;
            state.error = null;
          });

          try {
            const results = await Promise.all(
              ids.map(async (id) => {
                try {
                  const exam = await get().fetchExamById(id);
                  if (exam) {
                    const newTags = exam.tags.filter(tag => !tags.includes(tag));
                    await ExamService.updateExam(id, { tags: newTags });
                    return true;
                  }
                  return false;
                } catch {
                  return false;
                }
              })
            );

            const successCount = results.filter(Boolean).length;

            set((state) => {
              state.isUpdating = false;
            });

            toast.success(`Đã xóa tags khỏi ${successCount} đề thi`);
            return successCount === ids.length;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove tags';
            set((state) => {
              state.error = errorMessage;
              state.isUpdating = false;
            });
            toast.error(errorMessage);
            return false;
          }
        },

        // Export exams
        exportExams: async (ids) => {
          try {
            // Mock implementation - in real app, this would call backend export API
            const examsToExport = ids ?
              get().exams.filter((e: Exam) => ids.includes(e.id)) :
              get().exams;

            const exportData = {
              exams: examsToExport,
              exportedAt: new Date().toISOString(),
              totalCount: examsToExport.length
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
              type: 'application/json'
            });

            toast.success(`Đã xuất ${examsToExport.length} đề thi`);
            return blob;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export exams';
            toast.error(errorMessage);
            return null;
          }
        },

        // Question management operations
        addQuestionToExam: async (examId, questionId, orderNumber) => {
          try {
            await ExamService.addQuestionToExam(examId, questionId, orderNumber);

            // Update exam in state
            set((state) => {
              const exam = state.exams.find((e: Exam) => e.id === examId);
              if (exam) {
                if (!exam.questionIds.includes(questionId)) {
                  if (orderNumber !== undefined) {
                    exam.questionIds.splice(orderNumber, 0, questionId);
                  } else {
                    exam.questionIds.push(questionId);
                  }
                  exam.updatedAt = new Date().toISOString();
                }
              }

              // Update cache
              const cached = state.examCache.get(examId);
              if (cached && !cached.exam.questionIds.includes(questionId)) {
                if (orderNumber !== undefined) {
                  cached.exam.questionIds.splice(orderNumber, 0, questionId);
                } else {
                  cached.exam.questionIds.push(questionId);
                }
                cached.exam.updatedAt = new Date().toISOString();
                cached.timestamp = Date.now();
              }
            });

            toast.success('Đã thêm câu hỏi vào đề thi');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add question to exam';
            toast.error(errorMessage);
            return false;
          }
        },

        removeQuestionFromExam: async (examId, questionId) => {
          try {
            await ExamService.removeQuestionFromExam(examId, questionId);

            // Update exam in state
            set((state) => {
              const exam = state.exams.find((e: Exam) => e.id === examId);
              if (exam) {
                exam.questionIds = exam.questionIds.filter(id => id !== questionId);
                exam.updatedAt = new Date().toISOString();
              }

              // Update cache
              const cached = state.examCache.get(examId);
              if (cached) {
                cached.exam.questionIds = cached.exam.questionIds.filter(id => id !== questionId);
                cached.exam.updatedAt = new Date().toISOString();
                cached.timestamp = Date.now();
              }
            });

            toast.success('Đã xóa câu hỏi khỏi đề thi');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove question from exam';
            toast.error(errorMessage);
            return false;
          }
        },

        reorderExamQuestions: async (examId, questionIds) => {
          try {
            await ExamService.reorderQuestions(examId, questionIds);

            // Update exam in state
            set((state) => {
              const exam = state.exams.find((e: Exam) => e.id === examId);
              if (exam) {
                exam.questionIds = questionIds;
                exam.updatedAt = new Date().toISOString();
              }

              // Update cache
              const cached = state.examCache.get(examId);
              if (cached) {
                cached.exam.questionIds = questionIds;
                cached.exam.updatedAt = new Date().toISOString();
                cached.timestamp = Date.now();
              }
            });

            toast.success('Đã sắp xếp lại thứ tự câu hỏi');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reorder questions';
            toast.error(errorMessage);
            return false;
          }
        },

        // Exam taking operations
        startExam: async (examId) => {
          try {
            const attempt = await ExamService.startExam(examId);

            set((state) => {
              state.examTaking.currentAttempt = attempt;
              state.examTaking.currentQuestionIndex = 0;
              state.examTaking.answers = {};
              state.examTaking.lastSaveTime = Date.now();
            });

            // Start timer if exam has duration
            const exam = await get().fetchExamById(examId);
            if (exam && exam.durationMinutes > 0) {
              get().startTimer(exam.durationMinutes);
            }

            toast.success('Đã bắt đầu làm bài thi');
            return attempt;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start exam';
            toast.error(errorMessage);
            return null;
          }
        },

        saveAnswer: async (questionId, answer) => {
          const { currentAttempt } = get().examTaking;
          if (!currentAttempt) {
            return false;
          }

          try {
            await ExamService.saveAnswer(currentAttempt.id, questionId, answer);

            set((state) => {
              state.examTaking.answers[questionId] = answer;
              state.examTaking.lastSaveTime = Date.now();
            });

            return true;
          } catch (error) {
            console.error('Failed to save answer:', error);
            return false;
          }
        },

        submitExam: async () => {
          const { currentAttempt, answers } = get().examTaking;
          if (!currentAttempt) {
            return null;
          }

          try {
            // Stop timer
            get().stopTimer();

            const result = await ExamService.submitExam(currentAttempt.id, answers);

            set((state) => {
              state.examResults.push(result);
              state.currentResult = result;
              state.examTaking = { ...INITIAL_EXAM_TAKING };
            });

            toast.success('Đã nộp bài thi thành công');
            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit exam';
            toast.error(errorMessage);
            return null;
          }
        },

        pauseExam: () => {
          set((state) => {
            state.examTaking.isTimerActive = false;
          });
        },

        resumeExam: () => {
          set((state) => {
            state.examTaking.isTimerActive = true;
          });
        },

        // Timer management
        startTimer: (durationMinutes) => {
          set((state) => {
            state.examTaking.timeRemaining = durationMinutes * 60;
            state.examTaking.isTimerActive = true;
          });
        },

        pauseTimer: () => {
          set((state) => {
            state.examTaking.isTimerActive = false;
          });
        },

        resumeTimer: () => {
          set((state) => {
            state.examTaking.isTimerActive = true;
          });
        },

        stopTimer: () => {
          set((state) => {
            state.examTaking.isTimerActive = false;
            state.examTaking.timeRemaining = 0;
          });
        },

        updateTimeRemaining: (seconds) => {
          set((state) => {
            state.examTaking.timeRemaining = seconds;
            if (seconds <= 0) {
              state.examTaking.isTimerActive = false;
            }
          });
        },

        // Selection actions
        selectExam: (id) => {
          set((state) => {
            state.selection.selectedIds.add(id);
            state.selection.lastSelectedId = id;
            state.selection.isAllSelected =
              state.selection.selectedIds.size === state.exams.length;
          });
        },

        deselectExam: (id) => {
          set((state) => {
            state.selection.selectedIds.delete(id);
            state.selection.isAllSelected = false;
            if (state.selection.lastSelectedId === id) {
              state.selection.lastSelectedId = null;
            }
          });
        },

        toggleExamSelection: (id) => {
          const { selectedIds } = get().selection;
          if (selectedIds.has(id)) {
            get().deselectExam(id);
          } else {
            get().selectExam(id);
          }
        },

        selectAllExams: () => {
          set((state) => {
            state.exams.forEach((exam: Exam) => {
              state.selection.selectedIds.add(exam.id);
            });
            state.selection.isAllSelected = true;
          });
        },

        deselectAllExams: () => {
          set((state) => {
            state.selection.selectedIds.clear();
            state.selection.isAllSelected = false;
            state.selection.lastSelectedId = null;
          });
        },

        toggleSelectAll: () => {
          const { isAllSelected } = get().selection;
          if (isAllSelected) {
            get().deselectAllExams();
          } else {
            get().selectAllExams();
          }
        },

        selectExamRange: (fromId, toId) => {
          const { exams } = get();
          const fromIndex = exams.findIndex((e: Exam) => e.id === fromId);
          const toIndex = exams.findIndex((e: Exam) => e.id === toId);

          if (fromIndex !== -1 && toIndex !== -1) {
            const startIndex = Math.min(fromIndex, toIndex);
            const endIndex = Math.max(fromIndex, toIndex);

            set((state) => {
              for (let i = startIndex; i <= endIndex; i++) {
                state.selection.selectedIds.add(state.exams[i].id);
              }
              state.selection.isAllSelected =
                state.selection.selectedIds.size === state.exams.length;
            });
          }
        },

        // View actions
        setSelectedExam: (exam) => {
          set((state) => {
            state.selectedExam = exam;
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

        openDetailPanel: async (examId) => {
          const exam = await get().fetchExamById(examId);
          set((state) => {
            state.selectedExam = exam;
            state.isDetailPanelOpen = true;
          });
        },

        closeDetailPanel: () => {
          set((state) => {
            state.isDetailPanelOpen = false;
            state.selectedExam = null;
          });
        },

        // Draft actions
        setDraftExam: (draft) => {
          set((state) => {
            state.draftExam = draft;
          });
        },

        updateDraftField: (field, value) => {
          set((state) => {
            if (state.draftExam) {
              (state.draftExam as any)[field] = value;
            }
          });
        },

        validateDraft: () => {
          const { draftExam } = get();
          if (!draftExam) return false;

          const errors = validateExamDraft(draftExam);

          set((state) => {
            state.fieldErrors = errors;
          });

          return Object.keys(errors).length === 0;
        },

        saveDraft: async () => {
          const { draftExam } = get();
          if (!draftExam) return null;

          if (!get().validateDraft()) {
            return null;
          }

          return await get().createExam(draftExam);
        },

        discardDraft: () => {
          set((state) => {
            state.draftExam = null;
            state.fieldErrors = {};
          });
        },

        // Pagination actions
        setPage: (page) => {
          set((state) => {
            state.pagination.page = page;
          });

          // Fetch new page data
          const { lastAppliedFilters } = get();
          get().fetchExams(lastAppliedFilters || {});
        },

        setPageSize: (pageSize) => {
          set((state) => {
            state.pagination.pageSize = pageSize;
            state.pagination.page = 1; // Reset to first page
            state.pagination.totalPages = calculateTotalPages(
              state.pagination.total,
              pageSize
            );
          });

          // Fetch new page data
          const { lastAppliedFilters } = get();
          get().fetchExams(lastAppliedFilters || {});
        },

        nextPage: () => {
          const { pagination } = get();
          if (pagination.page < pagination.totalPages) {
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
          get().setPage(pagination.totalPages);
        },

        // Cache actions
        clearCache: () => {
          set((state) => {
            state.examCache.clear();
            state.cacheSize = 0;
          });
        },

        pruneCache: () => {
          const { examCache, maxCacheSize } = get();

          if (examCache.size <= maxCacheSize) return;

          // Convert to array and sort by timestamp (oldest first)
          const entries = Array.from(examCache.entries()).sort(
            ([, a], [, b]) => a.timestamp - b.timestamp
          );

          // Remove oldest entries
          const toRemove = entries.slice(0, examCache.size - maxCacheSize);

          set((state) => {
            toRemove.forEach(([id]) => {
              state.examCache.delete(id);
            });
            state.cacheSize = state.examCache.size;
          });
        },

        setCacheSize: (size) => {
          set((state) => {
            state.maxCacheSize = size;
          });

          // Prune if current cache exceeds new size
          if (get().cacheSize > size) {
            get().pruneCache();
          }
        },

        // Utility actions
        refreshExams: async () => {
          const { lastAppliedFilters } = get();
          await get().fetchExams(lastAppliedFilters || {});
        },

        refreshStatistics: async () => {
          const { exams } = get();

          const stats: ExamStatistics = {
            totalExams: exams.length,
            activeExams: exams.filter((e: Exam) => e.status === ExamStatus.ACTIVE).length,
            pendingExams: exams.filter((e: Exam) => e.status === ExamStatus.PENDING).length,
            archivedExams: exams.filter((e: Exam) => e.status === ExamStatus.ARCHIVED).length,
            examsByType: {} as Record<ExamType, number>,
            examsByDifficulty: {} as Record<QuestionDifficulty, number>,
            examsBySubject: {},
          };

          // Count by type
          Object.values(ExamType).forEach(type => {
            stats.examsByType[type] = exams.filter((e: Exam) => e.examType === type).length;
          });

          // Count by difficulty
          Object.values(QuestionDifficulty).forEach(difficulty => {
            stats.examsByDifficulty[difficulty] = exams.filter((e: Exam) => e.difficulty === difficulty).length;
          });

          // Count by subject
          exams.forEach((exam: Exam) => {
            stats.examsBySubject[exam.subject] = (stats.examsBySubject[exam.subject] || 0) + 1;
          });

          set((state) => {
            state.statistics = stats;
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

        // Search & Sort actions
        applyFilters: async (filters) => {
          set((state) => {
            state.pagination.page = 1; // Reset to first page
          });

          await get().fetchExams(filters);
        },

        clearFilters: async () => {
          set((state) => {
            state.pagination.page = 1;
            state.lastAppliedFilters = null;
          });

          await get().fetchExams();
        },

        sortExams: (sortBy, direction) => {
          set((state) => {
            const sortedExams = [...state.exams].sort((a: Exam, b: Exam) => {
              let aValue: unknown = a[sortBy];
              let bValue: unknown = b[sortBy];

              // Handle different data types
              if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
              }

              // Type guard for comparison
              if (aValue == null && bValue == null) return 0;
              if (aValue == null) return direction === 'asc' ? -1 : 1;
              if (bValue == null) return direction === 'asc' ? 1 : -1;

              if (direction === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
              } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
              }
            });

            state.exams = sortedExams;
          });
        },

        // Results actions
        fetchExamResults: async (attemptId) => {
          try {
            const result = await ExamService.getExamResults(attemptId);

            set((state) => {
              const existingIndex = state.examResults.findIndex(r => r.attemptId === attemptId);
              if (existingIndex !== -1) {
                state.examResults[existingIndex] = result;
              } else {
                state.examResults.push(result);
              }
              state.currentResult = result;
            });

            return result;
          } catch (error) {
            console.error('Failed to fetch exam results:', error);
            return null;
          }
        },

        fetchExamStatistics: async (examId) => {
          try {
            const statistics = await ExamService.getExamStatistics(examId);
            return statistics;
          } catch (error) {
            console.error('Failed to fetch exam statistics:', error);
            return null;
          }
        },

      }))
    ),
    {
      name: 'exam-store',
      version: 1,
    }
  )
);
