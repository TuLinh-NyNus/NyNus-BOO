/**
 * Question Code Utilities
 * Utilities cho parsing và working với QuestionCode system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { QuestionCode } from '@/types/question';

// Type alias for backward compatibility
type ParsedQuestionCode = QuestionCode;

// ===== MAPCODE CONFIGURATION =====

/**
 * Shared MapCode configuration system-wide
 * Extracted from MapCode.md (4,666 lines) imported into database
 * 
 * NOTE: This is a FLAT mapping for convenience.
 * MapCode.md has hierarchical structure (Lớp > Môn > Chương > Bài > Dạng)
 * where chapter/lesson names vary by parent context.
 * 
 * This config uses first-occurrence names from MapCode.md, providing
 * meaningful labels instead of generic placeholders while accepting
 * that some names may not be perfectly context-specific.
 * 
 * @see tools/parsing-question/src/parser/MapCode.md (source)
 * @see docs/resources/latex/mapcode/v2025-10-27/MapCode-2025-10-27.md (imported version)
 * @updated 2025-10-27 - Extracted actual names from MapCode.md
 */
export const MAPCODE_CONFIG = {
  // Grade mapping (Position 1) - Complete from MapCode.md
  grades: {
    '0': 'Lớp 10',
    '1': 'Lớp 11', 
    '2': 'Lớp 12',
    '6': 'Lớp 6',
    '7': 'Lớp 7',
    '8': 'Lớp 8',
    '9': 'Lớp 9',
    'A': 'Đại học',
    'B': 'Cao đẳng',
    'C': 'Trung cấp'
  },
  
  // Subject mapping (Position 2) - From MapCode.md
  // Only subjects that exist in MapCode.md
  subjects: {
    'P': 'NGÂN HÀNG CHÍNH',
    'D': 'Đại số và giải tích',
    'H': 'Hình học và đo lường',
    'C': 'Chuyên đề',
    'G': 'HỌC SINH GIỎI',
    'T': 'CÂU HỎI TƯ DUY'
  },
  
  // Chapter mapping (Position 3) - From MapCode.md
  // Names are contextual (vary by grade+subject), showing first occurrence
  chapters: {
    '0': 'Xác suất',
    '1': 'Mệnh đề và tập hợp',
    '2': 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
    '3': 'Hàm số bậc hai và đồ thị',
    '4': 'Hệ thức lượng trong tam giác',
    '5': 'Véc tơ (chưa xét tọa độ)',
    '6': 'Thống kê',
    '7': 'Bất phương trình bậc 2 một ẩn',
    '8': 'Đại số tổ hợp',
    '9': 'Véc tơ (trong hệ tọa độ)'
  },
  
  // Level mapping (Position 4) - Fixed from MapCode.md
  levels: {
    'N': 'Nhận biết',
    'H': 'Thông Hiểu',
    'V': 'VD',
    'C': 'VD Cao',
    'T': 'VIP',
    'M': 'Note'
  },
  
  // Lesson mapping (Position 5) - From MapCode.md
  // Names are contextual (vary by grade+subject+chapter), showing first occurrence
  lessons: {
    '0': 'Chưa phân dạng',
    '1': 'Mệnh đề',
    '2': 'Tập hợp',
    '3': 'Các phép toán tập hợp',
    '4': 'Tích vô hướng (chưa xét tọa độ)',
    '5': 'Elip và các vấn đề liên quan',
    '6': 'Hypebol và các vấn đề liên quan',
    '7': 'Parabol và các vấn đề liên quan',
    '8': 'Sự thống nhất giữa ba đường Conic',
    '9': 'Tập hợp, ánh xạ (không giới hạn)',
    'A': 'Số nguyên tố - Hợp số',
    'B': 'Ước chung - Ước chung lớn nhất',
    'C': 'Bội chung - Bội chung nhỏ nhất'
  },
  
  // Form mapping (Position 6, chỉ ID6) - From MapCode.md
  // Names are contextual, showing first occurrence
  forms: {
    '0': 'Câu hỏi tổng hợp',
    '1': 'Xác định mệnh đề, mệnh đề chứa biến',
    '2': 'Tính đúng-sai của mệnh đề',
    '3': 'Phủ định của một mệnh đề',
    '4': 'Mệnh đề kéo theo, đảo, tương đương',
    '5': 'Mệnh đề với mọi, tồn tại',
    '6': 'Áp dụng mệnh đề vào suy luận có lí',
    '7': 'Các phép toán với tham số',
    '8': 'Sử dụng các tính chất của đồ thị',
    '9': 'Toán thực tế',
    'A': 'Chưa phân dạng',
    'B': 'Hàm số chứa dấu giá trị tuyệt đối',
    'C': 'Các phép biến đổi đồ thị',
    'D': 'Bài toán có chứa tham số m',
    'E': 'Giới hạn dãy số có chứa tham số',
    'F': 'Giá trị lớn nhất, nhỏ nhất hàm đạo hàm',
    'G': 'GTLN/GTNN qua bảng biến thiên',
    'H': 'Dạng H', 'I': 'Dạng I', 'J': 'Dạng J',
    'K': 'Dạng K', 'L': 'Dạng L', 'M': 'Dạng M',
    'N': 'Dạng N', 'O': 'Dạng O', 'P': 'Dạng P',
    'Q': 'Dạng Q', 'R': 'Dạng R', 'S': 'Dạng S',
    'T': 'Dạng T', 'U': 'Dạng U', 'V': 'Dạng V',
    'W': 'Dạng W', 'X': 'Dạng X', 'Y': 'Dạng Y', 'Z': 'Dạng Z'
  }
} as const;

