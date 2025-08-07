// Enhanced questions mockdata based on IMPLEMENT_QUESTION.md
import {
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  MockApiResponse,
  MockPagination
} from './core-types';

// Question Code System
export interface QuestionCode {
  code: string; // Primary key - "0P1VH1" format
  format: 'ID5' | 'ID6'; // [XXXXX] hoặc [XXXXX-X]
  grade: string; // Lớp (0-9, A, B, C)
  subject: string; // Môn học (P=Toán, L=Vật lý, H=Hóa học...)
  chapter: string; // Chương (1-9)
  lesson: string; // Bài học (1-9, A-Z)
  form?: string; // Dạng bài (1-9, chỉ ID6)
  level: string; // Mức độ (N,H,V,C,T,M)
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Question với LaTeX support (Database-aligned)
export interface EnhancedQuestion {
  id: string;
  rawContent: string; // LaTeX gốc từ user
  content: string; // Nội dung đã xử lý (cleaned)
  subcount?: string; // [XX.N] format
  type: QuestionType;
  source?: string; // Nguồn câu hỏi

  // Structured answers data
  answers?: string[] | Record<string, unknown> | null; // JSON - MC/TF: array options, SA/ES/MA: null
  correctAnswer?: string | string[] | Record<string, unknown> | null; // JSON - MC: single, TF: array, SA: string, ES/MA: null
  solution?: string; // Lời giải chi tiết

  // Metadata (Database-aligned field names)
  tag: string[]; // ✅ Fixed: 'tag' not 'tags' to match database
  usageCount: number;
  creator: string;
  status: QuestionStatus; // ✅ Fixed: Use proper enum
  feedback: number; // Điểm feedback trung bình
  difficulty: QuestionDifficulty; // ✅ Added: Missing field from database

  // Relations
  questionCodeId: string;
  questionCode?: QuestionCode;

