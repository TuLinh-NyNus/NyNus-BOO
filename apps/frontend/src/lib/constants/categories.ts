/**
 * Category Constants
 * Shared category definitions cho consistency across components
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

import { Calculator, Shapes, BarChart3, TrendingUp } from 'lucide-react';

// ===== TYPES =====

/**
 * Category Data Interface
 * Complete category information structure
 */
export interface CategoryData {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  emoji: string;
  keywords: string[];
}

/**
 * Category Filter Mapping
 * Mapping giữa category IDs và filter values
 */
export interface CategoryMapping {
  [key: string]: string;
}

// ===== CONSTANTS =====

/**
 * Category Filter Mapping
 * Consistent mapping cho store integration
 */
export const CATEGORY_MAPPING: CategoryMapping = {
  'algebra': 'Đại số',
  'geometry': 'Hình học',
  'calculus': 'Giải tích',
  'probability': 'Xác suất'
};

/**
 * Question Categories Data
 * Complete category definitions với enhanced information
 */
export const QUESTION_CATEGORIES: CategoryData[] = [
  {
    id: 'algebra',
    title: 'Đại số',
    description: 'Phương trình, bất phương trình, hàm số',
    questionCount: 2456,
    icon: Calculator,
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    emoji: '🔢',
    keywords: ['phương trình', 'hàm số', 'bất phương trình', 'logarit', 'mũ']
  },
  {
    id: 'geometry',
    title: 'Hình học',
    description: 'Hình học phẳng, không gian, tọa độ',
    questionCount: 1834,
    icon: Shapes,
    color: 'bg-green-500',
    gradient: 'from-green-400 to-green-600',
    emoji: '📐',
    keywords: ['tam giác', 'đường tròn', 'hình học không gian', 'tọa độ', 'vector']
  },
  {
    id: 'calculus',
    title: 'Giải tích',
    description: 'Đạo hàm, tích phân, giới hạn',
    questionCount: 1567,
    icon: BarChart3,
    color: 'bg-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    emoji: '📊',
    keywords: ['đạo hàm', 'tích phân', 'giới hạn', 'cực trị', 'khảo sát hàm số']
  },
  {
    id: 'probability',
    title: 'Xác suất',
    description: 'Xác suất, thống kê, tổ hợp',
    questionCount: 892,
    icon: TrendingUp,
    color: 'bg-orange-500',
    gradient: 'from-orange-400 to-orange-600',
    emoji: '🎲',
    keywords: ['xác suất', 'thống kê', 'tổ hợp', 'chỉnh hợp', 'biến cố']
  }
];

// ===== UTILITY FUNCTIONS =====

/**
 * Get category by ID
 * Retrieve category data by ID
 */
export function getCategoryById(id: string): CategoryData | undefined {
  return QUESTION_CATEGORIES.find(category => category.id === id);
}

/**
 * Get category filter value
 * Get filter value cho store integration
 */
export function getCategoryFilterValue(id: string): string | undefined {
  return CATEGORY_MAPPING[id];
}

/**
 * Get all category IDs
 * Get array of all category IDs
 */
export function getAllCategoryIds(): string[] {
  return QUESTION_CATEGORIES.map(category => category.id);
}

/**
 * Get categories by keyword
 * Search categories by keywords
 */
export function getCategoriesByKeyword(keyword: string): CategoryData[] {
  const lowerKeyword = keyword.toLowerCase();
  return QUESTION_CATEGORIES.filter(category =>
    category.keywords.some(k => k.includes(lowerKeyword)) ||
    category.title.toLowerCase().includes(lowerKeyword) ||
    category.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get total question count
 * Calculate total questions across all categories
 */
export function getTotalQuestionCount(): number {
  return QUESTION_CATEGORIES.reduce((total, category) => total + category.questionCount, 0);
}

// ===== EXPORTS =====

export default QUESTION_CATEGORIES;
