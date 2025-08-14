// Mock data for FAQ - Admin management
import { AdminFAQ, MockPagination, MockApiResponse } from '../shared/core-types';

// Mock FAQ data với realistic content
export const mockFAQs: AdminFAQ[] = [
  {
    id: 'faq-001',
    question: 'Làm thế nào để đăng ký tài khoản trên NyNus?',
    answer: 'Để đăng ký tài khoản trên NyNus, bạn có thể làm theo các bước sau:\n1. Truy cập trang chủ NyNus\n2. Nhấp vào nút "Đăng ký" ở góc phải màn hình\n3. Điền đầy đủ thông tin: email, mật khẩu, họ tên\n4. Xác nhận email đăng ký\n5. Hoàn tất quá trình đăng ký và bắt đầu học tập',
    category: 'Tài khoản',
    tags: ['đăng ký', 'tài khoản', 'email', 'mật khẩu'],
    isPublished: true,
    viewCount: 1245,
    helpfulCount: 987,
    order: 1,
    createdBy: 'admin-001',
    createdAt: new Date('2024-08-01T00:00:00Z'),
    updatedAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    id: 'faq-002',
    question: 'Tôi quên mật khẩu, làm sao để lấy lại?',
    answer: 'Nếu bạn quên mật khẩu, hãy làm theo các bước sau:\n1. Truy cập trang đăng nhập\n2. Nhấp vào "Quên mật khẩu?"\n3. Nhập email đã đăng ký\n4. Kiểm tra email và nhấp vào link đặt lại mật khẩu\n5. Tạo mật khẩu mới và xác nhận\n6. Đăng nhập với mật khẩu mới',
    category: 'Tài khoản',
    tags: ['quên mật khẩu', 'đặt lại', 'email', 'bảo mật'],
    isPublished: true,
    viewCount: 2156,
    helpfulCount: 1876,
    order: 2,
    createdBy: 'admin-001',
    createdAt: new Date('2024-08-01T00:00:00Z'),
    updatedAt: new Date('2025-01-08T00:00:00Z')
  },
  {
    id: 'faq-003',
    question: 'Làm thế nào để mua khóa học trên NyNus?',
    answer: 'Để mua khóa học trên NyNus:\n1. Duyệt danh sách khóa học hoặc tìm kiếm khóa học mong muốn\n2. Nhấp vào khóa học để xem chi tiết\n3. Nhấp nút "Mua ngay" hoặc "Thêm vào giỏ hàng"\n4. Chọn phương thức thanh toán (thẻ ngân hàng, ví điện tử, chuyển khoản)\n5. Hoàn tất thanh toán\n6. Bắt đầu học ngay sau khi thanh toán thành công',
    category: 'Thanh toán',
    tags: ['mua khóa học', 'thanh toán', 'giỏ hàng', 'phương thức'],
    isPublished: true,
    viewCount: 1876,
    helpfulCount: 1543,
    order: 3,
    createdBy: 'admin-002',
    createdAt: new Date('2024-08-05T00:00:00Z'),
    updatedAt: new Date('2025-01-12T00:00:00Z')
  },
  {
    id: 'faq-004',
    question: 'Tôi có thể học offline không?',
    answer: 'Hiện tại NyNus chưa hỗ trợ học offline hoàn toàn. Tuy nhiên, bạn có thể:\n1. Tải xuống tài liệu PDF để đọc offline\n2. Ghi chú bài học để ôn tập sau\n3. Sử dụng tính năng bookmark để đánh dấu bài học quan trọng\n4. Chúng tôi đang phát triển ứng dụng mobile với tính năng tải video để học offline',
    category: 'Học tập',
    tags: ['offline', 'tải xuống', 'mobile app', 'video'],
    isPublished: true,
    viewCount: 987,
    helpfulCount: 654,
    order: 4,
    createdBy: 'admin-001',
    createdAt: new Date('2024-08-10T00:00:00Z'),
    updatedAt: new Date('2025-01-05T00:00:00Z')
  },
  {
    id: 'faq-005',
    question: 'Làm thế nào để liên hệ với giảng viên?',
    answer: 'Bạn có thể liên hệ với giảng viên qua các cách sau:\n1. Sử dụng tính năng Q&A trong từng bài học\n2. Gửi tin nhắn trực tiếp qua hệ thống chat\n3. Tham gia phiên live session nếu có\n4. Đặt câu hỏi trong diễn đàn khóa học\n5. Gửi email trực tiếp (nếu giảng viên cung cấp)',
    category: 'Học tập',
    tags: ['giảng viên', 'liên hệ', 'Q&A', 'chat', 'diễn đàn'],
    isPublished: true,
    viewCount: 1432,
    helpfulCount: 1198,
    order: 5,
    createdBy: 'admin-002',
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-14T00:00:00Z')
  },
  {
    id: 'faq-006',
    question: 'Chứng chỉ hoàn thành có giá trị không?',
    answer: 'Chứng chỉ hoàn thành từ NyNus:\n1. Được cấp khi hoàn thành 100% khóa học và đạt điểm tối thiểu\n2. Có thể sử dụng để chứng minh kỹ năng trong CV\n3. Được nhiều doanh nghiệp trong ngành giáo dục công nhận\n4. Có mã xác thực để kiểm tra tính xác thực\n5. Lưu ý: Chứng chỉ không thay thế bằng cấp chính thức từ các cơ sở giáo dục',
    category: 'Chứng chỉ',
    tags: ['chứng chỉ', 'hoàn thành', 'CV', 'xác thực', 'giá trị'],
    isPublished: true,
    viewCount: 2345,
    helpfulCount: 1987,
    order: 6,
    createdBy: 'admin-001',
    createdAt: new Date('2024-08-20T00:00:00Z'),
    updatedAt: new Date('2025-01-11T00:00:00Z')
  },
  {
    id: 'faq-007',
    question: 'Tôi có thể hoàn tiền không?',
    answer: 'Chính sách hoàn tiền của NyNus:\n1. Hoàn tiền 100% trong vòng 7 ngày đầu nếu chưa học quá 20% khóa học\n2. Hoàn tiền 50% trong vòng 14 ngày nếu chưa học quá 50% khóa học\n3. Không hoàn tiền sau 30 ngày hoặc đã hoàn thành khóa học\n4. Liên hệ support@nynus.edu.vn để yêu cầu hoàn tiền\n5. Thời gian xử lý: 5-7 ngày làm việc',
    category: 'Thanh toán',
    tags: ['hoàn tiền', 'chính sách', 'support', 'thời gian'],
    isPublished: true,
    viewCount: 1654,
    helpfulCount: 1234,
    order: 7,
    createdBy: 'admin-002',
    createdAt: new Date('2024-08-25T00:00:00Z'),
    updatedAt: new Date('2025-01-09T00:00:00Z')
  },
  {
    id: 'faq-008',
    question: 'Làm thế nào để theo dõi tiến độ học tập?',
    answer: 'Để theo dõi tiến độ học tập:\n1. Truy cập Dashboard cá nhân\n2. Xem phần "Khóa học của tôi" để thấy % hoàn thành\n3. Kiểm tra lịch sử bài tập và điểm số\n4. Sử dụng tính năng "Mục tiêu học tập" để đặt target\n5. Nhận thông báo nhắc nhở qua email/app\n6. Xem báo cáo tiến độ hàng tuần/tháng',
    category: 'Học tập',
    tags: ['tiến độ', 'dashboard', 'mục tiêu', 'báo cáo', 'thông báo'],
    isPublished: true,
    viewCount: 1098,
    helpfulCount: 876,
    order: 8,
    createdBy: 'admin-001',
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-13T00:00:00Z')
  },
  {
    id: 'faq-009',
    question: 'Hệ thống có hỗ trợ mobile không?',
    answer: 'NyNus hỗ trợ đa nền tảng:\n1. Website responsive hoạt động tốt trên mobile browser\n2. Ứng dụng iOS và Android đang trong giai đoạn phát triển\n3. Tính năng sync tiến độ giữa các thiết bị\n4. Hỗ trợ học offline trên app mobile (sắp ra mắt)\n5. Thông báo push cho các hoạt động quan trọng\n6. Dự kiến ra mắt app trong Q2/2025',
    category: 'Kỹ thuật',
    tags: ['mobile', 'app', 'responsive', 'sync', 'offline'],
    isPublished: true,
    viewCount: 876,
    helpfulCount: 654,
    order: 9,
    createdBy: 'admin-002',
    createdAt: new Date('2024-09-05T00:00:00Z'),
    updatedAt: new Date('2025-01-15T00:00:00Z')
  },
  {
    id: 'faq-010',
    question: 'Làm thế nào để báo cáo lỗi hoặc góp ý?',
    answer: 'Để báo cáo lỗi hoặc góp ý:\n1. Sử dụng nút "Báo cáo lỗi" ở cuối mỗi trang\n2. Gửi email đến support@nynus.edu.vn\n3. Liên hệ qua chat trực tuyến (góc phải màn hình)\n4. Gọi hotline: 1900-NYNUS (1900-69687)\n5. Tham gia group Facebook "NyNus Community"\n6. Chúng tôi cam kết phản hồi trong 24h',
    category: 'Hỗ trợ',
    tags: ['báo cáo lỗi', 'góp ý', 'support', 'hotline', 'chat'],
    isPublished: true,
    viewCount: 543,
    helpfulCount: 432,
    order: 10,
    createdBy: 'admin-001',
    createdAt: new Date('2024-09-10T00:00:00Z'),
    updatedAt: new Date('2025-01-07T00:00:00Z')
  }
];