// ===== PARSING FUNCTIONS =====

/**
 * Parse QuestionCode từ string format
 * 
 * Format:
 * - ID5: [Grade][Subject][Chapter][Level][Lesson] - VD: "0P1N1"
 * - ID6: [Grade][Subject][Chapter][Level][Lesson]-[Form] - VD: "0P1N1-2"
 * 
 * @param code - QuestionCode string
 * @returns ParsedQuestionCode object
 */
export function parseQuestionCode(code: string): ParsedQuestionCode {
  if (!code || typeof code !== 'string') {
    return {
      code: '',
      format: 'ID5',
      grade: '',
      subject: '',
      chapter: '',
      level: '',
      lesson: '',
      isValid: false,
      error: 'Code không hợp lệ hoặc rỗng'
    };
  }

  // Trim và remove brackets nếu có
  const cleanCode = code.trim().replace(/[\[\]]/g, '');
  
  // Determine format based on presence of dash
  const isID6 = cleanCode.includes('-');
  const format: 'ID5' | 'ID6' = isID6 ? 'ID6' : 'ID5';
  
  let mainPart: string;
  let form: string | undefined;
  
  if (isID6) {
    const parts = cleanCode.split('-');
    if (parts.length !== 2) {
      return {
        code: cleanCode,
        format,
        grade: '',
        subject: '',
        chapter: '',
        level: '',
        lesson: '',
        isValid: false,
        error: 'Format ID6 không hợp lệ - phải có dạng XXXXX-X'
      };
    }
    mainPart = parts[0];
    form = parts[1];
  } else {
    mainPart = cleanCode;
  }
  
  // Validate main part length
  if (mainPart.length !== 5) {
    return {
      code: cleanCode,
      format,
      grade: '',
      subject: '',
      chapter: '',
      level: '',
      lesson: '',
      isValid: false,
      error: `Main part phải có 5 ký tự, nhận được ${mainPart.length}`
    };
  }
  
  // Parse positions theo database schema
  const grade = mainPart[0];      // Position 1
  const subject = mainPart[1];    // Position 2
  const chapter = mainPart[2];    // Position 3
  const level = mainPart[3];      // Position 4
  const lesson = mainPart[4];     // Position 5
  
  // Validate each component
  const errors: string[] = [];
  
  if (!MAPCODE_CONFIG.grades[grade as keyof typeof MAPCODE_CONFIG.grades]) {
    errors.push(`Grade '${grade}' không hợp lệ`);
  }
  
  if (!MAPCODE_CONFIG.subjects[subject as keyof typeof MAPCODE_CONFIG.subjects]) {
    errors.push(`Subject '${subject}' không hợp lệ`);
  }
  
  if (!MAPCODE_CONFIG.chapters[chapter as keyof typeof MAPCODE_CONFIG.chapters]) {
    errors.push(`Chapter '${chapter}' không hợp lệ`);
  }
  
  if (!MAPCODE_CONFIG.levels[level as keyof typeof MAPCODE_CONFIG.levels]) {
    errors.push(`Level '${level}' không hợp lệ`);
  }
  
  if (!MAPCODE_CONFIG.lessons[lesson as keyof typeof MAPCODE_CONFIG.lessons]) {
    errors.push(`Lesson '${lesson}' không hợp lệ`);
  }
  
  if (form && !MAPCODE_CONFIG.forms[form as keyof typeof MAPCODE_CONFIG.forms]) {
    errors.push(`Form '${form}' không hợp lệ`);
  }
  
  const isValid = errors.length === 0;
  
  return {
    code: cleanCode,
    format,
    grade,
    subject,
    chapter,
    level,
    lesson,
    form,
    isValid,
    error: errors.length > 0 ? errors.join(', ') : undefined
  };
}

