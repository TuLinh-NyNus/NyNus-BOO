/**
 * File Operations for Theory Content
 * Handles reading and managing LaTeX files in the content directory
 */

import { parseLatexContent, type ParsedLatexFile } from './latex-parser';

// Re-export types for convenience
export type { ParsedLatexFile } from './latex-parser';

// Content directory structure
export const CONTENT_PATHS = {
  BASE: '/content',
  TOAN: '/content/TOÁN',
  LOP_10: '/content/TOÁN/LỚP 10',
  LOP_11: '/content/TOÁN/LỚP 11', 
  LOP_12: '/content/TOÁN/LỚP 12',
} as const;

export interface FileInfo {
  fileName: string;
  filePath: string;
  grade: string;
  subject: string;
  chapter?: string;
  lastModified?: Date;
  size?: number;
}

export interface DirectoryStructure {
  subjects: SubjectInfo[];
  totalFiles: number;
}

export interface SubjectInfo {
  name: string;
  path: string;
  grades: GradeInfo[];
}

export interface GradeInfo {
  name: string;
  path: string;
  files: FileInfo[];
  fileCount: number;
}

/**
 * Get all LaTeX files in the content directory
 */
export async function getAllLatexFiles(): Promise<FileInfo[]> {
  try {
    // Return only files that actually have content to avoid 404 errors during build
    const files: FileInfo[] = [];

    // Only include Chapter1-1.tex which has actual content
    files.push({
      fileName: 'Chapter1-1.tex',
      filePath: `${CONTENT_PATHS.LOP_10}/Chapter1-1.tex`,
      grade: 'LỚP 10',
      subject: 'TOÁN',
      chapter: 'Chapter 1',
      lastModified: new Date(),
      size: 1024
    });

    // TODO: Add more files as content becomes available
    // This prevents 404 errors during static generation

    return files;
  } catch (error) {
    console.error('Error getting LaTeX files:', error);
    return [];
  }
}

/**
 * Get files by grade
 */
export async function getFilesByGrade(grade: string): Promise<FileInfo[]> {
  const allFiles = await getAllLatexFiles();
  return allFiles.filter(file => file.grade === grade);
}

/**
 * Get files by chapter
 */
export async function getFilesByChapter(grade: string, chapter: string): Promise<FileInfo[]> {
  const gradeFiles = await getFilesByGrade(grade);
  return gradeFiles.filter(file => file.chapter === chapter);
}

/**
 * Read LaTeX content from file path
 */
