// Mock data for questions - Admin management
import { QuestionType, Difficulty } from '@/types';
import { AdminQuestion, MockPagination, MockApiResponse } from './types';

// Mock questions data với realistic content
export const mockQuestions: AdminQuestion[] = [
  // Toán học - Lớp 12
  {
    id: 'q-001',
    content: 'Tìm giá trị lớn nhất của hàm số $f(x) = x^3 - 3x^2 + 2$ trên đoạn $[0, 3]$.',
    rawContent: 'Tìm giá trị lớn nhất của hàm số f(x) = x^3 - 3x^2 + 2 trên đoạn [0, 3].',
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.HARD,
    category: 'Toán học',
    tags: ['Hàm số', 'Cực trị', 'Lớp 12'],
    timeLimit: 300, // 5 minutes
    points: 10,
    explanation: 'Tính đạo hàm f\'(x) = 3x² - 6x, tìm nghiệm f\'(x) = 0 để có x = 0, x = 2. So sánh f(0), f(2), f(3).',
    options: [
      { id: 'opt-001-a', content: '2', isCorrect: true },
      { id: 'opt-001-b', content: '0', isCorrect: false },
      { id: 'opt-001-c', content: '-2', isCorrect: false },
      { id: 'opt-001-d', content: '6', isCorrect: false }
    ],
    correctAnswer: '2',
    createdBy: 'instructor-001',
    subcount: 'SC001',
    questionId: 'T12.C1.B1.M1.001',
    source: 'Sách giáo khoa Toán 12',
    solution: 'Đáp án: A. Giá trị lớn nhất là 2 tại x = 0.',
    subject: 'Toán',
    grade: '12',
    chapter: 'Ứng dụng đạo hàm',
    lesson: 'Cực trị hàm số',
    form: 'Trắc nghiệm',
    isActive: true,
    usageCount: 45,
    lastUsed: new Date('2025-01-14T10:30:00Z'),
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-10T14:20:00Z')
  },
  {
    id: 'q-002',
    content: 'Giải phương trình $\\log_2(x+1) + \\log_2(x-1) = 3$.',
    rawContent: 'Giải phương trình log_2(x+1) + log_2(x-1) = 3.',
    type: QuestionType.ESSAY,
    difficulty: Difficulty.MEDIUM,
    category: 'Toán học',
    tags: ['Logarithm', 'Phương trình', 'Lớp 12'],
    timeLimit: 600, // 10 minutes
    points: 15,
    explanation: 'Sử dụng tính chất logarithm: log_a(m) + log_a(n) = log_a(mn)',
    correctAnswer: 'x = 3',
    createdBy: 'instructor-001',
    subcount: 'SC002',
    questionId: 'T12.C2.B2.M2.002',
    source: 'Đề thi thử THPT QG',
    solution: 'Điều kiện: x > 1. Phương trình tương đương log_2[(x+1)(x-1)] = 3, suy ra (x+1)(x-1) = 8, x² - 1 = 8, x² = 9, x = ±3. Kết hợp điều kiện: x = 3.',
    subject: 'Toán',
    grade: '12',
    chapter: 'Hàm số mũ và logarithm',
    lesson: 'Phương trình logarithm',
    form: 'Tự luận',
    isActive: true,
    usageCount: 32,
    lastUsed: new Date('2025-01-13T15:45:00Z'),
    createdAt: new Date('2024-08-20T00:00:00Z'),
    updatedAt: new Date('2025-01-08T09:15:00Z')
  },

  // Vật lý - Lớp 11
  {
    id: 'q-003',
    content: 'Một vật dao động điều hòa với phương trình $x = 4\\cos(2\\pi t + \\frac{\\pi}{3})$ cm. Tìm biên độ dao động.',
    rawContent: 'Một vật dao động điều hòa với phương trình x = 4cos(2πt + π/3) cm. Tìm biên độ dao động.',
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.EASY,
    category: 'Vật lý',
    tags: ['Dao động điều hòa', 'Biên độ', 'Lớp 11'],
    timeLimit: 180, // 3 minutes
    points: 5,
    explanation: 'Trong phương trình dao động điều hòa x = A.cos(ωt + φ), A là biên độ dao động.',
    options: [
      { id: 'opt-003-a', content: '4 cm', isCorrect: true },
      { id: 'opt-003-b', content: '2π cm', isCorrect: false },
      { id: 'opt-003-c', content: 'π/3 cm', isCorrect: false },
      { id: 'opt-003-d', content: '2 cm', isCorrect: false }
    ],
    correctAnswer: '4 cm',
    createdBy: 'instructor-002',
    subcount: 'SC003',
    questionId: 'L11.C3.B1.M1.003',
    source: 'Sách bài tập Vật lý 11',
    solution: 'Đáp án: A. Biên độ dao động A = 4 cm.',
    subject: 'Lý',
    grade: '11',
    chapter: 'Dao động cơ',
    lesson: 'Dao động điều hòa',
    form: 'Trắc nghiệm',
    isActive: true,
    usageCount: 67,
    lastUsed: new Date('2025-01-15T08:20:00Z'),
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-12T16:30:00Z')
  },

  // Hóa học - Lớp 10
  {
    id: 'q-004',
    content: 'Nguyên tử của nguyên tố X có 17 proton. X thuộc nhóm nào trong bảng tuần hoàn?',
    rawContent: 'Nguyên tử của nguyên tố X có 17 proton. X thuộc nhóm nào trong bảng tuần hoàn?',
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.EASY,
    category: 'Hóa học',
    tags: ['Bảng tuần hoàn', 'Nguyên tố', 'Lớp 10'],
    timeLimit: 120, // 2 minutes
    points: 3,
    explanation: 'Nguyên tố có 17 proton là Clo (Cl), có cấu hình electron [Ne]3s²3p⁵, thuộc nhóm VIIA.',
    options: [
      { id: 'opt-004-a', content: 'Nhóm VIIA', isCorrect: true },
      { id: 'opt-004-b', content: 'Nhóm VIA', isCorrect: false },
      { id: 'opt-004-c', content: 'Nhóm VA', isCorrect: false },
      { id: 'opt-004-d', content: 'Nhóm VIIIA', isCorrect: false }
    ],
    correctAnswer: 'Nhóm VIIA',
    createdBy: 'instructor-003',
    subcount: 'SC004',
    questionId: 'H10.C1.B1.M1.004',
    source: 'Sách giáo khoa Hóa 10',
    solution: 'Đáp án: A. Clo có 7 electron lớp ngoài cùng, thuộc nhóm VIIA (halogen).',
    subject: 'Hóa',
    grade: '10',
    chapter: 'Cấu tạo nguyên tử',
    lesson: 'Bảng tuần hoàn các nguyên tố',
    form: 'Trắc nghiệm',
    isActive: true,
    usageCount: 89,
    lastUsed: new Date('2025-01-14T14:15:00Z'),
    createdAt: new Date('2024-09-15T00:00:00Z'),
    updatedAt: new Date('2025-01-11T11:45:00Z')
  },

  // Tiếng Anh - Lớp 9
  {
    id: 'q-005',
    content: 'Choose the correct answer: "I have been learning English _____ five years."',
    rawContent: 'Choose the correct answer: "I have been learning English _____ five years."',
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.MEDIUM,
    category: 'Tiếng Anh',
    tags: ['Grammar', 'Present Perfect Continuous', 'Lớp 9'],
    timeLimit: 90, // 1.5 minutes
    points: 4,
    explanation: 'Present Perfect Continuous với "for" để chỉ khoảng thời gian.',
    options: [
      { id: 'opt-005-a', content: 'for', isCorrect: true },
      { id: 'opt-005-b', content: 'since', isCorrect: false },
      { id: 'opt-005-c', content: 'in', isCorrect: false },
      { id: 'opt-005-d', content: 'during', isCorrect: false }
    ],
    correctAnswer: 'for',
    createdBy: 'instructor-004',
    subcount: 'SC005',
    questionId: 'E9.C4.B2.M2.005',
    source: 'Cambridge English Grammar',
    solution: 'Answer: A. "For" is used with periods of time in Present Perfect Continuous.',
    subject: 'Anh',
    grade: '9',
    chapter: 'Tenses',
    lesson: 'Present Perfect Continuous',
    form: 'Trắc nghiệm',
    isActive: true,
    usageCount: 54,
    lastUsed: new Date('2025-01-13T09:30:00Z'),
    createdAt: new Date('2024-10-01T00:00:00Z'),
    updatedAt: new Date('2025-01-09T13:20:00Z')
  },

  // True/False question
  {
    id: 'q-006',
    content: 'Phát biểu: "Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông." Đúng hay sai?',
    rawContent: 'Phát biểu: "Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông." Đúng hay sai?',
    type: QuestionType.TRUE_FALSE,
    difficulty: Difficulty.EASY,
    category: 'Toán học',
    tags: ['Hình học', 'Định lý Pythagoras', 'Lớp 8'],
    timeLimit: 60, // 1 minute
    points: 2,
    explanation: 'Đây chính là định lý Pythagoras.',
    correctAnswer: 'Đúng',
    createdBy: 'instructor-001',
    subcount: 'SC006',
    questionId: 'T8.C5.B1.M1.006',
    source: 'Sách giáo khoa Toán 8',
    solution: 'Đáp án: Đúng. Đây là định lý Pythagoras cơ bản.',
    subject: 'Toán',
    grade: '8',
    chapter: 'Tam giác vuông',
    lesson: 'Định lý Pythagoras',
    form: 'Đúng/Sai',
    isActive: true,
    usageCount: 123,
    lastUsed: new Date('2025-01-15T07:45:00Z'),
    createdAt: new Date('2024-07-10T00:00:00Z'),
    updatedAt: new Date('2025-01-14T10:15:00Z')
  }
];

