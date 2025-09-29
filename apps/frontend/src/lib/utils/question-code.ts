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
 * Theo database schema và IMPLEMENT_QUESTION.md
 */
export const MAPCODE_CONFIG = {
  // Grade mapping (Position 1)
  grades: {
    '0': 'Lớp 10',
    '1': 'Lớp 11', 
    '2': 'Lớp 12',
    'A': 'Đại học',
    'B': 'Cao đẳng',
    'C': 'Trung cấp'
  },
  
  // Subject mapping (Position 2)
  subjects: {
    'P': 'Toán học',
    'L': 'Vật lý', 
    'H': 'Hóa học',
    'S': 'Sinh học',
    'V': 'Văn học',
    'A': 'Tiếng Anh',
    'U': 'Lịch sử',
    'D': 'Địa lý',
    'G': 'GDCD'
  },
  
  // Chapter mapping (Position 3)
  chapters: {
    '1': 'Chương 1',
    '2': 'Chương 2',
    '3': 'Chương 3',
    '4': 'Chương 4',
    '5': 'Chương 5',
    '6': 'Chương 6',
    '7': 'Chương 7',
    '8': 'Chương 8',
    '9': 'Chương 9'
  },
  
  // Level mapping (Position 4) - theo IMPLEMENT_QUESTION.md
  levels: {
    'N': 'Nhận biết',
    'H': 'Thông hiểu',
    'V': 'Vận dụng',
    'C': 'Vận dụng cao',
    'T': 'VIP',
    'M': 'Note'
  },
  
  // Lesson mapping (Position 5)
  lessons: {
    '1': 'Bài 1', '2': 'Bài 2', '3': 'Bài 3', '4': 'Bài 4', '5': 'Bài 5',
    '6': 'Bài 6', '7': 'Bài 7', '8': 'Bài 8', '9': 'Bài 9',
    'A': 'Bài A', 'B': 'Bài B', 'C': 'Bài C', 'D': 'Bài D', 'E': 'Bài E',
    'F': 'Bài F', 'G': 'Bài G', 'H': 'Bài H', 'I': 'Bài I', 'J': 'Bài J',
    'K': 'Bài K', 'L': 'Bài L', 'M': 'Bài M', 'N': 'Bài N', 'O': 'Bài O',
    'P': 'Bài P', 'Q': 'Bài Q', 'R': 'Bài R', 'S': 'Bài S', 'T': 'Bài T',
    'U': 'Bài U', 'V': 'Bài V', 'W': 'Bài W', 'X': 'Bài X', 'Y': 'Bài Y', 'Z': 'Bài Z'
  },
  
  // Form mapping (Position 6, chỉ ID6)
  forms: {
    '1': 'Dạng 1', '2': 'Dạng 2', '3': 'Dạng 3', '4': 'Dạng 4', '5': 'Dạng 5',
    '6': 'Dạng 6', '7': 'Dạng 7', '8': 'Dạng 8', '9': 'Dạng 9'
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
