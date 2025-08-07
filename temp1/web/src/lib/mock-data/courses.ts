import { getChaptersByCourseId } from './course-details';
import { MockCourse } from './types';

export const mockCourses: MockCourse[] = [
  {
    id: '1',
    title: 'Toán học lớp 12 - Ôn thi THPT Quốc gia',
    description: 'Khóa học toàn diện về toán học lớp 12, bao gồm giải tích, hình học không gian, xác suất thống kê. Chuẩn bị tốt nhất cho kỳ thi THPT Quốc gia với hệ thống bài tập từ cơ bản đến nâng cao.',
    image: '/images/courses/math-12.jpg',
    instructor: 'Thầy Nguyễn Văn Toán',
    instructorAvatar: '/images/instructors/nguyen-van-toan.jpg',
    instructorBio: 'Thầy Nguyễn Văn Toán có hơn 15 năm kinh nghiệm giảng dạy Toán THPT. Từng là giáo viên chuyên Toán tại trường THPT chuyên Hà Nội - Amsterdam.',
    price: '899,000 VNĐ',
    originalPrice: '1,200,000 VNĐ',
    href: '/courses/math-12',
    progress: 75,
    rating: 4.9,
    students: 2150,
    tags: ['Toán 12', 'THPT Quốc gia', 'Giải tích'],
    duration: '60 giờ',
    level: 'Nâng cao',
    category: 'Toán học',
    featured: true,
    popular: true,
    // Extended fields
    chapters: [],
    totalLessons: 45,
    totalQuizzes: 12,
    requirements: [
      'Đã hoàn thành chương trình Toán lớp 11',
      'Có kiến thức cơ bản về hàm số và lượng giác',
      'Máy tính cầm tay (khuyến khích)'
    ],
    whatYouWillLearn: [
      'Nắm vững kiến thức Giải tích lớp 12',
      'Giải thành thạo các dạng bài tập THPT Quốc gia',
      'Kỹ năng làm bài thi hiệu quả',
      'Phương pháp học tập khoa học',
      'Tự tin đạt điểm cao trong kỳ thi'
    ],
    targetAudience: [
      'Học sinh lớp 12 chuẩn bị thi THPT Quốc gia',
      'Học sinh muốn nâng cao kiến thức Toán học',
      'Phụ huynh muốn hỗ trợ con em học tập'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Toán học lớp 11 - Hàm số và Lượng giác',
    description: 'Khóa học chuyên sâu về hàm số, phương trình lượng giác, dãy số và cấp số. Xây dựng nền tảng vững chắc cho toán học lớp 12 với phương pháp giảng dạy hiện đại.',
    image: '/images/courses/math-11.jpg',
    instructor: 'Cô Trần Thị Hàm',
    instructorAvatar: '/images/instructors/tran-thi-ham.jpg',
    instructorBio: 'Cô Trần Thị Hàm có 12 năm kinh nghiệm giảng dạy Toán THPT, chuyên về hàm số và lượng giác.',
    price: '799,000 VNĐ',
    originalPrice: '999,000 VNĐ',
    href: '/courses/math-11',
    progress: 60,
    rating: 4.8,
    students: 1890,
    tags: ['Toán 11', 'Hàm số', 'Lượng giác'],
    duration: '50 giờ',
    level: 'Trung cấp',
    category: 'Toán học',
    featured: true,
    popular: true,
    // Extended fields
    chapters: [],
    totalLessons: 38,
    totalQuizzes: 10,
    requirements: [
      'Đã hoàn thành chương trình Toán lớp 10',
      'Kiến thức cơ bản về phương trình và bất phương trình'
    ],
    whatYouWillLearn: [
      'Nắm vững kiến thức về hàm số',
      'Giải thành thạo phương trình lượng giác',
      'Hiểu về dãy số và cấp số',
      'Chuẩn bị tốt cho Toán lớp 12'
    ],
    targetAudience: [
      'Học sinh lớp 11',
      'Học sinh muốn ôn tập Toán 11'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-10T00:00:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    title: 'Toán học lớp 10 - Đại số và Hình học',
    description: 'Khóa học nền tảng cho học sinh lớp 10, bao gồm phương trình bậc hai, hệ phương trình, bất đẳng thức và hình học phẳng. Phương pháp giảng dạy dễ hiểu, bài tập phong phú.',
    image: '/images/courses/math-10.jpg',
    instructor: 'Thầy Lê Văn Số',
    instructorAvatar: '/images/instructors/le-van-so.jpg',
    instructorBio: 'Thầy Lê Văn Số có 10 năm kinh nghiệm giảng dạy Toán THPT, chuyên về đại số và hình học.',
    price: '699,000 VNĐ',
    originalPrice: '899,000 VNĐ',
    href: '/courses/math-10',
    progress: 45,
    rating: 4.7,
    students: 1650,
    tags: ['Toán 10', 'Đại số', 'Hình học'],
    duration: '45 giờ',
    level: 'Cơ bản',
    category: 'Toán học',
    featured: true,
    popular: true,
    // Extended fields
    chapters: [],
    totalLessons: 32,
    totalQuizzes: 8,
    requirements: [
      'Hoàn thành chương trình Toán lớp 9',
      'Kiến thức cơ bản về số học'
    ],
    whatYouWillLearn: [
      'Nắm vững đại số lớp 10',
      'Hiểu về hình học phẳng',
      'Giải phương trình và bất phương trình',
      'Chuẩn bị cho Toán lớp 11'
    ],
    targetAudience: [
      'Học sinh lớp 10',
      'Học sinh muốn ôn tập nền tảng'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-08T00:00:00Z',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    title: 'Vật lý đại cương lớp 11',
    description: 'Khóa học vật lý lớp 11 với các thí nghiệm thực tế và bài tập chi tiết.',
    image: '/images/courses/physics-11.jpg',
    instructor: 'Cô Trần Thị Hướng Dẫn',
    instructorAvatar: '/images/instructors/tran-thi-huong-dan.jpg',
    instructorBio: 'Cô Trần Thị Hướng Dẫn có 8 năm kinh nghiệm giảng dạy Vật lý THPT, chuyên về thí nghiệm và ứng dụng thực tế.',
    price: '750,000 VNĐ',
    originalPrice: '950,000 VNĐ',
    href: '/courses/physics-11',
    progress: 60,
    rating: 4.6,
    students: 980,
    tags: ['Vật lý', 'Lớp 11', 'Thí nghiệm'],
    duration: '35 giờ',
    level: 'Trung cấp',
    category: 'Vật lý',
    featured: false,
    popular: false,
    // Extended fields
    chapters: [],
    totalLessons: 28,
    totalQuizzes: 7,
    requirements: [
      'Đã hoàn thành chương trình Vật lý lớp 10',
      'Kiến thức cơ bản về toán học',
      'Máy tính khoa học'
    ],
    whatYouWillLearn: [
      'Nắm vững các định luật vật lý cơ bản',
      'Thực hiện các thí nghiệm vật lý',
      'Giải các bài tập vật lý phức tạp',
      'Ứng dụng vật lý trong đời sống'
    ],
    targetAudience: [
      'Học sinh lớp 11',
      'Học sinh muốn ôn tập Vật lý'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-12T00:00:00Z',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    title: 'Hóa học hữu cơ lớp 12',
    description: 'Tìm hiểu về các hợp chất hữu cơ, phản ứng và ứng dụng trong đời sống.',
    image: '/images/courses/chemistry-12.jpg',
    instructor: 'Thầy Lê Văn Thí Nghiệm',
    instructorAvatar: '/images/instructors/le-van-thi-nghiem.jpg',
    instructorBio: 'Thầy Lê Văn Thí Nghiệm có 13 năm kinh nghiệm giảng dạy Hóa học THPT, chuyên về hóa hữu cơ và thí nghiệm.',
    price: '650,000 VNĐ',
    originalPrice: '850,000 VNĐ',
    href: '/courses/chemistry-12',
    progress: 45,
    rating: 4.5,
    students: 750,
    tags: ['Hóa học', 'Hữu cơ', 'Lớp 12'],
    duration: '30 giờ',
    level: 'Nâng cao',
    category: 'Hóa học',
    featured: false,
    popular: true,
    // Extended fields
    chapters: [],
    totalLessons: 24,
    totalQuizzes: 6,
    requirements: [
      'Đã hoàn thành chương trình Hóa học lớp 11',
      'Kiến thức cơ bản về hóa vô cơ',
      'Hiểu về cấu trúc nguyên tử'
    ],
    whatYouWillLearn: [
      'Nắm vững kiến thức hóa hữu cơ',
      'Hiểu các phản ứng hóa học',
      'Ứng dụng hóa học trong đời sống',
      'Chuẩn bị tốt cho kỳ thi THPT Quốc gia'
    ],
    targetAudience: [
      'Học sinh lớp 12',
      'Học sinh chuẩn bị thi THPT Quốc gia'
    ],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-13T00:00:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '6',
    title: 'Tiếng Anh giao tiếp cơ bản',
    description: 'Khóa học tiếng Anh giao tiếp hàng ngày cho học sinh THPT.',
    image: '/images/courses/english-basic.jpg',
    instructor: 'Ms. Sarah Johnson',
    instructorAvatar: '/images/instructors/sarah-johnson.jpg',
    instructorBio: 'Ms. Sarah Johnson là giáo viên bản ngữ với 7 năm kinh nghiệm giảng dạy tiếng Anh giao tiếp cho học sinh Việt Nam.',
    price: '550,000 VNĐ',
    originalPrice: '750,000 VNĐ',
    href: '/courses/english-basic',
    progress: 30,
    rating: 4.7,
    students: 1100,
    tags: ['Tiếng Anh', 'Giao tiếp', 'Cơ bản'],
    duration: '25 giờ',
    level: 'Cơ bản',
    category: 'Ngoại ngữ',
    featured: false,
    popular: false,
    // Extended fields
    chapters: [],
    totalLessons: 20,
    totalQuizzes: 5,
    requirements: [
      'Kiến thức tiếng Anh cơ bản',
      'Muốn cải thiện kỹ năng giao tiếp'
    ],
    whatYouWillLearn: [
      'Giao tiếp tiếng Anh tự tin',
      'Từ vựng thông dụng hàng ngày',
      'Phát âm chuẩn',
      'Kỹ năng nghe hiểu'
    ],
    targetAudience: [
      'Học sinh THPT',
      'Người mới bắt đầu học tiếng Anh'
    ],
    language: 'Tiếng Anh/Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-14T00:00:00Z',
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z'
  },
  {
    id: '7',
    title: 'Lịch sử Việt Nam hiện đại',
    description: 'Tìm hiểu lịch sử Việt Nam từ thế kỷ 19 đến nay.',
    image: '/images/courses/history-vietnam.jpg',
    instructor: 'Thầy Phạm Văn Sử',
    price: '300,000 VNĐ',
    href: '/courses/history-vietnam',
    progress: 80,
    rating: 4.4,
    students: 650,
    tags: ['Lịch sử', 'Việt Nam', 'Hiện đại'],
    duration: '20 giờ',
    level: 'Cơ bản',
    category: 'Lịch sử',
    featured: false,
    popular: false,
    // Extended fields
    chapters: [],
    totalLessons: 15,
    totalQuizzes: 5,
    requirements: ['Kiến thức cơ bản về lịch sử'],
    whatYouWillLearn: ['Hiểu rõ lịch sử Việt Nam hiện đại'],
    targetAudience: ['Học sinh THPT'],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-05T00:00:00Z',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '8',
    title: 'Địa lý tự nhiên Việt Nam',
    description: 'Khám phá địa hình, khí hậu và tài nguyên thiên nhiên của Việt Nam.',
    image: '/images/courses/geography-vietnam.jpg',
    instructor: 'Cô Hoàng Thị Địa',
    price: '280,000 VNĐ',
    href: '/courses/geography-vietnam',
    progress: 55,
    rating: 4.3,
    students: 520,
    tags: ['Địa lý', 'Tự nhiên', 'Việt Nam'],
    duration: '18 giờ',
    level: 'Cơ bản',
    category: 'Địa lý',
    featured: false,
    popular: true,
    // Extended fields
    chapters: [],
    totalLessons: 12,
    totalQuizzes: 4,
    requirements: ['Kiến thức cơ bản về địa lý'],
    whatYouWillLearn: ['Hiểu về địa lý tự nhiên Việt Nam'],
    targetAudience: ['Học sinh THPT'],
    language: 'Tiếng Việt',
    hasSubtitles: true,
    hasCertificate: true,
    lastUpdated: '2024-01-06T00:00:00Z',
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z'
  }
];

// Helper functions
export function getCourseById(id: string): MockCourse | undefined {
  return mockCourses.find(course => course.id === id);
}

export function getCourseBySlug(slug: string): MockCourse | undefined {
  return mockCourses.find(course => course.href.includes(slug));
}

export function getCourseWithDetails(id: string): MockCourse | undefined {
  const course = getCourseById(id);
  if (!course) return undefined;

  return {
    ...course,
    chapters: getChaptersByCourseId(id)
  };
}

export function getFeaturedCourses(limit: number = 6): MockCourse[] {
  return mockCourses.filter(course => course.featured).slice(0, limit);
}

export function getPopularCourses(limit: number = 6): MockCourse[] {
  return mockCourses.filter(course => course.popular).slice(0, limit);
}

export function getCoursesByCategory(category: string): MockCourse[] {
  return mockCourses.filter(course => course.category === category);
}

export function getCoursesByLevel(level: string): MockCourse[] {
  return mockCourses.filter(course => course.level === level);
}

export function searchCourses(query: string): MockCourse[] {
  const lowercaseQuery = query.toLowerCase();
  return mockCourses.filter(course => 
    course.title.toLowerCase().includes(lowercaseQuery) ||
    course.description.toLowerCase().includes(lowercaseQuery) ||
    course.instructor.toLowerCase().includes(lowercaseQuery) ||
    course.category.toLowerCase().includes(lowercaseQuery)
  );
}
