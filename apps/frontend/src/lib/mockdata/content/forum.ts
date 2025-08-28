// Mock data for forum - Admin management
import { AdminForumPost, MockPagination, MockApiResponse } from '../shared/core-types';

// Mock forum posts data với realistic content
export const mockForumPosts: AdminForumPost[] = [
  {
    id: 'post-001',
    title: 'Cách giải nhanh bài toán cực trị hàm số',
    content: 'Chào các bạn, mình muốn chia sẻ một số mẹo để giải nhanh bài toán cực trị hàm số trong đề thi THPT QG:\n\n1. Luôn tính đạo hàm đầu tiên\n2. Tìm nghiệm của phương trình f\'(x) = 0\n3. Lập bảng biến thiên\n4. So sánh giá trị tại các điểm đặc biệt\n\nCác bạn có thêm mẹo nào khác không?',
    authorId: 'student-001',
    authorName: 'Nguyễn Văn An',
    authorAvatar: '/avatars/student-001.svg',
    category: 'Toán học',
    tags: ['Toán 12', 'Cực trị', 'THPT QG', 'Mẹo hay'],
    isSticky: true,
    isLocked: false,
    viewCount: 1245,
    replyCount: 23,
    lastReplyAt: new Date('2025-01-15T14:30:00Z'),
    lastReplyBy: 'instructor-001',
    createdAt: new Date('2025-01-10T08:00:00Z'),
    updatedAt: new Date('2025-01-15T14:30:00Z'),
    replies: [
      {
        id: 'reply-001-01',
        postId: 'post-001',
        content: 'Cảm ơn bạn đã chia sẻ! Mình muốn bổ sung thêm: nên chú ý đến việc kiểm tra điều kiện xác định của hàm số trước khi tính đạo hàm.',
        authorId: 'student-004',
        authorName: 'Lê Thị Dung',
        authorAvatar: '/avatars/student-004.svg',
        isInstructorReply: false,
        likes: 15,
        createdAt: new Date('2025-01-10T10:30:00Z'),
        updatedAt: new Date('2025-01-10T10:30:00Z')
      },
      {
        id: 'reply-001-02',
        postId: 'post-001',
        content: 'Rất hay! Thêm một mẹo nữa: với hàm số có chứa tham số, hãy phân loại theo giá trị của tham số để có kết quả chính xác nhất.',
        authorId: 'instructor-001',
        authorName: 'Lê Văn Toán',
        authorAvatar: '/avatars/instructor-001.svg',
        isInstructorReply: true,
        likes: 28,
        createdAt: new Date('2025-01-15T14:30:00Z'),
        updatedAt: new Date('2025-01-15T14:30:00Z')
      }
    ]
  },
  {
    id: 'post-002',
    title: 'Thắc mắc về dao động điều hòa - Vật lý 11',
    content: 'Các bạn ơi, mình đang học về dao động điều hòa nhưng vẫn chưa hiểu rõ về mối quan hệ giữa li độ, vận tốc và gia tốc.\n\nCụ thể:\n- Tại sao khi li độ cực đại thì vận tốc bằng 0?\n- Gia tốc và li độ có mối quan hệ như thế nào?\n\nMong các bạn và thầy cô giải đáp giúp mình!',
    authorId: 'student-002',
    authorName: 'Trần Thị Bình',
    authorAvatar: '/avatars/student-002.svg',
    category: 'Vật lý',
    tags: ['Vật lý 11', 'Dao động', 'Thắc mắc'],
    isSticky: false,
    isLocked: false,
    viewCount: 876,
    replyCount: 18,
    lastReplyAt: new Date('2025-01-14T16:45:00Z'),
    lastReplyBy: 'instructor-002',
    createdAt: new Date('2025-01-12T14:20:00Z'),
    updatedAt: new Date('2025-01-14T16:45:00Z'),
    replies: [
      {
        id: 'reply-002-01',
        postId: 'post-002',
        content: 'Mình giải thích đơn giản nhé: Trong dao động điều hòa, khi vật ở vị trí biên (li độ cực đại), nó sẽ đổi chiều chuyển động, nên tại thời điểm đó vận tốc bằng 0. Còn gia tốc luôn hướng về vị trí cân bằng và tỉ lệ với li độ: a = -ω²x.',
        authorId: 'instructor-002',
        authorName: 'Phạm Thị Lý',
        authorAvatar: '/avatars/instructor-002.svg',
        isInstructorReply: true,
        likes: 34,
        createdAt: new Date('2025-01-14T16:45:00Z'),
        updatedAt: new Date('2025-01-14T16:45:00Z')
      }
    ]
  },
  {
    id: 'post-003',
    title: 'Chia sẻ tài liệu ôn thi THPT QG 2025',
    content: 'Xin chào mọi người!\n\nMình vừa tổng hợp được một số tài liệu hay để ôn thi THPT QG 2025, bao gồm:\n- Công thức tóm tắt các môn\n- Đề thi thử có lời giải chi tiết\n- Phương pháp làm bài hiệu quả\n\nNếu các bạn cần thì comment bên dưới, mình sẽ share link drive.',
    authorId: 'student-005',
    authorName: 'Trần Minh Hoàng',
    authorAvatar: '/avatars/student-005.svg',
    category: 'Tài liệu',
    tags: ['THPT QG', 'Tài liệu', 'Chia sẻ', '2025'],
    isSticky: false,
    isLocked: false,
    viewCount: 2134,
    replyCount: 45,
    lastReplyAt: new Date('2025-01-15T09:15:00Z'),
    lastReplyBy: 'student-010',
    createdAt: new Date('2025-01-08T20:00:00Z'),
    updatedAt: new Date('2025-01-15T09:15:00Z'),
    replies: [
      {
        id: 'reply-003-01',
        postId: 'post-003',
        content: 'Cảm ơn bạn rất nhiều! Mình đang cần tài liệu ôn Toán và Lý, có thể share được không?',
        authorId: 'student-006',
        authorName: 'Phạm Thị Lan',
        authorAvatar: '/avatars/student-006.svg',
        isInstructorReply: false,
        likes: 12,
        createdAt: new Date('2025-01-09T08:30:00Z'),
        updatedAt: new Date('2025-01-09T08:30:00Z')
      }
    ]
  },
  {
    id: 'post-004',
    title: 'Hướng dẫn sử dụng tính năng mới của NyNus',
    content: 'Chào các bạn học viên!\n\nNyNus vừa cập nhật một số tính năng mới:\n1. Chế độ học tập tập trung (Focus Mode)\n2. Thống kê tiến độ chi tiết\n3. Hệ thống nhắc nhở thông minh\n4. Tính năng ghi chú cải tiến\n\nMọi người đã thử chưa? Cảm giác thế nào?',
    authorId: 'admin-002',
    authorName: 'Trần Hỗ Trợ',
            authorAvatar: '/avatars/admin-002.svg',
    category: 'Thông báo',
    tags: ['Cập nhật', 'Tính năng mới', 'Hướng dẫn'],
    isSticky: true,
    isLocked: false,
    viewCount: 3456,
    replyCount: 67,
    lastReplyAt: new Date('2025-01-15T11:20:00Z'),
    lastReplyBy: 'student-008',
    createdAt: new Date('2025-01-05T10:00:00Z'),
    updatedAt: new Date('2025-01-15T11:20:00Z'),
    replies: [
      {
        id: 'reply-004-01',
        postId: 'post-004',
        content: 'Tính năng Focus Mode rất hữu ích! Giúp mình tập trung hơn khi học. Cảm ơn team NyNus!',
        authorId: 'student-007',
        authorName: 'Võ Văn Nam',
        authorAvatar: '/avatars/student-007.svg',
        isInstructorReply: false,
        likes: 23,
        createdAt: new Date('2025-01-06T14:15:00Z'),
        updatedAt: new Date('2025-01-06T14:15:00Z')
      }
    ]
  },
  {
    id: 'post-005',
    title: 'Thảo luận về đề thi thử Hóa học',
    content: 'Mình vừa làm đề thi thử Hóa học trên NyNus, có một câu về cân bằng hóa học mình chưa hiểu lắm.\n\nCâu hỏi: "Trong phản ứng N₂ + 3H₂ ⇌ 2NH₃, nếu tăng áp suất thì cân bằng dịch chuyển theo chiều nào?"\n\nMình biết đáp án là dịch chuyển theo chiều thuận, nhưng tại sao vậy?',
    authorId: 'student-003',
    authorName: 'Lê Minh Cường',
    authorAvatar: '/avatars/student-003.svg',
    category: 'Hóa học',
    tags: ['Hóa 11', 'Cân bằng', 'Đề thi thử'],
    isSticky: false,
    isLocked: false,
    viewCount: 654,
    replyCount: 12,
    lastReplyAt: new Date('2025-01-13T15:30:00Z'),
    lastReplyBy: 'instructor-003',
    createdAt: new Date('2025-01-11T16:45:00Z'),
    updatedAt: new Date('2025-01-13T15:30:00Z'),
    replies: [
      {
        id: 'reply-005-01',
        postId: 'post-005',
        content: 'Theo nguyên lý Le Chatelier, khi tăng áp suất, cân bằng sẽ dịch chuyển theo chiều làm giảm áp suất. Ở đây, chiều thuận có 4 mol khí (1N₂ + 3H₂) tạo thành 2 mol NH₃, nên áp suất giảm. Vậy cân bằng dịch chuyển theo chiều thuận.',
        authorId: 'instructor-003',
        authorName: 'Nguyễn Văn Hóa',
        authorAvatar: '/avatars/instructor-003.svg',
        isInstructorReply: true,
        likes: 18,
        createdAt: new Date('2025-01-13T15:30:00Z'),
        updatedAt: new Date('2025-01-13T15:30:00Z')
      }
    ]
  }
];

