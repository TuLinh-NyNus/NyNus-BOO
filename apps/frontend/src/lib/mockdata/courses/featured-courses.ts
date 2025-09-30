/**
 * Frontend Courses Mock Data
 * Tương thích với dự án cũ để chuyển đổi giao diện
 */

import { MockCourse, MockTutorial } from './courses-types';

// Mock courses data cho frontend
export const mockFrontendCourses: MockCourse[] = [
  {
    id: 'course-001',
    title: 'Toán học lớp 12 - Ôn thi THPT Quốc gia',
    description: 'Khóa học toàn diện về Toán học lớp 12, chuẩn bị cho kỳ thi THPT Quốc gia với đầy đủ chuyên đề và bài tập.',
    image: '/courses/math-12.svg',
    instructor: 'Lê Văn Toán',
    instructorAvatar: '/avatars/instructor-001.svg',
    instructorBio: 'Thạc sĩ Toán học, 10 năm kinh nghiệm giảng dạy',
    price: '1.500.000đ',
    originalPrice: '2.000.000đ',
    href: '/courses/toan-hoc-lop-12',
    progress: 0,
    rating: 4.8,
    students: 1250,
    tags: ['Toán 12', 'THPT QG', 'Ôn thi', 'Cấp 3'],
    duration: '120 giờ',
    level: 'Nâng cao',
    category: 'Toán học',
    featured: true,
    popular: true,
    chapters: [], // Sẽ được populate từ mockChapters
    totalLessons: 45,
    totalQuizzes: 15,
    requirements: [
      'Đã hoàn thành chương trình Toán lớp 11',
      'Có kiến thức cơ bản về đại số và hình học',
      'Máy tính bỏ túi khoa học'
    ],
    whatYouWillLearn: [
      'Nắm vững các chuyên đề Toán 12',
      'Kỹ năng giải bài tập trắc nghiệm nhanh',
      'Phương pháp làm bài thi THPT QG hiệu quả',
      'Ôn tập và củng cố kiến thức toàn diện'
    ],
    targetAudience: [
      'Học sinh lớp 12',
      'Thí sinh ôn thi THPT Quốc gia',
      'Người muốn nâng cao kiến thức Toán'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2025-01-10T00:00:00Z',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'course-002',
    title: 'Toán học lớp 11 - Nền tảng vững chắc',
    description: 'Khóa học Toán lớp 11 với phương pháp giảng dạy hiện đại, giúp học sinh nắm vững kiến thức nền tảng.',
    image: '/courses/math-11.svg',
    instructor: 'Nguyễn Thị Hương',
    instructorAvatar: '/avatars/instructor-002.svg',
    instructorBio: 'Cử nhân Toán học, 8 năm kinh nghiệm giảng dạy',
    price: '1.200.000đ',
    originalPrice: '1.600.000đ',
    href: '/courses/toan-hoc-lop-11',
    progress: 0,
    rating: 4.7,
    students: 980,
    tags: ['Toán 11', 'Nền tảng', 'Cấp 3'],
    duration: '100 giờ',
    level: 'Trung bình',
    category: 'Toán học',
    featured: true,
    popular: false,
    chapters: [],
    totalLessons: 38,
    totalQuizzes: 12,
    requirements: [
      'Đã hoàn thành chương trình Toán lớp 10',
      'Có kiến thức cơ bản về đại số'
    ],
    whatYouWillLearn: [
      'Nắm vững kiến thức Toán 11',
      'Chuẩn bị tốt cho Toán 12',
      'Phát triển tư duy logic'
    ],
    targetAudience: [
      'Học sinh lớp 11',
      'Học sinh muốn ôn tập Toán 11'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2025-01-05T00:00:00Z',
    createdAt: '2024-07-15T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
  {
    id: 'course-003',
    title: 'Toán học lớp 10 - Khởi đầu vững chắc',
    description: 'Khóa học Toán lớp 10 giúp học sinh làm quen với chương trình THPT và xây dựng nền tảng vững chắc.',
    image: '/courses/math-10.svg',
    instructor: 'Trần Văn Minh',
    instructorAvatar: '/avatars/instructor-003.svg',
    instructorBio: 'Thạc sĩ Toán ứng dụng, 12 năm kinh nghiệm',
    price: '1.000.000đ',
    originalPrice: '1.400.000đ',
    href: '/courses/toan-hoc-lop-10',
    progress: 0,
    rating: 4.6,
    students: 1150,
    tags: ['Toán 10', 'Nền tảng', 'Cấp 3'],
    duration: '80 giờ',
    level: 'Cơ bản',
    category: 'Toán học',
    featured: false,
    popular: true,
    chapters: [],
    totalLessons: 32,
    totalQuizzes: 10,
    requirements: [
      'Đã hoàn thành chương trình THCS',
      'Có kiến thức cơ bản về số học'
    ],
    whatYouWillLearn: [
      'Nắm vững kiến thức Toán 10',
      'Làm quen với chương trình THPT',
      'Xây dựng tư duy toán học'
    ],
    targetAudience: [
      'Học sinh lớp 10',
      'Học sinh chuyển cấp từ THCS'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-12-20T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-20T00:00:00Z',
  }
];

// Mock tutorials data
export const mockTutorials: MockTutorial[] = [
  {
    id: 'tutorial-001',
    number: 1,
    title: 'Giới thiệu về hàm số',
    description: 'Khái niệm cơ bản về hàm số và các tính chất',
    duration: '45 phút',
    category: 'Toán 12',
    level: 'Cơ bản',
    instructor: 'Lê Văn Toán',
    thumbnail: '/tutorials/ham-so-intro.svg',
    videoUrl: '/videos/tutorial-001.mp4',
    isCompleted: false,
    tags: ['Hàm số', 'Cơ bản'],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'tutorial-002',
    number: 2,
    title: 'Đạo hàm và ứng dụng',
    description: 'Cách tính đạo hàm và ứng dụng trong giải toán',
    duration: '60 phút',
    category: 'Toán 12',
    level: 'Trung bình',
    instructor: 'Lê Văn Toán',
    thumbnail: '/tutorials/dao-ham.svg',
    videoUrl: '/videos/tutorial-002.mp4',
    isCompleted: false,
    tags: ['Đạo hàm', 'Ứng dụng'],
    createdAt: '2024-08-02T00:00:00Z',
    updatedAt: '2024-08-02T00:00:00Z',
  }
];

// Helper functions
export function getCoursesByCategory(category: string): MockCourse[] {
  return mockFrontendCourses.filter(course => course.category === category);
}

export function getCourseBySlug(slug: string): MockCourse | null {
  // Convert slug back to course
  const slugToCourseMap: Record<string, string> = {
    'toan-hoc-lop-12': 'course-001',
    'toan-hoc-lop-11': 'course-002',
    'toan-hoc-lop-10': 'course-003'
  };
  
  const courseId = slugToCourseMap[slug];
  return mockFrontendCourses.find(course => course.id === courseId) || null;
}

export function getFeaturedCourses(limit: number = 6): MockCourse[] {
  return mockFrontendCourses.filter(course => course.featured).slice(0, limit);
}

export function getPopularCourses(limit: number = 6): MockCourse[] {
  return mockFrontendCourses.filter(course => course.popular).slice(0, limit);
}
