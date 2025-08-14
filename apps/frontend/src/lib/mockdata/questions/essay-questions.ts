/**
 * Essay Questions Mockdata
 * Mock data cho câu hỏi tự luận (ES) theo đúng specification
 */

import {
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  Question,
  MockApiResponse
} from '../shared/core-types';

// Mock Essay Questions theo đúng specification
export const mockEssayQuestions: Question[] = [
  {
    id: 'es-001',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi THPT QG 2024"]%[2P4C2]
    [TL.500001]
    Cho hàm số $y = \\frac{2x + 1}{x - 1}$ có đồ thị (C).
    a) Khảo sát sự biến thiên và vẽ đồ thị hàm số.
    b) Tìm tất cả các giá trị của tham số m để đường thẳng d: y = mx + 2 cắt đồ thị (C) tại hai điểm phân biệt.
    \\loigiai{
        a) TXĐ: D = ℝ \\ {1}
        Giới hạn: lim(x→1⁻) y = -∞, lim(x→1⁺) y = +∞, lim(x→±∞) y = 2
        Tiệm cận đứng: x = 1, tiệm cận ngang: y = 2
        y' = -3/(x-1)² < 0 ∀x ≠ 1 ⟹ Hàm số nghịch biến trên (-∞;1) và (1;+∞)
        
        b) Phương trình hoành độ giao điểm: (2x+1)/(x-1) = mx + 2
        ⟺ 2x + 1 = (mx + 2)(x - 1) = mx² + (2-m)x - 2
        ⟺ mx² + (2-m-2)x - 2 - 1 = 0
        ⟺ mx² - mx - 3 = 0
        
        Để có 2 nghiệm phân biệt khác 1:
        - m ≠ 0
        - Δ = m² + 12m > 0 ⟺ m(m + 12) > 0 ⟺ m < -12 hoặc m > 0
        - x = 1 không là nghiệm: m - m - 3 ≠ 0 ⟺ -3 ≠ 0 (luôn đúng)
        
        Vậy m ∈ (-∞; -12) ∪ (0; +∞)
    }
    \\end{ex}`,
    content: 'Cho hàm số y = (2x + 1)/(x - 1) có đồ thị (C). a) Khảo sát sự biến thiên và vẽ đồ thị hàm số. b) Tìm tất cả các giá trị của tham số m để đường thẳng d: y = mx + 2 cắt đồ thị (C) tại hai điểm phân biệt.',
    subcount: '[TL.500001]',
    type: QuestionType.ES,
    source: 'Đề thi THPT QG 2024',
    
    // ES: answers = null, correctAnswer = null
    answers: null,
    correctAnswer: null,
    
    solution: 'a) TXĐ: D = ℝ \\ {1}. Giới hạn và tiệm cận: x = 1 (đứng), y = 2 (ngang). y\' = -3/(x-1)² < 0 ∀x ≠ 1 ⟹ Hàm số nghịch biến. b) Phương trình giao điểm: mx² - mx - 3 = 0. Điều kiện: m ≠ 0, Δ = m² + 12m > 0. Vậy m ∈ (-∞; -12) ∪ (0; +∞)',
    tag: ['Khảo sát hàm số', 'Hàm phân thức', 'Tham số', 'Lớp 12'],
    usageCount: 67,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.5,
    difficulty: QuestionDifficulty.HARD,
    questionCodeId: '2P4C2',
    createdAt: new Date('2024-12-01T00:00:00Z'),
    updatedAt: new Date('2025-01-14T15:30:00Z')
  },

  {
    id: 'es-002',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi học sinh giỏi Vật lý 12"]%[2L3T1]
    [VL.600012]
    Một mạch dao động LC có L = 2mH, C = 8pF. Ban đầu tụ điện được tích điện đến hiệu điện thế U₀ = 6V.
    a) Viết phương trình dao động của điện tích và dòng điện trong mạch.
    b) Tính năng lượng điện trường và từ trường tại thời điểm t = T/8.
    c) Tại thời điểm nào năng lượng điện trường bằng 3 lần năng lượng từ trường?
    \\loigiai{
        a) ω = 1/√(LC) = 1/√(2×10⁻³ × 8×10⁻¹²) = 2.5×10⁷ rad/s
        Q₀ = CU₀ = 8×10⁻¹² × 6 = 48×10⁻¹² C
        q(t) = Q₀cos(ωt) = 48×10⁻¹²cos(2.5×10⁷t) C
        i(t) = -Q₀ωsin(ωt) = -1.2×10⁻³sin(2.5×10⁷t) A
        
        b) Tại t = T/8: ωt = π/4
        q = Q₀cos(π/4) = Q₀/√2
        i = -Q₀ωsin(π/4) = -Q₀ω/√2
        
        W_C = q²/(2C) = (Q₀/√2)²/(2C) = Q₀²/(4C) = 9×10⁻⁹ J
        W_L = Li²/2 = L(Q₀ω/√2)²/2 = LQ₀²ω²/4 = 9×10⁻⁹ J
        
        c) W_C = 3W_L ⟺ q²/(2C) = 3Li²/2
        ⟺ Q₀²cos²(ωt)/(2C) = 3LQ₀²ω²sin²(ωt)/2
        ⟺ cos²(ωt)/C = 3Lω²sin²(ωt)
        ⟺ cos²(ωt) = 3sin²(ωt) (vì Lω²C = 1)
        ⟺ tan²(ωt) = 1/3 ⟺ tan(ωt) = ±1/√3
        ⟺ ωt = π/6 + kπ/2
        ⟺ t = π/(6ω) + kπ/(2ω) = T/12 + kT/4
    }
    \\end{ex}`,
    content: 'Một mạch dao động LC có L = 2mH, C = 8pF. Ban đầu tụ điện được tích điện đến hiệu điện thế U₀ = 6V. a) Viết phương trình dao động của điện tích và dòng điện trong mạch. b) Tính năng lượng điện trường và từ trường tại thời điểm t = T/8. c) Tại thời điểm nào năng lượng điện trường bằng 3 lần năng lượng từ trường?',
    subcount: '[VL.600012]',
    type: QuestionType.ES,
    source: 'Đề thi học sinh giỏi Vật lý 12',
    
    answers: null,
    correctAnswer: null,
    
    solution: 'a) ω = 2.5×10⁷ rad/s, q(t) = 48×10⁻¹²cos(2.5×10⁷t) C, i(t) = -1.2×10⁻³sin(2.5×10⁷t) A. b) Tại t = T/8: W_C = W_L = 9×10⁻⁹ J. c) W_C = 3W_L khi t = T/12 + kT/4',
    tag: ['Mạch dao động LC', 'Năng lượng', 'Vật lý', 'Lớp 12'],
    usageCount: 23,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.8,
    difficulty: QuestionDifficulty.HARD,
    questionCodeId: '2L3T1',
    createdAt: new Date('2024-11-15T00:00:00Z'),
    updatedAt: new Date('2025-01-13T10:45:00Z')
  },

  {
    id: 'es-003',
    rawContent: `\\begin{ex}%[Nguồn: "Đề thi Olympic Hóa học 11"]%[1H4C3]
    [HH.700025]
    Hòa tan hoàn toàn 13g kim loại M (hóa trị II) bằng dung dịch HCl dư, thu được 5.6 lít khí H₂ (đktc).
    a) Xác định kim loại M.
    b) Tính khối lượng muối tạo thành.
    c) Nếu dùng 200ml dung dịch HCl 2M để hòa tan kim loại trên, sau phản ứng dung dịch có pH bằng bao nhiêu?
    \\loigiai{
        a) Phương trình: M + 2HCl → MCl₂ + H₂
        n_H₂ = 5.6/22.4 = 0.25 mol
        Theo phương trình: n_M = n_H₂ = 0.25 mol
        M_M = 13/0.25 = 52 g/mol
        Vậy M là Cr (Crom)
        
        b) n_CrCl₂ = n_Cr = 0.25 mol
        m_CrCl₂ = 0.25 × (52 + 2×35.5) = 0.25 × 123 = 30.75g
        
        c) n_HCl ban đầu = 0.2 × 2 = 0.4 mol
        n_HCl phản ứng = 2 × n_Cr = 2 × 0.25 = 0.5 mol
        Vì n_HCl ban đầu < n_HCl cần thiết nên HCl hết, Cr dư
        n_Cr phản ứng = n_HCl/2 = 0.4/2 = 0.2 mol
        n_H₂ = 0.2 mol ⟹ V_H₂ = 0.2 × 22.4 = 4.48 lít
        
        Sau phản ứng chỉ có muối CrCl₂ trong dung dịch
        CrCl₂ + H₂O ⇌ Cr(OH)₂ + 2HCl (thủy phân)
        Do Cr(OH)₂ là base yếu nên muối có tính axit nhẹ
        pH ≈ 6 (do thủy phân không hoàn toàn)
    }
    \\end{ex}`,
    content: 'Hòa tan hoàn toàn 13g kim loại M (hóa trị II) bằng dung dịch HCl dư, thu được 5.6 lít khí H₂ (đktc). a) Xác định kim loại M. b) Tính khối lượng muối tạo thành. c) Nếu dùng 200ml dung dịch HCl 2M để hòa tan kim loại trên, sau phản ứng dung dịch có pH bằng bao nhiêu?',
    subcount: '[HH.700025]',
    type: QuestionType.ES,
    source: 'Đề thi Olympic Hóa học 11',
    
    answers: null,
    correctAnswer: null,
    
    solution: 'a) M + 2HCl → MCl₂ + H₂. n_H₂ = 0.25 mol, n_M = 0.25 mol, M_M = 52 g/mol ⟹ M là Cr. b) m_CrCl₂ = 30.75g. c) HCl hết, pH ≈ 6 do thủy phân muối.',
    tag: ['Kim loại', 'Phản ứng axit-base', 'Thủy phân', 'Hóa học', 'Lớp 11'],
    usageCount: 34,
    creator: 'ADMIN',
    status: QuestionStatus.ACTIVE,
    feedback: 4.6,
    difficulty: QuestionDifficulty.HARD,
    questionCodeId: '1H4C3',
    createdAt: new Date('2024-10-20T00:00:00Z'),
    updatedAt: new Date('2025-01-12T14:20:00Z')
  }
];

