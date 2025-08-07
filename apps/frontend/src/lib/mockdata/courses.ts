// Mock data for courses - Admin management
import { AdminCourse, MockPagination, MockApiResponse } from './types';

// Mock courses data với realistic content
export const mockCourses: AdminCourse[] = [
  {
    id: 'course-001',
    title: 'Toán học lớp 12 - Ôn thi THPT Quốc gia',
    description: 'Khóa học toàn diện về Toán học lớp 12, chuẩn bị cho kỳ thi THPT Quốc gia với đầy đủ chuyên đề và bài tập.',
    image: '/courses/math-12.jpg',
    instructor: 'Lê Văn Toán',
    instructorId: 'instructor-001',
    instructorAvatar: '/avatars/instructor-001.jpg',
    instructorBio: 'Thạc sĩ Toán học, 10 năm kinh nghiệm giảng dạy',
    price: 1500000,
    originalPrice: 2000000,
    progress: 0,
    rating: 4.8,
    students: 1250,
    tags: ['Toán 12', 'THPT QG', 'Ôn thi', 'Cấp 3'],
    duration: '120 giờ',
    level: 'Nâng cao',
    category: 'Toán học',
    featured: true,
    popular: true,
    isPublished: true,
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
    lastUpdated: new Date('2025-01-10T00:00:00Z'),
    createdAt: new Date('2024-08-01T00:00:00Z'),
    updatedAt: new Date('2025-01-10T00:00:00Z'),
    chapters: [
      {
        id: 'chapter-001-01',
        courseId: 'course-001',
        number: 1,
        title: 'Ứng dụng đạo hàm để khảo sát hàm số',
        description: 'Học cách sử dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
        totalDuration: '25 giờ',
        completedLessons: 0,
        createdAt: new Date('2024-08-01T00:00:00Z'),
        updatedAt: new Date('2025-01-05T00:00:00Z'),
        lessons: [
          {
            id: 'lesson-001-01-01',
            courseId: 'course-001',
            chapterId: 'chapter-001-01',
            number: 1,
            title: 'Tính đơn điệu của hàm số',
            description: 'Học cách xác định khoảng đồng biến, nghịch biến của hàm số',
            duration: '45 phút',
            videoUrl: '/videos/math-12-ch1-l1.mp4',
            thumbnail: '/thumbnails/math-12-ch1-l1.jpg',
            isCompleted: false,
            isFree: true,
            createdAt: new Date('2024-08-01T00:00:00Z'),
            updatedAt: new Date('2025-01-05T00:00:00Z'),
            resources: [
              {
                id: 'resource-001',
                lessonId: 'lesson-001-01-01',
                title: 'Bài tập tính đơn điệu',
                type: 'pdf',
                url: '/resources/math-12-monotonic-exercises.pdf',
                size: '2.5 MB',
                createdAt: new Date('2024-08-01T00:00:00Z')
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-002',
    title: 'Vật lý lớp 11 - Dao động và sóng',
    description: 'Khóa học chuyên sâu về dao động cơ và sóng cơ, phù hợp cho học sinh lớp 11.',
    image: '/courses/physics-11.jpg',
    instructor: 'Phạm Thị Lý',
    instructorId: 'instructor-002',
    instructorAvatar: '/avatars/instructor-002.jpg',
    instructorBio: 'Tiến sĩ Vật lý, chuyên gia về cơ học lượng tử',
    price: 1200000,
    originalPrice: 1500000,
    progress: 0,
    rating: 4.6,
    students: 890,
    tags: ['Vật lý 11', 'Dao động', 'Sóng', 'Cấp 3'],
    duration: '80 giờ',
    level: 'Trung bình',
    category: 'Vật lý',
    featured: false,
    popular: true,
    isPublished: true,
    totalLessons: 32,
    totalQuizzes: 10,
    requirements: [
      'Đã học xong Vật lý lớp 10',
      'Có kiến thức cơ bản về toán học',
      'Máy tính khoa học'
    ],
    whatYouWillLearn: [
      'Hiểu rõ bản chất dao động điều hòa',
      'Phân tích các loại sóng cơ học',
      'Giải bài tập về dao động và sóng',
      'Ứng dụng thực tế của dao động và sóng'
    ],
    targetAudience: [
      'Học sinh lớp 11',
      'Người yêu thích Vật lý',
      'Thí sinh thi Olympic Vật lý'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: new Date('2025-01-08T00:00:00Z'),
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-08T00:00:00Z'),
    chapters: [
      {
        id: 'chapter-002-01',
        courseId: 'course-002',
        number: 1,
        title: 'Dao động điều hòa',
        description: 'Tìm hiểu về dao động điều hòa và các đặc trưng',
        totalDuration: '20 giờ',
        completedLessons: 0,
        createdAt: new Date('2024-09-01T00:00:00Z'),
        updatedAt: new Date('2025-01-08T00:00:00Z'),
        lessons: [
          {
            id: 'lesson-002-01-01',
            courseId: 'course-002',
            chapterId: 'chapter-002-01',
            number: 1,
            title: 'Khái niệm dao động điều hòa',
            description: 'Định nghĩa và các đặc trưng của dao động điều hòa',
            duration: '40 phút',
            videoUrl: '/videos/physics-11-ch1-l1.mp4',
            thumbnail: '/thumbnails/physics-11-ch1-l1.jpg',
            isCompleted: false,
            isFree: true,
            createdAt: new Date('2024-09-01T00:00:00Z'),
            updatedAt: new Date('2025-01-08T00:00:00Z'),
            resources: [
              {
                id: 'resource-002',
                lessonId: 'lesson-002-01-01',
                title: 'Công thức dao động điều hòa',
                type: 'pdf',
                url: '/resources/physics-11-harmonic-formulas.pdf',
                size: '1.8 MB',
                createdAt: new Date('2024-09-01T00:00:00Z')
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-003',
    title: 'Hóa học lớp 10 - Cấu tạo nguyên tử',
    description: 'Khóa học cơ bản về cấu tạo nguyên tử và bảng tuần hoàn các nguyên tố.',
    image: '/courses/chemistry-10.jpg',
    instructor: 'Nguyễn Văn Hóa',
    instructorId: 'instructor-003',
    instructorAvatar: '/avatars/instructor-003.jpg',
    instructorBio: 'Thạc sĩ Hóa học, giảng viên đại học',
    price: 800000,
    originalPrice: 1000000,
    progress: 0,
    rating: 4.4,
    students: 650,
    tags: ['Hóa 10', 'Nguyên tử', 'Bảng tuần hoàn', 'Cấp 3'],
    duration: '60 giờ',
    level: 'Cơ bản',
    category: 'Hóa học',
    featured: false,
    popular: false,
    isPublished: true,
    totalLessons: 25,
    totalQuizzes: 8,
    requirements: [
      'Kiến thức Hóa học cơ bản',
      'Đã học xong chương trình lớp 9',
      'Bảng tuần hoàn các nguyên tố'
    ],
    whatYouWillLearn: [
      'Hiểu cấu tạo nguyên tử',
      'Nắm vững bảng tuần hoàn',
      'Dự đoán tính chất nguyên tố',
      'Giải bài tập về cấu tạo nguyên tử'
    ],
    targetAudience: [
      'Học sinh lớp 10',
      'Người mới học Hóa học',
      'Thí sinh ôn thi vào lớp 10'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: false,
    hasCertificate: false,
    lastUpdated: new Date('2025-01-05T00:00:00Z'),
    createdAt: new Date('2024-09-15T00:00:00Z'),
    updatedAt: new Date('2025-01-05T00:00:00Z'),
    chapters: [
      {
        id: 'chapter-003-01',
        courseId: 'course-003',
        number: 1,
        title: 'Cấu tạo nguyên tử',
        description: 'Tìm hiểu về proton, neutron, electron',
        totalDuration: '15 giờ',
        completedLessons: 0,
        createdAt: new Date('2024-09-15T00:00:00Z'),
        updatedAt: new Date('2025-01-05T00:00:00Z'),
        lessons: [
          {
            id: 'lesson-003-01-01',
            courseId: 'course-003',
            chapterId: 'chapter-003-01',
            number: 1,
            title: 'Thành phần cấu tạo nguyên tử',
            description: 'Proton, neutron, electron và đặc điểm của chúng',
            duration: '35 phút',
            videoUrl: '/videos/chemistry-10-ch1-l1.mp4',
            thumbnail: '/thumbnails/chemistry-10-ch1-l1.jpg',
            isCompleted: false,
            isFree: false,
            createdAt: new Date('2024-09-15T00:00:00Z'),
            updatedAt: new Date('2025-01-05T00:00:00Z'),
            resources: [
              {
                id: 'resource-003',
                lessonId: 'lesson-003-01-01',
                title: 'Bảng tính chất hạt cơ bản',
                type: 'pdf',
                url: '/resources/chemistry-10-particles-table.pdf',
                size: '1.2 MB',
                createdAt: new Date('2024-09-15T00:00:00Z')
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper functions for course management
export function getCourseById(id: string): AdminCourse | undefined {
  return mockCourses.find(course => course.id === id);
}

export function getCoursesByInstructor(instructorId: string): AdminCourse[] {
  return mockCourses.filter(course => course.instructorId === instructorId);
}

export function getCoursesByCategory(category: string): AdminCourse[] {
  return mockCourses.filter(course => course.category === category);
}

export function getFeaturedCourses(): AdminCourse[] {
  return mockCourses.filter(course => course.featured);
}

export function getPopularCourses(): AdminCourse[] {
  return mockCourses.filter(course => course.popular);
}

export function searchCourses(query: string): AdminCourse[] {
  const searchTerm = query.toLowerCase();
  return mockCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm) ||
    course.description.toLowerCase().includes(searchTerm) ||
    course.instructor.toLowerCase().includes(searchTerm) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

// Mock API responses
export function getMockCoursesResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    level?: string;
    featured?: boolean;
    popular?: boolean;
    isPublished?: boolean;
    search?: string;
  }
): MockApiResponse<{ courses: AdminCourse[]; pagination: MockPagination }> {
  let filteredCourses = [...mockCourses];

  // Apply filters
  if (filters?.category) {
    filteredCourses = filteredCourses.filter(c => c.category === filters.category);
  }
  if (filters?.level) {
    filteredCourses = filteredCourses.filter(c => c.level === filters.level);
  }
  if (filters?.featured !== undefined) {
    filteredCourses = filteredCourses.filter(c => c.featured === filters.featured);
  }
  if (filters?.popular !== undefined) {
    filteredCourses = filteredCourses.filter(c => c.popular === filters.popular);
  }
  if (filters?.isPublished !== undefined) {
    filteredCourses = filteredCourses.filter(c => c.isPublished === filters.isPublished);
  }
  if (filters?.search) {
    filteredCourses = searchCourses(filters.search);
  }

  // Apply pagination
  const total = filteredCourses.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      courses: paginatedCourses,
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
