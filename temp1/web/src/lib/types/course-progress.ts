/**
 * Comprehensive interfaces for course progress data structures
 * Fixes TypeScript errors in course progress components
 */

// Achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Chapter progress interface
export interface ChapterProgress {
  id: string;
  name: string;
  progress: number;
  averageScore: number;
  timeSpent: number;
  status: 'completed' | 'in-progress' | 'not-started';
  weakPoints?: string[];
  strongPoints?: string[];
}

// Daily progress interface
export interface DayProgress {
  date: string;
  progress: number;
  timeSpent: number;
}

// Recommendation interface
export interface Recommendation {
  type: 'study' | 'practice' | 'review' | 'time';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

// Gamification data interface
export interface GamificationData {
  achievements: Achievement[];
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  leaderboard?: LeaderboardEntry[];
  weeklyRank?: number;
  totalUsers?: number;
}

// Leaderboard entry interface
export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
}

// Insights data interface
export interface InsightsData {
  strengths: {
    subject: string;
    score: number;
    improvement: number;
  }[];
  weaknesses: {
    subject: string;
    score: number;
    decline: number;
  }[];
  recommendations: Recommendation[];
  goals: {
    current: number;
    target: number;
    deadline: string;
    status: 'on-track' | 'behind' | 'ahead';
  };
}

// Enhanced progress data interface
export interface EnhancedProgressData {
  insights: InsightsData;
  gamification: GamificationData;
  weeklyData?: {
    date: string;
    progress: number;
    timeSpent: number;
  }[];
  weeklyProgress?: DayProgress[]; // Make optional for backward compatibility
  chapterProgress: ChapterProgress[];
  totalProgress?: number; // Add missing property from mock data
  completedLessons?: string[]; // Add missing property from mock data
  timeSpent?: number; // Add missing property from mock data
  lastAccessed?: string; // Add missing property from mock data
}

// Learning stats interface
export interface LearningStats {
  totalTimeSpent?: number;
  averageSessionTime?: number;
  completedLessons?: number;
  totalLessons?: number;
  averageScore?: number;
  streakDays?: number;
  lastActivity?: string;
  // Add properties from MockLearningStats for compatibility
  totalCoursesEnrolled?: number;
  totalCoursesCompleted?: number;
  totalLessonsCompleted?: number;
  totalQuizzesCompleted?: number;
  currentStreak?: number; // Add missing property from mock data
  longestStreak?: number; // Add missing property from mock data
  certificatesEarned?: number;
  weeklyProgress?: { week: string; progress: number }[];
  subjectProgress?: { subject: string; progress: number; color: string }[];
}

// Session data interface
export interface SessionData {
  sessions?: {
    isTrusted: boolean;
    [key: string]: unknown;
  }[];
}

// Progress data interface
export interface ProgressData {
  date: string;
  progress: number;
  timeSpent: number;
}

// Course progress page props
export interface CourseProgressPageProps {
  params: {
    slug: string;
  };
}

// Course progress state
export interface CourseProgressState {
  course: {
    id: string;
    title: string;
    slug: string;
    [key: string]: unknown;
  } | null;
  progressData: {
    totalProgress?: number;
    completedLessons?: string[];
    timeSpent?: number;
    lastAccessed?: string;
    [key: string]: unknown;
  } | null;
  enhancedData: EnhancedProgressData | null;
  learningStats: LearningStats | null;
  isLoading: boolean;
}
