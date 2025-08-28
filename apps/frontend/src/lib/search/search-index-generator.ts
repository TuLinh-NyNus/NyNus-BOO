/**
 * Search Index Generator
 * Build-time generator cho theory search indices với optimization
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { gzipSync } from 'zlib';

// ===== TYPES =====

export interface TheorySearchIndex {
  version: string;
  lastBuilt: string;
  totalItems: number;
  subjects: Record<string, TheorySearchItem[]>;
  grades: Record<number, TheorySearchItem[]>;
  searchIndex: TheorySearchItem[];
  metadata: SearchIndexMetadata;
}

export interface TheorySearchItem {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: number;
  chapter: number;
  lesson: number;
  keywords: string[];
  mathFormulas: string[];
  url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  lastModified: string;
}

export interface SearchIndexMetadata {
  buildTime: number;
  compressionRatio: number;
  indexSize: number;
  compressedSize: number;
  itemCount: number;
  subjectCount: number;
  gradeRange: [number, number];
}

export interface SearchIndexGeneratorOptions {
  /** Output path cho search index file */
  outputPath?: string;
  
  /** Enable gzip compression */
  enableCompression?: boolean;
  
  /** Include detailed metadata */
  includeMetadata?: boolean;
  
  /** Optimize cho mobile performance */
  optimizeForMobile?: boolean;
  
  /** Maximum content length per item */
  maxContentLength?: number;
  
  /** Enable debug logging */
  enableDebugLogging?: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_OPTIONS: Required<SearchIndexGeneratorOptions> = {
  outputPath: 'apps/frontend/public/theory-search-index.json',
  enableCompression: true,
  includeMetadata: true,
  optimizeForMobile: true,
  maxContentLength: 2000,
  enableDebugLogging: false
};

const SUPPORTED_SUBJECTS = ['TOÁN', 'LÝ', 'HÓA', 'SINH', 'VĂN', 'ANH', 'SỬ', 'ĐỊA'];
const GRADE_RANGE = [3, 12];

// ===== MAIN CLASS =====

export class SearchIndexGenerator {
  private options: Required<SearchIndexGeneratorOptions>;
  private buildStartTime: number = 0;

