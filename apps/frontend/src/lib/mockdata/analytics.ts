// Mock data for analytics - Admin dashboard
import { AdminAnalytics, MockApiResponse } from './types';

// Mock analytics data với realistic metrics
export const mockAnalytics: AdminAnalytics = {
  overview: {
    totalUsers: 2847,
    totalQuestions: 15623,
    totalCourses: 156,
    totalSessions: 8934,
    activeUsers: 1245,
    newUsersToday: 23,
    questionsAddedToday: 12,
    coursesCompletedToday: 8
  },
  userGrowth: [
    { date: '2025-01-01', newUsers: 15, totalUsers: 2750 },
    { date: '2025-01-02', newUsers: 18, totalUsers: 2768 },
    { date: '2025-01-03', newUsers: 22, totalUsers: 2790 },
    { date: '2025-01-04', newUsers: 12, totalUsers: 2802 },
    { date: '2025-01-05', newUsers: 25, totalUsers: 2827 },
    { date: '2025-01-06', newUsers: 8, totalUsers: 2835 },
    { date: '2025-01-07', newUsers: 19, totalUsers: 2854 },
    { date: '2025-01-08', newUsers: 16, totalUsers: 2870 },
    { date: '2025-01-09', newUsers: 21, totalUsers: 2891 },
    { date: '2025-01-10', newUsers: 14, totalUsers: 2905 },
    { date: '2025-01-11', newUsers: 28, totalUsers: 2933 },
    { date: '2025-01-12', newUsers: 11, totalUsers: 2944 },
    { date: '2025-01-13', newUsers: 17, totalUsers: 2961 },
    { date: '2025-01-14', newUsers: 20, totalUsers: 2981 },
    { date: '2025-01-15', newUsers: 23, totalUsers: 3004 }
  ],
  questionUsage: [
    { date: '2025-01-01', questionsUsed: 245, questionsAdded: 8 },
    { date: '2025-01-02', questionsUsed: 312, questionsAdded: 12 },
    { date: '2025-01-03', questionsUsed: 289, questionsAdded: 6 },
    { date: '2025-01-04', questionsUsed: 198, questionsAdded: 4 },
    { date: '2025-01-05', questionsUsed: 156, questionsAdded: 3 },
    { date: '2025-01-06', questionsUsed: 134, questionsAdded: 2 },
    { date: '2025-01-07', questionsUsed: 267, questionsAdded: 9 },
    { date: '2025-01-08', questionsUsed: 298, questionsAdded: 11 },
    { date: '2025-01-09', questionsUsed: 324, questionsAdded: 15 },
    { date: '2025-01-10', questionsUsed: 278, questionsAdded: 7 },
    { date: '2025-01-11', questionsUsed: 345, questionsAdded: 18 },
    { date: '2025-01-12', questionsUsed: 189, questionsAdded: 5 },
    { date: '2025-01-13', questionsUsed: 234, questionsAdded: 10 },
    { date: '2025-01-14', questionsUsed: 301, questionsAdded: 13 },
    { date: '2025-01-15', questionsUsed: 287, questionsAdded: 12 }
  ],
  courseProgress: [
    {
      courseId: 'course-001',
      courseName: 'Toán học lớp 12 - Ôn thi THPT Quốc gia',
      enrollments: 1250,
      completions: 234,
      averageProgress: 68.5
    },
    {
      courseId: 'course-002',
      courseName: 'Vật lý lớp 11 - Dao động và sóng',
      enrollments: 890,
      completions: 156,
      averageProgress: 72.3
    },
    {
      courseId: 'course-003',
      courseName: 'Hóa học lớp 10 - Cấu tạo nguyên tử',
      enrollments: 650,
      completions: 89,
      averageProgress: 45.8
    },
    {
      courseId: 'course-004',
      courseName: 'Tiếng Anh lớp 9 - Grammar cơ bản',
      enrollments: 1100,
      completions: 298,
      averageProgress: 81.2
    },
    {
      courseId: 'course-005',
      courseName: 'Văn học lớp 12 - Phân tích tác phẩm',
      enrollments: 780,
      completions: 145,
      averageProgress: 59.7
    }
  ],
  topPerformers: [
    {
      userId: 'student-001',
      userName: 'Nguyễn Văn An',
      averageScore: 9.2,
      completedExams: 45
    },
    {
      userId: 'student-004',
      userName: 'Lê Thị Dung',
      averageScore: 8.9,
      completedExams: 38
    },
    {
      userId: 'student-005',
      userName: 'Trần Minh Hoàng',
      averageScore: 8.7,
      completedExams: 42
    },
    {
      userId: 'student-006',
      userName: 'Phạm Thị Lan',
      averageScore: 8.5,
      completedExams: 35
    },
    {
      userId: 'student-007',
      userName: 'Võ Văn Nam',
      averageScore: 8.3,
      completedExams: 40
    },
    {
      userId: 'student-008',
      userName: 'Đỗ Thị Oanh',
      averageScore: 8.1,
      completedExams: 33
    },
    {
      userId: 'student-009',
      userName: 'Bùi Văn Phúc',
      averageScore: 8.0,
      completedExams: 37
    },
    {
      userId: 'student-010',
      userName: 'Ngô Thị Quỳnh',
      averageScore: 7.9,
      completedExams: 31
    }
  ],
  performance: {
    totalRevenue: 125000000, // 125 triệu VND
    revenueGrowth: 15.8, // 15.8% tăng trưởng
    coursesCompleted: 1247,
    completionRate: 78.5, // 78.5% completion rate
    averageRating: 4.6 // 4.6/5 stars
  },
  engagement: {
    activeStudents: 1845,
    studentGrowth: 12.3, // 12.3% tăng trưởng học viên
    averageStudyTime: 45, // 45 phút/ngày
    questionsAnswered: 28934,
    correctAnswerRate: 82.7 // 82.7% câu trả lời đúng
  }
};

