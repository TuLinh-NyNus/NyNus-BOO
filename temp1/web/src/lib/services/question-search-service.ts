import { MockQuestion } from '../mock-data/types';

// Note: Mock questions data removed - this service should be replaced with real API calls

/**
 * Service xử lý tìm kiếm câu hỏi nâng cao
 * Hỗ trợ 3 phương thức: từ khóa, mã số, questionID format
 */

// Interface cho kết quả tìm kiếm
export interface SearchResult {
  question: MockQuestion;
  matchScore: number; // 0-100, độ chính xác khớp
  matchType: 'exact' | 'partial' | 'fuzzy';
  matchedFields: string[]; // Các trường được khớp
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchTime: number; // milliseconds
  searchMethod: 'keyword' | 'Subcount' | 'QuestionID';
}

/**
 * 1. Tìm kiếm theo từ khóa với độ tương đồng ~90%
 */
export class KeywordSearchService {
  /**
   * Tính độ tương đồng giữa 2 chuỗi (Levenshtein distance)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;
    
    // Simple similarity check - contains
    if (s1.includes(s2) || s2.includes(s1)) {
      const longer = s1.length > s2.length ? s1 : s2;
      const shorter = s1.length > s2.length ? s2 : s1;
      return (shorter.length / longer.length) * 100;
    }
    
    // Levenshtein distance
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return ((maxLength - distance) / maxLength) * 100;
  }
  
  /**
   * Tìm kiếm theo từ khóa
   * TODO: Replace with real API call
   */
  static async searchByKeyword(
    keyword: string,
    minSimilarity: number = 90
  ): Promise<SearchResponse> {
    const startTime = Date.now();

    if (!keyword.trim()) {
      return {
        results: [],
        totalCount: 0,
        searchTime: Date.now() - startTime,
        searchMethod: 'keyword'
      };
    }

    // TODO: Implement real API call
    // const response = await fetch(`/api/questions/search?keyword=${encodeURIComponent(keyword)}&minSimilarity=${minSimilarity}`);
    // const data = await response.json();
    // return data;

    // Placeholder response - no mock data available
    return {
      results: [],
      totalCount: 0,
      searchTime: Date.now() - startTime,
      searchMethod: 'keyword'
    };
  }
}

/**
 * 2. Tìm kiếm theo mã số (Subcount)
 */
export class SubcountSearchService {
  /**
   * Tìm kiếm theo Subcount
   * TODO: Replace with real API call
   */
  static async searchBySubcount(Subcount: string): Promise<SearchResponse> {
    const startTime = Date.now();

    if (!Subcount.trim()) {
      return {
        results: [],
        totalCount: 0,
        searchTime: Date.now() - startTime,
        searchMethod: 'Subcount'
      };
    }

    // TODO: Implement real API call
    // const response = await fetch(`/api/questions/search?Subcount=${encodeURIComponent(Subcount)}`);
    // const data = await response.json();
    // return data;

    // Placeholder response - no mock data available
    return {
      results: [],
      totalCount: 0,
      searchTime: Date.now() - startTime,
      searchMethod: 'Subcount'
    };
  }
}

/**
 * 3. Tìm kiếm theo QuestionID format
 */
export class QuestionIDSearchService {
  /**
   * Parse QuestionID format: lớp môn chương mức độ bài dạng
   */
  private static parseQuestionIDFormat(format: string): {
    grade?: string;
    subject?: string;
    chapter?: string;
    level?: string;
    lesson?: string;
    form?: string;
  } {
    // Ví dụ format: "12T1N2-1" = Lớp 12, Toán, Chương 1, Nhận biết, Bài 2, Dạng 1
    const parts = format.trim().split('-');
    const mainPart = parts[0];
    const formPart = parts[1];
    
    if (mainPart.length < 4) return {};
    
    return {
      grade: mainPart[0] + (mainPart[1] && !isNaN(Number(mainPart[1])) ? mainPart[1] : ''),
      subject: mainPart[mainPart[0] + (mainPart[1] && !isNaN(Number(mainPart[1])) ? mainPart[1] : '') === mainPart.substring(0, 2) ? 2 : 1],
      chapter: mainPart[2] || mainPart[3],
      level: mainPart[3] || mainPart[4],
      lesson: mainPart[4] || mainPart[5],
      form: formPart
    };
  }
  
  /**
   * Tìm kiếm theo QuestionID format
   */
  static async searchByQuestionIDFormat(
    grade?: string,
    subject?: string, 
    chapter?: string,
    level?: string,
    lesson?: string,
    form?: string
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const results: SearchResult[] = [];
    
    // Kiểm tra có ít nhất 1 tham số
    if (!grade && !subject && !chapter && !level && !lesson && !form) {
      return {
        results: [],
        totalCount: 0,
        searchTime: Date.now() - startTime,
        searchMethod: 'QuestionID'
      };
    }

    // TODO: Implement real API call
    // const params = new URLSearchParams();
    // if (grade) params.append('grade', grade);
    // if (subject) params.append('subject', subject);
    // if (chapter) params.append('chapter', chapter);
    // if (level) params.append('level', level);
    // if (lesson) params.append('lesson', lesson);
    // if (form) params.append('form', form);
    //
    // const response = await fetch(`/api/questions/search?${params.toString()}`);
    // const data = await response.json();
    // return data;

    // Placeholder response - no mock data available
    return {
      results: [],
      totalCount: 0,
      searchTime: Date.now() - startTime,
      searchMethod: 'QuestionID'
    };
  }
}

/**
 * Main Search Service - tổng hợp tất cả phương thức
 */
export class QuestionSearchService {
  static async searchByKeyword(keyword: string, minSimilarity: number = 90): Promise<SearchResponse> {
    return KeywordSearchService.searchByKeyword(keyword, minSimilarity);
  }
  
  static async searchBySubcount(Subcount: string): Promise<SearchResponse> {
    return SubcountSearchService.searchBySubcount(Subcount);
  }
  
  static async searchByQuestionIDFormat(params: {
    grade?: string;
    subject?: string;
    chapter?: string;
    level?: string;
    lesson?: string;
    form?: string;
  }): Promise<SearchResponse> {
    return QuestionIDSearchService.searchByQuestionIDFormat(
      params.grade,
      params.subject,
      params.chapter,
      params.level,
      params.lesson,
      params.form
    );
  }
}
