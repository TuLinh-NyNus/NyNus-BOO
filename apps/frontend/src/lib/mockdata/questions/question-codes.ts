/**
 * Question Codes Mockdata
 * Mock data cho question codes và mapcode configuration
 */

import {
  QuestionCode,
  CodeFormat,
  MockApiResponse
} from '../core-types';

// Mock Question Codes
export const mockQuestionCodes: QuestionCode[] = [
  {
    code: '0P1VH1',
    format: CodeFormat.ID5,
    grade: '0', // Lớp 10
    subject: 'P', // Toán
    chapter: '1', // Chương 1
    lesson: 'V', // Bài V
    level: 'H', // Vận dụng
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    code: '1L3HC2',
    format: CodeFormat.ID6,
    grade: '1', // Lớp 11
    subject: 'L', // Vật lý
    chapter: '3', // Chương 3
    lesson: 'H', // Bài H
    form: '2', // Dạng 2
    level: 'C', // Vận dụng cao
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-12T00:00:00Z')
  },
  {
    code: '2P5VN',
    format: CodeFormat.ID5,
    grade: '2', // Lớp 12
    subject: 'P', // Toán
    chapter: '5', // Chương 5
    lesson: 'V', // Bài V
    level: 'N', // Nhận biết
    createdAt: new Date('2024-07-20T00:00:00Z'),
    updatedAt: new Date('2025-01-08T00:00:00Z')
  },
  {
    code: '2H2TH3',
    format: CodeFormat.ID6,
    grade: '2', // Lớp 12
    subject: 'H', // Hóa học
    chapter: '2', // Chương 2
    lesson: 'T', // Bài T
    form: '3', // Dạng 3
    level: 'H', // Hiểu
    createdAt: new Date('2024-10-15T00:00:00Z'),
    updatedAt: new Date('2025-01-05T00:00:00Z')
  },
  {
    code: '1S4MC1',
    format: CodeFormat.ID6,
    grade: '1', // Lớp 11
    subject: 'S', // Sinh học
    chapter: '4', // Chương 4
    lesson: 'M', // Bài M
    form: '1', // Dạng 1
    level: 'C', // Vận dụng cao
    createdAt: new Date('2024-11-01T00:00:00Z'),
    updatedAt: new Date('2025-01-03T00:00:00Z')
  }
];

// Mock MapCode Config
export const mockMapCodeConfig = {
  subjects: {
    'P': 'Toán học',
    'L': 'Vật lý', 
    'H': 'Hóa học',
    'S': 'Sinh học',
    'V': 'Văn học',
    'A': 'Tiếng Anh',
    'U': 'Lịch sử',
    'D': 'Địa lý',
    'G': 'GDCD'
  },
  grades: {
    '0': 'Lớp 10',
    '1': 'Lớp 11', 
    '2': 'Lớp 12',
    'A': 'Đại học',
    'B': 'Cao đẳng',
    'C': 'Trung cấp'
  },
  levels: {
    'N': 'Nhận biết',
    'H': 'Hiểu',
    'V': 'Vận dụng',
    'C': 'Vận dụng cao',
    'T': 'Tổng hợp',
    'M': 'Mở rộng'
  },
  chapters: {
    '1': 'Chương 1',
    '2': 'Chương 2',
    '3': 'Chương 3',
    '4': 'Chương 4',
    '5': 'Chương 5',
    '6': 'Chương 6',
    '7': 'Chương 7',
    '8': 'Chương 8',
    '9': 'Chương 9'
  },
  lessons: {
    'A': 'Bài A', 'B': 'Bài B', 'C': 'Bài C', 'D': 'Bài D', 'E': 'Bài E',
    'F': 'Bài F', 'G': 'Bài G', 'H': 'Bài H', 'I': 'Bài I', 'J': 'Bài J',
    'K': 'Bài K', 'L': 'Bài L', 'M': 'Bài M', 'N': 'Bài N', 'O': 'Bài O',
    'P': 'Bài P', 'Q': 'Bài Q', 'R': 'Bài R', 'S': 'Bài S', 'T': 'Bài T',
    'U': 'Bài U', 'V': 'Bài V', 'W': 'Bài W', 'X': 'Bài X', 'Y': 'Bài Y',
    'Z': 'Bài Z'
  },
  forms: {
    '1': 'Dạng 1',
    '2': 'Dạng 2',
    '3': 'Dạng 3',
    '4': 'Dạng 4',
    '5': 'Dạng 5',
    '6': 'Dạng 6',
    '7': 'Dạng 7',
    '8': 'Dạng 8',
    '9': 'Dạng 9'
  }
};

