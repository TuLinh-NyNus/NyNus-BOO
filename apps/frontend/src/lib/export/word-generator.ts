/**
 * Word Generator for Question Export
 * 
 * Uses docx library to generate professional .docx files
 * Design matches the NyNus theme system (clean, organized layout)
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { Question, QuestionType } from '@/types/question';

export interface ExportOptions {
  title?: string;
  showSolutions?: boolean;
  showMetadata?: boolean;
}

/**
 * Strip HTML tags from content (basic sanitization)
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Get answer option label (A, B, C, D for MC; 1, 2, 3 for others)
 */
function getAnswerLabel(index: number, type: QuestionType): string {
  if (type === 'MULTIPLE_CHOICE') {
    return String.fromCharCode(65 + index); // A, B, C, D
  }
  return `${index + 1}`;
}

/**
 * Get difficulty display text (Vietnamese)
 */
function getDifficultyText(difficulty: string): string {
  const difficultyMap: Record<string, string> = {
    EASY: 'Dễ',
    MEDIUM: 'Trung bình',
    HARD: 'Khó',
  };
  return difficultyMap[difficulty] || difficulty;
}

/**
 * Get question type display text (Vietnamese)
 */
function getQuestionTypeText(type: QuestionType): string {
  const typeMap: Record<QuestionType, string> = {
    MC: 'Trắc nghiệm',
    MULTIPLE_CHOICE: 'Trắc nghiệm',
    TF: 'Đúng/Sai',
    SA: 'Trả lời ngắn',
    ES: 'Tự luận',
    MA: 'Nối đáp án',
  };
  return typeMap[type] || type;
}

/**
 * Create document header
 */
function createHeader(title: string, totalQuestions: number): Paragraph[] {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Tổng số câu hỏi: ${totalQuestions} | Ngày xuất: ${currentDate}`,
          size: 20, // 10pt
          color: '4A5568', // Medium gray
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      border: {
        bottom: {
          color: 'E8A0A4', // Pastel rose
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    }),
    new Paragraph({
      text: '',
      spacing: { after: 200 },
    }),
  ];
}

/**
 * Create question paragraph with metadata badges
 */
function createQuestionHeader(question: Question, index: number): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `Câu ${index + 1}`,
          bold: true,
          size: 28, // 14pt
          color: '1A1A2E', // Dark navy
        }),
        new TextRun({
          text: `  [ ${getQuestionTypeText(question.type)} | ${getDifficultyText(
            question.difficulty || 'EASY'
          )} ]`,
          size: 20, // 10pt
          color: '4A5568',
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
  ];
}

/**
 * Create question content paragraph
 */
function createQuestionContent(content: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: stripHtml(content),
        size: 24, // 12pt
        color: '1A1A2E',
      }),
    ],
    spacing: { after: 200 },
    shading: {
      type: ShadingType.CLEAR,
      fill: 'FDF2F8', // Very light pink background
    },
  });
}

/**
 * Create answers section
 */
function createAnswers(question: Question): Paragraph[] {
  if (!question.answers || question.answers.length === 0) {
    return [];
  }

  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: 'Các đáp án:',
          bold: true,
          size: 22, // 11pt
        }),
      ],
      spacing: { before: 100, after: 100 },
    }),
  ];

  question.answers.forEach((answer, idx) => {
    const label = getAnswerLabel(idx, question.type);
    const isCorrect = 'isCorrect' in answer ? answer.isCorrect : false;

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${label}. `,
            bold: true,
            size: 22,
            color: isCorrect ? '065F46' : '1A1A2E', // Green for correct, navy for others
          }),
          new TextRun({
            text: stripHtml('content' in answer ? answer.content : `${answer.left} - ${answer.right}`),
            size: 22,
            color: isCorrect ? '065F46' : '1A1A2E',
          }),
        ],
        spacing: { after: 100 },
        shading: {
          type: ShadingType.CLEAR,
          fill: isCorrect ? 'D1FAE5' : 'F6EADE', // Green 100 for correct, beige for others
        },
        indent: { left: convertInchesToTwip(0.3) },
      })
    );
  });

  return paragraphs;
}

/**
 * Create solution section
 */
function createSolution(solution: string): Paragraph[] {
  return [
    new Paragraph({
      text: '',
      spacing: { before: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Lời giải:',
          bold: true,
          size: 22,
          color: '1E3A8A', // Blue 800
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: stripHtml(solution),
          size: 20,
          color: '1E3A8A',
        }),
      ],
      spacing: { after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        fill: 'DBEAFE', // Blue 100
      },
      border: {
        left: {
          color: '3B82F6', // Blue 500
          space: 1,
          style: BorderStyle.SINGLE,
          size: 18, // 3pt thick
        },
      },
      indent: { left: convertInchesToTwip(0.2) },
    }),
  ];
}

/**
 * Create tags section
 */
function createTags(tags: string[]): Paragraph {
  const tagsText = tags.map((tag) => `#${tag}`).join('  ');
  
  return new Paragraph({
    children: [
      new TextRun({
        text: tagsText,
        size: 18, // 9pt
        color: '1A1A2E',
        italics: true,
      }),
    ],
    spacing: { before: 100, after: 200 },
  });
}

/**
 * Create document footer
 */
function createFooter(): Paragraph {
  return new Paragraph({
    text: 'NyNus - Hệ thống câu hỏi trắc nghiệm',
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    border: {
      top: {
        color: 'F9DDD2', // Light muted border
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

/**
 * Generate Word Document
 */
export async function generateWord(
  questions: Question[],
  options: ExportOptions = {},
  filename: string = 'questions.docx'
): Promise<void> {
  const { title = 'Bộ câu hỏi', showSolutions = true, showMetadata = true } = options;

  try {
    // Build document sections
    const sections: Paragraph[] = [];

    // Add header
    sections.push(...createHeader(title, questions.length));

    // Add questions
    questions.forEach((question, index) => {
      // Question header
      sections.push(...createQuestionHeader(question, index));

      // Question content
      sections.push(createQuestionContent(question.content));

      // Answers
      sections.push(...createAnswers(question));

      // Solution (if enabled)
      if (showSolutions && question.solution) {
        sections.push(...createSolution(question.solution));
      }

      // Tags (if enabled and available)
      if (showMetadata && question.tag && question.tag.length > 0) {
        sections.push(createTags(question.tag));
      }

      // Separator between questions
      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 300 },
          border: {
            bottom: {
              color: 'F9DDD2',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 3,
            },
          },
        })
      );
    });

    // Add footer
    sections.push(createFooter());

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children: sections,
        },
      ],
    });

    // Generate and download
    const { Packer } = await import('docx');
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Không thể tạo file Word. Vui lòng thử lại.');
  }
}