  createdAt: Date;
  updatedAt: Date;
}

// Question Image
export interface QuestionImage {
  id: string;
  questionId: string;
  imageType: 'QUESTION' | 'SOLUTION';
  imagePath?: string; // Local path (temporary)
  driveUrl?: string; // Google Drive URL
  driveFileId?: string; // Google Drive file ID
  status: 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

// Question Tag
export interface QuestionTag {
  id: string;
  questionId: string;
  tagName: string;
  createdAt: Date;
}

// Question Feedback
export interface QuestionFeedback {
  id: string;
  questionId: string;
  userId?: string;
  feedbackType: 'LIKE' | 'DISLIKE' | 'REPORT' | 'SUGGESTION';
  content?: string;
  rating?: number; // 1-5 sao
  createdAt: Date;
}

// MapCode Configuration (user-specific)
export interface MapCodeConfig {
  id: string;
  userId: string; // User-specific configuration
  version: string; // v2024-12-20
  isActive: boolean;
  gradeMapping: Record<string, string>; // "0": "Lớp 10"
  subjectMapping: Record<string, string>; // "P": "Toán học"
  chapterMapping: Record<string, Record<string, string>>; // grade -> subject -> chapters
  lessonMapping: Record<string, Record<string, Record<string, string>>>; // grade -> subject -> chapter -> lessons
  formMapping: Record<string, string>; // "1": "Dạng 1"
  levelMapping: Record<string, string>; // "N": "Nhận biết" (fixed)
  createdAt: Date;
  updatedAt: Date;
}

// Mock Question Codes
export const mockQuestionCodes: QuestionCode[] = [
  {
    code: '0P1VH1',
    format: 'ID6',
    grade: '0', // Lớp 10
    subject: 'P', // Toán học
    chapter: '1', // Chương 1
    lesson: 'V', // Bài V
    form: '1', // Dạng 1
    level: 'H', // Thông hiểu
    createdAt: new Date('2024-08-01T00:00:00Z'),
    updatedAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    code: '2P5VN',
    format: 'ID5',
    grade: '2', // Lớp 12
    subject: 'P', // Toán học
    chapter: '5', // Chương 5
    lesson: 'V', // Bài V
    level: 'N', // Nhận biết
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-08T00:00:00Z')
  },
  {
    code: '1L3HC2',
    format: 'ID6',
    grade: '1', // Lớp 11
    subject: 'L', // Vật lý
    chapter: '3', // Chương 3
    lesson: 'H', // Bài H
    form: '2', // Dạng 2
    level: 'C', // Vận dụng cao
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-12T00:00:00Z')
  }
];

// Mock Enhanced Questions với LaTeX content
export const mockEnhancedQuestions: EnhancedQuestion[] = [
  {
    id: 'q-enh-001',
    rawContent: `\\begin{ex}%[Nguồn: "Sách giáo khoa Toán 12"]%[2P5VN]
    [TL.100022]
    Tìm giá trị lớn nhất của hàm số $f(x) = x^3 - 3x^2 + 2$ trên đoạn $[0, 3]$.
    \\choice
    {$-2$}
    {$0$}
    {\\True $2$}
    {$6$}
    \\loigiai{
        Tính đạo hàm $f'(x) = 3x^2 - 6x = 3x(x-2)$.
        $f'(x) = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$.
        Tính $f(0) = 2$, $f(2) = -2$, $f(3) = 2$.
        Vậy giá trị lớn nhất là $2$.
    }
\\end{ex}`,
    content: 'Tìm giá trị lớn nhất của hàm số $f(x) = x^3 - 3x^2 + 2$ trên đoạn $[0, 3]$.',
    subcount: 'TL.100022',
    type: QuestionType.MC, // ✅ Fixed: Use correct enum value
    source: 'Sách giáo khoa Toán 12',
    answers: ['$-2$', '$0$', '$2$', '$6$'],
    correctAnswer: '$2$',
    solution: 'Tính đạo hàm $f\'(x) = 3x^2 - 6x = 3x(x-2)$. $f\'(x) = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Tính $f(0) = 2$, $f(2) = -2$, $f(3) = 2$. Vậy giá trị lớn nhất là $2$.',
    tag: ['Hàm số', 'Cực trị', 'Lớp 12', 'THPT QG'], // ✅ Fixed: 'tag' not 'tags'
    usageCount: 45,
    creator: 'instructor-001',
    status: QuestionStatus.ACTIVE, // ✅ Fixed: Use enum
    feedback: 4.6,
    difficulty: QuestionDifficulty.HARD, // ✅ Added: Missing field
    questionCodeId: '2P5VN',
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-10T14:20:00Z')
  },
  {
    id: 'q-enh-002',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi thử THPT QG"]%[2P2VH-3]
    [MT.200045]
    Giải phương trình $\\log_2(x+1) + \\log_2(x-1) = 3$.
    \\shortans{'3'}
    \\loigiai{
        Điều kiện: $x > 1$.
        $\\log_2(x+1) + \\log_2(x-1) = 3$
        $\\Leftrightarrow \\log_2[(x+1)(x-1)] = 3$
        $\\Leftrightarrow (x+1)(x-1) = 2^3 = 8$
        $\\Leftrightarrow x^2 - 1 = 8$
        $\\Leftrightarrow x^2 = 9$
        $\\Leftrightarrow x = \\pm 3$
        Kết hợp điều kiện $x > 1$, ta có $x = 3$.
    }
\\end{ex}`,
    content: 'Giải phương trình $\\log_2(x+1) + \\log_2(x-1) = 3$.',
    subcount: 'MT.200045',
    type: QuestionType.SA, // ✅ Fixed: Use correct enum value
    source: 'Đề thi thử THPT QG',
    answers: null,
    correctAnswer: '3',
    solution: 'Điều kiện: $x > 1$. $\\log_2(x+1) + \\log_2(x-1) = 3$ $\\Leftrightarrow \\log_2[(x+1)(x-1)] = 3$ $\\Leftrightarrow (x+1)(x-1) = 2^3 = 8$ $\\Leftrightarrow x^2 - 1 = 8$ $\\Leftrightarrow x^2 = 9$ $\\Leftrightarrow x = \\pm 3$. Kết hợp điều kiện $x > 1$, ta có $x = 3$.',
    tag: ['Logarithm', 'Phương trình', 'Lớp 12'], // ✅ Fixed: 'tag' not 'tags'
    usageCount: 32,
    creator: 'instructor-001',
    status: QuestionStatus.ACTIVE, // ✅ Fixed: Use enum
    feedback: 4.8,
    difficulty: QuestionDifficulty.MEDIUM, // ✅ Added: Missing field
    questionCodeId: '2P2VH3',
    createdAt: new Date('2024-08-20T00:00:00Z'),
    updatedAt: new Date('2025-01-08T09:15:00Z')
  },
  {
    id: 'q-enh-003',
    rawContent: `\\begin{ex}%[Nguồn: "Sách bài tập Vật lý 11"]%[1L3HC2]
    [VL.150033]
    Một vật dao động điều hòa với phương trình $x = 4\\cos(2\\pi t + \\frac{\\pi}{3})$ cm.
    \\choiceTF
    {\\True Biên độ dao động là 4 cm}
    {Tần số góc là $\\pi$ rad/s}
    {\\True Pha ban đầu là $\\frac{\\pi}{3}$ rad}
    {Chu kì dao động là 2 s}
    \\loigiai{
        Từ phương trình $x = 4\\cos(2\\pi t + \\frac{\\pi}{3})$ cm:
        - Biên độ $A = 4$ cm (Đúng)
        - Tần số góc $\\omega = 2\\pi$ rad/s (Sai, đáp án B sai)
        - Pha ban đầu $\\varphi = \\frac{\\pi}{3}$ rad (Đúng)
        - Chu kì $T = \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{2\\pi} = 1$ s (Sai, đáp án D sai)
    }
\\end{ex}`,
    content: 'Một vật dao động điều hòa với phương trình $x = 4\\cos(2\\pi t + \\frac{\\pi}{3})$ cm.',
    subcount: 'VL.150033',
    type: QuestionType.TF, // ✅ Fixed: Use correct enum value
    source: 'Sách bài tập Vật lý 11',
    answers: [
      'Biên độ dao động là 4 cm',
      'Tần số góc là $\\pi$ rad/s',
      'Pha ban đầu là $\\frac{\\pi}{3}$ rad',
      'Chu kì dao động là 2 s'
    ],
    correctAnswer: [
      'Biên độ dao động là 4 cm',
      'Pha ban đầu là $\\frac{\\pi}{3}$ rad'
    ],
    solution: 'Từ phương trình $x = 4\\cos(2\\pi t + \\frac{\\pi}{3})$ cm: - Biên độ $A = 4$ cm (Đúng) - Tần số góc $\\omega = 2\\pi$ rad/s (Sai) - Pha ban đầu $\\varphi = \\frac{\\pi}{3}$ rad (Đúng) - Chu kì $T = 1$ s (Sai)',
    tag: ['Dao động điều hòa', 'Vật lý 11', 'Biên độ'], // ✅ Fixed: 'tag' not 'tags'
    usageCount: 67,
    creator: 'instructor-002',
    status: QuestionStatus.ACTIVE, // ✅ Fixed: Use enum
    feedback: 4.4,
    difficulty: QuestionDifficulty.EASY, // ✅ Added: Missing field
    questionCodeId: '1L3HC2',
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-12T16:30:00Z')
  },
  {
    id: 'q-enh-004',
    rawContent: `\\begin{ex}%[Nguồn: "Tự soạn"]%[0P1VH1]
    [GV.300012]
    Phân tích đa thức sau thành nhân tử: $x^4 - 5x^2 + 4$.
    \\loigiai{
        Đặt $t = x^2$ (với $t \\geq 0$), ta có:
        $t^2 - 5t + 4 = 0$
        $(t-1)(t-4) = 0$
        $\\Leftrightarrow t = 1$ hoặc $t = 4$
        $\\Leftrightarrow x^2 = 1$ hoặc $x^2 = 4$
        $\\Leftrightarrow x = \\pm 1$ hoặc $x = \\pm 2$
        Vậy $x^4 - 5x^2 + 4 = (x-1)(x+1)(x-2)(x+2)$.
    }
\\end{ex}`,
    content: 'Phân tích đa thức sau thành nhân tử: $x^4 - 5x^2 + 4$.',
    subcount: 'GV.300012',
    type: QuestionType.ES, // ✅ Fixed: Use correct enum value
    source: 'Tự soạn',
    answers: null,
    correctAnswer: null,
    solution: 'Đặt $t = x^2$ (với $t \\geq 0$), ta có: $t^2 - 5t + 4 = 0$ $(t-1)(t-4) = 0$ $\\Leftrightarrow t = 1$ hoặc $t = 4$ $\\Leftrightarrow x^2 = 1$ hoặc $x^2 = 4$ $\\Leftrightarrow x = \\pm 1$ hoặc $x = \\pm 2$. Vậy $x^4 - 5x^2 + 4 = (x-1)(x+1)(x-2)(x+2)$.',
    tag: ['Phân tích nhân tử', 'Đa thức', 'Lớp 10'], // ✅ Fixed: 'tag' not 'tags'
    usageCount: 23,
    creator: 'instructor-001',
    status: QuestionStatus.PENDING, // ✅ Fixed: Use enum
    feedback: 0,
    difficulty: QuestionDifficulty.MEDIUM, // ✅ Added: Missing field
    questionCodeId: '0P1VH1',
    createdAt: new Date('2025-01-14T10:00:00Z'),
    updatedAt: new Date('2025-01-14T10:00:00Z')
  }
];

// Mock Question Images
export const mockQuestionImages: QuestionImage[] = [
  {
    id: 'img-001',
    questionId: 'q-enh-001',
    imageType: 'QUESTION',
    imagePath: '/tmp/TL100022-QUES.webp',
    driveUrl: 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view',
    driveFileId: '1a2b3c4d5e6f7g8h9i0j',
    status: 'UPLOADED',
    createdAt: new Date('2024-08-15T01:00:00Z'),
    updatedAt: new Date('2024-08-15T01:05:00Z')
  },
  {
    id: 'img-002',
    questionId: 'q-enh-001',
    imageType: 'SOLUTION',
    imagePath: '/tmp/TL100022-SOL.webp',
    driveUrl: 'https://drive.google.com/file/d/2b3c4d5e6f7g8h9i0j1k/view',
    driveFileId: '2b3c4d5e6f7g8h9i0j1k',
    status: 'UPLOADED',
    createdAt: new Date('2024-08-15T01:10:00Z'),
    updatedAt: new Date('2024-08-15T01:15:00Z')
  },
  {
    id: 'img-003',
    questionId: 'q-enh-004',
    imageType: 'QUESTION',
    imagePath: '/tmp/GV300012-QUES.webp',
    status: 'PENDING',
    createdAt: new Date('2025-01-14T10:05:00Z'),
    updatedAt: new Date('2025-01-14T10:05:00Z')
  }
];

// Mock Question Tags
export const mockQuestionTags: QuestionTag[] = [
  { id: 'tag-001', questionId: 'q-enh-001', tagName: 'Hàm số', createdAt: new Date('2024-08-15T00:00:00Z') },
  { id: 'tag-002', questionId: 'q-enh-001', tagName: 'Cực trị', createdAt: new Date('2024-08-15T00:00:00Z') },
  { id: 'tag-003', questionId: 'q-enh-001', tagName: 'Lớp 12', createdAt: new Date('2024-08-15T00:00:00Z') },
  { id: 'tag-004', questionId: 'q-enh-002', tagName: 'Logarithm', createdAt: new Date('2024-08-20T00:00:00Z') },
  { id: 'tag-005', questionId: 'q-enh-003', tagName: 'Dao động điều hòa', createdAt: new Date('2024-09-01T00:00:00Z') }
];

// Mock Question Feedback
export const mockQuestionFeedback: QuestionFeedback[] = [
  {
    id: 'feedback-001',
    questionId: 'q-enh-001',
    userId: 'student-001',
    feedbackType: 'LIKE',
    rating: 5,
    createdAt: new Date('2025-01-10T15:00:00Z')
  },
  {
    id: 'feedback-002',
    questionId: 'q-enh-001',
    userId: 'student-002',
    feedbackType: 'SUGGESTION',
    content: 'Nên thêm hình vẽ đồ thị để dễ hiểu hơn',
    rating: 4,
    createdAt: new Date('2025-01-11T09:30:00Z')
  },
  {
    id: 'feedback-003',
    questionId: 'q-enh-002',
    userId: 'student-003',
    feedbackType: 'REPORT',
    content: 'Có lỗi LaTeX trong lời giải',
    rating: 2,
    createdAt: new Date('2025-01-12T14:20:00Z')
  }
];

// Mock MapCode Configuration
export const mockMapCodeConfig: MapCodeConfig = {
  id: 'mapcode-001',
  userId: 'system', // System-wide default
  version: 'v2024-12-20',
  isActive: true,
  gradeMapping: {
    '0': 'Lớp 10',
    '1': 'Lớp 11',
    '2': 'Lớp 12',
    '3': 'Lớp 3',
    '4': 'Lớp 4',
    '5': 'Lớp 5',
    '6': 'Lớp 6',
    '7': 'Lớp 7',
    '8': 'Lớp 8',
    '9': 'Lớp 9'
  },
  subjectMapping: {
    'P': 'Toán học',
    'L': 'Vật lý',
    'H': 'Hóa học',
    'S': 'Sinh học',
    'T': 'Tiếng Anh',
    'V': 'Văn học',
    'U': 'Lịch sử',
    'D': 'Địa lý'
  },
  chapterMapping: {
    '0': { // Lớp 10
      'P': 'Toán học lớp 10' // ✅ Fixed: Use string instead of object
    },
    '2': { // Lớp 12
      'P': 'Toán học lớp 12' // ✅ Fixed: Use string instead of object
    }
  },
  lessonMapping: {
    '0': { // Lớp 10
      'P': {
        '1': 'Chương 1 - Mệnh đề và tập hợp'
      }
    },
    '2': { // Lớp 12
      'P': {
        '5': 'Chương 5 - Ứng dụng đạo hàm'
      }
    }
  },
  formMapping: {
    '1': 'Dạng 1',
    '2': 'Dạng 2',
    '3': 'Dạng 3'
  },
  levelMapping: {
    'N': 'Nhận biết',
    'H': 'Thông hiểu',
    'V': 'Vận dụng',
    'C': 'Vận dụng cao',
    'T': 'VIP',
    'M': 'Note'
  },
  createdAt: new Date('2024-12-20T00:00:00Z'),
  updatedAt: new Date('2025-01-10T00:00:00Z')
};

// Helper functions
export function getQuestionsByCode(questionCodeId: string): EnhancedQuestion[] {
  return mockEnhancedQuestions.filter(q => q.questionCodeId === questionCodeId);
}

export function getQuestionsByStatus(status: string): EnhancedQuestion[] {
  return mockEnhancedQuestions.filter(q => q.status === status);
}

export function getQuestionsByType(type: QuestionType): EnhancedQuestion[] {
  return mockEnhancedQuestions.filter(q => q.type === type);
}

export function translateQuestionCode(code: string, config: MapCodeConfig = mockMapCodeConfig): string {
  const parts = code.split('-');
  const mainCode = parts[0]; // "2P5VN"
  const form = parts[1]; // "3" (optional)
  
  if (mainCode.length < 5) return code; // Invalid format
  
  const grade = config.gradeMapping[mainCode[0]] || mainCode[0];
  const subject = config.subjectMapping[mainCode[1]] || mainCode[1];
  const chapter = mainCode[2];
  const level = config.levelMapping[mainCode[3]] || mainCode[3];
  const lesson = mainCode[4];
  const formText = form ? ` - ${config.formMapping[form] || `Dạng ${form}`}` : '';
  
  return `${grade} - ${subject} - Chương ${chapter} - ${level} - Bài ${lesson}${formText}`;
}

export function searchEnhancedQuestions(query: string): EnhancedQuestion[] {
  const searchTerm = query.toLowerCase();
  return mockEnhancedQuestions.filter(q =>
    q.content.toLowerCase().includes(searchTerm) ||
    q.rawContent.toLowerCase().includes(searchTerm) ||
    q.solution?.toLowerCase().includes(searchTerm) ||
    q.tag.some(tag => tag.toLowerCase().includes(searchTerm)) || // ✅ Fixed: 'tag' not 'tags'
    q.subcount?.toLowerCase().includes(searchTerm)
  );
}

// Mock API responses
export function getMockEnhancedQuestionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    questionCodeId?: string;
    type?: QuestionType;
    status?: string;
    creator?: string;
    search?: string;
  }
): MockApiResponse<{ questions: EnhancedQuestion[]; pagination: MockPagination }> {
  let filteredQuestions = [...mockEnhancedQuestions];

  if (filters?.questionCodeId) {
    filteredQuestions = filteredQuestions.filter(q => q.questionCodeId === filters.questionCodeId);
  }
  if (filters?.type) {
    filteredQuestions = filteredQuestions.filter(q => q.type === filters.type);
  }
  if (filters?.status) {
    filteredQuestions = filteredQuestions.filter(q => q.status === filters.status);
  }
  if (filters?.creator) {
    filteredQuestions = filteredQuestions.filter(q => q.creator === filters.creator);
  }
  if (filters?.search) {
    filteredQuestions = searchEnhancedQuestions(filters.search);
  }

  const total = filteredQuestions.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      questions: paginatedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  };
}
