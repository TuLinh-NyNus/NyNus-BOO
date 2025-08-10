/**
 * XSS Prevention Module
 * Comprehensive XSS protection cho question content và user inputs
 * Tích hợp với latex-sanitizer.ts để bảo vệ toàn diện
 */

import DOMPurify from 'isomorphic-dompurify';

// ===== XSS PREVENTION CONFIGURATION =====

/**
 * DOMPurify configuration cho different contexts
 */
export const XSS_CONFIGS = {
  // Strict config cho question content
  QUESTION_CONTENT: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'sub', 'sup',
      'ol', 'ul', 'li', 'blockquote', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'img', 'a'
    ] as string[],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height',
      'class', 'id', 'style'
    ] as string[],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'] as string[],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'] as string[],
  },

  // Moderate config cho user comments/feedback
  USER_CONTENT: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote'] as string[],
    ALLOWED_ATTR: ['class'] as string[],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button', 'iframe'] as string[],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'] as string[],
  },

  // Strict config cho plain text (no HTML allowed)
  PLAIN_TEXT: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },
};

/**
 * Dangerous patterns detection
 */
export const DANGEROUS_PATTERNS = {
  // JavaScript injection patterns
  JAVASCRIPT_PATTERNS: [
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  ],

  // Event handler patterns
  EVENT_HANDLERS: [
    /on\w+\s*=/gi,
    /onclick/gi,
    /onload/gi,
    /onerror/gi,
    /onmouseover/gi,
    /onfocus/gi,
    /onblur/gi,
  ],

  // URL injection patterns
  URL_INJECTION: [
    /data:text\/html/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /file:/gi,
  ],

  // CSS injection patterns
  CSS_INJECTION: [
    /expression\s*\(/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /@import/gi,
    /behavior:/gi,
  ],
} as const;

// ===== SANITIZATION FUNCTIONS =====

/**
 * Sanitize question content với strict rules
 */
export function sanitizeQuestionContent(content: string): {
  sanitized: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!content || typeof content !== 'string') {
    return {
      sanitized: '',
      isValid: false,
      errors: ['Nội dung không hợp lệ'],
      warnings: [],
    };
  }

  // Check for dangerous patterns before sanitization
  const dangerousPatterns = detectDangerousPatterns(content);
  if (dangerousPatterns.length > 0) {
    warnings.push(`Phát hiện patterns nguy hiểm: ${dangerousPatterns.join(', ')}`);
  }

  // Sanitize with DOMPurify
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: XSS_CONFIGS.QUESTION_CONTENT.ALLOWED_TAGS,
    ALLOWED_ATTR: XSS_CONFIGS.QUESTION_CONTENT.ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: XSS_CONFIGS.QUESTION_CONTENT.ALLOWED_URI_REGEXP,
    FORBID_TAGS: XSS_CONFIGS.QUESTION_CONTENT.FORBID_TAGS,
    FORBID_ATTR: XSS_CONFIGS.QUESTION_CONTENT.FORBID_ATTR,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });

  // Check if content was modified
  if (sanitized !== content) {
    warnings.push('Nội dung đã được làm sạch để đảm bảo an toàn');
  }

  // Validate sanitized content
  const finalValidation = validateSanitizedContent(sanitized);
  if (!finalValidation.isValid) {
    errors.push(...finalValidation.errors);
  }

  return {
    sanitized,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize user content (comments, feedback)
 */
export function sanitizeUserContent(content: string): {
  sanitized: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!content || typeof content !== 'string') {
    return {
      sanitized: '',
      isValid: false,
      errors: ['Nội dung không hợp lệ'],
      warnings: [],
    };
  }

  // Check for dangerous patterns
  const dangerousPatterns = detectDangerousPatterns(content);
  if (dangerousPatterns.length > 0) {
    warnings.push(`Phát hiện patterns nguy hiểm: ${dangerousPatterns.join(', ')}`);
  }

  // Sanitize with moderate rules
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: XSS_CONFIGS.USER_CONTENT.ALLOWED_TAGS,
    ALLOWED_ATTR: XSS_CONFIGS.USER_CONTENT.ALLOWED_ATTR,
    FORBID_TAGS: XSS_CONFIGS.USER_CONTENT.FORBID_TAGS,
    FORBID_ATTR: XSS_CONFIGS.USER_CONTENT.FORBID_ATTR,
  });

  if (sanitized !== content) {
    warnings.push('Nội dung đã được làm sạch để đảm bảo an toàn');
  }

  return {
    sanitized,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize plain text (remove all HTML)
 */
export function sanitizePlainText(content: string): {
  sanitized: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!content || typeof content !== 'string') {
    return {
      sanitized: '',
      isValid: false,
      errors: ['Nội dung không hợp lệ'],
      warnings: [],
    };
  }

  // Remove all HTML tags
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: XSS_CONFIGS.PLAIN_TEXT.ALLOWED_TAGS,
    ALLOWED_ATTR: XSS_CONFIGS.PLAIN_TEXT.ALLOWED_ATTR,
    KEEP_CONTENT: XSS_CONFIGS.PLAIN_TEXT.KEEP_CONTENT,
  });

  // Check for remaining dangerous patterns
  const dangerousPatterns = detectDangerousPatterns(sanitized);
  if (dangerousPatterns.length > 0) {
    errors.push(`Vẫn còn patterns nguy hiểm sau khi sanitize: ${dangerousPatterns.join(', ')}`);
  }

  if (sanitized !== content) {
    warnings.push('Đã loại bỏ tất cả HTML tags');
  }

  return {
    sanitized,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Sanitize URL để prevent URL injection
 */
export function sanitizeUrl(url: string): {
  sanitized: string;
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!url || typeof url !== 'string') {
    return {
      sanitized: '',
      isValid: false,
      errors: ['URL không hợp lệ'],
    };
  }

  // Check for dangerous URL patterns
  for (const pattern of DANGEROUS_PATTERNS.URL_INJECTION) {
    if (pattern.test(url)) {
      errors.push('URL chứa patterns nguy hiểm');
      break;
    }
  }

  // Sanitize URL
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Additional URL validation
  try {
    const urlObj = new URL(sanitized);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      errors.push('Protocol URL không được phép');
    }
  } catch {
    errors.push('URL không có định dạng hợp lệ');
  }

  return {
    sanitized,
    isValid: errors.length === 0,
    errors,
  };
}

