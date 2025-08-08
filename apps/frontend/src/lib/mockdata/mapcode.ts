/**
 * MapCode Mock Data
 * Mock data cho MapCode management system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

/**
 * Interface cho MapCode version
 */
export interface MapCodeVersion {
  id: string;
  version: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
  questionCount: number;
  fileSize: number;
  content?: string; // JSON content của MapCode
}

/**
 * Interface cho MapCode statistics
 */
export interface MapCodeStatistics {
  totalVersions: number;
  activeVersion: string;
  totalQuestions: number;
  lastUpdate: string;
}

/**
 * Mock MapCode versions
 */
export const mockMapCodeVersions: MapCodeVersion[] = [
  {
    id: 'mapcode-001',
    version: 'v2.1.0',
    name: 'MapCode 2024 Q3',
    description: 'Cập nhật mã câu hỏi cho quý 3 năm 2024 với hệ thống phân loại mới',
    isActive: true,
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-07-15T00:00:00Z',
    author: 'Admin System',
    questionCount: 1250,
    fileSize: 45600,
    content: JSON.stringify({
      version: '2.1.0',
      categories: {
        'math': {
          code: 'M',
          name: 'Toán học',
          subcategories: {
            'algebra': { code: 'A', name: 'Đại số' },
            'geometry': { code: 'G', name: 'Hình học' },
            'calculus': { code: 'C', name: 'Giải tích' }
          }
        },
        'physics': {
          code: 'P',
          name: 'Vật lý',
          subcategories: {
            'mechanics': { code: 'M', name: 'Cơ học' },
            'thermodynamics': { code: 'T', name: 'Nhiệt học' },
            'electromagnetism': { code: 'E', name: 'Điện từ học' }
          }
        }
      },
      difficulties: {
        'easy': { code: 'E', name: 'Dễ', points: 1 },
        'medium': { code: 'M', name: 'Trung bình', points: 2 },
        'hard': { code: 'H', name: 'Khó', points: 3 }
      },
      grades: {
        '10': { code: '0', name: 'Lớp 10' },
        '11': { code: '1', name: 'Lớp 11' },
        '12': { code: '2', name: 'Lớp 12' }
      }
    }, null, 2),
  },
  {
    id: 'mapcode-002',
    version: 'v2.0.5',
    name: 'MapCode 2024 Q2',
    description: 'Phiên bản ổn định cho quý 2 với các cải tiến về performance',
    isActive: false,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-06-30T00:00:00Z',
    author: 'Admin System',
    questionCount: 1180,
    fileSize: 42300,
    content: JSON.stringify({
      version: '2.0.5',
      categories: {
        'math': {
          code: 'M',
          name: 'Toán học',
          subcategories: {
            'algebra': { code: 'A', name: 'Đại số' },
            'geometry': { code: 'G', name: 'Hình học' }
          }
        },
        'physics': {
          code: 'P',
          name: 'Vật lý',
          subcategories: {
            'mechanics': { code: 'M', name: 'Cơ học' },
            'thermodynamics': { code: 'T', name: 'Nhiệt học' }
          }
        }
      },
      difficulties: {
        'easy': { code: 'E', name: 'Dễ', points: 1 },
        'medium': { code: 'M', name: 'Trung bình', points: 2 },
        'hard': { code: 'H', name: 'Khó', points: 3 }
      },
      grades: {
        '10': { code: '0', name: 'Lớp 10' },
        '11': { code: '1', name: 'Lớp 11' },
        '12': { code: '2', name: 'Lớp 12' }
      }
    }, null, 2),
  },
  {
    id: 'mapcode-003',
    version: 'v1.9.8',
    name: 'MapCode 2024 Q1',
    description: 'Phiên bản legacy với hỗ trợ backward compatibility',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-31T00:00:00Z',
    author: 'Admin System',
    questionCount: 980,
    fileSize: 38200,
    content: JSON.stringify({
      version: '1.9.8',
      categories: {
        'math': {
          code: 'M',
          name: 'Toán học',
          subcategories: {
            'algebra': { code: 'A', name: 'Đại số' }
          }
        },
        'physics': {
          code: 'P',
          name: 'Vật lý',
          subcategories: {
            'mechanics': { code: 'M', name: 'Cơ học' }
          }
        }
      },
      difficulties: {
        'easy': { code: 'E', name: 'Dễ', points: 1 },
        'medium': { code: 'M', name: 'Trung bình', points: 2 },
        'hard': { code: 'H', name: 'Khó', points: 3 }
      },
      grades: {
        '10': { code: '0', name: 'Lớp 10' },
        '11': { code: '1', name: 'Lớp 11' },
        '12': { code: '2', name: 'Lớp 12' }
      }
    }, null, 2),
  },
];

