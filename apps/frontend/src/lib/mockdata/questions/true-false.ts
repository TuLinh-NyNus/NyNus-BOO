/**
 * True/False Questions Mockdata
 * Mock data cho câu hỏi đúng/sai (TF) theo đúng specification
 */

import {
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  Question,
  MockApiResponse
} from '../shared/core-types';

// Mock True/False Questions theo đúng specification
export const mockTrueFalseQuestions: Question[] = [
  {
    id: 'tf-001',
    rawContent: `\\begin{ex}%[Nguồn: "Sách giáo khoa Toán 8"]%[8P5N1]
    [TL.100024]
    Xét tính đúng sai của các mệnh đề sau về tam giác vuông:
    \\choiceTF
    {\\True Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông}
    {Trong tam giác vuông, cạnh huyền luôn là cạnh dài nhất}
    {\\True Nếu một tam giác có bình phương một cạnh bằng tổng bình phương hai cạnh kia thì tam giác đó là tam giác vuông}
    {Mọi tam giác đều có thể áp dụng định lý Pythagoras}
    \\loigiai{
        Mệnh đề 1: Đúng - Định lý Pythagoras.
        Mệnh đề 2: Sai - Cạnh huyền luôn dài nhất trong tam giác vuông.
        Mệnh đề 3: Đúng - Định lý Pythagoras đảo.
        Mệnh đề 4: Sai - Chỉ áp dụng cho tam giác vuông.
    }
    \\end{ex}`,
    content: 'Xét tính đúng sai của các mệnh đề sau về tam giác vuông:',
    subcount: '[TL.100024]',
    type: QuestionType.TF,
    source: 'Sách giáo khoa Toán 8',
    
    // TF: answers = array statements, correctAnswer = array of correct statements
    answers: [
      'Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông',
      'Trong tam giác vuông, cạnh huyền luôn là cạnh dài nhất', 
      'Nếu một tam giác có bình phương một cạnh bằng tổng bình phương hai cạnh kia thì tam giác đó là tam giác vuông',
      'Mọi tam giác đều có thể áp dụng định lý Pythagoras'
    ],
    correctAnswer: [
      'Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông',
      'Nếu một tam giác có bình phương một cạnh bằng tổng bình phương hai cạnh kia thì tam giác đó là tam giác vuông'
    ],
    
    solution: 'Mệnh đề 1: Đúng - Định lý Pythagoras. Mệnh đề 2: Sai - Cạnh huyền luôn dài nhất trong tam giác vuông. Mệnh đề 3: Đúng - Định lý Pythagoras đảo. Mệnh đề 4: Sai - Chỉ áp dụng cho tam giác vuông.',
    tag: ['Hình học', 'Định lý Pythagoras', 'Tam giác vuông', 'Lớp 8'],
    usageCount: 89,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.5,
    difficulty: QuestionDifficulty.EASY,
    questionCodeId: '8P5N1',
    createdAt: new Date('2024-07-10T00:00:00Z'),
    updatedAt: new Date('2025-01-14T10:15:00Z')
  },
  
  {
    id: 'tf-002', 
    rawContent: `\\begin{ex}%[Nguồn: "Đề kiểm tra Vật lý 11"]%[1L2H2]
    [VL.200015]
    Xét tính đúng sai của các phát biểu về dao động điều hòa:
    \\choiceTF
    {\\True Dao động điều hòa là dao động có li độ biến thiên theo quy luật hình sin theo thời gian}
    {Trong dao động điều hòa, vận tốc và li độ luôn cùng pha}
    {\\True Năng lượng dao động điều hòa tỉ lệ với bình phương biên độ}
    {\\True Tần số dao động điều hòa không phụ thuộc vào biên độ}
    \\loigiai{
        1. Đúng - Định nghĩa dao động điều hòa.
        2. Sai - Vận tốc sớm pha π/2 so với li độ.
        3. Đúng - E = (1/2)kA².
        4. Đúng - Tần số chỉ phụ thuộc vào đặc tính của hệ.
    }
    \\end{ex}`,
    content: 'Xét tính đúng sai của các phát biểu về dao động điều hòa:',
    subcount: '[VL.200015]',
    type: QuestionType.TF,
    source: 'Đề kiểm tra Vật lý 11',
    
    answers: [
      'Dao động điều hòa là dao động có li độ biến thiên theo quy luật hình sin theo thời gian',
      'Trong dao động điều hòa, vận tốc và li độ luôn cùng pha',
      'Năng lượng dao động điều hòa tỉ lệ với bình phương biên độ', 
      'Tần số dao động điều hòa không phụ thuộc vào biên độ'
    ],
    correctAnswer: [
      'Dao động điều hòa là dao động có li độ biến thiên theo quy luật hình sin theo thời gian',
      'Năng lượng dao động điều hòa tỉ lệ với bình phương biên độ',
      'Tần số dao động điều hòa không phụ thuộc vào biên độ'
    ],
    
    solution: '1. Đúng - Định nghĩa dao động điều hòa. 2. Sai - Vận tốc sớm pha π/2 so với li độ. 3. Đúng - E = (1/2)kA². 4. Đúng - Tần số chỉ phụ thuộc vào đặc tính của hệ.',
    tag: ['Dao động điều hòa', 'Vật lý', 'Lớp 11'],
    usageCount: 34,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.2,
    difficulty: QuestionDifficulty.MEDIUM,
    questionCodeId: '1L2H2',
    createdAt: new Date('2024-09-15T00:00:00Z'),
    updatedAt: new Date('2025-01-12T08:30:00Z')
  },

  {
    id: 'tf-003',
    rawContent: `\\begin{ex}%[Nguồn: "Sách bài tập Hóa 10"]%[0H1V3]
    [HH.150008]
    Xét tính đúng sai của các phát biểu về cấu tạo nguyên tử:
    \\choiceTF
    {\\True Nguyên tử gồm hạt nhân mang điện tích dương và các electron mang điện tích âm}
    {\\True Khối lượng nguyên tử tập trung chủ yếu ở hạt nhân}
    {Số proton luôn bằng số neutron trong mọi nguyên tử}
    {Electron chuyển động quanh hạt nhân theo quỹ đạo tròn cố định}
    \\loigiai{
        1. Đúng - Cấu tạo cơ bản của nguyên tử.
        2. Đúng - Hạt nhân chiếm 99.9% khối lượng nguyên tử.
        3. Sai - Số neutron có thể khác số proton (đồng vị).
        4. Sai - Electron chuyển động trong orbital, không phải quỹ đạo cố định.
    }
    \\end{ex}`,
    content: 'Xét tính đúng sai của các phát biểu về cấu tạo nguyên tử:',
    subcount: '[HH.150008]',
    type: QuestionType.TF,
    source: 'Sách bài tập Hóa 10',
    
    answers: [
      'Nguyên tử gồm hạt nhân mang điện tích dương và các electron mang điện tích âm',
      'Khối lượng nguyên tử tập trung chủ yếu ở hạt nhân',
      'Số proton luôn bằng số neutron trong mọi nguyên tử',
      'Electron chuyển động quanh hạt nhân theo quỹ đạo tròn cố định'
    ],
    correctAnswer: [
      'Nguyên tử gồm hạt nhân mang điện tích dương và các electron mang điện tích âm',
      'Khối lượng nguyên tử tập trung chủ yếu ở hạt nhân'
    ],
    
    solution: '1. Đúng - Cấu tạo cơ bản của nguyên tử. 2. Đúng - Hạt nhân chiếm 99.9% khối lượng nguyên tử. 3. Sai - Số neutron có thể khác số proton (đồng vị). 4. Sai - Electron chuyển động trong orbital, không phải quỹ đạo cố định.',
    tag: ['Cấu tạo nguyên tử', 'Hóa học', 'Lớp 10'],
    usageCount: 67,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.7,
    difficulty: QuestionDifficulty.MEDIUM,
    questionCodeId: '0H1V3',
    createdAt: new Date('2024-10-01T00:00:00Z'),
    updatedAt: new Date('2025-01-11T14:45:00Z')
  }
];

// Helper functions
export function getTrueFalseQuestionById(id: string): Question | undefined {
  return mockTrueFalseQuestions.find(question => question.id === id);
}

export function getTrueFalseQuestionsByTag(tag: string): Question[] {
  return mockTrueFalseQuestions.filter(question => 
    question.tag.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function getMockTrueFalseQuestionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    questionCodeId?: string;
    tag?: string;
    status?: QuestionStatus;
  }
): MockApiResponse<Question[]> {
  let filteredQuestions = [...mockTrueFalseQuestions];

  if (filters?.questionCodeId) {
    filteredQuestions = filteredQuestions.filter(q => q.questionCodeId === filters.questionCodeId);
  }
  if (filters?.tag) {
    filteredQuestions = getTrueFalseQuestionsByTag(filters.tag);
  }
  if (filters?.status) {
    filteredQuestions = filteredQuestions.filter(q => q.status === filters.status);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginatedQuestions,
    message: 'True/False questions retrieved successfully',
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