  constructor(options: SearchIndexGeneratorOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate complete search index từ theory content
   */
  async generateSearchIndex(): Promise<TheorySearchIndex> {
    this.buildStartTime = Date.now();
    this.log('🔍 Starting search index generation...');

    try {
      // 1. Scan theory content directory
      const theoryItems = await this.scanTheoryContent();
      this.log(`📁 Found ${theoryItems.length} theory items`);

      // 2. Process và optimize content
      const processedItems = await this.processTheoryItems(theoryItems);
      this.log(`⚙️ Processed ${processedItems.length} items`);

      // 3. Build subject và grade indices
      const subjectIndex = this.buildSubjectIndex(processedItems);
      const gradeIndex = this.buildGradeIndex(processedItems);

      // 4. Generate metadata
      const metadata = this.generateMetadata(processedItems);

      // 5. Create final search index
      const searchIndex: TheorySearchIndex = {
        version: '1.0.0',
        lastBuilt: new Date().toISOString(),
        totalItems: processedItems.length,
        subjects: subjectIndex,
        grades: gradeIndex,
        searchIndex: processedItems,
        metadata
      };

      // 6. Save to file
      await this.saveSearchIndex(searchIndex);

      const buildTime = Date.now() - this.buildStartTime;
      this.log(`✅ Search index generated successfully in ${buildTime}ms`);

      return searchIndex;
    } catch (error) {
      this.log(`❌ Search index generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Scan theory content directory cho all theory files
   */
  private async scanTheoryContent(): Promise<TheorySearchItem[]> {
    const theoryItems: TheorySearchItem[] = [];
    const contentRoot = path.join(process.cwd(), 'content/theory');

    try {
      // Check if content directory exists
      await fs.access(contentRoot);
    } catch {
      this.log('⚠️ Theory content directory not found, creating mock data...');
      return this.createMockTheoryData();
    }

    // Scan each subject directory
    for (const subject of SUPPORTED_SUBJECTS) {
      const subjectPath = path.join(contentRoot, subject);
      
      try {
        await fs.access(subjectPath);
        const subjectItems = await this.scanSubjectDirectory(subjectPath, subject);
        theoryItems.push(...subjectItems);
      } catch {
        this.log(`⚠️ Subject directory not found: ${subject}`);
      }
    }

    return theoryItems;
  }

  /**
   * Scan một subject directory cho theory files
   */
  private async scanSubjectDirectory(subjectPath: string, subject: string): Promise<TheorySearchItem[]> {
    const items: TheorySearchItem[] = [];

    // Scan grade directories (LỚP-3 to LỚP-12)
    for (let grade = GRADE_RANGE[0]; grade <= GRADE_RANGE[1]; grade++) {
      const gradePath = path.join(subjectPath, `LỚP-${grade}`);
      
      try {
        await fs.access(gradePath);
        const gradeItems = await this.scanGradeDirectory(gradePath, subject, grade);
        items.push(...gradeItems);
      } catch {
        // Grade directory doesn't exist, skip
        continue;
      }
    }

    return items;
  }

  /**
   * Scan một grade directory cho chapter files
   */
  private async scanGradeDirectory(gradePath: string, subject: string, grade: number): Promise<TheorySearchItem[]> {
    const items: TheorySearchItem[] = [];

    try {
      const entries = await fs.readdir(gradePath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('CHƯƠNG-')) {
          const chapterNumber = parseInt(entry.name.replace('CHƯƠNG-', ''));
          const chapterPath = path.join(gradePath, entry.name);
          const chapterItems = await this.scanChapterDirectory(chapterPath, subject, grade, chapterNumber);
          items.push(...chapterItems);
        }
      }
    } catch (error) {
      this.log(`Error scanning grade directory ${gradePath}: ${error}`);
    }

    return items;
  }

  /**
   * Scan một chapter directory cho lesson files
   */
  private async scanChapterDirectory(chapterPath: string, subject: string, grade: number, chapter: number): Promise<TheorySearchItem[]> {
    const items: TheorySearchItem[] = [];

    try {
      const files = await fs.readdir(chapterPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(chapterPath, file);
          const item = await this.processTheoryFile(filePath, subject, grade, chapter);
          if (item) {
            items.push(item);
          }
        }
      }
    } catch (error) {
      this.log(`Error scanning chapter directory ${chapterPath}: ${error}`);
    }

    return items;
  }

  /**
   * Process một theory file thành search item
   */
  private async processTheoryFile(filePath: string, subject: string, grade: number, chapter: number): Promise<TheorySearchItem | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract frontmatter và content
      const { metadata, bodyContent } = this.parseMarkdownFile(content);
      
      // Extract searchable text
      const searchableText = this.extractSearchableText(bodyContent);
      
      // Extract LaTeX formulas
      const mathFormulas = this.extractMathFormulas(bodyContent);
      
      // Generate URL
      const relativePath = path.relative(path.join(process.cwd(), 'content/theory'), filePath);
      const url = `/theory/${relativePath.replace(/\\/g, '/').replace('.md', '')}`;
      
      // Get file stats
      const stats = await fs.stat(filePath);
      
      return {
        id: relativePath.replace(/\\/g, '/'),
        title: (metadata.title as string) || path.basename(filePath, '.md'),
        content: this.truncateContent(searchableText),
        subject,
        grade,
        chapter,
        lesson: (metadata.lesson as number) || 1,
        keywords: (metadata.keywords as string[]) || [],
        mathFormulas,
        url,
        difficulty: (metadata.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        estimatedTime: (metadata.estimatedTime as number) || 45,
        lastModified: stats.mtime.toISOString()
      };
    } catch (error) {
      this.log(`Error processing file ${filePath}: ${error}`);
      return null;
    }
  }

  /**
   * Parse markdown file với frontmatter
   */
  private parseMarkdownFile(content: string): { metadata: Record<string, unknown>; bodyContent: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      try {
        // Simple YAML parsing (basic implementation)
        const yamlContent = match[1];
        const metadata = this.parseSimpleYaml(yamlContent);
        return { metadata, bodyContent: match[2] };
      } catch {
        return { metadata: {}, bodyContent: content };
      }
    }
    
    return { metadata: {}, bodyContent: content };
  }

  /**
   * Simple YAML parser cho frontmatter
   */
  private parseSimpleYaml(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else if (!isNaN(Number(value))) {
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Extract searchable text từ markdown content
   */
  private extractSearchableText(content: string): string {
    // Remove markdown syntax
    const text = content
      .replace(/^#{1,6}\s+/gm, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/```[\s\S]*?```/g, '') // Code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      .replace(/^\s*[-*+]\s+/gm, '') // List items
      .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
      .replace(/\$\$[\s\S]*?\$\$/g, ' ') // Block math
      .replace(/\$[^$]+\$/g, ' ') // Inline math
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return text;
  }

  /**
   * Extract LaTeX formulas từ content
   */
  private extractMathFormulas(content: string): string[] {
    const formulas: string[] = [];
    
    // Extract block math
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    let match;
    while ((match = blockMathRegex.exec(content)) !== null) {
      formulas.push(match[1].trim());
    }
    
    // Extract inline math
    const inlineMathRegex = /\$([^$]+)\$/g;
    while ((match = inlineMathRegex.exec(content)) !== null) {
      formulas.push(match[1].trim());
    }
    
    return formulas;
  }

  /**
   * Truncate content to maximum length
   */
  private truncateContent(content: string): string {
    if (content.length <= this.options.maxContentLength) {
      return content;
    }
    
    return content.substring(0, this.options.maxContentLength) + '...';
  }

  /**
   * Create mock theory data cho development
   */
  private createMockTheoryData(): TheorySearchItem[] {
    const mockItems: TheorySearchItem[] = [];
    
    for (const subject of SUPPORTED_SUBJECTS.slice(0, 3)) { // Only first 3 subjects
      for (let grade = 10; grade <= 12; grade++) {
        for (let chapter = 1; chapter <= 3; chapter++) {
          for (let lesson = 1; lesson <= 2; lesson++) {
            mockItems.push({
              id: `${subject}/LỚP-${grade}/CHƯƠNG-${chapter}/bài-${lesson}`,
              title: `${subject} Lớp ${grade} - Chương ${chapter} - Bài ${lesson}`,
              content: `Nội dung bài học ${subject} lớp ${grade}, chương ${chapter}, bài ${lesson}. Đây là nội dung mẫu cho việc phát triển và testing.`,
              subject,
              grade,
              chapter,
              lesson,
              keywords: [`${subject.toLowerCase()}`, `lớp-${grade}`, `chương-${chapter}`],
              mathFormulas: ['x^2 + y^2 = z^2', 'a + b = c'],
              url: `/theory/${subject}/LỚP-${grade}/CHƯƠNG-${chapter}/bài-${lesson}`,
              difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
              estimatedTime: 30 + (lesson * 15),
              lastModified: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return mockItems;
  }

  /**
   * Process theory items với optimization
   */
  private async processTheoryItems(items: TheorySearchItem[]): Promise<TheorySearchItem[]> {
    if (!this.options.optimizeForMobile) {
      return items;
    }
    
    // Mobile optimization: reduce content size, optimize keywords
    return items.map(item => ({
      ...item,
      content: this.truncateContent(item.content),
      keywords: item.keywords.slice(0, 10) // Limit keywords for mobile
    }));
  }

  /**
   * Build subject-based index
   */
  private buildSubjectIndex(items: TheorySearchItem[]): Record<string, TheorySearchItem[]> {
    const index: Record<string, TheorySearchItem[]> = {};
    
    for (const item of items) {
      if (!index[item.subject]) {
        index[item.subject] = [];
      }
      index[item.subject].push(item);
    }
    
    // Sort items within each subject
    for (const subject in index) {
      index[subject].sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.lesson - b.lesson;
      });
    }
    
    return index;
  }

  /**
   * Build grade-based index
   */
  private buildGradeIndex(items: TheorySearchItem[]): Record<number, TheorySearchItem[]> {
    const index: Record<number, TheorySearchItem[]> = {};
    
    for (const item of items) {
      if (!index[item.grade]) {
        index[item.grade] = [];
      }
      index[item.grade].push(item);
    }
    
    return index;
  }

  /**
   * Generate metadata cho search index
   */
  private generateMetadata(items: TheorySearchItem[]): SearchIndexMetadata {
    const buildTime = Date.now() - this.buildStartTime;
    const indexSize = JSON.stringify(items).length;
    const compressedSize = this.options.enableCompression ? 
      gzipSync(JSON.stringify(items)).length : indexSize;
    
    const grades = items.map(item => item.grade);
    const gradeRange: [number, number] = [Math.min(...grades), Math.max(...grades)];
    
    return {
      buildTime,
      compressionRatio: indexSize / compressedSize,
      indexSize,
      compressedSize,
      itemCount: items.length,
      subjectCount: new Set(items.map(item => item.subject)).size,
      gradeRange
    };
  }

  /**
   * Save search index to file
   */
  private async saveSearchIndex(searchIndex: TheorySearchIndex): Promise<void> {
    const outputPath = path.resolve(this.options.outputPath);
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save main index
    const indexContent = JSON.stringify(searchIndex, null, 2);
    await fs.writeFile(outputPath, indexContent, 'utf-8');
    
    // Save compressed version if enabled
    if (this.options.enableCompression) {
      const compressedPath = outputPath.replace('.json', '.json.gz');
      const compressed = gzipSync(indexContent);
      await fs.writeFile(compressedPath, compressed);
    }
    
    this.log(`💾 Search index saved to: ${outputPath}`);
    this.log(`📊 Index size: ${(indexContent.length / 1024).toFixed(2)} KB`);
    
    if (this.options.enableCompression) {
      const compressedSize = gzipSync(indexContent).length;
      this.log(`🗜️ Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
    }
  }

  /**
   * Log message với timestamp
   */
  private log(message: string): void {
    if (this.options.enableDebugLogging) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${message}`);
    }
  }
}