// FAQ statistics
export const mockFAQStats = {
  totalFAQs: 45,
  publishedFAQs: 42,
  draftFAQs: 3,
  totalViews: 15678,
  totalHelpfulVotes: 12345,
  averageHelpfulRate: 78.7, // percentage
  faqsByCategory: {
    'Tài khoản': 8,
    'Học tập': 12,
    'Thanh toán': 6,
    'Chứng chỉ': 4,
    'Kỹ thuật': 7,
    'Hỗ trợ': 5,
    'Khác': 3
  },
  topViewedFAQs: [
    { id: 'faq-006', question: 'Chứng chỉ hoàn thành có giá trị không?', views: 2345 },
    { id: 'faq-002', question: 'Tôi quên mật khẩu, làm sao để lấy lại?', views: 2156 },
    { id: 'faq-003', question: 'Làm thế nào để mua khóa học trên NyNus?', views: 1876 },
    { id: 'faq-007', question: 'Tôi có thể hoàn tiền không?', views: 1654 },
    { id: 'faq-005', question: 'Làm thế nào để liên hệ với giảng viên?', views: 1432 }
  ]
};

// Helper functions for FAQ management
export function getFAQById(id: string): AdminFAQ | undefined {
  return mockFAQs.find(faq => faq.id === id);
}