// Forum statistics
export const mockForumStats = {
  totalPosts: 1234,
  totalReplies: 5678,
  totalViews: 45678,
  activeUsers: 234,
  postsToday: 12,
  repliesToday: 34,
  postsByCategory: {
    'Toán học': 345,
    'Vật lý': 234,
    'Hóa học': 189,
    'Tiếng Anh': 156,
    'Văn học': 123,
    'Tài liệu': 98,
    'Thông báo': 45,
    'Khác': 44
  },
  topContributors: [
    { userId: 'student-001', userName: 'Nguyễn Văn An', posts: 45, replies: 123 },
    { userId: 'student-004', userName: 'Lê Thị Dung', posts: 38, replies: 98 },
    { userId: 'instructor-001', userName: 'Lê Văn Toán', posts: 23, replies: 156 },
    { userId: 'student-005', userName: 'Trần Minh Hoàng', posts: 34, replies: 87 },
    { userId: 'instructor-002', userName: 'Phạm Thị Lý', posts: 19, replies: 134 }
  ],
  mostViewedPosts: [
    { id: 'post-004', title: 'Hướng dẫn sử dụng tính năng mới của NyNus', views: 3456 },
    { id: 'post-003', title: 'Chia sẻ tài liệu ôn thi THPT QG 2025', views: 2134 },
    { id: 'post-001', title: 'Cách giải nhanh bài toán cực trị hàm số', views: 1245 },
    { id: 'post-002', title: 'Thắc mắc về dao động điều hòa - Vật lý 11', views: 876 },
    { id: 'post-005', title: 'Thảo luận về đề thi thử Hóa học', views: 654 }
  ]
};