// ===== DETECTION FUNCTIONS =====

/**
 * Detect dangerous patterns in content
 */
function detectDangerousPatterns(content: string): string[] {
  const detected: string[] = [];
  
  // Check JavaScript patterns
  for (const pattern of DANGEROUS_PATTERNS.JAVASCRIPT_PATTERNS) {
    if (pattern.test(content)) {
      detected.push('JavaScript injection');
      break;
    }
  }

  // Check event handlers
  for (const pattern of DANGEROUS_PATTERNS.EVENT_HANDLERS) {
    if (pattern.test(content)) {
      detected.push('Event handlers');
      break;
    }
  }

  // Check CSS injection
  for (const pattern of DANGEROUS_PATTERNS.CSS_INJECTION) {
    if (pattern.test(content)) {
      detected.push('CSS injection');
      break;
    }
  }

  return detected;
}

/**
 * Validate sanitized content
 */
function validateSanitizedContent(content: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check if any dangerous patterns remain
  const remainingPatterns = detectDangerousPatterns(content);
  if (remainingPatterns.length > 0) {
    errors.push(`Vẫn còn patterns nguy hiểm: ${remainingPatterns.join(', ')}`);
  }

  // Check for suspicious attributes
  if (content.includes('javascript:') || content.includes('vbscript:')) {
    errors.push('Chứa JavaScript hoặc VBScript URLs');
  }

  // Check for data URLs with executable content
  if (/data:(?:text\/html|application\/javascript)/i.test(content)) {
    errors.push('Chứa data URLs nguy hiểm');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Check if content is safe without sanitizing
 */
export function isContentSafe(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  
  const dangerousPatterns = detectDangerousPatterns(content);
  return dangerousPatterns.length === 0;
}

/**
 * Get security report for content
 */
export function getSecurityReport(content: string): {
  isSafe: boolean;
  threats: string[];
  recommendations: string[];
} {
  const threats = detectDangerousPatterns(content);
  const recommendations: string[] = [];
  
  if (threats.includes('JavaScript injection')) {
    recommendations.push('Loại bỏ tất cả JavaScript code');
  }
  
  if (threats.includes('Event handlers')) {
    recommendations.push('Loại bỏ các event handlers HTML');
  }
  
  if (threats.includes('CSS injection')) {
    recommendations.push('Kiểm tra và làm sạch CSS inline');
  }

  return {
    isSafe: threats.length === 0,
    threats,
    recommendations,
  };
}

/**
 * Batch sanitize multiple contents
 */
export function batchSanitize(
  contents: string[], 
  type: 'question' | 'user' | 'plain' = 'question'
): Array<{
  original: string;
  sanitized: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const sanitizeFunction = type === 'question' 
    ? sanitizeQuestionContent 
    : type === 'user' 
    ? sanitizeUserContent 
    : sanitizePlainText;

  return contents.map(content => ({
    original: content,
    ...sanitizeFunction(content),
  }));
}
