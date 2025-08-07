/**
 * Unified QuestionFormData Type Definition
 * Consolidates all question form interfaces to fix TypeScript errors
 */

export interface QuestionAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface QuestionIDField {
  value: string;
  description: string;
}

export interface QuestionID {
  format: string;
  fullId: string;
  grade: QuestionIDField;
  subject: QuestionIDField;
  chapter?: QuestionIDField | null;
  level?: QuestionIDField;
  difficulty?: QuestionIDField;
  lesson?: QuestionIDField | null;
  form?: QuestionIDField;
  [key: string]: unknown; // Cho phép các trường động
}

export interface Subcount {
  prefix: string;
  number: string;
  fullId: string;
}

export interface QuestionImages {
  questionImage: string | null;
  solutionImage: string | null;
}

export interface QuestionCreator {
  id: string;
  name: string;
}

export interface QuestionStatus {
  code: string;
  lastUpdated: string;
}

export interface QuestionUsageHistory {
  examId: string;
  examName: string;
  date: Date | string;
  questionPosition: number;
}

export interface QuestionFeedback {
  count: number;
  averageDifficulty: number;
  clarity: number;
  correctnessRate: number;
  feedbackCount: number;
  comments: Array<{
    id: string;
    userId: string;
    content: string;
    date: string | Date;
  }>;
}

/**
 * Unified QuestionFormData interface
 * Includes all properties used across the application
 */
export interface QuestionFormData {
  // Basic identification
  id?: string;
  _id?: string; // Legacy compatibility

  // Content fields
  rawContent: string;
  raw_content?: string; // Legacy compatibility
  content: string;
  
  // Question type - aligned with Prisma schema
  type: string;
  
  // Additional content
  solution: string;
  source: string;
  tags: string[];
  
  // Identification systems
  subcount: Subcount;
  questionID: QuestionID;
  questionId?: string; // Legacy compatibility
  
  // Answers and correct answers - aligned with Prisma schema
  answers: QuestionAnswer[];
  correctAnswer: string | string[] | null;

  // Additional fields for compatibility
  creatorId?: string; // Creator ID field
  examRefs?: Array<{ id: string; name: string; date: string | Date }> | null;
  
  // Media
  images: QuestionImages;
  
  // Metadata
  creator: QuestionCreator;
  status: QuestionStatus;
  difficulty?: string;
  usageCount: number;
  usageHistory: QuestionUsageHistory[];
  feedback: QuestionFeedback;
  
  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Partial type for form updates
 */
export type PartialQuestionFormData = Partial<QuestionFormData>;

/**
 * Type for question form state setters
 */
export type QuestionFormDataSetter = React.Dispatch<React.SetStateAction<QuestionFormData>>;

/**
 * Helper function to create default QuestionFormData
 */
export const createDefaultQuestionFormData = (): QuestionFormData => ({
  rawContent: '',
  content: '',
  type: 'MC',
  solution: '',
  source: '',
  tags: [],

  subcount: {
    prefix: 'SC',
    number: '',
    fullId: '',
  },

  questionID: {
    format: 'standard',
    fullId: '',
    grade: { value: '', description: '' },
    subject: { value: '', description: '' },
    chapter: { value: '', description: '' },
    level: { value: '', description: '' },
    lesson: { value: '', description: '' },
    form: { value: '', description: '' },
  },
  
  answers: [],
  correctAnswer: null,
  
  images: {
    questionImage: null,
    solutionImage: null,
  },
  
  creator: {
    id: 'admin',
    name: 'Tú',
  },
  
  status: {
    code: 'draft',
    lastUpdated: new Date().toISOString(),
  },
  
  usageCount: 0,
  usageHistory: [],
  
  feedback: {
    count: 0,
    averageDifficulty: 0,
    clarity: 0,
    correctnessRate: 0,
    feedbackCount: 0,
    comments: [],
   },
});

/**
 * Type guard to check if an object is QuestionFormData
 */
export const isQuestionFormData = (obj: any): obj is QuestionFormData => {
  return obj &&
    typeof obj.rawContent === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.type === 'string' &&
    obj.subcount &&
    obj.questionID &&
    Array.isArray(obj.answers);
};