// Helper functions for forum management
export function getPostById(id: string): AdminForumPost | undefined {
  return mockForumPosts.find(post => post.id === id);
}

export function getPostsByCategory(category: string): AdminForumPost[] {
  return mockForumPosts.filter(post => post.category === category);
}

export function getPostsByAuthor(authorId: string): AdminForumPost[] {
  return mockForumPosts.filter(post => post.authorId === authorId);
}

export function getStickyPosts(): AdminForumPost[] {
  return mockForumPosts.filter(post => post.isSticky);
}

export function getLockedPosts(): AdminForumPost[] {
  return mockForumPosts.filter(post => post.isLocked);
}

export function getMostViewedPosts(limit: number = 10): AdminForumPost[] {
  return [...mockForumPosts]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function getMostRepliedPosts(limit: number = 10): AdminForumPost[] {
  return [...mockForumPosts]
    .sort((a, b) => b.replyCount - a.replyCount)
    .slice(0, limit);
}

export function getRecentPosts(limit: number = 10): AdminForumPost[] {
  return [...mockForumPosts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function searchPosts(query: string): AdminForumPost[] {
  const searchTerm = query.toLowerCase();
  return mockForumPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm) ||
    post.authorName.toLowerCase().includes(searchTerm) ||
    post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
  );
}

// Mock API responses
export function getMockForumPostsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    authorId?: string;
    isSticky?: boolean;
    isLocked?: boolean;
    search?: string;
  }
): MockApiResponse<{ posts: AdminForumPost[]; pagination: MockPagination }> {
  let filteredPosts = [...mockForumPosts];

  // Apply filters
  if (filters?.category) {
    filteredPosts = filteredPosts.filter(p => p.category === filters.category);
  }
  if (filters?.authorId) {
    filteredPosts = filteredPosts.filter(p => p.authorId === filters.authorId);
  }
  if (filters?.isSticky !== undefined) {
    filteredPosts = filteredPosts.filter(p => p.isSticky === filters.isSticky);
  }
  if (filters?.isLocked !== undefined) {
    filteredPosts = filteredPosts.filter(p => p.isLocked === filters.isLocked);
  }
  if (filters?.search) {
    filteredPosts = searchPosts(filters.search);
  }

  // Sort by sticky first, then by last reply time
  filteredPosts.sort((a, b) => {
    if (a.isSticky && !b.isSticky) return -1;
    if (!a.isSticky && b.isSticky) return 1;
    return (b.lastReplyAt?.getTime() || b.createdAt.getTime()) - 
           (a.lastReplyAt?.getTime() || a.createdAt.getTime());
  });

  // Apply pagination
  const total = filteredPosts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      posts: paginatedPosts,
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

export function getMockForumStatsResponse(): MockApiResponse<typeof mockForumStats> {
  return {
    success: true,
    data: mockForumStats,
    message: 'Forum statistics retrieved successfully'
  };
}
