/**
 * Exam Attempt Store
 * Zustand store for exam session management and real-time exam taking
 * Manages exam attempts, timer, auto-save, and exam taking experience
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
  type ExamAttempt,
  type ExamAnswer,
  type ExamResult,

} from '@/types/exam';

import { ExamService } from '@/services/grpc/exam.service';
import { toast } from 'sonner';

// ===== STORE INTERFACES =====

interface ExamTimerState {
  totalDurationSeconds: number;
  timeRemainingSeconds: number;
  isActive: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number;
  warningThresholds: number[]; // Seconds for warnings (e.g., [300, 60] for 5min, 1min)
  warningsShown: Set<number>;
}

interface ExamNavigationState {
  currentQuestionIndex: number;
  totalQuestions: number;
  visitedQuestions: Set<number>;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  questionOrder: number[]; // For shuffled questions
}

interface ExamAnswerState {
  answers: Record<string, unknown>; // questionId -> answer data
  answerHistory: Record<string, unknown[]>; // questionId -> answer history
  lastSaveTime: number;
  unsavedChanges: Set<string>; // questionIds with unsaved changes
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // seconds
}

interface ExamSessionState {
  sessionId: string | null;
  isActive: boolean;
  isSubmitting: boolean;
  isAutoSaving: boolean;
  lastActivity: number;
  inactivityWarningShown: boolean;
  maxInactivityMinutes: number;
}

interface ExamAttemptStoreState {
  // Current attempt
  currentAttempt: ExamAttempt | null;
  
  // Timer state
  timer: ExamTimerState;
  
  // Navigation state
  navigation: ExamNavigationState;
  
  // Answer state
  answers: ExamAnswerState;
  
  // Session state
  session: ExamSessionState;
  
  // Results
  submittedResult: ExamResult | null;
  
  // Loading states
  isLoading: boolean;
  isStarting: boolean;
  isSubmitting: boolean;
  
  // Error state
  error: string | null;
  
  // === ACTIONS ===
  
  // Attempt management
  startAttempt: (examId: string) => Promise<ExamAttempt | null>;
  resumeAttempt: (attemptId: string) => Promise<ExamAttempt | null>;
  submitAttempt: () => Promise<ExamResult | null>;
  abandonAttempt: () => Promise<boolean>;
  
  // Timer actions
  startTimer: (durationMinutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateTimer: () => void;
  addWarningThreshold: (seconds: number) => void;
  
  // Navigation actions
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToFirstUnanswered: () => void;
  goToLastQuestion: () => void;
  markQuestionVisited: (index: number) => void;
  toggleQuestionFlag: (index: number) => void;
  
  // Answer actions
  saveAnswer: (questionId: string, answer: unknown) => Promise<boolean>;
  updateAnswer: (questionId: string, answer: unknown) => void;
  clearAnswer: (questionId: string) => void;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  forceAutoSave: () => Promise<boolean>;
  
  // Session actions
  updateActivity: () => void;
  checkInactivity: () => void;
  showInactivityWarning: () => void;
  
  // Utility actions
  getProgress: () => { answered: number; total: number; percentage: number };
  getTimeSpent: () => number;
  getQuestionStatus: (index: number) => 'not-visited' | 'visited' | 'answered' | 'flagged';
  canNavigateToQuestion: (index: number) => boolean;
  
  // Reset actions
  resetAttempt: () => void;
  clearError: () => void;
}

// ===== CONSTANTS =====

const DEFAULT_AUTO_SAVE_INTERVAL = 30; // seconds
const DEFAULT_INACTIVITY_WARNING = 15; // minutes
const DEFAULT_WARNING_THRESHOLDS = [300, 60]; // 5 minutes, 1 minute

const INITIAL_TIMER_STATE: ExamTimerState = {
  totalDurationSeconds: 0,
  timeRemainingSeconds: 0,
  isActive: false,
  isPaused: false,
  startTime: null,
  pausedTime: 0,
  warningThresholds: [...DEFAULT_WARNING_THRESHOLDS],
  warningsShown: new Set(),
};

const INITIAL_NAVIGATION_STATE: ExamNavigationState = {
  currentQuestionIndex: 0,
  totalQuestions: 0,
  visitedQuestions: new Set(),
  answeredQuestions: new Set(),
  flaggedQuestions: new Set(),
  questionOrder: [],
};

const INITIAL_ANSWER_STATE: ExamAnswerState = {
  answers: {},
  answerHistory: {},
  lastSaveTime: 0,
  unsavedChanges: new Set(),
  autoSaveEnabled: true,
  autoSaveInterval: DEFAULT_AUTO_SAVE_INTERVAL,
};

const INITIAL_SESSION_STATE: ExamSessionState = {
  sessionId: null,
  isActive: false,
  isSubmitting: false,
  isAutoSaving: false,
  lastActivity: Date.now(),
  inactivityWarningShown: false,
  maxInactivityMinutes: DEFAULT_INACTIVITY_WARNING,
};

// ===== UTILITY FUNCTIONS =====

function calculateTimeRemaining(startTime: number, durationSeconds: number, pausedTime: number): number {
  const elapsed = (Date.now() - startTime - pausedTime) / 1000;
  return Math.max(0, durationSeconds - elapsed);
}

function generateQuestionOrder(totalQuestions: number, shuffle: boolean): number[] {
  const order = Array.from({ length: totalQuestions }, (_, i) => i);
  
  if (shuffle) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  
  return order;
}

// ===== STORE IMPLEMENTATION =====

export const useExamAttemptStore = create<ExamAttemptStoreState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        currentAttempt: null,
        
        timer: { ...INITIAL_TIMER_STATE },
        navigation: { ...INITIAL_NAVIGATION_STATE },
        answers: { ...INITIAL_ANSWER_STATE },
        session: { ...INITIAL_SESSION_STATE },
        
        submittedResult: null,
        
        isLoading: false,
        isStarting: false,
        isSubmitting: false,
        
        error: null,
        
        // === ACTIONS IMPLEMENTATION ===
        
        // Start new exam attempt
        startAttempt: async (examId) => {
          set((state) => {
            state.isStarting = true;
            state.error = null;
          });
          
          try {
            const attempt = await ExamService.startExam(examId);
            
            if (attempt) {
              set((state) => {
                state.currentAttempt = attempt;
                state.session.sessionId = attempt.id;
                state.session.isActive = true;
                state.session.lastActivity = Date.now();
                state.isStarting = false;
              });
              
              // Initialize navigation for this exam
              // Note: In real implementation, we'd get question count from exam
              const questionCount = 20; // Mock value
              const shouldShuffle = false; // Mock value - get from exam settings
              
              set((state) => {
                state.navigation.totalQuestions = questionCount;
                state.navigation.questionOrder = generateQuestionOrder(questionCount, shouldShuffle);
                state.navigation.currentQuestionIndex = 0;
                state.navigation.visitedQuestions.add(0);
              });
              
              toast.success('Đã bắt đầu làm bài thi');
              return attempt;
            }
            
            throw new Error('Failed to start exam attempt');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start exam attempt';
            set((state) => {
              state.error = errorMessage;
              state.isStarting = false;
            });
            toast.error(errorMessage);
            return null;
          }
        },
        
        // Resume existing attempt
        resumeAttempt: async (attemptId) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            const attempt = await ExamService.getAttemptStatus(attemptId);
            
            if (attempt) {
              set((state) => {
                state.currentAttempt = attempt;
                state.session.sessionId = attempt.id;
                state.session.isActive = true;
                state.session.lastActivity = Date.now();
                
                // Restore answers
                if (attempt.answers) {
                  (attempt.answers as ExamAnswer[]).forEach((answer: ExamAnswer) => {
                    state.answers.answers[answer.questionId] = answer.answerData;
                    state.navigation.answeredQuestions.add(
                      state.navigation.questionOrder.indexOf(
                        parseInt(answer.questionId.replace('q', '')) - 1
                      )
                    );
                  });
                }
                
                state.isLoading = false;
              });
              
              toast.success('Đã khôi phục phiên làm bài');
              return attempt;
            }
            
            throw new Error('Attempt not found');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to resume attempt';
            set((state) => {
              state.error = errorMessage;
              state.isLoading = false;
            });
            toast.error(errorMessage);
            return null;
          }
        },

        // Submit exam attempt
        submitAttempt: async () => {
          const { currentAttempt, answers: _answers } = get();
          if (!currentAttempt) {
            return null;
          }

          set((state) => {
            state.isSubmitting = true;
            state.error = null;
          });

          try {
            // Stop timer
            get().stopTimer();

            // Force save any unsaved answers
            await get().forceAutoSave();

            const result = await ExamService.submitExam(currentAttempt.id);

            set((state) => {
              state.submittedResult = result;
              state.session.isActive = false;
              state.isSubmitting = false;
            });

            toast.success('Đã nộp bài thi thành công');
            return result;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit exam';
            set((state) => {
              state.error = errorMessage;
              state.isSubmitting = false;
            });
            toast.error(errorMessage);
            return null;
          }
        },

        // Abandon attempt
        abandonAttempt: async () => {
          const { currentAttempt } = get();
          if (!currentAttempt) {
            return false;
          }

          try {
            // In real implementation, call API to mark attempt as cancelled
            // await ExamService.cancelAttempt(currentAttempt.id);

            get().resetAttempt();
            toast.success('Đã hủy bài thi');
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to abandon attempt';
            toast.error(errorMessage);
            return false;
          }
        },

        // Timer actions
        startTimer: (durationMinutes) => {
          const durationSeconds = durationMinutes * 60;

          set((state) => {
            state.timer.totalDurationSeconds = durationSeconds;
            state.timer.timeRemainingSeconds = durationSeconds;
            state.timer.isActive = true;
            state.timer.isPaused = false;
            state.timer.startTime = Date.now();
            state.timer.pausedTime = 0;
            state.timer.warningsShown.clear();
          });
        },

        pauseTimer: () => {
          set((state) => {
            if (state.timer.isActive && !state.timer.isPaused) {
              state.timer.isPaused = true;
              state.timer.isActive = false;
            }
          });
        },

        resumeTimer: () => {
          set((state) => {
            if (state.timer.isPaused) {
              const pauseDuration = Date.now() - (state.timer.startTime || Date.now());
              state.timer.pausedTime += pauseDuration;
              state.timer.isPaused = false;
              state.timer.isActive = true;
            }
          });
        },

        stopTimer: () => {
          set((state) => {
            state.timer.isActive = false;
            state.timer.isPaused = false;
            state.timer.timeRemainingSeconds = 0;
          });
        },

        updateTimer: () => {
          const { timer } = get();
          if (!timer.isActive || timer.isPaused || !timer.startTime) {
            return;
          }

          const timeRemaining = calculateTimeRemaining(
            timer.startTime,
            timer.totalDurationSeconds,
            timer.pausedTime
          );

          set((state) => {
            state.timer.timeRemainingSeconds = timeRemaining;
          });

          // Check for warnings
          timer.warningThresholds.forEach(threshold => {
            if (timeRemaining <= threshold && !timer.warningsShown.has(threshold)) {
              set((state) => {
                state.timer.warningsShown.add(threshold);
              });

              const minutes = Math.floor(threshold / 60);
              const seconds = threshold % 60;
              const timeText = minutes > 0 ? `${minutes} phút` : `${seconds} giây`;
              toast.warning(`Còn lại ${timeText} để hoàn thành bài thi`);
            }
          });

          // Auto-submit when time runs out
          if (timeRemaining <= 0) {
            toast.error('Hết thời gian làm bài! Tự động nộp bài...');
            get().submitAttempt();
          }
        },

        addWarningThreshold: (seconds) => {
          set((state) => {
            if (!state.timer.warningThresholds.includes(seconds)) {
              state.timer.warningThresholds.push(seconds);
              state.timer.warningThresholds.sort((a, b) => b - a);
            }
          });
        },

        // Navigation actions
        goToQuestion: (index) => {
          const { navigation } = get();
          if (index >= 0 && index < navigation.totalQuestions) {
            set((state) => {
              state.navigation.currentQuestionIndex = index;
              state.navigation.visitedQuestions.add(index);
            });

            get().updateActivity();
          }
        },

        nextQuestion: () => {
          const { navigation } = get();
          if (navigation.currentQuestionIndex < navigation.totalQuestions - 1) {
            get().goToQuestion(navigation.currentQuestionIndex + 1);
          }
        },

        previousQuestion: () => {
          const { navigation } = get();
          if (navigation.currentQuestionIndex > 0) {
            get().goToQuestion(navigation.currentQuestionIndex - 1);
          }
        },

        goToFirstUnanswered: () => {
          const { navigation } = get();
          for (let i = 0; i < navigation.totalQuestions; i++) {
            if (!navigation.answeredQuestions.has(i)) {
              get().goToQuestion(i);
              return;
            }
          }
        },

        goToLastQuestion: () => {
          const { navigation } = get();
          get().goToQuestion(navigation.totalQuestions - 1);
        },

        markQuestionVisited: (index) => {
          set((state) => {
            state.navigation.visitedQuestions.add(index);
          });
        },

        toggleQuestionFlag: (index) => {
          set((state) => {
            if (state.navigation.flaggedQuestions.has(index)) {
              state.navigation.flaggedQuestions.delete(index);
            } else {
              state.navigation.flaggedQuestions.add(index);
            }
          });
        },

        // Answer actions
        saveAnswer: async (questionId, answer) => {
          const { currentAttempt } = get();
          if (!currentAttempt) {
            return false;
          }

          try {
            await ExamService.saveAnswer(currentAttempt.id, questionId, typeof answer === 'string' ? answer : JSON.stringify(answer));

            set((state) => {
              // Update answer
              state.answers.answers[questionId] = answer;

              // Add to answer history
              if (!state.answers.answerHistory[questionId]) {
                state.answers.answerHistory[questionId] = [];
              }
              state.answers.answerHistory[questionId].push({
                answer,
                timestamp: Date.now()
              });

              // Mark as answered
              const questionIndex = state.navigation.questionOrder.indexOf(
                parseInt(questionId.replace('q', '')) - 1
              );
              if (questionIndex !== -1) {
                state.navigation.answeredQuestions.add(questionIndex);
              }

              // Remove from unsaved changes
              state.answers.unsavedChanges.delete(questionId);
              state.answers.lastSaveTime = Date.now();
            });

            get().updateActivity();
            return true;
          } catch (error) {
            console.error('Failed to save answer:', error);
            return false;
          }
        },

        updateAnswer: (questionId, answer) => {
          set((state) => {
            state.answers.answers[questionId] = answer;
            state.answers.unsavedChanges.add(questionId);
          });

          get().updateActivity();
        },

        clearAnswer: (questionId) => {
          set((state) => {
            delete state.answers.answers[questionId];
            state.answers.unsavedChanges.add(questionId);

            // Remove from answered questions
            const questionIndex = state.navigation.questionOrder.indexOf(
              parseInt(questionId.replace('q', '')) - 1
            );
            if (questionIndex !== -1) {
              state.navigation.answeredQuestions.delete(questionIndex);
            }
          });

          get().updateActivity();
        },

        enableAutoSave: () => {
          set((state) => {
            state.answers.autoSaveEnabled = true;
          });
        },

        disableAutoSave: () => {
          set((state) => {
            state.answers.autoSaveEnabled = false;
          });
        },

        forceAutoSave: async () => {
          const { answers, currentAttempt } = get();
          if (!currentAttempt || !answers.autoSaveEnabled || answers.unsavedChanges.size === 0) {
            return true;
          }

          set((state) => {
            state.session.isAutoSaving = true;
          });

          try {
            const savePromises = Array.from(answers.unsavedChanges).map(async (questionId) => {
              const answer = answers.answers[questionId];
              if (answer !== undefined) {
                return await get().saveAnswer(questionId, answer);
              }
              return true;
            });

            const results = await Promise.all(savePromises);
            const allSaved = results.every(Boolean);

            set((state) => {
              state.session.isAutoSaving = false;
            });

            return allSaved;
          } catch (error) {
            set((state) => {
              state.session.isAutoSaving = false;
            });
            console.error('Auto-save failed:', error);
            return false;
          }
        },

        // Session actions
        updateActivity: () => {
          set((state) => {
            state.session.lastActivity = Date.now();
            state.session.inactivityWarningShown = false;
          });
        },

        checkInactivity: () => {
          const { session } = get();
          const inactiveMinutes = (Date.now() - session.lastActivity) / (1000 * 60);

          if (inactiveMinutes >= session.maxInactivityMinutes && !session.inactivityWarningShown) {
            get().showInactivityWarning();
          }
        },

        showInactivityWarning: () => {
          set((state) => {
            state.session.inactivityWarningShown = true;
          });

          toast.warning(
            'Bạn đã không hoạt động trong thời gian dài. Vui lòng tiếp tục làm bài để tránh mất phiên.',
            { duration: 10000 }
          );
        },

        // Utility actions
        getProgress: () => {
          const { navigation } = get();
          const answered = navigation.answeredQuestions.size;
          const total = navigation.totalQuestions;
          const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

          return { answered, total, percentage };
        },

        getTimeSpent: () => {
          const { timer } = get();
          if (!timer.startTime) return 0;

          const elapsed = Date.now() - timer.startTime - timer.pausedTime;
          return Math.floor(elapsed / 1000);
        },

        getQuestionStatus: (index) => {
          const { navigation } = get();

          if (navigation.flaggedQuestions.has(index)) {
            return 'flagged';
          }
          if (navigation.answeredQuestions.has(index)) {
            return 'answered';
          }
          if (navigation.visitedQuestions.has(index)) {
            return 'visited';
          }
          return 'not-visited';
        },

        canNavigateToQuestion: (index) => {
          const { navigation } = get();
          return index >= 0 && index < navigation.totalQuestions;
        },

        // Reset actions
        resetAttempt: () => {
          set((state) => {
            state.currentAttempt = null;
            state.timer = { ...INITIAL_TIMER_STATE };
            state.navigation = { ...INITIAL_NAVIGATION_STATE };
            state.answers = { ...INITIAL_ANSWER_STATE };
            state.session = { ...INITIAL_SESSION_STATE };
            state.submittedResult = null;
            state.isLoading = false;
            state.isStarting = false;
            state.isSubmitting = false;
            state.error = null;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

      }))
    ),
    {
      name: 'exam-attempt-store',
      version: 1,
    }
  )
);

// ===== TIMER HOOK =====

import React from 'react';

// ===== AUTO-SAVE HOOK =====

// Custom hook for auto-save
export function useExamAutoSave() {
  const forceAutoSave = useExamAttemptStore(state => state.forceAutoSave);
  const autoSaveEnabled = useExamAttemptStore(state => state.answers.autoSaveEnabled);
  const autoSaveInterval = useExamAttemptStore(state => state.answers.autoSaveInterval);
  const unsavedChanges = useExamAttemptStore(state => state.answers.unsavedChanges);

  React.useEffect(() => {
    if (!autoSaveEnabled || unsavedChanges.size === 0) return;

    const interval = setInterval(() => {
      forceAutoSave();
    }, autoSaveInterval * 1000);

    return () => clearInterval(interval);
  }, [autoSaveEnabled, autoSaveInterval, unsavedChanges.size, forceAutoSave]);
}

// ===== INACTIVITY HOOK =====

// Custom hook for inactivity checking
export function useExamInactivityCheck() {
  const checkInactivity = useExamAttemptStore(state => state.checkInactivity);
  const isActive = useExamAttemptStore(state => state.session.isActive);

  React.useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      checkInactivity();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isActive, checkInactivity]);
}

// ===== PERFORMANCE OPTIMIZATION HOOKS =====

// Custom hook for selective state subscription to prevent unnecessary re-renders
export function useExamAttemptSelector<T>(selector: (state: ExamAttemptStoreState) => T) {
  return useExamAttemptStore(selector);
}

// Custom hook for exam timer with optimized updates
export function useExamTimer() {
  return useExamAttemptStore(
    React.useCallback(
      (state) => ({
        timeRemainingSeconds: state.timer.timeRemainingSeconds,
        isActive: state.timer.isActive,
        isPaused: state.timer.isPaused,
        startTimer: state.startTimer,
        pauseTimer: state.pauseTimer,
        resumeTimer: state.resumeTimer,
      }),
      []
    )
  );
}

// Custom hook for exam answers with memoization
export function useExamAnswers() {
  return useExamAttemptStore(
    React.useCallback(
      (state) => ({
        answers: state.answers,
        saveAnswer: state.saveAnswer,
        hasUnsavedChanges: state.answers.unsavedChanges.size > 0,
      }),
      []
    )
  );
}

// Performance monitoring hook
export function useExamPerformanceMonitor() {
  const [metrics, setMetrics] = React.useState({
    renderCount: 0,
    lastRenderTime: Date.now(),
    averageRenderTime: 0,
  });

  React.useEffect(() => {
    const now = Date.now();
    const renderTime = now - metrics.lastRenderTime;

    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: now,
      averageRenderTime: (prev.averageRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1),
    }));
  }, [metrics.lastRenderTime]);

  return metrics;
}
