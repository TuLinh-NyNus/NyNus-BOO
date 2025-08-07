// Common types for NyNus application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR", 
  STUDENT = "STUDENT"
}

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  timeLimit?: number;
  points: number;
  explanation?: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  ESSAY = "ESSAY",
  TRUE_FALSE = "TRUE_FALSE",
  FILL_IN_BLANK = "FILL_IN_BLANK"
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM", 
  HARD = "HARD"
}

export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  totalPoints: number;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  answers: Answer[];
  score: number;
  totalPoints: number;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number; // in seconds
}

export interface Answer {
  questionId: string;
  selectedOption?: string;
  textAnswer?: string;
  isCorrect: boolean;
  points: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface CreateQuestionForm {
  content: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  timeLimit?: number;
  points: number;
  explanation?: string;
  options?: Omit<QuestionOption, 'id'>[];
}

export interface CreateExamForm {
  title: string;
  description?: string;
  duration: number;
  questionIds: string[];
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  difficulty?: Difficulty;
  type?: QuestionType;
  tags?: string[];
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  borderRadius: number;
}
