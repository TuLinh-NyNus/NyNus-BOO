/**
 * Short Answer Questions Mockdata
 * Mock data cho câu hỏi trả lời ngắn (SA) theo đúng specification
 */

import {
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  Question,
  MockApiResponse
} from '../shared/core-types';

// Mock Short Answer Questions theo đúng specification
export const mockShortAnswerQuestions: Question[] = [
  {
    id: 'sa-001',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi Olympic Toán 12"]%[2P3C1]
    [OL.300012]
    Tính giới hạn: $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$
    \\shortans{'4'}
    \\loigiai{
        $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x - 2} = \\lim_{x \\to 2} (x+2) = 4$
    }
    \\end{ex}`,
    content: 'Tính giới hạn: lim(x→2) (x² - 4)/(x - 2)',
    subcount: '[OL.300012]',
    type: QuestionType.SA,
    source: 'Đề thi Olympic Toán 12',
    
    // SA: answers = null, correctAnswer = string
    answers: null,
    correctAnswer: '4',
    
    solution: 'lim(x→2) (x² - 4)/(x - 2) = lim(x→2) (x-2)(x+2)/(x - 2) = lim(x→2) (x+2) = 4',
    tag: ['Giới hạn', 'Hàm số', 'Lớp 12'],
    usageCount: 23,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.8,
    difficulty: QuestionDifficulty.HARD,
    questionCodeId: '2P3C1',
    createdAt: new Date('2024-11-01T00:00:00Z'),
    updatedAt: new Date('2025-01-13T09:20:00Z')
  },

  {
    id: 'sa-002',
    rawContent: `\\begin{ex}%[Nguồn: "Sách bài tập Vật lý 11"]%[1L4V2]
    [VL.250018]
    Một con lắc đơn có chiều dài 1m dao động với biên độ góc nhỏ. Tính chu kỳ dao động (lấy g = 10 m/s², π ≈ 3.14).
    \\shortans{'2s'}
    \\loigiai{
        Chu kỳ dao động của con lắc đơn: $T = 2\\pi\\sqrt{\\frac{l}{g}} = 2 \\times 3.14 \\times \\sqrt{\\frac{1}{10}} = 2 \\times 3.14 \\times 0.316 ≈ 2s$
    }
    \\end{ex}`,
    content: 'Một con lắc đơn có chiều dài 1m dao động với biên độ góc nhỏ. Tính chu kỳ dao động (lấy g = 10 m/s², π ≈ 3.14).',
    subcount: '[VL.250018]',
    type: QuestionType.SA,
    source: 'Sách bài tập Vật lý 11',
    
    answers: null,
    correctAnswer: '2s',
    
    solution: 'Chu kỳ dao động của con lắc đơn: T = 2π√(l/g) = 2 × 3.14 × √(1/10) = 2 × 3.14 × 0.316 ≈ 2s',
    tag: ['Con lắc đơn', 'Dao động', 'Vật lý', 'Lớp 11'],
    usageCount: 45,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.3,
    difficulty: QuestionDifficulty.MEDIUM,
    questionCodeId: '1L4V2',
    createdAt: new Date('2024-10-15T00:00:00Z'),
    updatedAt: new Date('2025-01-12T16:45:00Z')
  },

  {
    id: 'sa-003',
    rawContent: `\\begin{ex}%[Nguồn: "Đề kiểm tra Hóa 10"]%[0H2N1]
    [HH.180025]
    Nguyên tố X có cấu hình electron là 1s²2s²2p⁶3s²3p⁵. X là nguyên tố gì?
    \\shortans{'Clo'}
    \\loigiai{
        Đếm số electron: 2 + 2 + 6 + 2 + 5 = 17 electron.
        Nguyên tử trung hòa nên có 17 proton.
        Nguyên tố có 17 proton là Clo (Cl).
    }
    \\end{ex}`,
    content: 'Nguyên tố X có cấu hình electron là 1s²2s²2p⁶3s²3p⁵. X là nguyên tố gì?',
    subcount: '[HH.180025]',
    type: QuestionType.SA,
    source: 'Đề kiểm tra Hóa 10',
    
    answers: null,
    correctAnswer: 'Clo',
    
    solution: 'Đếm số electron: 2 + 2 + 6 + 2 + 5 = 17 electron. Nguyên tử trung hòa nên có 17 proton. Nguyên tố có 17 proton là Clo (Cl).',
    tag: ['Cấu hình electron', 'Nguyên tố', 'Hóa học', 'Lớp 10'],
    usageCount: 78,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.6,
    difficulty: QuestionDifficulty.MEDIUM,
    questionCodeId: '0H2N1',
    createdAt: new Date('2024-09-20T00:00:00Z'),
    updatedAt: new Date('2025-01-14T11:30:00Z')
  },

  {
    id: 'sa-004',
    rawContent: `\\begin{ex}%[Nguồn: "Sách giáo khoa Toán 11"]%[1P1H3]
    [TL.120030]
    Tính sin(π/6).
    \\shortans[oly]{'1/2'}
    \\loigiai{
        sin(π/6) = sin(30°) = 1/2
    }
    \\end{ex}`,
    content: 'Tính sin(π/6).',
    subcount: '[TL.120030]',
    type: QuestionType.SA,
    source: 'Sách giáo khoa Toán 11',
    
    answers: null,
    correctAnswer: '1/2',
    
    solution: 'sin(π/6) = sin(30°) = 1/2',
    tag: ['Lượng giác', 'Toán học', 'Lớp 11'],
    usageCount: 156,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.9,
    difficulty: QuestionDifficulty.EASY,
    questionCodeId: '1P1H3',
    createdAt: new Date('2024-08-10T00:00:00Z'),
    updatedAt: new Date('2025-01-15T07:15:00Z')
  },

  {
    id: 'sa-005',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi thử THPT QG 2024"]%[2P5T1]
    [TH.400045]
    Cho hàm số y = x³ - 3x + 1. Tìm số điểm cực trị của hàm số.
    \\shortans{'2'}
    \\loigiai{
        y' = 3x² - 3 = 3(x² - 1) = 3(x - 1)(x + 1)
        y' = 0 ⟺ x = ±1
        Bảng biến thiên cho thấy hàm số có 2 điểm cực trị tại x = -1 và x = 1.
    }
    \\end{ex}`,
    content: 'Cho hàm số y = x³ - 3x + 1. Tìm số điểm cực trị của hàm số.',
    subcount: '[TH.400045]',
    type: QuestionType.SA,
    source: 'Đề thi thử THPT QG 2024',
    
    answers: null,
    correctAnswer: '2',
    
    solution: 'y\' = 3x² - 3 = 3(x² - 1) = 3(x - 1)(x + 1). y\' = 0 ⟺ x = ±1. Bảng biến thiên cho thấy hàm số có 2 điểm cực trị tại x = -1 và x = 1.',
    tag: ['Cực trị', 'Hàm số', 'Đạo hàm', 'Lớp 12'],
    usageCount: 91,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.4,
    difficulty: QuestionDifficulty.HARD,
    questionCodeId: '2P5T1',
    createdAt: new Date('2024-12-05T00:00:00Z'),
    updatedAt: new Date('2025-01-10T13:25:00Z')
  }
];

