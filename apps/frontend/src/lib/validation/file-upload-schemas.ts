/**
 * File Upload Validation Schemas
 * Comprehensive validation cho file uploads với security checks
 * Support cho .tex, .txt, .csv files với size limits và malicious file detection
 */

import { z } from "zod";

// ===== CONSTANTS =====

/**
 * Allowed file types và MIME types
 */
export const ALLOWED_FILE_TYPES = {
  TEX: {
    extensions: ['.tex', '.latex'] as readonly string[],
    mimeTypes: ['text/x-tex', 'application/x-tex', 'text/plain'] as readonly string[],
    description: 'LaTeX files'
  },
  TEXT: {
    extensions: ['.txt'] as readonly string[],
    mimeTypes: ['text/plain'] as readonly string[],
    description: 'Text files'
  },
  CSV: {
    extensions: ['.csv'] as readonly string[],
    mimeTypes: ['text/csv', 'application/csv'] as readonly string[],
    description: 'CSV files'
  },
  JSON: {
    extensions: ['.json'] as readonly string[],
    mimeTypes: ['application/json'] as readonly string[],
    description: 'JSON files'
  }
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB for multiple files
  MIN_FILE_SIZE: 1, // 1 byte minimum
} as const;

/**
 * Security patterns - Dangerous content detection
 */
export const SECURITY_PATTERNS = {
  // Script injection patterns
  SCRIPT_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
  ],
  
  // Executable file signatures
  EXECUTABLE_SIGNATURES: [
    'MZ', // Windows PE
    '\x7fELF', // Linux ELF
    '\xca\xfe\xba\xbe', // Java class
    'PK', // ZIP/JAR
  ],
  
  // Dangerous LaTeX commands (extend from latex-sanitizer)
  DANGEROUS_LATEX: [
    '\\input',
    '\\include',
    '\\write18',
    '\\immediate',
    '\\openin',
    '\\openout',
    '\\system',
    '\\pdfshellescape',
  ],
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Check if file type is allowed
 */
function isAllowedFileType(filename: string, mimeType?: string): boolean {
  const extension = getFileExtension(filename);
  
  for (const fileType of Object.values(ALLOWED_FILE_TYPES)) {
    if (fileType.extensions.includes(extension)) {
      // If MIME type provided, verify it matches
      if (mimeType && !fileType.mimeTypes.includes(mimeType)) {
        return false;
      }
      return true;
    }
  }
  
  return false;
}

/**
 * Check for malicious content in file
 */
function containsMaliciousContent(content: string, filename: string): string[] {
  const issues: string[] = [];
  const extension = getFileExtension(filename);
  
  // Check for script injection
  for (const pattern of SECURITY_PATTERNS.SCRIPT_PATTERNS) {
    if (pattern.test(content)) {
      issues.push('File chứa mã script nguy hiểm');
      break;
    }
  }
  
  // Check for executable signatures
  for (const signature of SECURITY_PATTERNS.EXECUTABLE_SIGNATURES) {
    if (content.startsWith(signature)) {
      issues.push('File có thể là file thực thi nguy hiểm');
      break;
    }
  }
  
  // LaTeX specific checks
  if (['.tex', '.latex'].includes(extension)) {
    for (const command of SECURITY_PATTERNS.DANGEROUS_LATEX) {
      if (content.includes(command)) {
        issues.push(`File LaTeX chứa lệnh nguy hiểm: ${command}`);
      }
    }
  }
  
  return issues;
}

// ===== VALIDATION SCHEMAS =====

/**
 * Single File Upload Schema
 */
