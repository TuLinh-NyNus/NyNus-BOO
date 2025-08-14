/**
 * LaTeX Parser for Theory Content
 * Parses LaTeX files and extracts structured content and metadata
 */

import { parseLatexToHtml, extractMetadata, extractTitle, type LatexMetadata } from './latex-commands';

export interface ParsedLatexFile {
  // File information
  fileName: string;
  filePath: string;
  
  // Content
  rawContent: string;
  htmlContent: string;
  
  // Metadata
  title: string;
  metadata: LatexMetadata;
  
  // Structure
  sections: LatexSection[];
  
  // Statistics
  wordCount: number;
  estimatedReadingTime: number; // in minutes
  
  // Timestamps
  parsedAt: Date;
}

export interface LatexSection {
  level: number; // 1 = section, 2 = subsection, 3 = subsubsection
  title: string;
  content: string;
  htmlContent: string;
  startLine: number;
  endLine: number;
}

// Interface for section being processed
interface SectionInProgress {
  level: number;
  title: string;
  content?: string;
  htmlContent?: string;
  startLine: number;
  endLine?: number;
}

/**
 * Parse a LaTeX file from file path
 */
export async function parseLatexFile(filePath: string): Promise<ParsedLatexFile> {
  try {
    // In a real implementation, this would read from file system
    // For now, we'll simulate with a placeholder
    const rawContent = await readFileContent(filePath);
    
    return parseLatexContent(rawContent, filePath);
  } catch (error) {
    console.error('Error parsing LaTeX file:', error);
    throw new Error(`Failed to parse LaTeX file: ${filePath}`);
  }
}

/**
 * Parse LaTeX content string
 */
export function parseLatexContent(content: string, filePath: string = ''): ParsedLatexFile {
  const fileName = filePath.split('/').pop() || 'unknown.tex';
  
  // Extract basic metadata
  const title = extractTitle(content);
  const metadata = extractMetadata(content);
  
  // Parse sections
  const sections = extractSections(content);
  
  // Generate HTML
  const htmlContent = parseLatexToHtml(content);
  
  // Calculate statistics
  const wordCount = calculateWordCount(content);
  const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute
  
  return {
    fileName,
    filePath,
    rawContent: content,
    htmlContent,
    title,
    metadata,
    sections,
    wordCount,
    estimatedReadingTime,
    parsedAt: new Date()
  };
}

/**
 * Extract sections from LaTeX content
 */
function extractSections(content: string): LatexSection[] {
  const sections: LatexSection[] = [];
  const lines = content.split('\n');
  
  // Regex patterns for different section levels
  const sectionPatterns = [
    { level: 1, pattern: /\\section\{([^}]+)\}/, prefix: '\\section{' },
    { level: 2, pattern: /\\subsection\{([^}]+)\}/, prefix: '\\subsection{' },
    { level: 3, pattern: /\\subsubsection\{([^}]+)\}/, prefix: '\\subsubsection{' }
  ];
  
  let currentSection: SectionInProgress | null = null;
  
  lines.forEach((line, index) => {
    // Check if this line starts a new section
    for (const { level, pattern } of sectionPatterns) {
      const match = line.match(pattern);
      if (match) {
        // Save previous section if exists
        if (currentSection) {
          const endLine = index - 1;
          const content = extractSectionContent(lines, currentSection.startLine, endLine);
          const htmlContent = parseLatexToHtml(content);

          sections.push({
            level: currentSection.level,
            title: currentSection.title,
            content,
            htmlContent,
            startLine: currentSection.startLine,
            endLine
          });
        }
        
        // Start new section
        currentSection = {
          level,
          title: match[1],
          startLine: index
        };
        break;
      }
    }
  });
  
  // Handle last section
  if (currentSection) {
    const section = currentSection as SectionInProgress;
    const endLine = lines.length - 1;
    const content = extractSectionContent(lines, section.startLine, endLine);
    const htmlContent = parseLatexToHtml(content);

    sections.push({
      level: section.level,
      title: section.title,
      content,
      htmlContent,
      startLine: section.startLine,
      endLine
    });
  }
  
  return sections;
}

/**
 * Extract content for a specific section
 */
function extractSectionContent(lines: string[], startLine: number, endLine: number): string {
  return lines.slice(startLine, endLine + 1).join('\n');
}

/**
 * Calculate word count from LaTeX content
 */
function calculateWordCount(content: string): number {
  // Remove LaTeX commands and count words
  const cleanContent = content
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove commands with arguments
    .replace(/\\[a-zA-Z]+/g, '') // Remove commands without arguments
    .replace(/\$[^$]*\$/g, '') // Remove inline math
    .replace(/\$\$[^$]*\$\$/g, '') // Remove display math
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return cleanContent.split(' ').filter(word => word.length > 0).length;
}

/**
 * Read file content (placeholder for actual file reading)
 */
async function readFileContent(filePath: string): Promise<string> {
  // In a real implementation, this would use fs.readFile or fetch
  // For now, return sample content based on file path
  
  if (filePath.includes('Chapter1-1.tex')) {
    return `\\section{MỆNH ĐỀ}

\\subsection{TÓM TẮT LÝ THUYẾT}
\\subsubsection{Mệnh đề, mệnh đề chứa biến}
\\begin{itemize}
	\\item [\\iconMT] \\indam{Mệnh đề:} Mệnh đề là một \\indamm{ câu khẳng định} đúng hoặc sai. 
	\\begin{boxkn}
		\\begin{itemize}
			\\item Câu khẳng định đúng gọi là mệnh đề đúng.
			\\item Câu khẳng định sai gọi là mệnh đề \\textbf{sai}.
		\\end{itemize} 
	\\end{boxkn}
	\\item [\\iconMT] \\indam{Mệnh đề chứa biến:} Mệnh đề chứa biến là một câu khẳng định chứa biến nhận giá trị trong một tập $X$ nào đó và với mỗi giá trị của biến thuộc $X$ ta được một mệnh đề.
\\end{itemize}

\\subsubsection{Mệnh đề phủ định}
\\begin{itemize}
	\\item [\\iconMT] Cho mệnh đề $P$. Mệnh đề \\lq\\lq không phải $P$ \\rq\\rq gọi là mệnh đề phủ định của $P$.
\\end{itemize}`;
  }
  
  throw new Error(`File not found: ${filePath}`);
}

/**
 * Get table of contents from parsed file
 */
export function generateTableOfContents(parsedFile: ParsedLatexFile): string {
  const toc = parsedFile.sections.map(section => {
    const indent = '  '.repeat(section.level - 1);
    return `${indent}- ${section.title}`;
  }).join('\n');
  
  return toc;
}

/**
 * Search within parsed content
 */
export function searchInContent(parsedFile: ParsedLatexFile, query: string): {
  sections: LatexSection[];
  matches: number;
} {
  const lowercaseQuery = query.toLowerCase();
  const matchingSections = parsedFile.sections.filter(section => 
    section.title.toLowerCase().includes(lowercaseQuery) ||
    section.content.toLowerCase().includes(lowercaseQuery)
  );
  
  return {
    sections: matchingSections,
    matches: matchingSections.length
  };
}
