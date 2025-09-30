// Mock data for books/materials - Admin management
import { AdminBook, MockPagination, MockApiResponse } from '../types';

// Mock books data với realistic content
export const mockBooks: AdminBook[] = [
  {
    id: 'book-001',
    title: 'Sách giáo khoa Toán 12',
    description: 'Sách giáo khoa Toán học lớp 12 theo chương trình mới, bao gồm đầy đủ các chuyên đề từ cơ bản đến nâng cao.',
    author: 'Bộ Giáo dục và Đào tạo',
    isbn: '978-604-0-12345-6',
    publisher: 'NXB Giáo dục Việt Nam',
    publishedDate: new Date('2023-08-01T00:00:00Z'),
    category: 'Sách giáo khoa',
    tags: ['Toán 12', 'SGK', 'THPT', 'Chương trình mới'],
    coverImage: '/books/covers/math-12-textbook.svg',
    fileUrl: '/books/files/math-12-textbook.pdf',
    fileSize: '45.2 MB',
    fileType: 'pdf',
    isActive: true,
    downloadCount: 2847,
    rating: 4.6,
    reviews: 234,
    createdAt: new Date('2024-08-01T00:00:00Z'),
    updatedAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    id: 'book-002',
    title: 'Bài tập Toán 12 nâng cao',
    description: 'Tuyển tập bài tập Toán 12 nâng cao với lời giải chi tiết, phù hợp cho học sinh giỏi và ôn thi đại học.',
    author: 'Nguyễn Văn Toán, Lê Thị Hình',
    isbn: '978-604-0-12346-7',
    publisher: 'NXB Đại học Quốc gia',
    publishedDate: new Date('2024-01-15T00:00:00Z'),
    category: 'Sách bài tập',
    tags: ['Toán 12', 'Bài tập', 'Nâng cao', 'Lời giải'],
    coverImage: '/books/covers/math-12-advanced.svg',
    fileUrl: '/books/files/math-12-advanced.pdf',
    fileSize: '38.7 MB',
    fileType: 'pdf',
    isActive: true,
    downloadCount: 1567,
    rating: 4.8,
    reviews: 156,
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-08T00:00:00Z')
  },
  {
    id: 'book-003',
    title: 'Sách giáo khoa Vật lý 11',
    description: 'Sách giáo khoa Vật lý lớp 11 với các thí nghiệm minh họa và bài tập thực hành phong phú.',
    author: 'Bộ Giáo dục và Đào tạo',
    isbn: '978-604-0-11345-6',
    publisher: 'NXB Giáo dục Việt Nam',
    publishedDate: new Date('2023-08-01T00:00:00Z'),
    category: 'Sách giáo khoa',
    tags: ['Vật lý 11', 'SGK', 'THPT', 'Thí nghiệm'],
    coverImage: '/books/covers/physics-11-textbook.svg',
    fileUrl: '/books/files/physics-11-textbook.pdf',
    fileSize: '52.3 MB',
    fileType: 'pdf',
    isActive: true,
    downloadCount: 1987,
    rating: 4.4,
    reviews: 189,
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-12T00:00:00Z')
  },
  {
    id: 'book-004',
    title: 'Hóa học 10 - Cẩm nang thí nghiệm',
    description: 'Cẩm nang thí nghiệm Hóa học lớp 10 với hướng dẫn chi tiết và biện pháp an toàn.',
    author: 'Trần Văn Hóa, Phạm Thị Kim',
    isbn: '978-604-0-10345-6',
    publisher: 'NXB Khoa học và Kỹ thuật',
    publishedDate: new Date('2024-03-01T00:00:00Z'),
    category: 'Sách tham khảo',
    tags: ['Hóa 10', 'Thí nghiệm', 'An toàn', 'Hướng dẫn'],
    coverImage: '/books/covers/chemistry-10-experiments.svg',
    fileUrl: '/books/files/chemistry-10-experiments.pdf',
    fileSize: '28.9 MB',
    fileType: 'pdf',
    isActive: true,
    downloadCount: 1234,
    rating: 4.5,
    reviews: 98,
    createdAt: new Date('2024-09-15T00:00:00Z'),
    updatedAt: new Date('2025-01-05T00:00:00Z')
  },
  {
    id: 'book-005',
    title: 'English Grammar in Use - Intermediate',
    description: 'Sách ngữ pháp tiếng Anh trình độ trung cấp với bài tập thực hành phong phú.',
    author: 'Raymond Murphy',
    isbn: '978-052-1-53762-9',
    publisher: 'Cambridge University Press',
    publishedDate: new Date('2019-01-01T00:00:00Z'),
    category: 'Sách ngoại ngữ',
    tags: ['Tiếng Anh', 'Grammar', 'Intermediate', 'Cambridge'],
    coverImage: '/books/covers/english-grammar-intermediate.svg',
    fileUrl: '/books/files/english-grammar-intermediate.pdf',
    fileSize: '67.4 MB',
    fileType: 'pdf',
    isActive: true,
    downloadCount: 3456,
    rating: 4.9,
    reviews: 567,
    createdAt: new Date('2024-10-01T00:00:00Z'),
    updatedAt: new Date('2025-01-14T00:00:00Z')
  },
  {
    id: 'book-006',
    title: 'Văn học Việt Nam lớp 12',
    description: 'Tuyển tập các tác phẩm văn học Việt Nam lớp 12 với phân tích và bình luận chi tiết.',
    author: 'Bộ Giáo dục và Đào tạo',
    isbn: '978-604-0-12347-8',
    publisher: 'NXB Giáo dục Việt Nam',
    publishedDate: new Date('2023-08-01T00:00:00Z'),
    category: 'Sách giáo khoa',
    tags: ['Văn 12', 'Văn học Việt Nam', 'Phân tích', 'SGK'],
    coverImage: '/books/covers/literature-12-textbook.svg',
    fileUrl: '/books/files/literature-12-textbook.pdf',
    fileSize: '41.8 MB',
    fileType: 'pdf',
    isActive: true,
    downloadCount: 1876,
    rating: 4.3,
    reviews: 145,
    createdAt: new Date('2024-08-20T00:00:00Z'),
    updatedAt: new Date('2025-01-11T00:00:00Z')
  },
  {
    id: 'book-007',
    title: 'Đề thi thử THPT Quốc gia 2025',
    description: 'Bộ đề thi thử THPT Quốc gia 2025 các môn với đáp án chi tiết và hướng dẫn giải.',
    author: 'Nhóm tác giả NyNus',
    publisher: 'NyNus Education',
    publishedDate: new Date('2024-12-01T00:00:00Z'),
    category: 'Đề thi',
    tags: ['THPT QG', 'Đề thi thử', '2025', 'Đáp án'],
    coverImage: '/books/covers/mock-exams-2025.svg',
    fileUrl: '/books/files/mock-exams-2025.pdf',
    fileSize: '89.3 MB',
    fileType: 'pdf',
    isActive: true,
    downloadCount: 4567,
    rating: 4.7,
    reviews: 289,
    createdAt: new Date('2024-12-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T00:00:00Z')
  },
  {
    id: 'book-008',
    title: 'Lịch sử Việt Nam lớp 12',
    description: 'Sách giáo khoa Lịch sử Việt Nam lớp 12 với timeline chi tiết và bản đồ minh họa.',
    author: 'Bộ Giáo dục và Đào tạo',
    isbn: '978-604-0-12348-9',
    publisher: 'NXB Giáo dục Việt Nam',
    publishedDate: new Date('2023-08-01T00:00:00Z'),
    category: 'Sách giáo khoa',
    tags: ['Lịch sử 12', 'Việt Nam', 'Timeline', 'Bản đồ'],
    coverImage: '/books/covers/history-12-textbook.svg',
    fileUrl: '/books/files/history-12-textbook.pdf',
    fileSize: '56.7 MB',
    fileType: 'pdf',
    isActive: false, // Temporarily inactive
    downloadCount: 987,
    rating: 4.2,
    reviews: 76,
    createdAt: new Date('2024-08-25T00:00:00Z'),
    updatedAt: new Date('2024-12-20T00:00:00Z')
  }
];