// Helper functions
export function getQuestionCodeById(code: string): QuestionCode | undefined {
  return mockQuestionCodes.find(qc => qc.code === code);
}

export function getQuestionCodesByGrade(grade: string): QuestionCode[] {
  return mockQuestionCodes.filter(qc => qc.grade === grade);
}

export function getQuestionCodesBySubject(subject: string): QuestionCode[] {
  return mockQuestionCodes.filter(qc => qc.subject === subject);
}

export function getQuestionCodesByLevel(level: string): QuestionCode[] {
  return mockQuestionCodes.filter(qc => qc.level === level);
}

export function parseQuestionCode(code: string): {
  grade?: string;
  subject?: string;
  chapter?: string;
  lesson?: string;
  form?: string;
  level?: string;
  gradeName?: string;
  subjectName?: string;
  chapterName?: string;
  lessonName?: string;
  formName?: string;
  levelName?: string;
} {
  if (!code || code.length < 5) {
    return {};
  }

  const grade = code[0];
  const subject = code[1];
  const chapter = code[2];
  const lesson = code[3];
  const level = code[4];
  const form = code.length > 5 ? code[5] : undefined;

  return {
    grade,
    subject,
    chapter,
    lesson,
    form,
    level,
    gradeName: mockMapCodeConfig.grades[grade as keyof typeof mockMapCodeConfig.grades],
    subjectName: mockMapCodeConfig.subjects[subject as keyof typeof mockMapCodeConfig.subjects],
    chapterName: mockMapCodeConfig.chapters[chapter as keyof typeof mockMapCodeConfig.chapters],
    lessonName: mockMapCodeConfig.lessons[lesson as keyof typeof mockMapCodeConfig.lessons],
    formName: form ? mockMapCodeConfig.forms[form as keyof typeof mockMapCodeConfig.forms] : undefined,
    levelName: mockMapCodeConfig.levels[level as keyof typeof mockMapCodeConfig.levels]
  };
}

export function generateQuestionCode(params: {
  grade: string;
  subject: string;
  chapter: string;
  lesson: string;
  level: string;
  form?: string;
}): string {
  const { grade, subject, chapter, lesson, level, form } = params;
  return form ? `${grade}${subject}${chapter}${lesson}${level}${form}` : `${grade}${subject}${chapter}${lesson}${level}`;
}

export function getMockQuestionCodesResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    grade?: string;
    subject?: string;
    level?: string;
    search?: string;
  }
): MockApiResponse<QuestionCode[]> {
  let filteredCodes = [...mockQuestionCodes];

  if (filters?.grade) {
    filteredCodes = filteredCodes.filter(qc => qc.grade === filters.grade);
  }
  if (filters?.subject) {
    filteredCodes = filteredCodes.filter(qc => qc.subject === filters.subject);
  }
  if (filters?.level) {
    filteredCodes = filteredCodes.filter(qc => qc.level === filters.level);
  }
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredCodes = filteredCodes.filter(qc => 
      qc.code.toLowerCase().includes(searchTerm)
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCodes = filteredCodes.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginatedCodes,
    message: 'Question codes retrieved successfully',
    pagination: {
      page,
      limit,
      total: filteredCodes.length,
      totalPages: Math.ceil(filteredCodes.length / limit),
      hasNext: page < Math.ceil(filteredCodes.length / limit),
      hasPrev: page > 1
    }
  };
}
