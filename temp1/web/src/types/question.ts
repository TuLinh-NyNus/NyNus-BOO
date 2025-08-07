// Question type definitions
export interface Question {
  _id: string;
  id?: string;
  content: string;
  rawContent: string;
  type: string;
  subcount?: string; // Aligned with Prisma schema
  answers?: Answer[];
  correctAnswer?: string;
  questionID?: QuestionID;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Answer {
  id?: string | number;
  text?: string;
  content?: string;
  isCorrect: boolean;
}

export interface QuestionID {
  fullId: string;
  grade: { value: string; description: string; };
  subject: { value: string; description: string; };
  chapter: { value: string; description: string; };
  level: { value: string; description: string; };
  lesson: { value: string; description: string; };
  form: { value: string; description: string; };
}

export interface ExtractedQuestion {
  content: string;
  type: string;
  answers?: Answer[];
  Subcount?: string;
  questionID?: QuestionID;
}

export interface QuestionIdDetails {
  fullId: string;
  prefix: string;
  number: string;
}

export interface SubcountDetails {
  prefix: string;
  number: string;
  fullId: string;
}
