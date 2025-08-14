/**
 * Theory Dynamic Pages
 * Dynamic routing cho theory content với static generation
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TheoryContentPage } from '@/components/theory/TheoryContentPage';
import { getAllLatexFiles, getFilesByGrade, getFilesByChapter } from '@/lib/theory/file-operations';
import { parseLatexContent } from '@/lib/theory/latex-parser';

/**
 * Convert Vietnamese grade name to English slug
 * Converts "LỚP 10" → "grade-10", "LỚP 11" → "grade-11", etc.
 */
function convertGradeToEnglishSlug(gradeName: string): string {
  const gradeNumber = gradeName.replace(/[^\d]/g, ''); // Extract number only
  return `grade-${gradeNumber}`;
}

interface TheoryPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

/**
 * Generate static params for all theory pages
 */
export async function generateStaticParams() {
  try {
    const allFiles = await getAllLatexFiles();
    const params: { slug: string[] }[] = [];

    // Generate params for all file paths
    allFiles.forEach(file => {
      const pathParts = file.filePath.split('/').filter(Boolean);
      
      if (pathParts.length >= 3) {
        // Extract grade, chapter, and file name
        const grade = pathParts[pathParts.length - 3];
        const chapter = pathParts[pathParts.length - 2];
        const fileName = pathParts[pathParts.length - 1].replace('.tex', '');

        // Convert to URL-friendly format
        const gradeSlug = convertGradeToEnglishSlug(grade);
        const chapterSlug = chapter.toLowerCase().replace(/\s+/g, '-');
        const fileSlug = fileName.toLowerCase().replace(/\s+/g, '-');

        // Add file-specific page
        params.push({
          slug: [gradeSlug, chapterSlug, fileSlug]
        });

        // Add chapter page
        if (!params.some(p => p.slug.length === 2 && p.slug[0] === gradeSlug && p.slug[1] === chapterSlug)) {
          params.push({
            slug: [gradeSlug, chapterSlug]
          });
        }

        // Add grade page
        if (!params.some(p => p.slug.length === 1 && p.slug[0] === gradeSlug)) {
          params.push({
            slug: [gradeSlug]
          });
        }
      }
    });

    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

/**
 * Generate metadata for theory pages
 */
export async function generateMetadata({ params }: TheoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const pageData = await getPageData(slug);
    
    if (!pageData) {
      return {
        title: 'Không tìm thấy trang - NyNus',
        description: 'Trang lý thuyết không tồn tại'
      };
    }

    const { title, description } = pageData;
    
    return {
      title: `${title} - Lý thuyết Toán - NyNus`,
      description: description || `Học ${title.toLowerCase()} với hệ thống LaTeX rendering và navigation thông minh`,
      keywords: ['toán học', 'lý thuyết', title.toLowerCase(), 'NyNus'],
      openGraph: {
        title: `${title} - Lý thuyết Toán`,
        description: description || `Học ${title.toLowerCase()} với NyNus`,
        type: 'article'
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Lý thuyết Toán - NyNus',
      description: 'Học lý thuyết toán học với NyNus'
    };
  }
}

/**
 * Theory Page Component
 */
export default async function TheoryPage({ params }: TheoryPageProps) {
  const { slug } = await params;
  
  try {
    const pageData = await getPageData(slug);
    
    if (!pageData) {
      notFound();
    }

    return <TheoryContentPage pageData={pageData} slug={slug} />;
  } catch (error) {
    console.error('Error loading theory page:', error);
    notFound();
  }
}

/**
 * Get page data based on slug
 */
async function getPageData(slug: string[]) {
  const [grade, chapter, file] = slug;

  if (!grade) {
    return null;
  }

  // Convert URL slugs back to original format
  let gradeOriginal: string;
  if (grade.startsWith('grade-')) {
    // Handle English grade slugs (grade-10 → LỚP 10)
    const gradeNumber = grade.replace('grade-', '');
    gradeOriginal = `LỚP ${gradeNumber}`;
  } else {
    // Handle Vietnamese slugs (lớp-10 → LỚP 10)
    gradeOriginal = grade.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const chapterOriginal = chapter ? chapter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null;

  if (file && chapter) {
    // Specific file page
    try {
      const files = await getFilesByChapter(gradeOriginal, chapterOriginal!);
      const targetFile = files.find(f => 
        f.fileName.replace('.tex', '').toLowerCase().replace(/\s+/g, '-') === file
      );

      if (!targetFile) {
        return null;
      }

      // Parse LaTeX content
      const content = await import('@/lib/theory/file-operations').then(mod => 
        mod.readLatexContent(targetFile.filePath)
      );
      const parsedContent = parseLatexContent(content, targetFile.filePath);

      return {
        type: 'file' as const,
        title: parsedContent.title || targetFile.fileName.replace('.tex', ''),
        description: `Học ${parsedContent.title || targetFile.fileName} - ${chapterOriginal} - ${gradeOriginal}`,
        content: parsedContent,
        file: targetFile,
        relatedFiles: files.filter(f => f.filePath !== targetFile.filePath).slice(0, 5)
      };
    } catch (error) {
      console.error('Error loading file content:', error);
      return null;
    }
  } else if (chapter) {
    // Chapter overview page
    try {
      const files = await getFilesByChapter(gradeOriginal, chapterOriginal!);
      
      return {
        type: 'chapter' as const,
        title: chapterOriginal!,
        description: `Danh sách bài học trong ${chapterOriginal} - ${gradeOriginal}`,
        files,
        grade: gradeOriginal,
        chapter: chapterOriginal!
      };
    } catch (error) {
      console.error('Error loading chapter files:', error);
      return null;
    }
  } else {
    // Grade overview page
    try {
      const files = await getFilesByGrade(gradeOriginal);
      
      // Group files by chapter
      const chapterMap = new Map<string, typeof files>();
      files.forEach(file => {
        if (file.chapter) {
          if (!chapterMap.has(file.chapter)) {
            chapterMap.set(file.chapter, []);
          }
          chapterMap.get(file.chapter)!.push(file);
        }
      });

      return {
        type: 'grade' as const,
        title: gradeOriginal,
        description: `Danh sách chương trong ${gradeOriginal}`,
        chapters: Array.from(chapterMap.entries()).map(([name, files]) => ({
          name,
          files,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        })),
        grade: gradeOriginal
      };
    } catch (error) {
      console.error('Error loading grade files:', error);
      return null;
    }
  }
}
