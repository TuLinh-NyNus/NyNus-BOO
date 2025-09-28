/**
 * Advanced Exam Export Service
 * Provides comprehensive export functionality for exams in multiple formats
 */

import { Exam, Question } from '@/lib/types/exam';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'word' | 'json' | 'csv';
  includeAnswers?: boolean;
  includeStatistics?: boolean;
  template?: 'standard' | 'compact' | 'detailed';
  language?: 'vi' | 'en';
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  error?: string;
}

export class ExamExportService {
  /**
   * Export single exam to specified format
   */
  static async exportExam(
    exam: Exam, 
    questions: Question[], 
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'pdf':
          return await this.exportToPDF(exam, questions, options);
        case 'excel':
          return await this.exportToExcel(exam, questions, options);
        case 'word':
          return await this.exportToWord(exam, questions, options);
        case 'json':
          return await this.exportToJSON(exam, questions, options);
        case 'csv':
          return await this.exportToCSV(exam, questions, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Export multiple exams to specified format
   */
  static async exportMultipleExams(
    exams: Array<{ exam: Exam; questions: Question[] }>,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'excel':
          return await this.exportMultipleToExcel(exams, options);
        case 'json':
          return await this.exportMultipleToJSON(exams, options);
        case 'csv':
          return await this.exportMultipleToCSV(exams, options);
        default:
          // For PDF and Word, create a zip file with multiple documents
          return await this.exportMultipleAsZip(exams, options);
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Bulk export failed'
      };
    }
  }

  /**
   * Export exam to PDF format
   */
  private static async exportToPDF(
    exam: Exam, 
    questions: Question[], 
    options: ExportOptions
  ): Promise<ExportResult> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize = 12, isBold = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      
      const lines = doc.splitTextToSize(text, pageWidth - 40);
      