export async function readLatexContent(filePath: string): Promise<string> {
  try {
    // In a real implementation, this would use fetch or fs.readFile
    // For now, simulate reading based on file path
    
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
			\\item Một mệnh đề không thể vừa đúng hoặc vừa \\textbf{sai}.
			\\item Những mệnh đề liên quan đến toán học được gọi là mệnh đề toán học.
		\\end{itemize} 
	\\end{boxkn}
	\\item [\\iconMT] \\indam{Mệnh đề chứa biến:} Mệnh đề chứa biến là một câu khẳng định chứa biến nhận giá trị trong một tập $X$ nào đó và với mỗi giá trị của biến thuộc $X$ ta được một mệnh đề.
\\end{itemize}

\\subsubsection{Mệnh đề phủ định}
\\begin{itemize}
	\\item [\\iconMT] Cho mệnh đề $P$. Mệnh đề \\lq\\lq không phải $P$ \\rq\\rq gọi là mệnh đề phủ định của $P$.
	\\item [\\iconMT] Chú ý: 
		\\begin{boxkn}
	\\begin{itemize}
		\\item  Mệnh đề phủ định của $P$, kí hiệu là $\\overline{P}$.
		\\item  Nếu $P$ đúng thì $\\overline{P}$ sai, nếu $P$ sai thì $\\overline{P}$ đúng.
	\\end{itemize}
	\\end{boxkn}
\\end{itemize}`;
    }
    
    // Return sample content for other files
    return `\\section{SAMPLE CHAPTER}
\\subsection{Sample Content}
This is sample content for ${filePath}.

\\begin{itemize}
	\\item [\\iconMT] Sample item with math: $x^2 + y^2 = z^2$
\\end{itemize}`;
    
  } catch (error) {
    console.error('Error reading LaTeX content:', error);
    throw new Error(`Failed to read file: ${filePath}`);
  }
}

/**
 * Get directory structure
 */
export async function getDirectoryStructure(): Promise<DirectoryStructure> {
  try {
    const allFiles = await getAllLatexFiles();
    
    // Group files by subject and grade
    const subjects: SubjectInfo[] = [
      {
        name: 'TOÁN',
        path: CONTENT_PATHS.TOAN,
        grades: [
          {
            name: 'LỚP 10',
            path: CONTENT_PATHS.LOP_10,
            files: allFiles.filter(f => f.grade === 'LỚP 10'),
            fileCount: allFiles.filter(f => f.grade === 'LỚP 10').length
          },
          {
            name: 'LỚP 11',
            path: CONTENT_PATHS.LOP_11,
            files: allFiles.filter(f => f.grade === 'LỚP 11'),
            fileCount: allFiles.filter(f => f.grade === 'LỚP 11').length
          },
          {
            name: 'LỚP 12',
            path: CONTENT_PATHS.LOP_12,
            files: allFiles.filter(f => f.grade === 'LỚP 12'),
            fileCount: allFiles.filter(f => f.grade === 'LỚP 12').length
          }
        ]
      }
    ];
    
    return {
      subjects,
      totalFiles: allFiles.length
    };
  } catch (error) {
    console.error('Error getting directory structure:', error);
    return { subjects: [], totalFiles: 0 };
  }
}

/**
 * Parse a file and return structured content
 */
export async function parseFileByPath(filePath: string): Promise<ParsedLatexFile> {
  const content = await readLatexContent(filePath);
  return parseLatexContent(content, filePath);
}

/**
 * Get file info by path
 */
export async function getFileInfo(filePath: string): Promise<FileInfo | null> {
  const allFiles = await getAllLatexFiles();
  return allFiles.find(file => file.filePath === filePath) || null;
}

/**
 * Search files by name or content
 */
export async function searchFiles(query: string): Promise<{
  files: FileInfo[];
  parsedFiles: ParsedLatexFile[];
}> {
  try {
    const allFiles = await getAllLatexFiles();
    const lowercaseQuery = query.toLowerCase();
    
    // Search by filename first
    const matchingFiles = allFiles.filter(file => 
      file.fileName.toLowerCase().includes(lowercaseQuery) ||
      file.chapter?.toLowerCase().includes(lowercaseQuery)
    );
    
    // Parse matching files to search content
    const parsedFiles: ParsedLatexFile[] = [];
    for (const file of matchingFiles.slice(0, 5)) { // Limit to 5 files for performance
      try {
        const parsed = await parseFileByPath(file.filePath);
        parsedFiles.push(parsed);
      } catch (error) {
        console.warn(`Failed to parse file ${file.filePath}:`, error);
      }
    }
    
    return {
      files: matchingFiles,
      parsedFiles
    };
  } catch (error) {
    console.error('Error searching files:', error);
    return { files: [], parsedFiles: [] };
  }
}

/**
 * Get chapter list for a grade
 */
export async function getChapterList(grade: string): Promise<string[]> {
  const files = await getFilesByGrade(grade);
  const chapters = new Set(files.map(file => file.chapter).filter((chapter): chapter is string => Boolean(chapter)));
  return Array.from(chapters).sort();
}

/**
 * Validate file path
 */
export function isValidLatexFile(filePath: string): boolean {
  return filePath.endsWith('.tex') && filePath.includes('/content/');
}

/**
 * Get relative path from content root
 */
export function getRelativePath(filePath: string): string {
  return filePath.replace('/content/', '');
}
