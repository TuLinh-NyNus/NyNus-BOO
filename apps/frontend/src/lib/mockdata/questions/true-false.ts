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
    
    // TF: answers = AnswerOption array with 4+ options, flexible correct answers
    answers: [
      {
        id: 'tf-001-a',
        content: 'Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông',
        isCorrect: true,
        explanation: 'Đúng - Định lý Pythagoras'
      },
      {
        id: 'tf-001-b',
        content: 'Trong tam giác vuông, cạnh huyền luôn là cạnh dài nhất',
        isCorrect: false,
        explanation: 'Sai - Cạnh huyền luôn dài nhất trong tam giác vuông'
      },
      {
        id: 'tf-001-c', 
        content: 'Nếu một tam giác có bình phương một cạnh bằng tổng bình phương hai cạnh kia thì tam giác đó là tam giác vuông',
        isCorrect: true,
        explanation: 'Đúng - Định lý Pythagoras đảo'
      },
      {
        id: 'tf-001-d',
        content: 'Mọi tam giác đều có thể áp dụng định lý Pythagoras',
        isCorrect: false,
        explanation: 'Sai - Chỉ áp dụng cho tam giác vuông'
      }
    ],
    correctAnswer: ['tf-001-a', 'tf-001-c'], // Array of correct answer IDs
    
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
      {
        id: 'tf-002-a',
        content: 'Dao động điều hòa là dao động có li độ biến thiên theo quy luật hình sin theo thời gian',
        isCorrect: true,
        explanation: 'Đúng - Định nghĩa dao động điều hòa'
      },
      {
        id: 'tf-002-b',
        content: 'Trong dao động điều hòa, vận tốc và li độ luôn cùng pha',
        isCorrect: false,
        explanation: 'Sai - Vận tốc sớm pha π/2 so với li độ'
      },
      {
        id: 'tf-002-c',
        content: 'Năng lượng dao động điều hòa tỉ lệ với bình phương biên độ',
        isCorrect: true,
        explanation: 'Đúng - E = (1/2)kA²'
      },
      {
        id: 'tf-002-d',
        content: 'Tần số dao động điều hòa không phụ thuộc vào biên độ',
        isCorrect: true,
        explanation: 'Đúng - Tần số chỉ phụ thuộc vào đặc tính của hệ'
      }
    ],
    correctAnswer: ['tf-002-a', 'tf-002-c', 'tf-002-d'], // 3 correct answers
    
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
      {
        id: 'tf-003-a',
        content: 'Nguyên tử gồm hạt nhân mang điện tích dương và các electron mang điện tích âm',
        isCorrect: true,
        explanation: 'Đúng - Cấu tạo cơ bản của nguyên tử'
      },
      {
        id: 'tf-003-b',
        content: 'Khối lượng nguyên tử tập trung chủ yếu ở hạt nhân',
        isCorrect: true,
        explanation: 'Đúng - Hạt nhân chiếm 99.9% khối lượng nguyên tử'
      },
      {
        id: 'tf-003-c',
        content: 'Số proton luôn bằng số neutron trong mọi nguyên tử',
        isCorrect: false,
        explanation: 'Sai - Số neutron có thể khác số proton (đồng vị)'
      },
      {
        id: 'tf-003-d',
        content: 'Electron chuyển động quanh hạt nhân theo quỹ đạo tròn cố định',
        isCorrect: false,
        explanation: 'Sai - Electron chuyển động trong orbital, không phải quỹ đạo cố định'
      }
    ],
    correctAnswer: ['tf-003-a', 'tf-003-b'], // 2 correct answers
    
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
  },

  {
    id: 'tf-004',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi thử Toán 12"]%[2P4A1]
    [TL.300012]
    Xét tính đúng sai của các phát biểu sau về phương trình bậc ba:
    \\choiceTF
    {Phương trình bậc ba luôn có đúng 3 nghiệm thực}
    {Phương trình bậc ba có thể có 2 nghiệm phức và 1 nghiệm thực}
    {Đồ thị hàm bậc ba luôn cắt trục hoành tại đúng 3 điểm}
    {Phương trình bậc ba luôn có ít nhất 2 nghiệm thực}
    \\loigiai{
        Tất cả các phát biểu đều sai:
        1. Sai - Có thể có 1 hoặc 3 nghiệm thực.
        2. Sai - Nghiệm phức luôn xuất hiện thành cặp.
        3. Sai - Có thể cắt tại 1 hoặc 3 điểm.
        4. Sai - Có thể chỉ có 1 nghiệm thực.
    }
    \\end{ex}`,
    content: 'Xét tính đúng sai của các phát biểu sau về phương trình bậc ba:',
    subcount: '[TL.300012]',
    type: QuestionType.TF,
    source: 'Đề thi thử Toán 12',
    
    // Example with 0 correct answers - all statements are false
    answers: [
      {
        id: 'tf-004-a',
        content: 'Phương trình bậc ba luôn có đúng 3 nghiệm thực',
        isCorrect: false,
        explanation: 'Sai - Có thể có 1 hoặc 3 nghiệm thực'
      },
      {
        id: 'tf-004-b',
        content: 'Phương trình bậc ba có thể có 2 nghiệm phức và 1 nghiệm thực',
        isCorrect: false,
        explanation: 'Sai - Nghiệm phức luôn xuất hiện thành cặp'
      },
      {
        id: 'tf-004-c',
        content: 'Đồ thị hàm bậc ba luôn cắt trục hoành tại đúng 3 điểm',
        isCorrect: false,
        explanation: 'Sai - Có thể cắt tại 1 hoặc 3 điểm'
      },
      {
        id: 'tf-004-d',
        content: 'Phương trình bậc ba luôn có ít nhất 2 nghiệm thực',
        isCorrect: false,
        explanation: 'Sai - Có thể chỉ có 1 nghiệm thực'
      }
    ],
    correctAnswer: [], // No correct answers - demonstrates flexibility of TF
    
    solution: 'Tất cả các phát biểu đều sai: 1. Sai - Có thể có 1 hoặc 3 nghiệm thực. 2. Sai - Nghiệm phức luôn xuất hiện thành cặp. 3. Sai - Có thể cắt tại 1 hoặc 3 điểm. 4. Sai - Có thể chỉ có 1 nghiệm thực.',
    tag: ['Phương trình bậc ba', 'Đại số', 'Lớp 12'],
    usageCount: 45,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.1,
    difficulty: QuestionDifficulty.HARD,
    questionCodeId: '2P4A1',
    createdAt: new Date('2024-12-15T00:00:00Z'),
    updatedAt: new Date('2025-01-16T16:20:00Z')
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
