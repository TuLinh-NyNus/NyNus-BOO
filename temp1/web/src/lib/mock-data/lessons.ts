import { MockLesson } from './types';

export const mockLessons: MockLesson[] = [
  // Lessons for Course 1 - Chapter 1
  {
    id: 'lesson-1-1-1',
    courseId: '1',
    chapterId: 'chapter-1-1',
    number: 1,
    title: 'Giới thiệu về đạo hàm',
    description: 'Khái niệm cơ bản về đạo hàm và ý nghĩa hình học',
    duration: '15:30',
    videoUrl: '/videos/lessons/dao-ham-intro.mp4',
    thumbnail: '/images/lessons/dao-ham-intro.jpg',
    isCompleted: false,
    isFree: true,
    resources: [
      {
        id: 'resource-1-1-1-1',
        lessonId: 'lesson-1-1-1',
        title: 'Slide bài giảng - Đạo hàm cơ bản',
        type: 'slide',
        url: '/resources/slides/dao-ham-co-ban.pdf',
        size: '2.5 MB',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'resource-1-1-1-2',
        lessonId: 'lesson-1-1-1',
        title: 'Bài tập thực hành',
        type: 'exercise',
        url: '/resources/exercises/dao-ham-bai-tap.pdf',
        size: '1.8 MB',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'lesson-1-1-2',
    courseId: '1',
    chapterId: 'chapter-1-1',
    number: 2,
    title: 'Quy tắc tính đạo hàm cơ bản',
    description: 'Các quy tắc cơ bản để tính đạo hàm của các hàm số thường gặp',
    duration: '22:45',
    videoUrl: '/videos/lessons/dao-ham-quy-tac.mp4',
    thumbnail: '/images/lessons/dao-ham-quy-tac.jpg',
    isCompleted: false,
    isFree: false,
    resources: [
      {
        id: 'resource-1-1-2-1',
        lessonId: 'lesson-1-1-2',
        title: 'Bảng công thức đạo hàm',
        type: 'pdf',
        url: '/resources/formulas/dao-ham-cong-thuc.pdf',
        size: '1.2 MB',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'lesson-1-1-3',
    courseId: '1',
    chapterId: 'chapter-1-1',
    number: 3,
    title: 'Đạo hàm của hàm hợp',
    description: 'Quy tắc chuỗi và cách tính đạo hàm của hàm hợp',
    duration: '18:20',
    videoUrl: '/videos/lessons/dao-ham-ham-hop.mp4',
    thumbnail: '/images/lessons/dao-ham-ham-hop.jpg',
    isCompleted: false,
    isFree: false,
    resources: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Lessons for Course 1 - Chapter 2
  {
    id: 'lesson-1-2-1',
    courseId: '1',
    chapterId: 'chapter-1-2',
    number: 1,
    title: 'Ứng dụng đạo hàm khảo sát hàm số',
    description: 'Sử dụng đạo hàm để khảo sát tính đơn điệu và cực trị của hàm số',
    duration: '25:15',
    videoUrl: '/videos/lessons/dao-ham-khao-sat.mp4',
    thumbnail: '/images/lessons/dao-ham-khao-sat.jpg',
    isCompleted: false,
    isFree: true,
    resources: [
      {
        id: 'resource-1-2-1-1',
        lessonId: 'lesson-1-2-1',
        title: 'Sơ đồ khảo sát hàm số',
        type: 'slide',
        url: '/resources/diagrams/khao-sat-ham-so.pdf',
        size: '3.1 MB',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // Lessons for Course 2 - Chapter 1
  {
    id: 'lesson-2-1-1',
    courseId: '2',
    chapterId: 'chapter-2-1',
    number: 1,
    title: 'Khái niệm hàm số',
    description: 'Định nghĩa và các tính chất cơ bản của hàm số',
    duration: '20:30',
    videoUrl: '/videos/lessons/ham-so-khai-niem.mp4',
    thumbnail: '/images/lessons/ham-so-khai-niem.jpg',
    isCompleted: false,
    isFree: true,
    resources: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'lesson-2-1-2',
    courseId: '2',
    chapterId: 'chapter-2-1',
    number: 2,
    title: 'Đồ thị hàm số',
    description: 'Cách vẽ và phân tích đồ thị các hàm số cơ bản',
    duration: '28:45',
    videoUrl: '/videos/lessons/ham-so-do-thi.mp4',
    thumbnail: '/images/lessons/ham-so-do-thi.jpg',
    isCompleted: false,
    isFree: false,
    resources: [
      {
        id: 'resource-2-1-2-1',
        lessonId: 'lesson-2-1-2',
        title: 'Bài tập vẽ đồ thị',
        type: 'exercise',
        url: '/resources/exercises/ve-do-thi.pdf',
        size: '2.8 MB',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

// Helper functions
export function getLessonsByChapterId(chapterId: string): MockLesson[] {
  return mockLessons.filter(lesson => lesson.chapterId === chapterId);
}

export function getLessonsByCourseId(courseId: string): MockLesson[] {
  return mockLessons.filter(lesson => lesson.courseId === courseId);
}

export function getLessonById(lessonId: string): MockLesson | undefined {
  return mockLessons.find(lesson => lesson.id === lessonId);
}

export function getFreeLessons(): MockLesson[] {
  return mockLessons.filter(lesson => lesson.isFree);
}

export function getCompletedLessons(): MockLesson[] {
  return mockLessons.filter(lesson => lesson.isCompleted);
}
