/**
 * Course Details Mock Data
 * Chi tiết chapters, lessons, reviews cho courses
 */

import { MockChapter, MockLesson, MockResource, MockReview } from './courses-types';

// Mock chapters data
export const mockChapters: MockChapter[] = [
  // Course 001 - Toán 12
  {
    id: 'chapter-001-01',
    courseId: 'course-001',
    number: 1,
    title: 'Ứng dụng đạo hàm để khảo sát hàm số',
    description: 'Học cách sử dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    lessons: [],
    totalDuration: '8 giờ 30 phút',
    completedLessons: 0,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'chapter-001-02',
    courseId: 'course-001',
    number: 2,
    title: 'Hàm số mũ và logarit',
    description: 'Tính chất và ứng dụng của hàm số mũ và logarit',
    lessons: [],
    totalDuration: '6 giờ 45 phút',
    completedLessons: 0,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'chapter-001-03',
    courseId: 'course-001',
    number: 3,
    title: 'Nguyên hàm - Tích phân',
    description: 'Khái niệm nguyên hàm, tích phân và ứng dụng',
    lessons: [],
    totalDuration: '10 giờ 15 phút',
    completedLessons: 0,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  }
];

// Mock lessons data
export const mockLessons: MockLesson[] = [
  // Chapter 001-01 lessons
  {
    id: 'lesson-001-01-01',
    courseId: 'course-001',
    chapterId: 'chapter-001-01',
    number: 1,
    title: 'Đạo hàm và ý nghĩa hình học',
    description: 'Ôn tập khái niệm đạo hàm và ý nghĩa hình học của đạo hàm',
    duration: '45 phút',
    videoUrl: '/videos/lesson-001-01-01.mp4',
    thumbnail: '/thumbnails/lesson-001-01-01.svg',
    isCompleted: false,
    isFree: true,
    resources: [],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'lesson-001-01-02',
    courseId: 'course-001',
    chapterId: 'chapter-001-01',
    number: 2,
    title: 'Tính đơn điệu của hàm số',
    description: 'Sử dụng đạo hàm để xét tính đơn điệu của hàm số',
    duration: '50 phút',
    videoUrl: '/videos/lesson-001-01-02.mp4',
    thumbnail: '/thumbnails/lesson-001-01-02.svg',
    isCompleted: false,
    isFree: false,
    resources: [],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'lesson-001-01-03',
    courseId: 'course-001',
    chapterId: 'chapter-001-01',
    number: 3,
    title: 'Cực trị của hàm số',
    description: 'Tìm cực trị của hàm số bằng đạo hàm',
    duration: '55 phút',
    videoUrl: '/videos/lesson-001-01-03.mp4',
    thumbnail: '/thumbnails/lesson-001-01-03.svg',
    isCompleted: false,
    isFree: false,
    resources: [],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  }
];

// Mock resources data
export const mockResources: MockResource[] = [
  {
    id: 'resource-001',
    lessonId: 'lesson-001-01-01',
    title: 'Bài tập về đạo hàm',
    type: 'pdf',
    url: '/resources/dao-ham-exercises.pdf',
    size: '2.5 MB',
    createdAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'resource-002',
    lessonId: 'lesson-001-01-01',
    title: 'Slide bài giảng',
    type: 'slide',
    url: '/resources/dao-ham-slides.pptx',
    size: '5.2 MB',
    createdAt: '2024-08-01T00:00:00Z',
  }
];

// Mock reviews data
export const mockReviews: MockReview[] = [
  {
    id: 'review-001',
    courseId: 'course-001',
    userId: 'user-001',
    userName: 'Nguyễn Văn An',
    userAvatar: '/avatars/user-001.svg',
    rating: 5,
    comment: 'Khóa học rất hay, giảng viên dạy dễ hiểu. Tôi đã cải thiện được điểm số đáng kể.',
    helpful: 15,
    createdAt: '2024-12-15T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
  },
  {
    id: 'review-002',
    courseId: 'course-001',
    userId: 'user-002',
    userName: 'Trần Thị Bình',
    userAvatar: '/avatars/user-002.svg',
    rating: 4,
    comment: 'Nội dung khóa học phong phú, bài tập đa dạng. Chỉ có điều video hơi dài.',
    helpful: 8,
    createdAt: '2024-12-10T00:00:00Z',
    updatedAt: '2024-12-10T00:00:00Z',
  },
  {
    id: 'review-003',
    courseId: 'course-001',
    userId: 'user-003',
    userName: 'Lê Minh Châu',
    userAvatar: '/avatars/user-003.svg',
    rating: 5,
    comment: 'Tuyệt vời! Đây là khóa học Toán 12 tốt nhất tôi từng học. Cảm ơn thầy!',
    helpful: 22,
    createdAt: '2024-12-05T00:00:00Z',
    updatedAt: '2024-12-05T00:00:00Z',
  }
];

// Helper functions
export function getChaptersByCourseId(courseId: string): MockChapter[] {
  const chapters = mockChapters.filter(chapter => chapter.courseId === courseId);
  
  // Populate lessons for each chapter
  return chapters.map(chapter => ({
    ...chapter,
    lessons: mockLessons.filter(lesson => lesson.chapterId === chapter.id).map(lesson => ({
      ...lesson,
      resources: mockResources.filter(resource => resource.lessonId === lesson.id)
    }))
  }));
}

export function getReviewsByCourseId(courseId: string): MockReview[] {
  return mockReviews.filter(review => review.courseId === courseId);
}

export function getLessonById(lessonId: string): MockLesson | null {
  const lesson = mockLessons.find(lesson => lesson.id === lessonId);
  if (!lesson) return null;
  
  return {
    ...lesson,
    resources: mockResources.filter(resource => resource.lessonId === lesson.id)
  };
}

export function getLessonsByCourseId(courseId: string): MockLesson[] {
  return mockLessons.filter(lesson => lesson.courseId === courseId).map(lesson => ({
    ...lesson,
    resources: mockResources.filter(resource => resource.lessonId === lesson.id)
  }));
}