// Helper functions for question management
export function getQuestionById(id: string): AdminQuestion | undefined {
  return mockQuestions.find(question => question.id === id);
}

export function getQuestionsBySubject(subject: string): AdminQuestion[] {
  return mockQuestions.filter(question => question.subject === subject);
}

export function getQuestionsByGrade(grade: string): AdminQuestion[] {
  return mockQuestions.filter(question => question.grade === grade);
}

export function getQuestionsByDifficulty(difficulty: Difficulty): AdminQuestion[] {
  return mockQuestions.filter(question => question.difficulty === difficulty);
}

export function searchQuestions(query: string): AdminQuestion[] {
  const searchTerm = query.toLowerCase();
  return mockQuestions.filter(question => 
    question.content.toLowerCase().includes(searchTerm) ||
    question.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    question.subject?.toLowerCase().includes(searchTerm) ||
    question.chapter?.toLowerCase().includes(searchTerm)
  );
}

// Mock API responses
export function getMockQuestionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    subject?: string;
    grade?: string;
    difficulty?: Difficulty;
    type?: QuestionType;
    search?: string;
  }
): MockApiResponse<{ questions: AdminQuestion[]; pagination: MockPagination }> {
  let filteredQuestions = [...mockQuestions];

  // Apply filters
  if (filters?.subject) {
    filteredQuestions = filteredQuestions.filter(q => q.subject === filters.subject);
  }
  if (filters?.grade) {
    filteredQuestions = filteredQuestions.filter(q => q.grade === filters.grade);
  }
  if (filters?.difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
  }
  if (filters?.type) {
    filteredQuestions = filteredQuestions.filter(q => q.type === filters.type);
  }
  if (filters?.search) {
    filteredQuestions = searchQuestions(filters.search);
  }

  // Apply pagination
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
