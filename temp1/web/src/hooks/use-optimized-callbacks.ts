import { useCallback, useMemo } from 'react';

import { MapIDResult } from '@/lib/types/latex-parser';

// Define proper types for QuestionID
interface QuestionIDData {
  grade?: { value: string };
  subject?: { value: string };
  chapter?: { value: string };
  level?: { value: string };
  lesson?: { value: string };
  form?: { value: string };
}

/**
 * Custom hook for optimized MapID operations
 */
export const useOptimizedMapID = (): {
  generateMapID: (questionID: QuestionIDData) => string | null;
  validateMapID: (mapID: string) => { isValid: boolean; error?: string };
} => {
  const generateMapID = useCallback((questionID: QuestionIDData) => {
    if (!questionID?.grade?.value || !questionID?.subject?.value ||
        !questionID?.chapter?.value || !questionID?.level?.value ||
        !questionID?.lesson?.value) {
      return null;
    }

    let id = `[${questionID.grade.value}${questionID.subject.value}${questionID.chapter.value}${questionID.level.value}${questionID.lesson.value}`;

    if (questionID.form?.value) {
      id += `-${questionID.form.value}]`;
    } else {
      id += ']';
    }

    return id;
  }, []);

  const validateMapID = useCallback((mapID: string) => {
    if (!mapID) return { isValid: false, error: 'MapID không được để trống' };
    if (!mapID.startsWith('[') || !mapID.endsWith(']')) {
      return { isValid: false, error: 'MapID phải được bao quanh bởi dấu ngoặc vuông []' };
    }
    return { isValid: true };
  }, []);

  return { generateMapID, validateMapID };
};

/**
 * Custom hook for optimized LaTeX operations
 */
export const useOptimizedLatex = (): {
  processLatexContent: (content: string) => string;
  validateLatexSyntax: (content: string) => { isValid: boolean; error?: string };
} => {
  const processLatexContent = useCallback((content: string): string => {
    if (!content) return '';

    // Basic LaTeX processing
    return content
      .replace(/\\textbf\{([^{}]*)\}/g, '<strong>$1</strong>')
      .replace(/\\textit\{([^{}]*)\}/g, '<em>$1</em>')
      .replace(/\\underline\{([^{}]*)\}/g, '<u>$1</u>')
      .replace(/\\newline/g, '<br/>')
      .replace(/\\\\/g, '<br/>');
  }, []);

  const validateLatexSyntax = useCallback((content: string): { isValid: boolean; error?: string } => {
    if (!content) return { isValid: true };

    // Check for balanced braces
    let braceCount = 0;
    for (const char of content) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (braceCount < 0) return { isValid: false, error: 'Dấu ngoặc nhọn không cân bằng' };
    }

    if (braceCount !== 0) {
      return { isValid: false, error: 'Dấu ngoặc nhọn không cân bằng' };
    }

    return { isValid: true };
  }, []);

  return { processLatexContent, validateLatexSyntax };
};

/**
 * Custom hook for optimized file operations
 */
export const useOptimizedFileOps = (): {
  validateFileType: (file: File, allowedTypes: string[]) => { isValid: boolean; error?: string };
  validateFileSize: (file: File, maxSizeMB: number) => { isValid: boolean; error?: string };
  processFileUpload: (file: File) => Promise<{ success: boolean; fileUrl?: string; fileName?: string; fileSize?: number; error?: string }>;
} => {
  const validateFileType = useCallback((file: File, allowedTypes: string[]): { isValid: boolean; error?: string } => {
    if (!file) return { isValid: false, error: 'Không có file được chọn' };
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Chỉ chấp nhận các file: ${allowedTypes.join(', ')}` 
      };
    }
    
    return { isValid: true };
  }, []);

  const validateFileSize = useCallback((file: File, maxSizeMB: number) => {
    if (!file) return { isValid: false, error: 'Không có file được chọn' };
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return { 
        isValid: false, 
        error: `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB` 
      };
    }
    
    return { isValid: true };
  }, []);

  const processFileUpload = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // This would typically call an API endpoint
      // For now, just return a mock response
      return {
        success: true,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }, []);

  return { validateFileType, validateFileSize, processFileUpload };
};

/**
 * Custom hook for optimized form validation
 */
export const useOptimizedFormValidation = (): {
  validateEmail: (email: string) => { isValid: boolean; error?: string };
  validatePassword: (password: string) => { isValid: boolean; error?: string };
  validateRequired: (value: unknown, fieldName: string) => { isValid: boolean; error?: string };
} => {
  const validateEmail = useCallback((email: string) => {
    if (!email) return { isValid: false, error: 'Email không được để trống' };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email không hợp lệ' };
    }
    
    return { isValid: true };
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!password) return { isValid: false, error: 'Mật khẩu không được để trống' };
    
    if (password.length < 8) {
      return { isValid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { 
        isValid: false, 
        error: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số' 
      };
    }
    
    return { isValid: true };
  }, []);

  const validateRequired = useCallback((value: unknown, fieldName: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: `${fieldName} không được để trống` };
    }
    return { isValid: true };
  }, []);

  return { validateEmail, validatePassword, validateRequired };
};

/**
 * Custom hook for optimized search operations
 */
// Define generic type for searchable items
interface SearchableItem {
  [key: string]: unknown;
}

export const useOptimizedSearch = (): {
  normalizeSearchTerm: (term: string) => string;
  highlightSearchTerm: (text: string, searchTerm: string) => string;
  filterItems: <T extends SearchableItem>(items: T[], searchTerm: string, searchFields: string[]) => T[];
} => {
  const normalizeSearchTerm = useCallback((term: string) => {
    return term
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove Vietnamese diacritics
  }, []);

  const highlightSearchTerm = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const normalizedText = normalizeSearchTerm(text);
    const normalizedTerm = normalizeSearchTerm(searchTerm);
    
    if (!normalizedText.includes(normalizedTerm)) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }, [normalizeSearchTerm]);

  const filterItems = useCallback(<T extends SearchableItem>(items: T[], searchTerm: string, searchFields: string[]): T[] => {
    if (!searchTerm) return items;
    
    const normalizedTerm = normalizeSearchTerm(searchTerm);
    
    return items.filter(item => 
      searchFields.some(field => {
        const fieldValue = item[field];
        if (!fieldValue) return false;
        
        const normalizedValue = normalizeSearchTerm(String(fieldValue));
        return normalizedValue.includes(normalizedTerm);
      })
    );
  }, [normalizeSearchTerm]);

  return { normalizeSearchTerm, highlightSearchTerm, filterItems };
};

/**
 * Custom hook for optimized data formatting
 */
export const useOptimizedFormatting = (): {
  formatDate: (date: Date | string, format?: 'short' | 'long' | 'time') => string;
  formatFileSize: (bytes: number) => string;
  formatNumber: (num: number, locale?: string) => string;
} => {
  const formatDate = useCallback((date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'time') {
      return dateObj.toLocaleTimeString('vi-VN');
    }
    
    const Options: Intl.DateTimeFormatOptions = format === 'long' 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: '2-digit', day: '2-digit' };
    
    return dateObj.toLocaleDateString('vi-VN', options);
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatNumber = useCallback((num: number, locale: string = 'vi-VN'): string => {
    return new Intl.NumberFormat(locale).format(num);
  }, []);

  return { formatDate, formatFileSize, formatNumber };
};