// Additional analytics data
export const mockSystemMetrics = {
  serverHealth: {
    cpuUsage: 45.2,
    memoryUsage: 67.8,
    diskUsage: 34.5,
    networkTraffic: 125.6, // MB/s
    uptime: '15 days, 8 hours, 23 minutes',
    lastRestart: new Date('2024-12-31T16:00:00Z')
  },
  databaseMetrics: {
    totalQueries: 156789,
    averageQueryTime: 12.5, // ms
    slowQueries: 23,
    connectionPool: {
      active: 8,
      idle: 12,
      total: 20
    },
    tablesSizes: {
      users: '45.2 MB',
      questions: '234.7 MB',
      courses: '89.3 MB',
      sessions: '167.8 MB',
      analytics: '23.4 MB'
    }
  },
  userActivity: {
    currentOnline: 234,
    peakToday: 567,
    averageSessionDuration: 28.5, // minutes
    bounceRate: 12.3, // percentage
    mostActiveHours: [
      { hour: 8, users: 145 },
      { hour: 9, users: 234 },
      { hour: 10, users: 298 },
      { hour: 14, users: 267 },
      { hour: 15, users: 312 },
      { hour: 19, users: 189 },
      { hour: 20, users: 223 },
      { hour: 21, users: 178 }
    ]
  },
  contentMetrics: {
    totalViews: 45678,
    totalDownloads: 12345,
    averageRating: 4.6,
    totalReviews: 2345,
    contentByType: {
      videos: 1234,
      documents: 567,
      quizzes: 234,
      assignments: 123
    },
    popularContent: [
      { id: 'content-001', title: 'Đạo hàm và ứng dụng', views: 2345, type: 'video' },
      { id: 'content-002', title: 'Dao động điều hòa', views: 1987, type: 'video' },
      { id: 'content-003', title: 'Bảng tuần hoàn', views: 1654, type: 'document' },
      { id: 'content-004', title: 'Grammar exercises', views: 1432, type: 'quiz' },
      { id: 'content-005', title: 'Phân tích thơ', views: 1298, type: 'document' }
    ]
  }
};

// Revenue and financial metrics
export const mockRevenueMetrics = {
  totalRevenue: 125000000, // VND
  monthlyRevenue: [
    { month: '2024-08', revenue: 8500000 },
    { month: '2024-09', revenue: 9200000 },
    { month: '2024-10', revenue: 10100000 },
    { month: '2024-11', revenue: 11300000 },
    { month: '2024-12', revenue: 12800000 },
    { month: '2025-01', revenue: 13400000 }
  ],
  subscriptionMetrics: {
    totalSubscribers: 2847,
    newSubscriptions: 156,
    canceledSubscriptions: 23,
    churnRate: 0.8, // percentage
    averageRevenuePerUser: 43900 // VND
  },
  courseRevenue: [
    { courseId: 'course-001', courseName: 'Toán học lớp 12', revenue: 18750000 },
    { courseId: 'course-002', courseName: 'Vật lý lớp 11', revenue: 10680000 },
    { courseId: 'course-003', courseName: 'Hóa học lớp 10', revenue: 5200000 },
    { courseId: 'course-004', courseName: 'Tiếng Anh lớp 9', revenue: 8800000 },
    { courseId: 'course-005', courseName: 'Văn học lớp 12', revenue: 6240000 }
  ]
};

// Helper functions for analytics
export function getAnalyticsOverview(): AdminAnalytics['overview'] {
  return mockAnalytics.overview;
}

export function getUserGrowthData(days: number = 15): AdminAnalytics['userGrowth'] {
  return mockAnalytics.userGrowth.slice(-days);
}

export function getQuestionUsageData(days: number = 15): AdminAnalytics['questionUsage'] {
  return mockAnalytics.questionUsage.slice(-days);
}

export function getTopPerformers(limit: number = 10): AdminAnalytics['topPerformers'] {
  return mockAnalytics.topPerformers.slice(0, limit);
}

export function getCourseProgressData(): AdminAnalytics['courseProgress'] {
  return mockAnalytics.courseProgress;
}

// Mock API responses
export function getMockAnalyticsResponse(): MockApiResponse<AdminAnalytics> {
  return {
    success: true,
    data: mockAnalytics,
    message: 'Analytics data retrieved successfully'
  };
}

export function getMockSystemMetricsResponse(): MockApiResponse<typeof mockSystemMetrics> {
  return {
    success: true,
    data: mockSystemMetrics,
    message: 'System metrics retrieved successfully'
  };
}

export function getMockRevenueMetricsResponse(): MockApiResponse<typeof mockRevenueMetrics> {
  return {
    success: true,
    data: mockRevenueMetrics,
    message: 'Revenue metrics retrieved successfully'
  };
}
