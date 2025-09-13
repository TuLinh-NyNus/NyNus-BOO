/**
 * Taxonomy Constants
 * Bảng ánh xạ giữa Frontend và Backend cho taxonomy data
 * Subject codes, grades, levels, etc.
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

// ===== SUBJECT MAPPING =====

/**
 * Subject code mapping: FE display name → BE code
 * Backend sử dụng single character codes
 */
export const SUBJECT_CODE_MAP = {
  // Math and Science
  'Toán học': 'M',        // Math
  'Vật lý': 'P',          // Physics  
  'Hóa học': 'H',         // Chemistry
  'Sinh học': 'S',        // Science/Biology
  
  // Languages
  'Tiếng Anh': 'E',       // English
  
  // Other subjects (expand as needed)
  'Xác suất thống kê': 'D', // Probability (from proto comments)
} as const;

/**
 * Reverse mapping: BE code → FE display name
 */
export const SUBJECT_NAME_MAP = Object.fromEntries(
  Object.entries(SUBJECT_CODE_MAP).map(([name, code]) => [code, name])
) as Record<string, string>;

/**
 * Subject options cho UI select components
 */
export const SUBJECT_OPTIONS = Object.entries(SUBJECT_CODE_MAP).map(([name, code]) => ({
  value: code,
  label: name,
  displayName: name,
  code: code,
}));

// ===== GRADE MAPPING =====

/**
 * Grade mapping: FE display → BE code
 * Backend sử dụng numbers: 0,1,2 for grades 10,11,12
 */
export const GRADE_CODE_MAP = {
  'Lớp 10': '0',
  'Lớp 11': '1', 
  'Lớp 12': '2',
} as const;

/**
 * Reverse mapping: BE code → FE display name
 */
export const GRADE_NAME_MAP: Record<string, string> = {
  '0': 'Lớp 10',
  '1': 'Lớp 11',
  '2': 'Lớp 12',
};

/**
 * Grade options cho UI select components
 */
export const GRADE_OPTIONS = Object.entries(GRADE_CODE_MAP).map(([name, code]) => ({
  value: code,
  label: name,
  displayName: name,
  code: code,
  level: parseInt(code) + 10, // Grade level number
}));

// ===== LEVEL MAPPING =====

/**
 * Difficulty/Level mapping theo backend
 * N,H,V,C,T,M levels from proto
 */
export const LEVEL_CODE_MAP = {
  'Nhận biết': 'N',          // Recognition
  'Hiểu': 'H',               // Understanding  
  'Vận dụng': 'V',           // Application
  'Vận dụng cao': 'C',       // High Application
  'Vip': 'T',               // VIP (special)
  'Ghi chú': 'M',            // Note/Memo
} as const;

/**
 * Reverse mapping: BE code → FE display name
 */
export const LEVEL_NAME_MAP: Record<string, string> = {
  'N': 'Nhận biết',
  'H': 'Hiểu', 
  'V': 'Vận dụng',
  'C': 'Vận dụng cao',
  'T': 'Vip',
  'M': 'Ghi chú',
};

/**
 * Level options cho UI với difficulty ordering
 */
export const LEVEL_OPTIONS = [
  { value: 'N', label: 'Nhận biết', displayName: 'Nhận biết', order: 1 },
  { value: 'H', label: 'Hiểu', displayName: 'Hiểu', order: 2 },
  { value: 'V', label: 'Vận dụng', displayName: 'Vận dụng', order: 3 },
  { value: 'C', label: 'Vận dụng cao', displayName: 'Vận dụng cao', order: 4 },
  { value: 'T', label: 'Vip', displayName: 'Vip', order: 5 },
  { value: 'M', label: 'Ghi chú', displayName: 'Ghi chú', order: 6 },
];

// ===== QUESTION TYPE MAPPING =====

/**
 * Question type mapping (FE and BE use same codes)
 */
export const QUESTION_TYPE_MAP = {
  'MC': 'Trắc nghiệm',      // Multiple Choice
  'TF': 'Đúng/Sai',        // True/False
  'SA': 'Trả lời ngắn',    // Short Answer
  'ES': 'Tự luận',         // Essay
  'MA': 'Nối từ',          // Matching
} as const;

/**
 * Question type options
 */
export const QUESTION_TYPE_OPTIONS = Object.entries(QUESTION_TYPE_MAP).map(([code, name]) => ({
  value: code,
  label: name,
  displayName: name,
  code: code,
}));

// ===== DIFFICULTY MAPPING =====

