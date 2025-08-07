import { MockChapter, MockLesson, MockResource, MockQuiz, MockQuizQuestion, MockReview, MockDiscussion, MockProgress } from './types';

// Mock lessons data
export const mockLessons: MockLesson[] = [
  {
    id: 'lesson-1',
    courseId: '1',
    chapterId: 'chapter-1',
    number: 1,
    title: 'Giới thiệu về Giải tích',
    description: 'Tổng quan về giải tích, các khái niệm cơ bản và ứng dụng trong toán học lớp 12',
    duration: '15:30',
    videoUrl: '/videos/lessons/giai-thich-gioi-thieu.mp4',
    thumbnail: '/images/lessons/giai-thich-gioi-thieu.jpg',
    isCompleted: false,
    isFree: true,
    resources: [
      {
        id: 'resource-1',
        lessonId: 'lesson-1',
        title: 'Slide bài giảng',
        type: 'slide',
        url: '/resources/giai-thich-slide.pdf',
        size: '2.5 MB',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'lesson-2',
    courseId: '1',
    chapterId: 'chapter-1',
    number: 2,
    title: 'Giới hạn của hàm số',
    description: 'Khái niệm giới hạn, các định lý về giới hạn và phương pháp tính giới hạn',
    duration: '22:45',
    videoUrl: '/videos/lessons/gioi-han-ham-so.mp4',
    thumbnail: '/images/lessons/gioi-han-ham-so.jpg',
    isCompleted: false,
    isFree: false,
    resources: [
      {
        id: 'resource-2',
        lessonId: 'lesson-2',
        title: 'Bài tập về nhà',
        type: 'exercise',
        url: '/resources/gioi-han-bai-tap.pdf',
        size: '1.8 MB',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'lesson-3',
    courseId: '1',
    chapterId: 'chapter-1',
    number: 3,
    title: 'Đạo hàm và ý nghĩa hình học',
    description: 'Định nghĩa đạo hàm, ý nghĩa hình học và vật lý của đạo hàm',
    duration: '18:20',
    videoUrl: '/videos/lessons/dao-ham-y-nghia.mp4',
    thumbnail: '/images/lessons/dao-ham-y-nghia.jpg',
    isCompleted: false,
    isFree: false,
    resources: [],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

// Mock chapters data
export const mockChapters: MockChapter[] = [
  {
    id: 'chapter-1',
    courseId: '1',
    number: 1,
    title: 'Chương 1: Giải tích cơ bản',
    description: 'Nền tảng về giải tích, giới hạn và đạo hàm',
    lessons: mockLessons.filter(lesson => lesson.chapterId === 'chapter-1'),
    totalDuration: '56:35',
    completedLessons: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'chapter-2',
    courseId: '1',
    number: 2,
    title: 'Chương 2: Ứng dụng đạo hàm',
    description: 'Khảo sát hàm số, cực trị và bài toán tối ưu',
    lessons: [],
    totalDuration: '45:20',
    completedLessons: 0,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'chapter-3',
    courseId: '1',
    number: 3,
    title: 'Chương 3: Tích phân',
    description: 'Nguyên hàm, tích phân và ứng dụng',
    lessons: [],
    totalDuration: '38:15',
    completedLessons: 0,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

// Mock quiz questions - Updated to PascalCase
export const mockQuizQuestions: MockQuizQuestion[] = [
  {
    id: 'q1',
    Question: 'Đạo hàm của hàm số f(x) = x³ + 2x² - 5x + 1 là:',
    Type: 'multiple_choice',
    Options: ['3x² + 4x - 5', '3x² + 4x + 5', 'x³ + 4x - 5', '3x + 4x - 5'],
    correctAnswer: '3x² + 4x - 5',
    Explanation: 'Áp dụng quy tắc đạo hàm: (x³)\' = 3x², (2x²)\' = 4x, (-5x)\' = -5, (1)\' = 0',
    Points: 10
  },
  {
    id: 'q2',
    Question: 'Giới hạn lim(x→∞) (2x + 1)/(x - 3) bằng:',
    Type: 'multiple_choice',
    Options: ['2', '1', '∞', '0'],
    correctAnswer: '2',
    Explanation: 'Chia cả tử và mẫu cho x, ta được lim(x→∞) (2 + 1/x)/(1 - 3/x) = 2/1 = 2',
    Points: 10
  }
];

// Mock quizzes
export const mockQuizzes: MockQuiz[] = [
  {
    id: 'quiz-1',
    courseId: '1',
    chapterId: 'chapter-1',
    title: 'Kiểm tra Chương 1: Giải tích cơ bản',
    description: 'Bài kiểm tra kiến thức về giới hạn và đạo hàm',
    questions: mockQuizQuestions,
    timeLimit: 30,
    passingScore: 70,
    attempts: 3,
    isCompleted: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'quiz-2',
    courseId: '1',
    chapterId: 'chapter-2',
    title: 'Bài tập ứng dụng đạo hàm',
    description: 'Bài tập về khảo sát hàm số và tìm cực trị',
    questions: [
      {
        id: 'q3',
        Question: 'Hàm số y = x³ - 3x² + 2 đạt cực đại tại điểm nào?',
        Type: 'multiple_choice',
        Options: ['x = 0', 'x = 1', 'x = 2', 'x = -1'],
        correctAnswer: 'x = 0',
        Explanation: 'Tính y\' = 3x² - 6x = 3x(x-2). y\' = 0 khi x = 0 hoặc x = 2. Tính y\'\' = 6x - 6. Tại x = 0: y\'\'(0) = -6 < 0 nên x = 0 là điểm cực đại.',
        Points: 15
      },
      {
        id: 'q4',
        Question: 'Giá trị nhỏ nhất của hàm số y = x² - 4x + 5 trên đoạn [0, 3] là:',
        Type: 'multiple_choice',
        Options: ['1', '2', '5', '8'],
        correctAnswer: '1',
        Explanation: 'y\' = 2x - 4 = 0 khi x = 2. Tính y(0) = 5, y(2) = 1, y(3) = 2. Vậy min = 1 tại x = 2.',
        Points: 15
      }
    ],
    timeLimit: 45,
    passingScore: 75,
    attempts: 2,
    isCompleted: true,
    bestScore: 85,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'quiz-3',
    courseId: '1',
    chapterId: 'chapter-3',
    title: 'Tích phân và ứng dụng',
    description: 'Bài kiểm tra về tích phân xác định và ứng dụng tính diện tích',
    questions: [
      {
        id: 'q5',
        Question: 'Tích phân ∫₀¹ x² dx bằng:',
        Type: 'multiple_choice',
        Options: ['1/3', '1/2', '2/3', '1'],
        correctAnswer: '1/3',
        Explanation: '∫ x² dx = x³/3 + C. Vậy ∫₀¹ x² dx = [x³/3]₀¹ = 1³/3 - 0³/3 = 1/3.',
        Points: 10
      }
    ],
    timeLimit: 25,
    passingScore: 70,
    attempts: 3,
    isCompleted: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

// Mock reviews
export const mockReviews: MockReview[] = [
  {
    id: 'review-1',
    courseId: '1',
    userId: 'user-1',
    userName: 'Nguyễn Văn An',
    userAvatar: '/images/avatars/user-1.jpg',
    rating: 5,
    comment: 'Khóa học rất hay, thầy giảng dễ hiểu và có nhiều bài tập thực hành. Rất phù hợp cho học sinh lớp 12.',
    helpful: 15,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'review-2',
    courseId: '1',
    userId: 'user-2',
    userName: 'Trần Thị Bình',
    userAvatar: '/images/avatars/user-2.jpg',
    rating: 4,
    comment: 'Nội dung khóa học tốt, tuy nhiên một số bài giảng hơi nhanh. Nhìn chung vẫn rất hữu ích.',
    helpful: 8,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

// Mock discussions
export const mockDiscussions: MockDiscussion[] = [
  {
    id: 'discussion-1',
    courseId: '1',
    userId: 'user-3',
    userName: 'Lê Văn Cường',
    userAvatar: '/images/avatars/user-3.jpg',
    title: 'Câu hỏi về bài tập đạo hàm',
    content: 'Em không hiểu tại sao đạo hàm của x² lại là 2x. Thầy có thể giải thích thêm không ạ?',
    replies: [
      {
        id: 'reply-1',
        discussionId: 'discussion-1',
        userId: 'instructor-1',
        userName: 'Thầy Nguyễn Văn Toán',
        userAvatar: '/images/avatars/instructor-1.jpg',
        content: 'Đây là quy tắc cơ bản của đạo hàm. Với hàm số f(x) = x^n thì f\'(x) = n.x^(n-1). Vậy với x² thì đạo hàm là 2.x^(2-1) = 2x.',
        likes: 5,
        isInstructorReply: true,
        createdAt: '2024-01-25T10:30:00Z',
        updatedAt: '2024-01-25T10:30:00Z'
      }
    ],
    likes: 3,
    isResolved: true,
    isPinned: false,
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T10:30:00Z'
  }
];

// Mock progress data
export const mockProgress: MockProgress[] = [
  {
    courseId: '1',
    userId: 'user-1',
    completedLessons: ['lesson-1'],
    completedQuizzes: ['quiz-2'],
    totalProgress: 75,
    timeSpent: 1250, // minutes
    lastAccessed: '2024-01-20T14:30:00Z',
    certificateEarned: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  }
];

// Mock certificate data
export interface MockCertificate {
  id: string;
  courseId: string;
  userId: string;
  courseName: string;
  studentName: string;
  completionDate: string;
  certificateUrl: string;
  grade: string;
  instructorName: string;
  createdAt: string;
}

export const mockCertificates: MockCertificate[] = [
  {
    id: 'cert-1',
    courseId: '2',
    userId: 'user-1',
    courseName: 'Toán học lớp 11 - Hàm số và Lượng giác',
    studentName: 'Nguyễn Văn An',
    completionDate: '2024-01-15T00:00:00Z',
    certificateUrl: '/certificates/cert-1.pdf',
    grade: 'Xuất sắc',
    instructorName: 'Cô Trần Thị Hàm',
    createdAt: '2024-01-15T00:00:00Z'
  }
];

// Learning statistics
export interface MockLearningStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalQuizzesCompleted: number;
  totalTimeSpent: number; // minutes
  averageScore: number;
  currentStreak: number; // days
  longestStreak: number; // days
  certificatesEarned: number;
  weeklyProgress: { week: string; progress: number }[];
  subjectProgress: { subject: string; progress: number; color: string }[];
}

export const mockLearningStats: MockLearningStats = {
  totalCoursesEnrolled: 5,
  totalCoursesCompleted: 2,
  totalLessonsCompleted: 45,
  totalQuizzesCompleted: 12,
  totalTimeSpent: 2850, // 47.5 hours
  averageScore: 85,
  currentStreak: 7,
  longestStreak: 15,
  certificatesEarned: 2,
  weeklyProgress: [
    { week: 'T2', progress: 20 },
    { week: 'T3', progress: 35 },
    { week: 'T4', progress: 45 },
    { week: 'T5', progress: 60 },
    { week: 'T6', progress: 75 },
    { week: 'T7', progress: 85 },
    { week: 'CN', progress: 90 }
  ],
  subjectProgress: [
    { subject: 'Toán học', progress: 85, color: '#8B5CF6' },
    { subject: 'Vật lý', progress: 60, color: '#06B6D4' },
    { subject: 'Hóa học', progress: 45, color: '#10B981' },
    { subject: 'Tiếng Anh', progress: 30, color: '#F59E0B' }
  ]
};

// Helper functions
export function getChaptersByCourseId(courseId: string): MockChapter[] {
  return mockChapters.filter(chapter => chapter.courseId === courseId);
}

export function getLessonsByCourseId(courseId: string): MockLesson[] {
  return mockLessons.filter(lesson => lesson.courseId === courseId);
}

export function getQuizzesByCourseId(courseId: string): MockQuiz[] {
  return mockQuizzes.filter(quiz => quiz.courseId === courseId);
}

export function getQuizById(quizId: string): MockQuiz | undefined {
  return mockQuizzes.find(quiz => quiz.id === quizId);
}

export function getReviewsByCourseId(courseId: string): MockReview[] {
  return mockReviews.filter(review => review.courseId === courseId);
}

export function getDiscussionsByCourseId(courseId: string): MockDiscussion[] {
  return mockDiscussions.filter(discussion => discussion.courseId === courseId);
}

export function getProgressByCourseId(courseId: string): MockProgress | undefined {
  return mockProgress.find(progress => progress.courseId === courseId);
}

export function getCertificatesByCourseId(courseId: string): MockCertificate[] {
  return mockCertificates.filter(cert => cert.courseId === courseId);
}

export function getLearningStats(): MockLearningStats {
  return mockLearningStats;
}

// Enhanced progress data for new design
export interface EnhancedProgressData {
  weeklyData: {
    date: string;
    progress: number;
    timeSpent: number;
  }[];
  chapterProgress: {
    id: string;
    name: string;
    progress: number;
    averageScore: number;
    timeSpent: number;
    status: 'completed' | 'in-progress' | 'not-started';
    weakPoints?: string[];
    strongPoints?: string[];
  }[];
  insights: {
    strengths: {
      subject: string;
      score: number;
      improvement: number;
    }[];
    weaknesses: {
      subject: string;
      score: number;
      decline: number;
    }[];
    recommendations: {
      type: 'study' | 'practice' | 'review' | 'time';
      title: string;
      description: string;
      action: string;
      priority: 'high' | 'medium' | 'low';
    }[];
    goals: {
      current: number;
      target: number;
      deadline: string;
      status: 'on-track' | 'behind' | 'ahead';
    };
  };
  gamification: {
    achievements: {
      id: string;
      title: string;
      description: string;
      icon: string;
      earned: boolean;
      earnedDate?: string;
      progress?: number;
      maxProgress?: number;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }[];
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    level: number;
    nextLevelPoints: number;
    leaderboard: {
      rank: number;
      name: string;
      avatar: string;
      score: number;
      isCurrentUser?: boolean;
    }[];
    weeklyRank: number;
    totalUsers: number;
  };
}

export const mockEnhancedProgressData: EnhancedProgressData = {
  weeklyData: [
    { date: '2024-01-15', progress: 15, timeSpent: 45 },
    { date: '2024-01-16', progress: 25, timeSpent: 60 },
    { date: '2024-01-17', progress: 35, timeSpent: 30 },
    { date: '2024-01-18', progress: 50, timeSpent: 90 },
    { date: '2024-01-19', progress: 65, timeSpent: 75 },
    { date: '2024-01-20', progress: 75, timeSpent: 45 },
    { date: '2024-01-21', progress: 85, timeSpent: 60 }
  ],
  chapterProgress: [
    {
      id: 'chapter-1',
      name: 'Hàm số và đồ thị',
      progress: 100,
      averageScore: 8.5,
      timeSpent: 180,
      status: 'completed',
      strongPoints: ['Tính đạo hàm', 'Vẽ đồ thị'],
      weakPoints: []
    },
    {
      id: 'chapter-2',
      name: 'Phương trình và bất phương trình',
      progress: 75,
      averageScore: 7.2,
      timeSpent: 150,
      status: 'in-progress',
      strongPoints: ['Phương trình bậc 2'],
      weakPoints: ['Bất phương trình chứa tham số']
    },
    {
      id: 'chapter-3',
      name: 'Tích phân và ứng dụng',
      progress: 45,
      averageScore: 6.8,
      timeSpent: 90,
      status: 'in-progress',
      strongPoints: [],
      weakPoints: ['Tích phân từng phần', 'Ứng dụng hình học']
    },
    {
      id: 'chapter-4',
      name: 'Số phức',
      progress: 0,
      averageScore: 0,
      timeSpent: 0,
      status: 'not-started'
    }
  ],
  insights: {
    strengths: [
      { subject: 'Hàm số', score: 8.5, improvement: 15 },
      { subject: 'Đạo hàm', score: 8.2, improvement: 12 }
    ],
    weaknesses: [
      { subject: 'Tích phân', score: 6.8, decline: 8 },
      { subject: 'Bất phương trình', score: 6.5, decline: 5 }
    ],
    recommendations: [
      {
        type: 'practice',
        title: 'Luyện tập thêm bài tập tích phân',
        description: 'Bạn cần làm thêm 10-15 bài tập về tích phân từng phần để cải thiện kỹ năng.',
        action: 'Làm bài tập tích phân',
        priority: 'high'
      },
      {
        type: 'review',
        title: 'Ôn lại lý thuyết bất phương trình',
        description: 'Xem lại video bài giảng về bất phương trình chứa tham số.',
        action: 'Xem lại bài giảng',
        priority: 'medium'
      },
      {
        type: 'time',
        title: 'Tăng thời gian học mỗi ngày',
        description: 'Nên học ít nhất 1 giờ mỗi ngày để đạt mục tiêu.',
        action: 'Lập kế hoạch học tập',
        priority: 'medium'
      }
    ],
    goals: {
      current: 75,
      target: 90,
      deadline: '2024-02-15',
      status: 'on-track'
    }
  },
  gamification: {
    achievements: [
      {
        id: 'first-lesson',
        title: 'Bước đầu tiên',
        description: 'Hoàn thành bài học đầu tiên',
        icon: 'book',
        earned: true,
        earnedDate: '2024-01-15',
        rarity: 'common'
      },
      {
        id: 'week-streak',
        title: 'Tuần hoàn hảo',
        description: 'Học 7 ngày liên tiếp',
        icon: 'flame',
        earned: true,
        earnedDate: '2024-01-21',
        rarity: 'rare'
      },
      {
        id: 'high-score',
        title: 'Điểm cao',
        description: 'Đạt điểm 9+ trong bài kiểm tra',
        icon: 'star',
        earned: false,
        progress: 8,
        maxProgress: 9,
        rarity: 'epic'
      },
      {
        id: 'master',
        title: 'Bậc thầy',
        description: 'Hoàn thành khóa học với điểm A+',
        icon: 'crown',
        earned: false,
        progress: 75,
        maxProgress: 100,
        rarity: 'legendary'
      }
    ],
    currentStreak: 7,
    longestStreak: 12,
    totalPoints: 2450,
    level: 3,
    nextLevelPoints: 3000,
    leaderboard: [
      { rank: 1, name: 'Nguyễn Văn A', avatar: '', score: 3200 },
      { rank: 2, name: 'Trần Thị B', avatar: '', score: 2800 },
      { rank: 3, name: 'Lê Văn C', avatar: '', score: 2600 },
      { rank: 4, name: 'Bạn', avatar: '', score: 2450, isCurrentUser: true },
      { rank: 5, name: 'Phạm Thị D', avatar: '', score: 2300 }
    ],
    weeklyRank: 4,
    totalUsers: 156
  }
};

export function getEnhancedProgressData(courseId: string): EnhancedProgressData {
  return mockEnhancedProgressData;
}
