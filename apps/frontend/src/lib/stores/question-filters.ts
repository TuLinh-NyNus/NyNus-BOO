/**
 * Question Filters Store
 * Zustand store cho comprehensive question filtering state management
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { QuestionFilters, QuestionType, QuestionStatus, QuestionDifficulty } from '@/lib/types/question';

// ===== FILTER PRESET INTERFACE =====

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: QuestionFilters;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== STORE STATE INTERFACE =====

interface QuestionFiltersState {
  // Current filter state
  filters: QuestionFilters;
  
  // Filter presets
  presets: FilterPreset[];
  activePresetId: string | null;
  
  // UI state
  isAdvancedMode: boolean;
  isFilterPanelOpen: boolean;
  
  // Filter result count
  resultCount: number;
  
  // Actions
  setFilters: (filters: Partial<QuestionFilters>) => void;
  resetFilters: () => void;
  resetFilterCategory: (category: 'questionCode' | 'metadata' | 'content' | 'usage' | 'search') => void;
  
  // QuestionCode filters
  setGradeFilter: (grades: string[]) => void;
  setSubjectFilter: (subjects: string[]) => void;
  setChapterFilter: (chapters: string[]) => void;
  setLevelFilter: (levels: string[]) => void;
  setLessonFilter: (lessons: string[]) => void;
  setFormFilter: (forms: string[]) => void;
  setFormatFilter: (formats: ('ID5' | 'ID6')[]) => void;
  
  // Metadata filters
  setTypeFilter: (types: QuestionType[]) => void;
  setStatusFilter: (statuses: QuestionStatus[]) => void;
  setDifficultyFilter: (difficulties: string[]) => void;
  setCreatorFilter: (creators: string[]) => void;
  
  // Content filters
  setSourceFilter: (source: string) => void; // Changed from string[] to string
  setTagsFilter: (tags: string[]) => void;
  setSubcountFilter: (subcount: string) => void;
  setHasAnswersFilter: (hasAnswers: boolean | undefined) => void;
  setHasSolutionFilter: (hasSolution: boolean | undefined) => void;
  setHasImagesFilter: (hasImages: boolean | undefined) => void;
  
  // Usage filters
  setUsageCountFilter: (range: { min?: number; max?: number } | undefined) => void;
  setFeedbackFilter: (range: { min?: number; max?: number } | undefined) => void;
  setDateRangeFilter: (range: { from?: Date; to?: Date; field: 'createdAt' | 'updatedAt' } | undefined) => void;
  
  // Search filters
  setKeywordFilter: (keyword: string) => void;
  setSolutionKeywordFilter: (keyword: string) => void;
  setLatexKeywordFilter: (keyword: string) => void;
  setGlobalSearchFilter: (keyword: string) => void;
  
  // Sorting
  setSorting: (sortBy: 'createdAt' | 'updatedAt' | 'usageCount' | 'feedback', sortDir: 'asc' | 'desc') => void;
  
  // Presets
  savePreset: (name: string, description: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<FilterPreset>) => void;
  
  // UI actions
  toggleAdvancedMode: () => void;
  toggleFilterPanel: () => void;
  setResultCount: (count: number) => void;
}

// ===== DEFAULT FILTER STATE =====

const DEFAULT_FILTERS: QuestionFilters = {
  // QuestionCode filters
  grade: [],
  subject: [],
  chapter: [],
  level: [],
  lesson: [],
  form: [],
  format: [],
  
  // Metadata filters
  type: [],
  status: [],
  difficulty: [],
  creator: [],
  
  // Content filters
  source: '', // Changed from [] to '' for free input
  tags: [],
  subcount: '',
  hasAnswers: undefined,
  hasSolution: undefined,
  hasImages: undefined,
  
  // Usage filters
  usageCount: undefined,
  feedback: undefined,
  dateRange: undefined,
  
  // Search filters
  keyword: '',
  solutionKeyword: '',
  latexKeyword: '',
  globalSearch: '',
  
  // Sorting
  sortBy: 'createdAt',
  sortDir: 'desc',
  
  // Pagination
  page: 1,
  pageSize: 20
};

// ===== DEFAULT PRESETS =====

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all-questions',
    name: 'Tất cả câu hỏi',
    description: 'Hiển thị tất cả câu hỏi trong hệ thống',
    filters: { ...DEFAULT_FILTERS },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'active-questions',
    name: 'Câu hỏi hoạt động',
    description: 'Chỉ hiển thị câu hỏi đang hoạt động',
    filters: {
      ...DEFAULT_FILTERS,
      status: [QuestionStatus.ACTIVE]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'math-grade-10',
    name: 'Toán lớp 10',
    description: 'Câu hỏi Toán học lớp 10',
    filters: {
      ...DEFAULT_FILTERS,
      grade: ['0'],
      subject: ['P'],
      status: [QuestionStatus.ACTIVE]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'multiple-choice',
    name: 'Trắc nghiệm',
    description: 'Chỉ câu hỏi trắc nghiệm',
    filters: {
      ...DEFAULT_FILTERS,
      type: [QuestionType.MC],
      status: [QuestionStatus.ACTIVE]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ===== ZUSTAND STORE =====

export const useQuestionFiltersStore = create<QuestionFiltersState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        filters: { ...DEFAULT_FILTERS },
        presets: DEFAULT_PRESETS,
        activePresetId: 'all-questions',
        isAdvancedMode: false,
        isFilterPanelOpen: true,
        resultCount: 0,

        // Basic filter actions
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            activePresetId: null // Clear active preset when manually changing filters
          }));
        },

        resetFilters: () => {
          set({
            filters: { ...DEFAULT_FILTERS },
            activePresetId: 'all-questions'
          });
        },

        resetFilterCategory: (category) => {
          set((state) => {
            const newFilters = { ...state.filters };
            
            switch (category) {
              case 'questionCode':
                newFilters.grade = [];
                newFilters.subject = [];
                newFilters.chapter = [];
                newFilters.level = [];
                newFilters.lesson = [];
                newFilters.form = [];
                newFilters.format = [];
                break;
              case 'metadata':
                newFilters.type = [];
                newFilters.status = [];
                newFilters.difficulty = [];
                newFilters.creator = [];
                break;
              case 'content':
                newFilters.source = '';
                newFilters.tags = [];
                newFilters.subcount = '';
                newFilters.hasAnswers = undefined;
                newFilters.hasSolution = undefined;
                newFilters.hasImages = undefined;
                break;
              case 'usage':
                newFilters.usageCount = undefined;
                newFilters.feedback = undefined;
                newFilters.dateRange = undefined;
                break;
              case 'search':
                newFilters.keyword = '';
                newFilters.solutionKeyword = '';
                newFilters.latexKeyword = '';
                newFilters.globalSearch = '';
                break;
            }
            
            return {
              filters: newFilters,
              activePresetId: null
            };
          });
        },

        // QuestionCode filter actions
        setGradeFilter: (grades) => {
          set((state) => ({
            filters: { ...state.filters, grade: grades },
            activePresetId: null
          }));
        },

        setSubjectFilter: (subjects) => {
          set((state) => ({
            filters: { ...state.filters, subject: subjects },
            activePresetId: null
          }));
        },

        setChapterFilter: (chapters) => {
          set((state) => ({
            filters: { ...state.filters, chapter: chapters },
            activePresetId: null
          }));
        },

        setLevelFilter: (levels) => {
          set((state) => ({
            filters: { ...state.filters, level: levels },
            activePresetId: null
          }));
        },

        setLessonFilter: (lessons) => {
          set((state) => ({
            filters: { ...state.filters, lesson: lessons },
            activePresetId: null
          }));
        },

        setFormFilter: (forms) => {
          set((state) => ({
            filters: { ...state.filters, form: forms },
            activePresetId: null
          }));
        },

        setFormatFilter: (formats) => {
          set((state) => ({
            filters: { ...state.filters, format: formats },
            activePresetId: null
          }));
        },

        // Metadata filter actions
        setTypeFilter: (types) => {
          set((state) => ({
            filters: { ...state.filters, type: types },
            activePresetId: null
          }));
        },

        setStatusFilter: (statuses) => {
          set((state) => ({
            filters: { ...state.filters, status: statuses },
            activePresetId: null
          }));
        },

        setDifficultyFilter: (difficulties) => {
          set((state) => ({
            filters: { ...state.filters, difficulty: difficulties as QuestionDifficulty[] },
            activePresetId: null
          }));
        },

        setCreatorFilter: (creators) => {
          set((state) => ({
            filters: { ...state.filters, creator: creators },
            activePresetId: null
          }));
        },

        // Content filter actions
        setSourceFilter: (source) => {
          set((state) => ({
            filters: { ...state.filters, source: source },
            activePresetId: null
          }));
        },

        setTagsFilter: (tags) => {
          set((state) => ({
            filters: { ...state.filters, tags: tags },
            activePresetId: null
          }));
        },

        setSubcountFilter: (subcount) => {
          set((state) => ({
            filters: { ...state.filters, subcount },
            activePresetId: null
          }));
        },

        setHasAnswersFilter: (hasAnswers) => {
          set((state) => ({
            filters: { ...state.filters, hasAnswers },
            activePresetId: null
          }));
        },

        setHasSolutionFilter: (hasSolution) => {
          set((state) => ({
            filters: { ...state.filters, hasSolution },
            activePresetId: null
          }));
        },

        setHasImagesFilter: (hasImages) => {
          set((state) => ({
            filters: { ...state.filters, hasImages },
            activePresetId: null
          }));
        },

        // Usage filter actions
        setUsageCountFilter: (usageCount) => {
          set((state) => ({
            filters: { ...state.filters, usageCount },
            activePresetId: null
          }));
        },

        setFeedbackFilter: (feedback) => {
          set((state) => ({
            filters: { ...state.filters, feedback },
            activePresetId: null
          }));
        },

        setDateRangeFilter: (dateRange) => {
          set((state) => ({
            filters: { ...state.filters, dateRange },
            activePresetId: null
          }));
        },

        // Search filter actions
        setKeywordFilter: (keyword) => {
          set((state) => ({
            filters: { ...state.filters, keyword },
            activePresetId: null
          }));
        },

        setSolutionKeywordFilter: (solutionKeyword) => {
          set((state) => ({
            filters: { ...state.filters, solutionKeyword },
            activePresetId: null
          }));
        },

        setLatexKeywordFilter: (latexKeyword) => {
          set((state) => ({
            filters: { ...state.filters, latexKeyword },
            activePresetId: null
          }));
        },

        setGlobalSearchFilter: (globalSearch) => {
          set((state) => ({
            filters: { ...state.filters, globalSearch },
            activePresetId: null
          }));
        },

        // Sorting actions
        setSorting: (sortBy, sortDir) => {
          set((state) => ({
            filters: { ...state.filters, sortBy, sortDir },
            activePresetId: null
          }));
        },

        // Preset actions
        savePreset: (name, description) => {
          const { filters } = get();
          const newPreset: FilterPreset = {
            id: `preset-${Date.now()}`,
            name,
            description,
            filters: { ...filters },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set((state) => ({
            presets: [...state.presets, newPreset],
            activePresetId: newPreset.id
          }));
        },

        loadPreset: (presetId) => {
          const { presets } = get();
          const preset = presets.find(p => p.id === presetId);
          
          if (preset) {
            set({
              filters: { ...preset.filters },
              activePresetId: presetId
            });
          }
        },

        deletePreset: (presetId) => {
          set((state) => ({
            presets: state.presets.filter(p => p.id !== presetId),
            activePresetId: state.activePresetId === presetId ? null : state.activePresetId
          }));
        },

        updatePreset: (presetId, updates) => {
          set((state) => ({
            presets: state.presets.map(p => 
              p.id === presetId 
                ? { ...p, ...updates, updatedAt: new Date() }
                : p
            )
          }));
        },

        // UI actions
        toggleAdvancedMode: () => {
          set((state) => ({
            isAdvancedMode: !state.isAdvancedMode
          }));
        },

        toggleFilterPanel: () => {
          set((state) => ({
            isFilterPanelOpen: !state.isFilterPanelOpen
          }));
        },

        setResultCount: (resultCount) => {
          set({ resultCount });
        }
      }),
      {
        name: 'question-filters-store',
        partialize: (state) => ({
          filters: state.filters,
          presets: state.presets,
          activePresetId: state.activePresetId,
          isAdvancedMode: state.isAdvancedMode,
          isFilterPanelOpen: state.isFilterPanelOpen
        })
      }
    ),
    {
      name: 'question-filters-store'
    }
  )
);