export function getFAQsByCategory(category: string): AdminFAQ[] {
  return mockFAQs.filter(faq => faq.category === category);
}

export function getPublishedFAQs(): AdminFAQ[] {
  return mockFAQs.filter(faq => faq.isPublished);
}

export function getDraftFAQs(): AdminFAQ[] {
  return mockFAQs.filter(faq => !faq.isPublished);
}

export function getMostViewedFAQs(limit: number = 10): AdminFAQ[] {
  return [...mockFAQs]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function getMostHelpfulFAQs(limit: number = 10): AdminFAQ[] {
  return [...mockFAQs]
    .sort((a, b) => b.helpfulCount - a.helpfulCount)
    .slice(0, limit);
}

export function searchFAQs(query: string): AdminFAQ[] {
  const searchTerm = query.toLowerCase();
  return mockFAQs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm) ||
    faq.answer.toLowerCase().includes(searchTerm) ||
    faq.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
}

// Mock API responses
export function getMockFAQsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    isPublished?: boolean;
    search?: string;
  }
): MockApiResponse<{ faqs: AdminFAQ[]; pagination: MockPagination }> {
  let filteredFAQs = [...mockFAQs];

  // Apply filters
  if (filters?.category) {
    filteredFAQs = filteredFAQs.filter(f => f.category === filters.category);
  }
  if (filters?.isPublished !== undefined) {
    filteredFAQs = filteredFAQs.filter(f => f.isPublished === filters.isPublished);
  }
  if (filters?.search) {
    filteredFAQs = searchFAQs(filters.search);
  }

  // Sort by order
  filteredFAQs.sort((a, b) => a.order - b.order);

  // Apply pagination
  const total = filteredFAQs.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedFAQs = filteredFAQs.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      faqs: paginatedFAQs,
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

export function getMockFAQStatsResponse(): MockApiResponse<typeof mockFAQStats> {
  return {
    success: true,
    data: mockFAQStats,
    message: 'FAQ statistics retrieved successfully'
  };
}