// Helper functions
export function getEssayQuestionById(id: string): Question | undefined {
  return mockEssayQuestions.find(question => question.id === id);
}

export function getEssayQuestionsByTag(tag: string): Question[] {
  return mockEssayQuestions.filter(question => 
    question.tag.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function getEssayQuestionsByQuestionCode(questionCodeId: string): Question[] {
  return mockEssayQuestions.filter(question => question.questionCodeId === questionCodeId);
}

export function searchEssayQuestions(query: string): Question[] {
  const searchTerm = query.toLowerCase();
  return mockEssayQuestions.filter(question =>
    question.content.toLowerCase().includes(searchTerm) ||
    question.tag.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    question.solution?.toLowerCase().includes(searchTerm)
  );
}

export function getMockEssayQuestionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    questionCodeId?: string;
    tag?: string;
    status?: QuestionStatus;
    search?: string;
  }
): MockApiResponse<Question[]> {
  let filteredQuestions = [...mockEssayQuestions];

  if (filters?.questionCodeId) {
    filteredQuestions = getEssayQuestionsByQuestionCode(filters.questionCodeId);
  }
  if (filters?.tag) {
    filteredQuestions = getEssayQuestionsByTag(filters.tag);
  }
  if (filters?.status) {
    filteredQuestions = filteredQuestions.filter(q => q.status === filters.status);
  }
  if (filters?.search) {
    filteredQuestions = searchEssayQuestions(filters.search);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginatedQuestions,
    message: 'Essay questions retrieved successfully',
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