// Helper functions
export function getShortAnswerQuestionById(id: string): Question | undefined {
  return mockShortAnswerQuestions.find(question => question.id === id);
}

export function getShortAnswerQuestionsByTag(tag: string): Question[] {
  return mockShortAnswerQuestions.filter(question => 
    question.tag.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function getShortAnswerQuestionsByQuestionCode(questionCodeId: string): Question[] {
  return mockShortAnswerQuestions.filter(question => question.questionCodeId === questionCodeId);
}

export function searchShortAnswerQuestions(query: string): Question[] {
  const searchTerm = query.toLowerCase();
  return mockShortAnswerQuestions.filter(question =>
    question.content.toLowerCase().includes(searchTerm) ||
    question.tag.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    question.solution?.toLowerCase().includes(searchTerm)
  );
}

export function getMockShortAnswerQuestionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    questionCodeId?: string;
    tag?: string;
    status?: QuestionStatus;
    search?: string;
  }
): MockApiResponse<Question[]> {
  let filteredQuestions = [...mockShortAnswerQuestions];

  if (filters?.questionCodeId) {
    filteredQuestions = getShortAnswerQuestionsByQuestionCode(filters.questionCodeId);
  }
  if (filters?.tag) {
    filteredQuestions = getShortAnswerQuestionsByTag(filters.tag);
  }
  if (filters?.status) {
    filteredQuestions = filteredQuestions.filter(q => q.status === filters.status);
  }
  if (filters?.search) {
    filteredQuestions = searchShortAnswerQuestions(filters.search);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginatedQuestions,
    message: 'Short Answer questions retrieved successfully',
    pagination: {
      page,
      limit,
      total: filteredQuestions.length,
      totalPages: Math.ceil(filteredQuestions.length / limit),
      hasNext: page < Math.ceil(filteredQuestions.length / limit),
      hasPrev: page > 1
    }
  };
}