/**
 * Get human-readable label cho QuestionCode component
 */
export function getQuestionCodeLabel(code: string): string {
  const parsed = parseQuestionCode(code);
  
  if (!parsed.isValid) {
    return code; // Return original nếu không parse được
  }
  
  const gradeLabel = MAPCODE_CONFIG.grades[parsed.grade as keyof typeof MAPCODE_CONFIG.grades] || parsed.grade;
  const subjectLabel = MAPCODE_CONFIG.subjects[parsed.subject as keyof typeof MAPCODE_CONFIG.subjects] || parsed.subject;
  const chapterLabel = MAPCODE_CONFIG.chapters[parsed.chapter as keyof typeof MAPCODE_CONFIG.chapters] || parsed.chapter;
  const levelLabel = MAPCODE_CONFIG.levels[parsed.level as keyof typeof MAPCODE_CONFIG.levels] || parsed.level;
  const lessonLabel = MAPCODE_CONFIG.lessons[parsed.lesson as keyof typeof MAPCODE_CONFIG.lessons] || parsed.lesson;
  
  let label = `${gradeLabel} - ${subjectLabel} - ${chapterLabel} - ${levelLabel} - ${lessonLabel}`;
  
  if (parsed.form) {
    const formLabel = MAPCODE_CONFIG.forms[parsed.form as keyof typeof MAPCODE_CONFIG.forms] || parsed.form;
    label += ` - ${formLabel}`;
  }
  
  return label;
}

/**
 * Get filter options cho each QuestionCode component
 */
export function getFilterOptions() {
  return {
    grades: Object.entries(MAPCODE_CONFIG.grades).map(([value, label]) => ({ value, label })),
    subjects: Object.entries(MAPCODE_CONFIG.subjects).map(([value, label]) => ({ value, label })),
    chapters: Object.entries(MAPCODE_CONFIG.chapters).map(([value, label]) => ({ value, label })),
    levels: Object.entries(MAPCODE_CONFIG.levels).map(([value, label]) => ({ value, label })),
    lessons: Object.entries(MAPCODE_CONFIG.lessons).map(([value, label]) => ({ value, label })),
    forms: Object.entries(MAPCODE_CONFIG.forms).map(([value, label]) => ({ value, label })),
    formats: [
      { value: 'ID5', label: 'ID5 Format' },
      { value: 'ID6', label: 'ID6 Format' }
    ]
  };
}

/**
 * Validate QuestionCode format
 */
export function isValidQuestionCode(code: string): boolean {
  return parseQuestionCode(code).isValid ?? false;
}

/**
 * Generate QuestionCode từ components
 */
export function generateQuestionCode(components: {
  grade: string;
  subject: string;
  chapter: string;
  level: string;
  lesson: string;
  form?: string;
}): string {
  const { grade, subject, chapter, level, lesson, form } = components;
  const mainPart = `${grade}${subject}${chapter}${level}${lesson}`;

  if (form) {
    return `${mainPart}-${form}`;
  }

  return mainPart;
}

// ===== ENHANCED TRANSLATION SERVICE =====

/**
 * MapCode Translation Service
 * Centralized service cho translating MapCode components
 */
