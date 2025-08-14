/**
 * Theory Content Page Component
 * Renders different types of theory content pages
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, BookOpen, ChevronRight, Eye } from 'lucide-react';
import { LatexToReact } from '@/lib/theory/latex-to-react';
import type { ParsedLatexFile } from '@/lib/theory/latex-parser';
import type { FileInfo } from '@/lib/theory/file-operations';

interface TheoryContentPageProps {
  pageData: PageData;
  slug: string[];
}

type PageData = 
  | {
      type: 'file';
      title: string;
      description: string;
      content: ParsedLatexFile;
      file: FileInfo;
      relatedFiles: FileInfo[];
    }
  | {
      type: 'chapter';
      title: string;
      description: string;
      files: FileInfo[];
      grade: string;
      chapter: string;
    }
  | {
      type: 'grade';
      title: string;
      description: string;
      chapters: Array<{
        name: string;
        files: FileInfo[];
        slug: string;
      }>;
      grade: string;
    };

/**
 * Theory Content Page Component
 * Renders content based on page type
 */
export function TheoryContentPage({ pageData, slug }: TheoryContentPageProps) {
  switch (pageData.type) {
    case 'file':
      return <FileContentPage data={pageData} slug={slug} />;
    case 'chapter':
      return <ChapterOverviewPage data={pageData} slug={slug} />;
    case 'grade':
      return <GradeOverviewPage data={pageData} slug={slug} />;
    default:
      return <div>Không tìm thấy nội dung</div>;
  }
}

/**
 * File Content Page
 * Renders specific LaTeX file content
 */
function FileContentPage({ data, slug }: { data: Extract<PageData, { type: 'file' }>; slug: string[] }) {
  const { content, relatedFiles } = data;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Content Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>~{content.estimatedReadingTime} phút đọc</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{content.wordCount} từ</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{content.sections.length} phần</span>
          </div>
        </div>
      </div>

      {/* LaTeX Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <LatexToReact content={content.rawContent} />
      </div>

      {/* Related Content */}
      {relatedFiles.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-6">Bài học liên quan</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedFiles.map((file, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {file.fileName.replace('.tex', '')}
                  </CardTitle>
                  <CardDescription>
                    {file.chapter} - {file.grade}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    href={`/theory/${slug[0]}/${slug[1]}/${file.fileName.replace('.tex', '').toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Xem bài học
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Chapter Overview Page
 * Lists all files in a chapter
 */
function ChapterOverviewPage({ data, slug }: { data: Extract<PageData, { type: 'chapter' }>; slug: string[] }) {
  const { title, files, grade } = data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground">
          {files.length} bài học trong {title} - {grade}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {files.map((file, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {file.fileName.replace('.tex', '')}
                  </CardTitle>
                  <CardDescription>
                    {file.chapter} - {file.grade}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <FileText className="h-3 w-3 mr-1" />
                  LaTeX
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/theory/${slug[0]}/${slug[1]}/${file.fileName.replace('.tex', '').toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Xem bài học
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Grade Overview Page
 * Lists all chapters in a grade
 */
function GradeOverviewPage({ data, slug }: { data: Extract<PageData, { type: 'grade' }>; slug: string[] }) {
  const { title, chapters } = data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground">
          {chapters.length} chương học với tổng cộng {chapters.reduce((sum, ch) => sum + ch.files.length, 0)} bài học
        </p>
      </div>

      <div className="space-y-6">
        {chapters.map((chapter, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{chapter.name}</CardTitle>
                  <CardDescription>
                    {chapter.files.length} bài học
                  </CardDescription>
                </div>
                <Link href={`/theory/${slug[0]}/${chapter.slug}`}>
                  <Button variant="outline">
                    Xem chương
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {chapter.files.slice(0, 6).map((file, fileIndex) => (
                  <Link
                    key={fileIndex}
                    href={`/theory/${slug[0]}/${chapter.slug}/${file.fileName.replace('.tex', '').toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-sm"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{file.fileName.replace('.tex', '')}</span>
                  </Link>
                ))}
                {chapter.files.length > 6 && (
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <span>+{chapter.files.length - 6} bài học khác</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
