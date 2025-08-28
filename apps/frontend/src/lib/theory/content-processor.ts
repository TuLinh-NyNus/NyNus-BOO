/**
 * Content Processor
 * Xử lý markdown content với LaTeX cho theory system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import matter from 'gray-matter';
import {
  renderMixedContent,
  extractLatexExpressions,
  hasLatexContent,
  LaTeXRenderOptions
} from '@/lib/utils/latex-rendering';
import {
  TheoryFile,
  TheoryMetadata,
  RenderedContent,
  BreadcrumbItem,
  ValidationResult,
  ProcessingOptions,
  Subject,
  Difficulty
} from '@/types/theory';

// ===== CONSTANTS =====

const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  validateLatex: true,
  optimizeImages: true,
  generateMobileVersion: true,
  extractSearchText: true,
  buildSearchIndex: true
};

const LATEX_RENDER_OPTIONS: LaTeXRenderOptions = {
  displayMode: false,
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  trust: true,
  maxSize: 10,
  maxExpand: 1000,
  macros: {
    // Vietnamese math macros
    '\\vn': '\\text{#1}',
    '\\viet': '\\text{#1}',
    '\\dap': '\\Rightarrow',
    '\\kq': '\\boxed{#1}',
    '\\dang': '\\text{dạng}',
    '\\khi': '\\text{khi}',
    '\\voi': '\\text{với}',
    '\\la': '\\text{là}'
  }
};

// ===== CONTENT PROCESSOR CLASS =====

export class ContentProcessor {
  private options: ProcessingOptions;

  constructor(options: Partial<ProcessingOptions> = {}) {
    this.options = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
  }

  /**
   * Parse markdown file với frontmatter
   * Phân tích file markdown và extract metadata
   */
  parseMarkdownWithLatex(filePath: string, content: string): TheoryFile {
    try {
      // Parse frontmatter và content
      const parsed = matter(content);
      
      // Validate và extract metadata
      const metadata = this.extractMetadata(parsed.data, filePath);
      
      // Validate content structure
      const validation = this.validateContent(parsed.content, metadata);
      if (!validation.isValid) {
        throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      return {
        path: filePath,
        absolutePath: '', // Will be set by caller
        content: parsed.content,
        metadata,
        lastModified: new Date(),
        size: content.length
      };
    } catch (error) {
      throw new Error(`Failed to parse markdown file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract và validate metadata từ frontmatter
   */
  extractMetadata(frontmatter: Record<string, unknown>, filePath: string): TheoryMetadata {
    // Extract path components for validation
    const pathParts = filePath.split('/');
    const subject = pathParts[0] as Subject;
    const gradeMatch = pathParts[1]?.match(/LỚP-(\d+)/);
    const chapterMatch = pathParts[2]?.match(/CHƯƠNG-(\d+)/);
    
    // Validate required fields
    if (!frontmatter.title) {
      throw new Error('Missing required field: title');
    }
    
    if (!frontmatter.subject) {
      throw new Error('Missing required field: subject');
    }

    // Build metadata object với validation
    const metadata: TheoryMetadata = {
      title: String(frontmatter.title),
      subject: (frontmatter.subject as Subject) || subject,
      grade: Number(frontmatter.grade) || (gradeMatch ? parseInt(gradeMatch[1]) : 10),
      chapter: Number(frontmatter.chapter) || (chapterMatch ? parseInt(chapterMatch[1]) : 1),
      lesson: Number(frontmatter.lesson) || 1,
      description: String(frontmatter.description || ''),
      keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
      difficulty: (frontmatter.difficulty as Difficulty) || 'medium',
      estimatedTime: String(frontmatter.estimatedTime || '45 phút'),
      author: frontmatter.author as string | undefined,
      lastUpdated: frontmatter.lastUpdated as string | undefined,
      mobileOptimized: Boolean(frontmatter.mobileOptimized)
    };

    // Validate metadata consistency
    this.validateMetadata(metadata, filePath);

    return metadata;
  }

  /**
   * Generate navigation breadcrumbs và links
   */
  generateNavigation(file: TheoryFile): RenderedContent['navigation'] {
    const { metadata, path } = file;
    
    // Build breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Lý thuyết', href: '/theory' },
      { label: metadata.subject, href: `/theory/${metadata.subject}` },
      { label: `Lớp ${metadata.grade}`, href: `/theory/${metadata.subject}/LỚP-${metadata.grade}` },
      { label: `Chương ${metadata.chapter}`, href: `/theory/${metadata.subject}/LỚP-${metadata.grade}/CHƯƠNG-${metadata.chapter}` },
      { label: metadata.title, href: `/theory/${path}`, isActive: true }
    ];

    // Generate prev/next links (simplified - would need full file list in real implementation)
    const basePath = `/theory/${metadata.subject}/LỚP-${metadata.grade}/CHƯƠNG-${metadata.chapter}`;
    const prev = metadata.lesson > 1 ? `${basePath}/bài-${metadata.lesson - 1}` : undefined;
    const next = `${basePath}/bài-${metadata.lesson + 1}`; // Would need validation in real implementation

    return {
      prev,
      next,
      parent: `/theory/${metadata.subject}/LỚP-${metadata.grade}/CHƯƠNG-${metadata.chapter}`,
      breadcrumbs
    };
  }

  /**
   * Process content và render LaTeX
   */
  async processContent(file: TheoryFile): Promise<RenderedContent> {
    const startTime = performance.now();
    const errors: string[] = [];

    try {
      // Check for LaTeX content
      const hasLatex = hasLatexContent(file.content);
      
      let html: string;
      let latexCount = 0;

      if (hasLatex) {
        // Render mixed content với LaTeX
        const renderResult = renderMixedContent(file.content, LATEX_RENDER_OPTIONS);
        
        if (!renderResult.isValid && renderResult.error) {
          errors.push(`LaTeX rendering error: ${renderResult.error}`);
        }

        html = renderResult.html || file.content;
        latexCount = renderResult.expressions.filter(expr => expr.type !== 'text').length;
      } else {
        // Simple markdown to HTML conversion (simplified)
        html = this.markdownToHtml(file.content);
      }

      // Generate navigation
      const navigation = this.generateNavigation(file);

      // Calculate performance metrics
      const renderTime = performance.now() - startTime;
      const imageCount = (html.match(/<img/g) || []).length;

      return {
        html,
        metadata: file.metadata,
        navigation,
        performance: {
          renderTime,
          latexCount,
          imageCount
        },
        errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      errors.push(errorMessage);

      // Return fallback content
      return {
        html: `<div class="error">Error processing content: ${errorMessage}</div>`,
        metadata: file.metadata,
        navigation: this.generateNavigation(file),
        performance: {
          renderTime: performance.now() - startTime,
          latexCount: 0,
          imageCount: 0
        },
        errors
      };
    }
  }

  /**
   * Extract searchable text từ content
   */
  extractSearchableText(content: string): string {
    // Remove LaTeX delimiters và extract plain text
    const searchText = content
      .replace(/\$\$[\s\S]*?\$\$/g, ' ') // Remove display math
      .replace(/\$[^$]*?\$/g, ' ')       // Remove inline math
      .replace(/\\[\[\]]/g, ' ')         // Remove LaTeX brackets
      .replace(/#{1,6}\s*/g, '')         // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*([^*]+)\*/g, '$1')     // Remove italic formatting
      .replace(/`([^`]+)`/g, '$1')       // Remove code formatting
      .replace(/\n+/g, ' ')              // Replace newlines with spaces
      .replace(/\s+/g, ' ')              // Normalize whitespace
      .trim();

    return searchText;
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Validate content structure và LaTeX
   */
  private validateContent(content: string, _metadata: TheoryMetadata): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check minimum content length
    if (content.length < 100) {
      warnings.push('Content is very short (< 100 characters)');
    }

    // Validate LaTeX expressions if present
    if (hasLatexContent(content)) {
      const expressions = extractLatexExpressions(content);
      
      for (const expr of expressions) {
        try {
          // Basic LaTeX validation would go here
          if (expr.includes('undefined') || expr.includes('error')) {
            errors.push(`Potentially invalid LaTeX expression: ${expr.substring(0, 50)}...`);
          }
        } catch (error) {
          errors.push(`LaTeX validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Content structure suggestions
    if (!content.includes('## ')) {
      suggestions.push('Consider adding section headers (##) for better structure');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate metadata consistency
   */
  private validateMetadata(metadata: TheoryMetadata, _filePath: string): void {
    // Validate subject
    const validSubjects: Subject[] = ['TOÁN', 'LÝ', 'HÓA', 'SINH', 'VĂN', 'ANH', 'SỬ', 'ĐỊA'];
    if (!validSubjects.includes(metadata.subject)) {
      throw new Error(`Invalid subject: ${metadata.subject}`);
    }

    // Validate grade range
    if (metadata.grade < 3 || metadata.grade > 12) {
      throw new Error(`Invalid grade: ${metadata.grade}. Must be between 3-12`);
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(metadata.difficulty)) {
      throw new Error(`Invalid difficulty: ${metadata.difficulty}`);
    }

    // Path consistency check
    const expectedSubject = _filePath.split('/')[0];
    if (metadata.subject !== expectedSubject) {
      throw new Error(`Subject mismatch: metadata has ${metadata.subject}, path has ${expectedSubject}`);
    }
  }

  /**
   * Simple markdown to HTML conversion
   */
  private markdownToHtml(markdown: string): string {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^(.*)$/gim, '<p>$1</p>')
      .replace(/<p><\/p>/gim, '');
  }
}
