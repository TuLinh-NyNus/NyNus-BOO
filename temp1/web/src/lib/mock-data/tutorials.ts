import { MockTutorial } from './types';

export const mockTutorials: MockTutorial[] = [
  {
    id: '1',
    number: 1,
    title: 'Phương trình bậc hai - Công thức nghiệm',
    description: 'Học cách giải phương trình bậc hai bằng công thức nghiệm, phân tích delta và các dạng bài tập thường gặp trong đề thi THPT...',
    duration: '18:04',
    category: 'Toán 10',
    level: 'Cơ bản',
    instructor: 'Thầy Nguyễn Văn Toán',
    thumbnail: '/images/tutorials/phuong-trinh-bac-hai.jpg',
    videoUrl: '/videos/tutorials/phuong-trinh-bac-hai.mp4',
    isCompleted: false,
    tags: ['Phương trình', 'Đại số', 'Toán 10'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    number: 2,
    title: 'Hàm số bậc nhất và đồ thị',
    description: 'Tìm hiểu về hàm số bậc nhất, cách vẽ đồ thị và ứng dụng trong giải bài tập hình học tọa độ...',
    duration: '22:02',
    category: 'Toán 10',
    level: 'Cơ bản',
    instructor: 'Cô Trần Thị Hàm',
    thumbnail: '/images/tutorials/ham-so-bac-nhat.jpg',
    videoUrl: '/videos/tutorials/ham-so-bac-nhat.mp4',
    isCompleted: false,
    tags: ['Hàm số', 'Đồ thị', 'Toán 10'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    number: 3,
    title: 'Lượng giác cơ bản - Sin, Cos, Tan',
    description: 'Nắm vững các tỉ số lượng giác cơ bản, công thức cộng và các phương pháp giải phương trình lượng giác đơn giản...',
    duration: '13:22',
    category: 'Toán 11',
    level: 'Trung cấp',
    instructor: 'Thầy Lê Văn Giác',
    thumbnail: '/images/tutorials/luong-giac-co-ban.jpg',
    videoUrl: '/videos/tutorials/luong-giac-co-ban.mp4',
    isCompleted: true,
    tags: ['Lượng giác', 'Sin Cos', 'Toán 11'],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    number: 4,
    title: 'Dãy số và Cấp số cộng',
    description: 'Tìm hiểu về dãy số, cấp số cộng và cấp số nhân. Công thức tổng quát và ứng dụng trong bài toán thực tế...',
    duration: '11:37',
    category: 'Toán 11',
    level: 'Trung cấp',
    instructor: 'Cô Phạm Thị Dãy',
    thumbnail: '/images/tutorials/day-so.jpg',
    videoUrl: '/videos/tutorials/day-so.mp4',
    isCompleted: false,
    tags: ['Dãy số', 'Cấp số', 'Toán 11'],
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    number: 5,
    title: 'Đạo hàm và Ứng dụng',
    description: 'Nắm vững khái niệm đạo hàm, quy tắc tính đạo hàm và ứng dụng trong khảo sát hàm số...',
    duration: '15:00',
    category: 'Toán 12',
    level: 'Nâng cao',
    instructor: 'Thầy Hoàng Văn Đạo',
    thumbnail: '/images/tutorials/dao-ham.jpg',
    videoUrl: '/videos/tutorials/dao-ham.mp4',
    isCompleted: false,
    tags: ['Đạo hàm', 'Giải tích', 'Toán 12'],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '6',
    number: 6,
    title: 'Tích phân và Diện tích',
    description: 'Học cách tính tích phân xác định và ứng dụng trong tính diện tích hình phẳng, thể tích khối tròn xoay...',
    duration: '5:34',
    category: 'Toán 12',
    level: 'Nâng cao',
    instructor: 'Cô Nguyễn Thị Tích',
    thumbnail: '/images/tutorials/tich-phan.jpg',
    videoUrl: '/videos/tutorials/tich-phan.mp4',
    isCompleted: false,
    tags: ['Tích phân', 'Diện tích', 'Toán 12'],
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z'
  },
  {
    id: '7',
    number: 7,
    title: 'Hình học không gian - Khối đa diện',
    description: 'Nắm vững các khái niệm về khối đa diện, thể tích và diện tích xung quanh của các hình cơ bản...',
    duration: '15:00',
    category: 'Toán 12',
    level: 'Nâng cao',
    instructor: 'Thầy Trần Văn Không',
    thumbnail: '/images/tutorials/hinh-hoc-khong-gian.jpg',
    videoUrl: '/videos/tutorials/hinh-hoc-khong-gian.mp4',
    isCompleted: false,
    tags: ['Hình học', 'Không gian', 'Toán 12'],
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-07T00:00:00Z'
  },
  {
    id: '8',
    number: 8,
    title: 'Xác suất và Thống kê',
    description: 'Học cách tính xác suất của các biến cố, phân phối xác suất và ứng dụng thống kê trong thực tế...',
    duration: '3:36',
    category: 'Toán 12',
    level: 'Trung cấp',
    instructor: 'Cô Lê Thị Suất',
    thumbnail: '/images/tutorials/xac-suat.jpg',
    videoUrl: '/videos/tutorials/xac-suat.mp4',
    isCompleted: false,
    tags: ['Xác suất', 'Thống kê', 'Toán 12'],
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z'
  },
  {
    id: '9',
    number: 9,
    title: 'Bất đẳng thức và Cực trị',
    description: 'Tìm hiểu các phương pháp chứng minh bất đẳng thức và tìm cực trị của hàm số...',
    duration: '6:11',
    category: 'Toán 11',
    level: 'Nâng cao',
    instructor: 'Thầy Vũ Văn Trị',
    thumbnail: '/images/tutorials/bat-dang-thuc.jpg',
    videoUrl: '/videos/tutorials/bat-dang-thuc.mp4',
    isCompleted: false,
    tags: ['Bất đẳng thức', 'Cực trị', 'Toán 11'],
    createdAt: '2024-01-09T00:00:00Z',
    updatedAt: '2024-01-09T00:00:00Z'
  }
];

// Helper functions
export function getTutorialById(id: string): MockTutorial | undefined {
  return mockTutorials.find(tutorial => tutorial.id === id);
}

export function getTutorialsByCategory(category: string): MockTutorial[] {
  return mockTutorials.filter(tutorial => tutorial.category === category);
}

export function getTutorialsByLevel(level: string): MockTutorial[] {
  return mockTutorials.filter(tutorial => tutorial.level === level);
}

export function getCompletedTutorials(): MockTutorial[] {
  return mockTutorials.filter(tutorial => tutorial.isCompleted);
}

export function getTutorialsByInstructor(instructor: string): MockTutorial[] {
  return mockTutorials.filter(tutorial => tutorial.instructor === instructor);
}

export function searchTutorials(query: string): MockTutorial[] {
  const lowercaseQuery = query.toLowerCase();
  return mockTutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(lowercaseQuery) ||
    tutorial.description.toLowerCase().includes(lowercaseQuery) ||
    tutorial.category.toLowerCase().includes(lowercaseQuery) ||
    tutorial.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getTutorialStats():  {
  total: number;
  completed: number;
  progress: number;
  categories: string[];
  levels: string[];
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
} {
  const total = mockTutorials.length;
  const completed = getCompletedTutorials().length;
  const categories = [...new Set(mockTutorials.map(tutorial => tutorial.category))];
  const levels = [...new Set(mockTutorials.map(tutorial => tutorial.level))];
  
  const byCategory: Record<string, number> = {};
  categories.forEach(category => {
    byCategory[category] = getTutorialsByCategory(category).length;
  });
  
  const byLevel: Record<string, number> = {};
  levels.forEach(level => {
    byLevel[level] = getTutorialsByLevel(level).length;
  });

  return {
    total,
    completed,
    progress: Math.round((completed / total) * 100),
    categories,
    levels,
    byCategory,
    byLevel
  };
}