export const singleFileUploadSchema = z.object({
  file: z.instanceof(File, { message: "File không hợp lệ" }),
  filename: z
    .string()
    .min(1, "Tên file không được để trống")
    .max(255, "Tên file không được vượt quá 255 ký tự")
    .refine(
      (filename) => !/[<>:"/\\|?*]/.test(filename),
      "Tên file chứa ký tự không hợp lệ"
    )
    .refine(
      (filename) => isAllowedFileType(filename),
      "Loại file không được hỗ trợ. Chỉ chấp nhận: .tex, .txt, .csv, .json"
    ),
  size: z
    .number()
    .min(FILE_SIZE_LIMITS.MIN_FILE_SIZE, "File quá nhỏ")
    .max(FILE_SIZE_LIMITS.MAX_FILE_SIZE, `File không được vượt quá ${FILE_SIZE_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`),
  mimeType: z
    .string()
    .optional(),
});

/**
 * Multiple Files Upload Schema
 */
export const multipleFilesUploadSchema = z.object({
  files: z
    .array(singleFileUploadSchema)
    .min(1, "Phải chọn ít nhất 1 file")
    .max(10, "Không được upload quá 10 files cùng lúc")
    .refine(
      (files) => {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        return totalSize <= FILE_SIZE_LIMITS.MAX_TOTAL_SIZE;
      },
      `Tổng dung lượng files không được vượt quá ${FILE_SIZE_LIMITS.MAX_TOTAL_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (files) => {
        const filenames = files.map(f => f.filename.toLowerCase());
        return new Set(filenames).size === filenames.length;
      },
      "Không được upload files trùng tên"
    ),
});

/**
 * File Content Validation Schema
 */
export const fileContentValidationSchema = z.object({
  filename: z.string().min(1, "Tên file không được để trống"),
  content: z
    .string()
    .min(1, "Nội dung file không được để trống")
    .max(5 * 1024 * 1024, "Nội dung file quá lớn"), // 5MB text content limit
  encoding: z
    .enum(['utf-8', 'ascii', 'latin1'], {
      errorMap: () => ({ message: "Encoding không được hỗ trợ" })
    })
    .optional()
    .default('utf-8'),
});

/**
 * LaTeX File Specific Schema
 */
export const latexFileSchema = z.object({
  filename: z
    .string()
    .refine(
      (filename) => {
        const ext = getFileExtension(filename);
        return ['.tex', '.latex'].includes(ext);
      },
      "File phải có extension .tex hoặc .latex"
    ),
  content: z.string().min(1, "Nội dung file không được để trống"),
  encoding: z.enum(['utf-8', 'ascii', 'latin1']).optional().default('utf-8'),
});

/**
 * CSV Import Schema
 */
export const csvImportSchema = z.object({
  filename: z
    .string()
    .refine(
      (filename) => getFileExtension(filename) === '.csv',
      "File phải có extension .csv"
    ),
  content: z.string().min(1, "Nội dung file không được để trống"),
  delimiter: z
    .enum([',', ';', '\t'], {
      errorMap: () => ({ message: "Delimiter phải là ',', ';' hoặc tab" })
    })
    .optional()
    .default(','),
  hasHeader: z.boolean().optional().default(true),
  expectedColumns: z
    .array(z.string())
    .optional(),
  encoding: z.enum(['utf-8', 'ascii', 'latin1']).optional().default('utf-8'),
});

// ===== TYPE EXPORTS =====

export type SingleFileUpload = z.infer<typeof singleFileUploadSchema>;
export type MultipleFilesUpload = z.infer<typeof multipleFilesUploadSchema>;
export type FileContentValidation = z.infer<typeof fileContentValidationSchema>;
export type LaTeXFileUpload = z.infer<typeof latexFileSchema>;
export type CSVImportData = z.infer<typeof csvImportSchema>;

// ===== VALIDATION HELPERS =====

/**
 * Validate file upload with detailed error messages
 */
export function validateFileUpload(file: File): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  const result = singleFileUploadSchema.safeParse({
    file,
    filename: file.name,
    size: file.size,
    mimeType: file.type,
  });
  
  if (!result.success) {
    errors.push(...result.error.errors.map(e => e.message));
  }
  
  // Additional warnings
  if (file.size > 5 * 1024 * 1024) { // 5MB
    warnings.push('File khá lớn, có thể mất thời gian upload');
  }
  
  const extension = getFileExtension(file.name);
  if (extension === '.txt' && file.size > 1024 * 1024) { // 1MB for text
    warnings.push('File text khá lớn, đảm bảo đây là file đúng định dạng');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get allowed file types for UI display
 */
export function getAllowedFileTypesDisplay(): string {
  return Object.values(ALLOWED_FILE_TYPES)
    .map(type => `${type.description} (${type.extensions.join(', ')})`)
    .join(', ');
}

/**
 * Check if file content is safe
 */
export async function validateFileContent(file: File): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const content = await file.text();
    const issues = containsMaliciousContent(content, file.name);
    
    if (issues.length > 0) {
      errors.push(...issues);
    }
    
    // Content-specific warnings
    if (content.length > 1024 * 1024) { // 1MB
      warnings.push('Nội dung file khá dài, có thể ảnh hưởng đến hiệu suất');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch {
    return {
      isValid: false,
      errors: ['Không thể đọc nội dung file'],
      warnings: [],
    };
  }
}
