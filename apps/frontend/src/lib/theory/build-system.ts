/**
 * Theory Build System
 * Main orchestrator cho build-time pre-rendering của theory content
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import {
  TheoryFile,
  MobileTheoryContent,
  BuildProgress,
  BuildResult,
  PreBuiltIndexes,
  ProcessingOptions
} from '@/types/theory';
import { ContentProcessor } from './content-processor';
import { MobileOptimizer } from './mobile-optimizer';
import { BuildTimeSearchIndexer } from './search-indexer';

// ===== CONSTANTS =====

const CONTENT_ROOT = path.join(process.cwd(), 'content/theory');
const OUTPUT_ROOT = path.join(process.cwd(), 'apps/frontend/public/theory-built');
const IMAGES_ROOT = path.join(process.cwd(), 'apps/frontend/public/theory-images');

const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  validateLatex: true,
  optimizeImages: true,
  generateMobileVersion: true,
  extractSearchText: true,
  buildSearchIndex: true
};

// ===== THEORY BUILD SYSTEM CLASS =====

export class TheoryBuildSystem {
  private contentProcessor: ContentProcessor;
  private mobileOptimizer: MobileOptimizer;
  private searchIndexer: BuildTimeSearchIndexer;
  private options: ProcessingOptions;
  private buildProgress: BuildProgress;

  constructor(options: Partial<ProcessingOptions> = {}) {
    this.options = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
    this.contentProcessor = new ContentProcessor(this.options);
    this.mobileOptimizer = new MobileOptimizer();
    this.searchIndexer = new BuildTimeSearchIndexer();
    
    this.buildProgress = {
      status: 'idle',
      processedFiles: 0,
      totalFiles: 0,
      errors: [],
      warnings: [],
      startTime: 0
    };
  }

  /**
   * Main build function - orchestrate toàn bộ build process
   */
  async buildTheorySystem(): Promise<BuildResult> {
    console.log('🚀 Starting Theory System build...');
    const startTime = performance.now();
    
    this.buildProgress = {
      status: 'scanning',
      processedFiles: 0,
      totalFiles: 0,
      errors: [],
      warnings: [],
      startTime
    };

    try {
      // 1. Scan và validate all theory files
      console.log('📁 Scanning theory files...');
      const theoryFiles = await this.scanAndValidateFiles();
      this.buildProgress.totalFiles = theoryFiles.length;
      this.buildProgress.status = 'processing';

      // 2. Pre-render all content
      console.log('⚙️ Pre-rendering content...');
      const preRenderedContent = await this.preRenderAllContent(theoryFiles);
      this.buildProgress.status = 'optimizing';

      // 3. Generate search index
      console.log('🔍 Building search index...');
      const searchIndex = await this.searchIndexer.generateSearchIndex(preRenderedContent);
      this.buildProgress.status = 'indexing';

      // 4. Save all output files
      console.log('💾 Saving output files...');
      await this.saveAllOutput(preRenderedContent, searchIndex);

      // 5. Calculate final results
      const totalTime = performance.now() - startTime;
      const outputSize = await this.calculateOutputSize();

      this.buildProgress.status = 'complete';

      const result: BuildResult = {
        success: true,
        processedFiles: theoryFiles.length,
        errors: this.buildProgress.errors,
        warnings: this.buildProgress.warnings,
        totalTime,
        outputSize,
        performance: {
          averageRenderTime: preRenderedContent.reduce((sum, c) => sum + c.performance.renderTime, 0) / preRenderedContent.length,
          totalLatexExpressions: preRenderedContent.reduce((sum, c) => sum + c.content.latexExpressions.length, 0),
          mobileOptimizationScore: preRenderedContent.reduce((sum, c) => sum + c.performance.mobileScore, 0) / preRenderedContent.length
        }
      };

      console.log(`✅ Theory System build completed in ${(totalTime / 1000).toFixed(2)}s`);
      console.log(`📊 Processed ${result.processedFiles} files, ${result.outputSize} bytes output`);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown build error';
      this.buildProgress.status = 'error';
      this.buildProgress.errors.push(errorMessage);

      console.error('❌ Theory System build failed:', errorMessage);

      return {
        success: false,
        processedFiles: this.buildProgress.processedFiles,
        errors: this.buildProgress.errors,
        warnings: this.buildProgress.warnings,
        totalTime: performance.now() - startTime,
        outputSize: 0,
        performance: {
          averageRenderTime: 0,
          totalLatexExpressions: 0,
          mobileOptimizationScore: 0
        }
      };
    }
  }

  /**
   * Scan và validate tất cả theory files
   */
  async scanAndValidateFiles(): Promise<TheoryFile[]> {
    try {
      const theoryFiles: TheoryFile[] = [];
      
      // Check if content directory exists
      try {
        await fs.access(CONTENT_ROOT);
      } catch {
        throw new Error(`Content directory not found: ${CONTENT_ROOT}`);
      }

      // Recursively scan all .md files
      const files = await this.scanDirectory(CONTENT_ROOT, '.md');
      
      console.log(`📄 Found ${files.length} theory files`);

      for (const filePath of files) {
        try {
          // Read file content
          const absolutePath = path.join(CONTENT_ROOT, filePath);
          const content = await fs.readFile(absolutePath, 'utf-8');
          
          // Parse và validate
          const theoryFile = this.contentProcessor.parseMarkdownWithLatex(filePath, content);
          theoryFile.absolutePath = absolutePath;
          
          theoryFiles.push(theoryFile);
        } catch (error) {
          const errorMessage = `Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          this.buildProgress.errors.push(errorMessage);
          console.warn(`⚠️ ${errorMessage}`);
        }
      }

      if (theoryFiles.length === 0) {
        throw new Error('No valid theory files found');
      }

      console.log(`✅ Validated ${theoryFiles.length} theory files`);
      return theoryFiles;
    } catch (error) {
      throw new Error(`File scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pre-render tất cả content với mobile optimization
   */
  async preRenderAllContent(theoryFiles: TheoryFile[]): Promise<MobileTheoryContent[]> {
    const preRenderedContent: MobileTheoryContent[] = [];

    for (const file of theoryFiles) {
      try {
        console.log(`🔄 Processing: ${file.path}`);
        
        // Process content
        const renderedContent = await this.contentProcessor.processContent(file);
        
        // Mobile optimization
        const mobileResult = await this.mobileOptimizer.optimizeContent(renderedContent.html);
        
        // Extract searchable text
        const searchText = this.contentProcessor.extractSearchableText(renderedContent.html);
        
        // Build mobile theory content
        const mobileContent: MobileTheoryContent = {
          metadata: file.metadata,
          content: {
            html: renderedContent.html,
            mobileHtml: renderedContent.html, // Would be different after mobile optimization
            images: [], // Would be populated with actual responsive images
            searchText,
            latexExpressions: [] // Would be extracted from content
          },
          navigation: renderedContent.navigation,
          performance: {
            buildTime: renderedContent.performance.renderTime,
            fileSize: Buffer.byteLength(renderedContent.html, 'utf8'),
            mobileScore: mobileResult.mobileScore,
            renderTime: renderedContent.performance.renderTime
          },
          filePath: file.path,
          outputPath: file.path.replace('.md', '.html'),
          lastBuilt: new Date().toISOString()
        };

        preRenderedContent.push(mobileContent);
        this.buildProgress.processedFiles++;

        // Add any warnings
        if (renderedContent.errors.length > 0) {
          this.buildProgress.warnings.push(...renderedContent.errors);
        }
        
        if (mobileResult.warnings.length > 0) {
          this.buildProgress.warnings.push(...mobileResult.warnings);
        }

      } catch (error) {
        const errorMessage = `Failed to render ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        this.buildProgress.errors.push(errorMessage);
        console.error(`❌ ${errorMessage}`);
      }
    }

    console.log(`✅ Pre-rendered ${preRenderedContent.length} files`);
    return preRenderedContent;
  }

  /**
   * Get current build progress
   */
  getBuildProgress(): BuildProgress {
    return { ...this.buildProgress };
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Recursively scan directory for files với extension
   */
  private async scanDirectory(dir: string, extension: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(CONTENT_ROOT, fullPath);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.scanDirectory(fullPath, extension);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          files.push(relativePath);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * Save all output files
   */
  private async saveAllOutput(preRenderedContent: MobileTheoryContent[], searchIndex: PreBuiltIndexes): Promise<void> {
    // Ensure output directories exist
    await fs.mkdir(OUTPUT_ROOT, { recursive: true });
    await fs.mkdir(IMAGES_ROOT, { recursive: true });

    // Save individual content files
    for (const content of preRenderedContent) {
      const outputPath = path.join(OUTPUT_ROOT, content.outputPath);
      const outputDir = path.dirname(outputPath);
      
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(outputPath, content.content.html, 'utf-8');
    }

    // Save search index
    const searchIndexPath = path.join(OUTPUT_ROOT, 'search-index.json');
    await fs.writeFile(searchIndexPath, JSON.stringify(searchIndex, null, 2), 'utf-8');

    // Save navigation tree
    const navTreePath = path.join(OUTPUT_ROOT, 'navigation-tree.json');
    await fs.writeFile(navTreePath, JSON.stringify(searchIndex.navigationTree, null, 2), 'utf-8');

    console.log(`💾 Saved ${preRenderedContent.length} content files and search index`);
  }

  /**
   * Calculate total output size
   */
  private async calculateOutputSize(): Promise<number> {
    try {
      const stats = await fs.stat(OUTPUT_ROOT);
      return stats.size;
    } catch {
      return 0;
    }
  }
}