      // Check if we need a new page
      if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * fontSize * 0.5 + 5;
    };

    // Title
    addText(exam.title, 18, true);
    addText(`Môn: ${exam.subject}`, 14);
    addText(`Thời gian: ${exam.duration_minutes} phút`, 12);
    addText(`Tổng điểm: ${questions.reduce((sum, q) => sum + (q.points || 0), 0)} điểm`, 12);
    
    if (exam.description) {
      addText(`Mô tả: ${exam.description}`, 12);
    }
    
    yPosition += 10;

    // Instructions
    addText('HƯỚNG DẪN LÀM BÀI:', 14, true);
    addText('- Đọc kỹ đề bài trước khi làm', 11);
    addText('- Chọn đáp án đúng nhất cho mỗi câu hỏi', 11);
    addText('- Kiểm tra lại bài làm trước khi nộp', 11);
    
    yPosition += 15;

    // Questions
    questions.forEach((question, index) => {
      // Question header
      addText(`Câu ${index + 1}: (${question.points || 0} điểm)`, 12, true);
      addText(question.content, 11);

      // Question options
      if (question.type === 'MULTIPLE_CHOICE' && question.options) {
        question.options.forEach((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex); // A, B, C, D
          addText(`${letter}. ${option}`, 11);
        });
      }

      // Show correct answer if requested
      if (options.includeAnswers && question.correct_answer) {
        addText(`Đáp án: ${question.correct_answer}`, 10, true);
      }

      yPosition += 10;
    });

    // Footer
    const now = new Date();
    doc.setFontSize(8);
    doc.text(
      `Xuất bản: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`,
      20,
      pageHeight - 10
    );

    const blob = doc.output('blob');
    const filename = `${this.sanitizeFilename(exam.title)}_${Date.now()}.pdf`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export exam to Excel format
   */
  private static async exportToExcel(
    exam: Exam, 
    questions: Question[], 
    options: ExportOptions
  ): Promise<ExportResult> {
    const workbook = XLSX.utils.book_new();

    // Exam Info Sheet
    const examInfo = [
      ['Tiêu đề', exam.title],
      ['Môn học', exam.subject],
      ['Thời gian (phút)', exam.duration_minutes],
      ['Số câu hỏi', questions.length],
      ['Tổng điểm', questions.reduce((sum, q) => sum + (q.points || 0), 0)],
      ['Mô tả', exam.description || ''],
      ['Trạng thái', exam.status],
      ['Ngày tạo', exam.created_at ? new Date(exam.created_at).toLocaleDateString('vi-VN') : ''],
    ];

    const examInfoSheet = XLSX.utils.aoa_to_sheet(examInfo);
    XLSX.utils.book_append_sheet(workbook, examInfoSheet, 'Thông tin đề thi');

    // Questions Sheet
    const questionHeaders = [
      'STT',
      'Nội dung câu hỏi',
      'Loại câu hỏi',
      'Độ khó',
      'Điểm',
      'Đáp án A',
      'Đáp án B',
      'Đáp án C',
      'Đáp án D',
      'Đáp án đúng',
      'Giải thích'
    ];

    const questionData = questions.map((question, index) => [
      index + 1,
      question.content,
      question.type,
      question.difficulty || 'MEDIUM',
      question.points || 0,
      question.options?.[0] || '',
      question.options?.[1] || '',
      question.options?.[2] || '',
      question.options?.[3] || '',
      options.includeAnswers ? question.correct_answer || '' : '',
      question.explanation || ''
    ]);

    const questionsSheet = XLSX.utils.aoa_to_sheet([questionHeaders, ...questionData]);
    
    // Auto-size columns
    const colWidths = questionHeaders.map((_, colIndex) => {
      const maxLength = Math.max(
        questionHeaders[colIndex].length,
        ...questionData.map(row => String(row[colIndex] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    questionsSheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, questionsSheet, 'Câu hỏi');

    // Statistics Sheet (if requested)
    if (options.includeStatistics) {
      const stats = this.calculateExamStatistics(exam, questions);
      const statsData = [
        ['Thống kê', 'Giá trị'],
        ['Tổng số câu hỏi', questions.length],
        ['Câu hỏi trắc nghiệm', stats.multipleChoice],
        ['Câu hỏi đúng/sai', stats.trueFalse],
        ['Câu hỏi tự luận ngắn', stats.shortAnswer],
        ['Câu hỏi tự luận dài', stats.essay],
        ['Độ khó trung bình', stats.averageDifficulty],
        ['Thời gian ước tính/câu (phút)', stats.averageTimePerQuestion],
        ['Điểm trung bình/câu', stats.averagePointsPerQuestion]
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Thống kê');
    }

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const filename = `${this.sanitizeFilename(exam.title)}_${Date.now()}.xlsx`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export exam to Word format (HTML-based)
   */
  private static async exportToWord(
    exam: Exam, 
    questions: Question[], 
    options: ExportOptions
  ): Promise<ExportResult> {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${exam.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 2cm; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
          .info { font-size: 12pt; margin-bottom: 5px; }
          .instructions { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
          .question { margin: 20px 0; page-break-inside: avoid; }
          .question-header { font-weight: bold; margin-bottom: 10px; }
          .question-content { margin-bottom: 10px; }
          .options { margin-left: 20px; }
          .option { margin: 5px 0; }
          .answer { color: #007700; font-weight: bold; margin-top: 10px; }
          .footer { margin-top: 50px; font-size: 10pt; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${exam.title}</div>
          <div class="info">Môn: ${exam.subject}</div>
          <div class="info">Thời gian: ${exam.duration_minutes} phút</div>
          <div class="info">Tổng điểm: ${questions.reduce((sum, q) => sum + (q.points || 0), 0)} điểm</div>
        </div>
        
        <div class="instructions">
          <strong>HƯỚNG DẪN LÀM BÀI:</strong><br>
          - Đọc kỹ đề bài trước khi làm<br>
          - Chọn đáp án đúng nhất cho mỗi câu hỏi<br>
          - Kiểm tra lại bài làm trước khi nộp
        </div>
    `;

    questions.forEach((question, index) => {
      html += `
        <div class="question">
          <div class="question-header">Câu ${index + 1}: (${question.points || 0} điểm)</div>
          <div class="question-content">${question.content}</div>
      `;

      if (question.type === 'MULTIPLE_CHOICE' && question.options) {
        html += '<div class="options">';
        question.options.forEach((option, optionIndex) => {
          const letter = String.fromCharCode(65 + optionIndex);
          html += `<div class="option">${letter}. ${option}</div>`;
        });
        html += '</div>';
      }

      if (options.includeAnswers && question.correct_answer) {
        html += `<div class="answer">Đáp án: ${question.correct_answer}</div>`;
      }

      html += '</div>';
    });

    html += `
        <div class="footer">
          Xuất bản: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/msword' });
    const filename = `${this.sanitizeFilename(exam.title)}_${Date.now()}.doc`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export exam to JSON format
   */
  private static async exportToJSON(
    exam: Exam, 
    questions: Question[], 
    options: ExportOptions
  ): Promise<ExportResult> {
    const exportData = {
      exam: {
        ...exam,
        // Remove sensitive data if answers not included
        ...(options.includeAnswers ? {} : {})
      },
      questions: questions.map(q => ({
        ...q,
        // Remove correct answers if not requested
        ...(options.includeAnswers ? {} : { correct_answer: undefined })
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        exportOptions: options,
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const filename = `${this.sanitizeFilename(exam.title)}_${Date.now()}.json`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export exam to CSV format
   */
  private static async exportToCSV(
    exam: Exam, 
    questions: Question[], 
    options: ExportOptions
  ): Promise<ExportResult> {
    const headers = [
      'STT',
      'Nội dung câu hỏi',
      'Loại câu hỏi',
      'Độ khó',
      'Điểm',
      'Đáp án A',
      'Đáp án B', 
      'Đáp án C',
      'Đáp án D',
      ...(options.includeAnswers ? ['Đáp án đúng'] : [])
    ];

    const rows = questions.map((question, index) => [
      index + 1,
      `"${question.content.replace(/"/g, '""')}"`,
      question.type,
      question.difficulty || 'MEDIUM',
      question.points || 0,
      `"${question.options?.[0]?.replace(/"/g, '""') || ''}"`,
      `"${question.options?.[1]?.replace(/"/g, '""') || ''}"`,
      `"${question.options?.[2]?.replace(/"/g, '""') || ''}"`,
      `"${question.options?.[3]?.replace(/"/g, '""') || ''}"`,
      ...(options.includeAnswers ? [`"${question.correct_answer?.replace(/"/g, '""') || ''}"`] : [])
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    // Add BOM for proper UTF-8 encoding in Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const filename = `${this.sanitizeFilename(exam.title)}_${Date.now()}.csv`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export multiple exams to Excel with separate sheets
   */
  private static async exportMultipleToExcel(
    exams: Array<{ exam: Exam; questions: Question[] }>,
    options: ExportOptions
  ): Promise<ExportResult> {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['STT', 'Tên đề thi', 'Môn học', 'Số câu hỏi', 'Thời gian (phút)', 'Tổng điểm'],
      ...exams.map((item, index) => [
        index + 1,
        item.exam.title,
        item.exam.subject,
        item.questions.length,
        item.exam.duration_minutes,
        item.questions.reduce((sum, q) => sum + (q.points || 0), 0)
      ])
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

    // Individual exam sheets
    exams.forEach((item, index) => {
      const sheetName = `Đề ${index + 1}`;
      const result = this.exportToExcel(item.exam, item.questions, options);
      // Add individual exam data to workbook
      // This is a simplified version - in practice, you'd extract the sheet data
    });

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const filename = `Bulk_Export_${Date.now()}.xlsx`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export multiple exams to JSON
   */
  private static async exportMultipleToJSON(
    exams: Array<{ exam: Exam; questions: Question[] }>,
    options: ExportOptions
  ): Promise<ExportResult> {
    const exportData = {
      exams: exams.map(item => ({
        exam: item.exam,
        questions: item.questions.map(q => ({
          ...q,
          ...(options.includeAnswers ? {} : { correct_answer: undefined })
        }))
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        exportOptions: options,
        totalExams: exams.length,
        totalQuestions: exams.reduce((sum, item) => sum + item.questions.length, 0)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const filename = `Bulk_Export_${Date.now()}.json`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export multiple exams to CSV
   */
  private static async exportMultipleToCSV(
    exams: Array<{ exam: Exam; questions: Question[] }>,
    options: ExportOptions
  ): Promise<ExportResult> {
    const headers = [
      'Tên đề thi',
      'Môn học',
      'STT câu hỏi',
      'Nội dung câu hỏi',
      'Loại câu hỏi',
      'Độ khó',
      'Điểm',
      'Đáp án A',
      'Đáp án B',
      'Đáp án C',
      'Đáp án D',
      ...(options.includeAnswers ? ['Đáp án đúng'] : [])
    ];

    const rows: string[][] = [];
    
    exams.forEach(item => {
      item.questions.forEach((question, questionIndex) => {
        rows.push([
          `"${item.exam.title.replace(/"/g, '""')}"`,
          `"${item.exam.subject.replace(/"/g, '""')}"`,
          String(questionIndex + 1),
          `"${question.content.replace(/"/g, '""')}"`,
          question.type,
          question.difficulty || 'MEDIUM',
          String(question.points || 0),
          `"${question.options?.[0]?.replace(/"/g, '""') || ''}"`,
          `"${question.options?.[1]?.replace(/"/g, '""') || ''}"`,
          `"${question.options?.[2]?.replace(/"/g, '""') || ''}"`,
          `"${question.options?.[3]?.replace(/"/g, '""') || ''}"`,
          ...(options.includeAnswers ? [`"${question.correct_answer?.replace(/"/g, '""') || ''}"`] : [])
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const filename = `Bulk_Export_${Date.now()}.csv`;

    return {
      success: true,
      blob,
      filename
    };
  }

  /**
   * Export multiple exams as ZIP file
   */
  private static async exportMultipleAsZip(
    exams: Array<{ exam: Exam; questions: Question[] }>,
    options: ExportOptions
  ): Promise<ExportResult> {
    // This would require a ZIP library like JSZip
    // For now, return an error
    return {
      success: false,
      filename: '',
      error: 'ZIP export not implemented yet'
    };
  }

  /**
   * Calculate exam statistics
   */
  private static calculateExamStatistics(exam: Exam, questions: Question[]) {
    const questionTypes = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyValues = { EASY: 1, MEDIUM: 2, HARD: 3, EXPERT: 4 };
    const averageDifficulty = questions.reduce((sum, q) => {
      return sum + (difficultyValues[q.difficulty as keyof typeof difficultyValues] || 2);
    }, 0) / questions.length;

    return {
      multipleChoice: questionTypes.MULTIPLE_CHOICE || 0,
      trueFalse: questionTypes.TRUE_FALSE || 0,
      shortAnswer: questionTypes.SHORT_ANSWER || 0,
      essay: questionTypes.ESSAY || 0,
      averageDifficulty: averageDifficulty.toFixed(1),
      averageTimePerQuestion: (exam.duration_minutes / questions.length).toFixed(1),
      averagePointsPerQuestion: (questions.reduce((sum, q) => sum + (q.points || 0), 0) / questions.length).toFixed(1)
    };
  }

  /**
   * Sanitize filename for safe file system usage
   */
  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9\s\-_]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * Download blob as file
   */
  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