/**
 * Difficulty levels (FE and BE use same values)
 */
export const DIFFICULTY_MAP = {
  'EASY': 'Dễ',
  'MEDIUM': 'Trung bình', 
  'HARD': 'Khó',
} as const;

/**
 * Difficulty options với color coding
 */
export const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Dễ', displayName: 'Dễ', color: 'green', order: 1 },
  { value: 'MEDIUM', label: 'Trung bình', displayName: 'Trung bình', color: 'yellow', order: 2 },
  { value: 'HARD', label: 'Khó', displayName: 'Khó', color: 'red', order: 3 },
];

// ===== UTILITY FUNCTIONS =====

/**
 * Convert FE subject names to BE codes
 */
export function subjectNameToCode(name: string): string | undefined {
  return SUBJECT_CODE_MAP[name as keyof typeof SUBJECT_CODE_MAP];
}

/**
 * Convert BE subject code to FE display name
 */
export function subjectCodeToName(code: string): string {
  return SUBJECT_NAME_MAP[code] || code;
}

/**
 * Convert FE grade name to BE code
 */
export function gradeNameToCode(name: string): string | undefined {
  return GRADE_CODE_MAP[name as keyof typeof GRADE_CODE_MAP];
}

/**
 * Convert BE grade code to FE display name
 */
export function gradeCodeToName(code: string): string {
  return GRADE_NAME_MAP[code] || `Lớp ${code}`;
}

/**
 * Convert FE level name to BE code
 */
export function levelNameToCode(name: string): string | undefined {
  return LEVEL_CODE_MAP[name as keyof typeof LEVEL_CODE_MAP];
}

/**
 * Convert BE level code to FE display name
 */
export function levelCodeToName(code: string): string {
  return LEVEL_NAME_MAP[code] || code;
}

/**
 * Get question type display name
 */
export function getQuestionTypeName(code: string): string {
  return QUESTION_TYPE_MAP[code as keyof typeof QUESTION_TYPE_MAP] || code;
}

/**
 * Get difficulty display name
 */
export function getDifficultyName(code: string): string {
  return DIFFICULTY_MAP[code as keyof typeof DIFFICULTY_MAP] || code;
}

/**
 * Validate subject code
 */
export function isValidSubjectCode(code: string): boolean {
  return Object.values(SUBJECT_CODE_MAP).includes(code as (typeof SUBJECT_CODE_MAP)[keyof typeof SUBJECT_CODE_MAP]);
}

/**
 * Validate grade code
 */
export function isValidGradeCode(code: string): boolean {
  return Object.values(GRADE_CODE_MAP).includes(code as (typeof GRADE_CODE_MAP)[keyof typeof GRADE_CODE_MAP]);
}

/**
 * Validate level code
 */
export function isValidLevelCode(code: string): boolean {
  return Object.values(LEVEL_CODE_MAP).includes(code as (typeof LEVEL_CODE_MAP)[keyof typeof LEVEL_CODE_MAP]);
}

// ===== COMBINED OPTIONS =====

/**
 * All taxonomy options combined for easy access
 */
export const TAXONOMY_OPTIONS = {
  subjects: SUBJECT_OPTIONS,
  grades: GRADE_OPTIONS,
  levels: LEVEL_OPTIONS,
  questionTypes: QUESTION_TYPE_OPTIONS,
  difficulties: DIFFICULTY_OPTIONS,
} as const;

// ===== SEARCH HELPERS =====

/**
 * Search trong options bằng text
 */
export function searchOptions<T extends { label: string; value: string }>(
  options: T[],
  searchText: string
): T[] {
  if (!searchText.trim()) return options;
  
  const query = searchText.toLowerCase();
  return options.filter(option => 
    option.label.toLowerCase().includes(query) ||
    option.value.toLowerCase().includes(query)
  );
}

/**
 * Get default category từ subject code
 * Dùng để map sang PublicQuestion.category
 */
export function getDefaultCategory(subjectCode?: string): string {
  if (!subjectCode) return 'Chưa phân loại';
  
  const subjectName = subjectCodeToName(subjectCode);
  
  // Map specific subjects to broader categories
  switch (subjectCode) {
    case 'M':
      return 'Toán học';
    case 'P':
      return 'Vật lý';
    case 'H': 
      return 'Hóa học';
    case 'S':
      return 'Sinh học';
    case 'E':
      return 'Ngoại ngữ';
    case 'D':
      return 'Toán học'; // Probability is part of Math
    default:
      return subjectName || 'Khác';
  }
}