export class MapCodeTranslationService {
  /**
   * Get full translation cho QuestionCode
   */
  static getFullTranslation(code: string): {
    code: string;
    translation: string;
    components: {
      grade: { value: string; label: string; position: number };
      subject: { value: string; label: string; position: number };
      chapter: { value: string; label: string; position: number };
      level: { value: string; label: string; position: number };
      lesson: { value: string; label: string; position: number };
      form?: { value: string; label: string; position: number };
    };
    format: 'ID5' | 'ID6';
    isValid: boolean;
    error?: string;
  } {
    const parsed = parseQuestionCode(code);

    if (!parsed.isValid) {
      return {
        code,
        translation: code,
        components: {
          grade: { value: '', label: '', position: 1 },
          subject: { value: '', label: '', position: 2 },
          chapter: { value: '', label: '', position: 3 },
          level: { value: '', label: '', position: 4 },
          lesson: { value: '', label: '', position: 5 },
        },
        format: 'ID5',
        isValid: false,
        error: parsed.error,
      };
    }

    const components = {
      grade: {
        value: parsed.grade,
        label: MAPCODE_CONFIG.grades[parsed.grade as keyof typeof MAPCODE_CONFIG.grades] || parsed.grade,
        position: 1,
      },
      subject: {
        value: parsed.subject,
        label: MAPCODE_CONFIG.subjects[parsed.subject as keyof typeof MAPCODE_CONFIG.subjects] || parsed.subject,
        position: 2,
      },
      chapter: {
        value: parsed.chapter,
        label: MAPCODE_CONFIG.chapters[parsed.chapter as keyof typeof MAPCODE_CONFIG.chapters] || parsed.chapter,
        position: 3,
      },
      level: {
        value: parsed.level,
        label: MAPCODE_CONFIG.levels[parsed.level as keyof typeof MAPCODE_CONFIG.levels] || parsed.level,
        position: 4,
      },
      lesson: {
        value: parsed.lesson,
        label: MAPCODE_CONFIG.lessons[parsed.lesson as keyof typeof MAPCODE_CONFIG.lessons] || parsed.lesson,
        position: 5,
      },
    };

    // Add form for ID6
    if (parsed.form && parsed.format === 'ID6') {
      (components as Record<string, unknown>).form = {
        value: parsed.form,
        label: MAPCODE_CONFIG.forms[parsed.form as keyof typeof MAPCODE_CONFIG.forms] || parsed.form,
        position: 6,
      };
    }

    const translation = getQuestionCodeLabel(code);

    return {
      code,
      translation,
      components,
      format: parsed.format,
      isValid: true,
    };
  }

  /**
   * Get component translation
   */
  static getComponentTranslation(
    type: keyof typeof MAPCODE_CONFIG,
    value: string
  ): { value: string; label: string; isValid: boolean } {
    const config = MAPCODE_CONFIG[type] as Record<string, string>;
    const label = config[value];

    return {
      value,
      label: label || `Không xác định (${value})`,
      isValid: !!label,
    };
  }

  /**
   * Get all available options cho component type
   */
  static getComponentOptions(type: keyof typeof MAPCODE_CONFIG): Array<{ value: string; label: string }> {
    const config = MAPCODE_CONFIG[type] as Record<string, string>;
    return Object.entries(config).map(([value, label]) => ({ value, label }));
  }

  /**
   * Validate component value
   */
  static validateComponent(type: keyof typeof MAPCODE_CONFIG, value: string): boolean {
    const config = MAPCODE_CONFIG[type] as Record<string, string>;
    return value in config;
  }

  /**
   * Get position info cho component
   */
  static getPositionInfo(type: keyof typeof MAPCODE_CONFIG): {
    position: number;
    description: string;
    required: boolean;
  } {
    const positionMap = {
      grades: { position: 1, description: 'Lớp học', required: true },
      subjects: { position: 2, description: 'Môn học', required: true },
      chapters: { position: 3, description: 'Chương', required: true },
      levels: { position: 4, description: 'Mức độ', required: true },
      lessons: { position: 5, description: 'Bài học', required: true },
      forms: { position: 6, description: 'Dạng bài (chỉ ID6)', required: false },
    };

    return positionMap[type] || { position: 0, description: 'Không xác định', required: false };
  }
}
