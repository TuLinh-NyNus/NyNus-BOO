/**
 * Build Time Search Indexer
 * Tạo search index tại build time cho instant client-side search
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import {
  SearchableContent,
  PreBuiltIndexes,
  NavigationNode,
  MobileManifest,
  Subject,
  MobileTheoryContent
} from '@/types/theory';

// ===== CONSTANTS =====

const FUSE_OPTIONS: IFuseOptions<SearchableContent> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'content', weight: 0.3 },
    { name: 'keywords', weight: 0.2 },
    { name: 'mathFormulas', weight: 0.1 }
  ],
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true
};

const SUBJECTS: Subject[] = ['TOÁN', 'LÝ', 'HÓA', 'SINH', 'VĂN', 'ANH', 'SỬ', 'ĐỊA'];

// ===== BUILD TIME SEARCH INDEXER CLASS =====

export class BuildTimeSearchIndexer {
  private searchIndex: SearchableContent[] = [];
  private fuseIndex: Fuse<SearchableContent> | null = null;

  /**
   * Generate complete search index từ pre-rendered content
   */
  async generateSearchIndex(preRenderedContent: MobileTheoryContent[]): Promise<PreBuiltIndexes> {
    try {
      console.log('🔍 Generating search index...');
      const startTime = performance.now();

      // 1. Build searchable content array
      this.searchIndex = await this.buildSearchableContent(preRenderedContent);

      // 2. Create Fuse.js index for fast searching
      this.fuseIndex = new Fuse(this.searchIndex, FUSE_OPTIONS);

      // 3. Build subject-based indexes
      const subjects = this.indexBySubject(this.searchIndex);

      // 4. Generate navigation tree
      const navigationTree = this.generateNavigationTree(preRenderedContent);

      // 5. Create mobile manifest
      const mobileManifest = this.generateMobileManifest(preRenderedContent);

      const buildTime = performance.now() - startTime;
      console.log(`✅ Search index generated in ${buildTime.toFixed(2)}ms`);

      return {
        subjects,
        searchIndex: this.searchIndex,
        navigationTree,
        mobileManifest,
        lastBuilt: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('❌ Search index generation failed:', error);
      throw new Error(`Search index generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract searchable text từ HTML content
   */
  extractSearchableText(html: string): string {
    try {
      // Remove HTML tags và extract plain text
      let text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove styles
        .replace(/<[^>]*>/g, ' ')                                           // Remove HTML tags
        .replace(/&nbsp;/g, ' ')                                            // Replace &nbsp;
        .replace(/&[a-z]+;/gi, ' ')                                         // Replace HTML entities
        .replace(/\s+/g, ' ')                                               // Normalize whitespace
        .trim();

      // Remove LaTeX artifacts
      text = text
        .replace(/\\[a-zA-Z]+\{[^}]*\}/g, ' ')  // Remove LaTeX commands
        .replace(/\$+/g, ' ')                    // Remove $ symbols
        .replace(/\\[[\]()]/g, ' ')              // Remove LaTeX brackets
        .trim();

      return text;
    } catch (error) {
      console.warn('Text extraction error:', error);
      return '';
    }
  }

  /**
   * Index content by metadata (subject, grade, etc.)
   */
  indexByMetadata(content: SearchableContent[], searchIndex: SearchableContent[]): void {
    // Group by subject
    const subjectGroups = content.reduce((groups, item) => {
      if (!groups[item.subject]) {
        groups[item.subject] = [];
      }
      groups[item.subject].push(item);
      return groups;
    }, {} as Record<Subject, SearchableContent[]>);

    // Add to main search index
    searchIndex.push(...content);

    console.log(`📊 Indexed ${content.length} items across ${Object.keys(subjectGroups).length} subjects`);
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Build searchable content từ pre-rendered content
   */
  private async buildSearchableContent(preRenderedContent: MobileTheoryContent[]): Promise<SearchableContent[]> {
    const searchableContent: SearchableContent[] = [];

    for (const content of preRenderedContent) {
      try {
        // Extract searchable text
        const searchText = this.extractSearchableText(content.content.html);
        
        // Extract LaTeX formulas
        const mathFormulas = content.content.latexExpressions || [];

        // Build searchable item
        const searchableItem: SearchableContent = {
          id: content.filePath,
          title: content.metadata.title,
          content: searchText,
          subject: content.metadata.subject,
          grade: content.metadata.grade,
          chapter: content.metadata.chapter,
          lesson: content.metadata.lesson,
          keywords: content.metadata.keywords,
          mathFormulas,
          url: `/theory/${content.filePath.replace('.md', '')}`
        };

        searchableContent.push(searchableItem);
      } catch (error) {
        console.warn(`Failed to process content for search: ${content.filePath}`, error);
      }
    }

    return searchableContent;
  }

  /**
   * Index content by subject
   */
  private indexBySubject(searchIndex: SearchableContent[]): Record<Subject, SearchableContent[]> {
    const subjects: Record<Subject, SearchableContent[]> = {} as Record<Subject, SearchableContent[]>;

    // Initialize all subjects
    for (const subject of SUBJECTS) {
      subjects[subject] = [];
    }

    // Group content by subject
    for (const item of searchIndex) {
      if (subjects[item.subject]) {
        subjects[item.subject].push(item);
      }
    }

    // Sort each subject's content
    for (const subject of SUBJECTS) {
      subjects[subject].sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.lesson - b.lesson;
      });
    }

    return subjects;
  }

  /**
   * Generate hierarchical navigation tree
   */
  private generateNavigationTree(preRenderedContent: MobileTheoryContent[]): NavigationNode[] {
    const tree: NavigationNode[] = [];

    // Group by subject
    const subjectGroups = preRenderedContent.reduce((groups, content) => {
      const subject = content.metadata.subject;
      if (!groups[subject]) {
        groups[subject] = [];
      }
      groups[subject].push(content);
      return groups;
    }, {} as Record<Subject, MobileTheoryContent[]>);

    // Build tree structure
    for (const [subject, contents] of Object.entries(subjectGroups)) {
      const subjectNode: NavigationNode = {
        id: subject,
        label: subject,
        type: 'subject',
        path: `/theory/${subject}`,
        children: [],
        metadata: {
          lessonCount: contents.length
        }
      };

      // Group by grade
      const gradeGroups = contents.reduce((groups, content) => {
        const grade = content.metadata.grade;
        if (!groups[grade]) {
          groups[grade] = [];
        }
        groups[grade].push(content);
        return groups;
      }, {} as Record<number, MobileTheoryContent[]>);

      // Add grade nodes
      for (const [grade, gradeContents] of Object.entries(gradeGroups)) {
        const gradeNode: NavigationNode = {
          id: `${subject}-${grade}`,
          label: `Lớp ${grade}`,
          type: 'grade',
          path: `/theory/${subject}/LỚP-${grade}`,
          children: [],
          metadata: {
            lessonCount: gradeContents.length
          }
        };

        // Group by chapter
        const chapterGroups = gradeContents.reduce((groups, content) => {
          const chapter = content.metadata.chapter;
          if (!groups[chapter]) {
            groups[chapter] = [];
          }
          groups[chapter].push(content);
          return groups;
        }, {} as Record<number, MobileTheoryContent[]>);

        // Add chapter nodes
        for (const [chapter, chapterContents] of Object.entries(chapterGroups)) {
          const chapterNode: NavigationNode = {
            id: `${subject}-${grade}-${chapter}`,
            label: `Chương ${chapter}`,
            type: 'chapter',
            path: `/theory/${subject}/LỚP-${grade}/CHƯƠNG-${chapter}`,
            children: [],
            metadata: {
              lessonCount: chapterContents.length
            }
          };

          // Add lesson nodes
          for (const content of chapterContents) {
            const lessonNode: NavigationNode = {
              id: content.filePath,
              label: content.metadata.title,
              type: 'lesson',
              path: `/theory/${content.filePath.replace('.md', '')}`,
              metadata: {
                estimatedTime: content.metadata.estimatedTime,
                difficulty: content.metadata.difficulty
              }
            };

            chapterNode.children!.push(lessonNode);
          }

          gradeNode.children!.push(chapterNode);
        }

        subjectNode.children!.push(gradeNode);
      }

      tree.push(subjectNode);
    }

    return tree;
  }

  /**
   * Generate mobile manifest
   */
  private generateMobileManifest(preRenderedContent: MobileTheoryContent[]): MobileManifest {
    const totalSize = preRenderedContent.reduce((sum, content) => sum + content.performance.fileSize, 0);
    const averageLoadTime = preRenderedContent.reduce((sum, content) => sum + content.performance.buildTime, 0) / preRenderedContent.length;

    const subjects = [...new Set(preRenderedContent.map(c => c.metadata.subject))];
    const grades = [...new Set(preRenderedContent.map(c => c.metadata.grade))].sort((a, b) => a - b);

    return {
      totalContent: preRenderedContent.length,
      subjects: subjects as Subject[],
      grades,
      totalSize,
      averageLoadTime,
      offlineCapable: true, // Pre-rendered content supports offline
      lastSync: new Date().toISOString()
    };
  }
}
