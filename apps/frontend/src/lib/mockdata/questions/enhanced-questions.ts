/**
 * Enhanced Questions Mockdata
 * Enhanced questions với LaTeX content và advanced features
 */

import {
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  Question,
  QuestionImage,
  QuestionTag,
  QuestionFeedback,
  ImageType,
  ImageStatus,
  FeedbackType,
  MockApiResponse
} from '../core-types';

// Mock Enhanced Questions
export const mockEnhancedQuestions: Question[] = [
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
    content: 'Tìm giá trị lớn nhất của hàm số f(x) = x³ - 3x² + 2 trên đoạn [0, 3].',
    subcount: '2P5VN',
    type: QuestionType.MC,
    source: 'Sách giáo khoa Toán 12',
    answers: ['A. -2', 'B. 0', 'C. 2', 'D. 6'],
    correctAnswer: 'C',
    solution: 'Tính đạo hàm f\'(x) = 3x² - 6x = 3x(x-2). f\'(x) = 0 ⟺ x = 0 hoặc x = 2. Tính f(0) = 2, f(2) = -2, f(3) = 2. Vậy giá trị lớn nhất là 2.',
    tag: ['Hàm số', 'Cực trị', 'Lớp 12'],
    usageCount: 15,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.8,
    difficulty: QuestionDifficulty.HARD,
    questionCodeId: '2P5VN',
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-10T14:20:00Z')
  },
  {
    id: 'q-enh-002',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi thử THPT QG 2024"]%[1L3HC]
    [TL.100023]
    Một vật dao động điều hòa với biên độ A = 10cm và tần số f = 2Hz. Tính vận tốc cực đại của vật.
    \\choice
    {$20\\pi$ cm/s}
    {\\True $40\\pi$ cm/s}
    {$80\\pi$ cm/s}
    {$10\\pi$ cm/s}
    \\loigiai{
        Vận tốc cực đại: $v_{max} = \\omega A = 2\\pi f \\cdot A = 2\\pi \\cdot 2 \\cdot 10 = 40\\pi$ cm/s.
    }
    \\end{ex}`,
    content: 'Một vật dao động điều hòa với biên độ A = 10cm và tần số f = 2Hz. Tính vận tốc cực đại của vật.',
    subcount: '1L3HC',
    type: QuestionType.MC,
    source: 'Đề thi thử THPT QG 2024',
    answers: ['A. 20π cm/s', 'B. 40π cm/s', 'C. 80π cm/s', 'D. 10π cm/s'],
    correctAnswer: 'B',
    solution: 'Vận tốc cực đại: vₘₐₓ = ωA = 2πf·A = 2π·2·10 = 40π cm/s.',
    tag: ['Dao động điều hòa', 'Biên độ', 'Lớp 11'],
    usageCount: 8,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 5,
    difficulty: QuestionDifficulty.MEDIUM,
    questionCodeId: '1L3HC2',
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-12T16:30:00Z')
  }
];

// Mock Question Images
export const mockQuestionImages: QuestionImage[] = [
  {
    id: 'img-001',
    questionId: 'q-enh-001',
    imageType: ImageType.QUESTION,
    imagePath: '/uploads/questions/q-enh-001-question.png',
    driveUrl: 'https://drive.google.com/file/d/1abc123/view',
    driveFileId: '1abc123',
    status: ImageStatus.UPLOADED,
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2024-08-15T00:05:00Z')
  },
  {
    id: 'img-002',
    questionId: 'q-enh-002',
    imageType: ImageType.SOLUTION,
    imagePath: '/uploads/questions/q-enh-002-solution.png',
    driveUrl: 'https://drive.google.com/file/d/1def456/view',
    driveFileId: '1def456',
    status: ImageStatus.UPLOADED,
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2024-09-01T00:03:00Z')
  }
];

// Mock Question Tags
export const mockQuestionTags: QuestionTag[] = [
  {
    id: 'tag-001',
    questionId: 'q-enh-001',
    tagName: 'Hàm số',
    createdAt: new Date('2024-08-15T00:00:00Z')
  },
  {
    id: 'tag-002',
    questionId: 'q-enh-001',
    tagName: 'Cực trị',
    createdAt: new Date('2024-08-15T00:00:00Z')
  },
  {
    id: 'tag-003',
    questionId: 'q-enh-002',
    tagName: 'Dao động điều hòa',
    createdAt: new Date('2024-09-01T00:00:00Z')
  }
];

// Mock Question Feedback
export const mockQuestionFeedback: QuestionFeedback[] = [
  {
    id: 'feedback-001',
    questionId: 'q-enh-001',
    userId: 'user-001',
    feedbackType: FeedbackType.LIKE,
    content: 'Câu hỏi hay và có lời giải chi tiết',
    rating: 5,
    createdAt: new Date('2024-08-16T00:00:00Z')
  },
  {
    id: 'feedback-002',
    questionId: 'q-enh-002',
    userId: 'user-002',
    feedbackType: FeedbackType.LIKE,
    content: 'Bài tập vật lý rất thực tế',
    rating: 4,
    createdAt: new Date('2024-09-02T00:00:00Z')
  }
];

// Helper functions
export function getEnhancedQuestionById(id: string): Question | undefined {
  return mockEnhancedQuestions.find(question => question.id === id);
}

export function getEnhancedQuestionsByType(type: QuestionType): Question[] {
  return mockEnhancedQuestions.filter(question => question.type === type);
}

export function getEnhancedQuestionsByDifficulty(difficulty: QuestionDifficulty): Question[] {
  return mockEnhancedQuestions.filter(question => question.difficulty === difficulty);
}

export function getMockEnhancedQuestionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: { type?: QuestionType; status?: QuestionStatus; difficulty?: QuestionDifficulty }
): MockApiResponse<Question[]> {
  let filteredQuestions = [...mockEnhancedQuestions];
  
  if (filters?.type) {
    filteredQuestions = filteredQuestions.filter(q => q.type === filters.type);
  }
  if (filters?.status) {
    filteredQuestions = filteredQuestions.filter(q => q.status === filters.status);
  }
  if (filters?.difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginatedQuestions,
    message: 'Enhanced questions retrieved successfully',
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