// Book statistics
export const mockBookStats = {
  totalBooks: 156,
  activeBooks: 142,
  inactiveBooks: 14,
  totalDownloads: 45678,
  averageRating: 4.5,
  totalReviews: 2345,
  booksByCategory: {
    'Sách giáo khoa': 45,
    'Sách bài tập': 32,
    'Sách tham khảo': 28,
    'Đề thi': 23,
    'Sách ngoại ngữ': 18,
    'Khác': 10
  },
  topDownloaded: [
    { id: 'book-007', title: 'Đề thi thử THPT Quốc gia 2025', downloads: 4567 },
    { id: 'book-005', title: 'English Grammar in Use - Intermediate', downloads: 3456 },
    { id: 'book-001', title: 'Sách giáo khoa Toán 12', downloads: 2847 },
    { id: 'book-003', title: 'Sách giáo khoa Vật lý 11', downloads: 1987 },
    { id: 'book-006', title: 'Văn học Việt Nam lớp 12', downloads: 1876 }
  ]
};

// Helper functions for book management
export function getBookById(id: string): AdminBook | undefined {
  return mockBooks.find(book => book.id === id);
}

export function getBooksByCategory(category: string): AdminBook[] {
  return mockBooks.filter(book => book.category === category);
}

export function getBooksByAuthor(author: string): AdminBook[] {
  return mockBooks.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
}

export function getActiveBooks(): AdminBook[] {
  return mockBooks.filter(book => book.isActive);
}

export function getTopRatedBooks(limit: number = 10): AdminBook[] {
  return [...mockBooks]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getMostDownloadedBooks(limit: number = 10): AdminBook[] {
  return [...mockBooks]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, limit);
}

export function searchBooks(query: string): AdminBook[] {
  const searchTerm = query.toLowerCase();
  return mockBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm) ||
    book.description.toLowerCase().includes(searchTerm) ||
    book.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
}

// Mock API responses
export function getMockBooksResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    author?: string;
    isActive?: boolean;
    fileType?: 'pdf' | 'epub' | 'doc' | 'ppt';
    search?: string;
  }
): MockApiResponse<{ books: AdminBook[]; pagination: MockPagination }> {
  let filteredBooks = [...mockBooks];

  // Apply filters
  if (filters?.category) {
    filteredBooks = filteredBooks.filter(b => b.category === filters.category);
  }
  if (filters?.author) {
    filteredBooks = getBooksByAuthor(filters.author);
  }
  if (filters?.isActive !== undefined) {
    filteredBooks = filteredBooks.filter(b => b.isActive === filters.isActive);
  }
  if (filters?.fileType) {
    filteredBooks = filteredBooks.filter(b => b.fileType === filters.fileType);
  }
  if (filters?.search) {
    filteredBooks = searchBooks(filters.search);
  }

  // Apply pagination
  const total = filteredBooks.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      books: paginatedBooks,
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

export function getMockBookStatsResponse(): MockApiResponse<typeof mockBookStats> {
  return {
    success: true,
    data: mockBookStats,
    message: 'Book statistics retrieved successfully'
  };
}