/**
 * Mock MapCode statistics
 */
export const mockMapCodeStatistics: MapCodeStatistics = {
  totalVersions: mockMapCodeVersions.length,
  activeVersion: mockMapCodeVersions.find(v => v.isActive)?.version || 'N/A',
  totalQuestions: mockMapCodeVersions.find(v => v.isActive)?.questionCount || 0,
  lastUpdate: mockMapCodeVersions.find(v => v.isActive)?.updatedAt || '',
};

/**
 * Function để lấy tất cả MapCode versions
 */
export function getMapCodeVersions(): Promise<{
  versions: MapCodeVersion[];
  activeVersion: MapCodeVersion | null;
  stats: MapCodeStatistics;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeVersion = mockMapCodeVersions.find(v => v.isActive) || null;
      resolve({
        versions: mockMapCodeVersions,
        activeVersion,
        stats: mockMapCodeStatistics,
      });
    }, 500);
  });
}

/**
 * Function để activate một MapCode version
 */
export function activateMapCodeVersion(versionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const version = mockMapCodeVersions.find(v => v.id === versionId);
      if (!version) {
        reject(new Error('Version not found'));
        return;
      }
      
      // Deactivate all versions
      mockMapCodeVersions.forEach(v => v.isActive = false);
      // Activate selected version
      version.isActive = true;
      
      resolve();
    }, 300);
  });
}

/**
 * Function để delete một MapCode version
 */
export function deleteMapCodeVersion(versionId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockMapCodeVersions.findIndex(v => v.id === versionId);
      if (index === -1) {
        reject(new Error('Version not found'));
        return;
      }
      
      const version = mockMapCodeVersions[index];
      if (version.isActive) {
        reject(new Error('Cannot delete active version'));
        return;
      }
      
      mockMapCodeVersions.splice(index, 1);
      resolve();
    }, 400);
  });
}

/**
 * Function để export một MapCode version
 */
export function exportMapCodeVersion(versionId: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const version = mockMapCodeVersions.find(v => v.id === versionId);
      if (!version) {
        reject(new Error('Version not found'));
        return;
      }
      
      const exportData = {
        version: version.version,
        name: version.name,
        description: version.description,
        content: version.content ? JSON.parse(version.content) : {},
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      resolve(blob);
    }, 600);
  });
}

/**
 * Function để save một MapCode version
 */
export function saveMapCodeVersion(versionData: Partial<MapCodeVersion>): Promise<MapCodeVersion> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newVersion: MapCodeVersion = {
        id: versionData.id || `mapcode-${Date.now()}`,
        version: versionData.version || 'v1.0.0',
        name: versionData.name || 'New MapCode Version',
        description: versionData.description || '',
        isActive: false,
        createdAt: versionData.id ? mockMapCodeVersions.find(v => v.id === versionData.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Admin System',
        questionCount: 0,
        fileSize: versionData.content ? new Blob([versionData.content]).size : 0,
        content: versionData.content || '',
      };
      
      if (versionData.id) {
        // Update existing version
        const index = mockMapCodeVersions.findIndex(v => v.id === versionData.id);
        if (index !== -1) {
          mockMapCodeVersions[index] = { ...mockMapCodeVersions[index], ...newVersion };
          resolve(mockMapCodeVersions[index]);
        } else {
          resolve(newVersion);
        }
      } else {
        // Create new version
        mockMapCodeVersions.unshift(newVersion);
        resolve(newVersion);
      }
    }, 700);
  });
}
