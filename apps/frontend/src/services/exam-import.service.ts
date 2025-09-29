/**
 * Advanced Exam Import Service
 * Provides comprehensive import functionality for exams from multiple formats
 */

import { Question, ExamFormData, ExamStatus, ExamType } from '@/types/exam';
import { QuestionType, QuestionDifficulty, AnswerOption, CorrectAnswer } from '@/types/question';
import * as XLSX from 'xlsx';

// Type for Excel/CSV row data
type CellValue = string | number | boolean | Date | null | undefined;
type RowData = CellValue[];
type SheetData = RowData[];

export interface ImportOptions {
  format: 'excel' | 'csv' | 'json';
  validateData?: boolean;
  skipErrors?: boolean;
  defaultSubject?: string;
  defaultDuration?: number;
}

export interface ImportResult {
  success: boolean;
  exams: ExamFormData[];
  questions: Record<string, Question[]>; // examId -> questions
  errors: ImportError[];
  warnings: ImportWarning[];
  summary: ImportSummary;
}

export interface ImportError {
  type: 'validation' | 'format' | 'data';
  row?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportWarning {
  type: 'missing_data' | 'format_issue' | 'validation';
  row?: number;
  field?: string;
  message: string;
  suggestion?: string;
}

export interface ImportSummary {
  totalRows: number;
  successfulExams: number;
  failedExams: number;
  totalQuestions: number;
  skippedRows: number;
}

export class ExamImportService {
  /**
   * Import exams from file
   */
  static async importFromFile(
    file: File,
    options: ImportOptions
  ): Promise<ImportResult> {
    try {
      const fileContent = await this.readFile(file);
      
      switch (options.format) {
        case 'excel':
          return await this.importFromExcel(fileContent, options);
        case 'csv':
          return await this.importFromCSV(fileContent, options);
        case 'json':
          return await this.importFromJSON(fileContent, options);
        default:
          throw new Error(`Unsupported import format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        exams: [],
        questions: {},
        errors: [{
          type: 'format',
          message: error instanceof Error ? error.message : 'Import failed',
          severity: 'error'
        }],
        warnings: [],
        summary: {
          totalRows: 0,
          successfulExams: 0,
          failedExams: 0,
          totalQuestions: 0,
          skippedRows: 0
        }
      };
    }
  }

  /**
   * Import from Excel file
   */
  private static async importFromExcel(
    fileContent: ArrayBuffer,
    options: ImportOptions
  ): Promise<ImportResult> {
    const workbook = XLSX.read(fileContent, { type: 'array' });
    const result: ImportResult = {
      success: true,
      exams: [],
      questions: {},
      errors: [],
      warnings: [],
      summary: {
        totalRows: 0,
        successfulExams: 0,
        failedExams: 0,
        totalQuestions: 0,
        skippedRows: 0
      }
    };

    // Check for required sheets
    const examSheetName = this.findSheetByName(workbook, ['exams', 'đề thi', 'exam_info']);
    const questionSheetName = this.findSheetByName(workbook, ['questions', 'câu hỏi', 'question_data']);

    if (!examSheetName) {
      result.errors.push({
        type: 'format',
        message: 'Không tìm thấy sheet chứa thông tin đề thi',
        severity: 'error'
      });
      result.success = false;
      return result;
    }

    // Import exams
    const examSheet = workbook.Sheets[examSheetName];
    const examData = XLSX.utils.sheet_to_json(examSheet, { header: 1 }) as SheetData;
    
    if (examData.length < 2) {
      result.errors.push({
        type: 'data',
        message: 'Sheet đề thi không có dữ liệu',
        severity: 'error'
      });
      result.success = false;
      return result;
    }

    const examHeaders = examData[0];
    const examRows = examData.slice(1);
    result.summary.totalRows += examRows.length;

    // Map headers to expected fields
    const examFieldMap = this.createFieldMap(examHeaders, {
      'title': ['title', 'tiêu đề', 'tên đề thi', 'exam_title'],
      'subject': ['subject', 'môn học', 'subject_name'],
      'description': ['description', 'mô tả', 'desc'],
      'duration_minutes': ['duration', 'thời gian', 'duration_minutes', 'time'],
      'difficulty': ['difficulty', 'độ khó', 'level'],
      'status': ['status', 'trạng thái', 'state'],
      'exam_type': ['type', 'loại', 'exam_type'],
      'pass_percentage': ['pass_percentage', 'điểm đạt', 'passing_score']
    });

    // Process exam rows
    examRows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because of header and 0-based index
      
      try {
        const examData = this.extractExamData(row, examFieldMap, options);
        
        if (options.validateData) {
          const validation = this.validateExamData(examData);
          if (validation.errors.length > 0) {
            validation.errors.forEach(error => {
              result.errors.push({
                ...error,
                row: rowNumber
              });
            });
            
            if (!options.skipErrors) {
              result.summary.failedExams++;
              return;
            }
          }
          
          validation.warnings.forEach(warning => {
            result.warnings.push({
              ...warning,
              row: rowNumber
            });
          });
        }

        result.exams.push(examData);
        result.summary.successfulExams++;
        
      } catch (error) {
        result.errors.push({
          type: 'data',
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Lỗi xử lý dữ liệu',
          severity: 'error'
        });
        result.summary.failedExams++;
      }
    });

    // Import questions if sheet exists
    if (questionSheetName) {
      const questionResult = await this.importQuestionsFromSheet(
        workbook.Sheets[questionSheetName],
        result.exams,
        options
      );
      
      result.questions = questionResult.questions;
      result.errors.push(...questionResult.errors);
      result.warnings.push(...questionResult.warnings);
      result.summary.totalQuestions = questionResult.totalQuestions;
    }

    result.success = result.errors.filter(e => e.severity === 'error').length === 0;
    return result;
  }

  /**
   * Import from CSV file
   */
  private static async importFromCSV(
    fileContent: ArrayBuffer,
    options: ImportOptions
  ): Promise<ImportResult> {
    const text = new TextDecoder('utf-8').decode(fileContent);
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      return {
        success: false,
        exams: [],
        questions: {},
        errors: [{
          type: 'format',
          message: 'File CSV không có đủ dữ liệu',
          severity: 'error'
        }],
        warnings: [],
        summary: {
          totalRows: 0,
          successfulExams: 0,
          failedExams: 0,
          totalQuestions: 0,
          skippedRows: 0
        }
      };
    }

    // Parse CSV
    const headers = this.parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => this.parseCSVLine(line));

    // Convert to Excel-like format for processing
    const data = [headers, ...rows];
    
    // Create a mock workbook structure
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    return this.importFromExcel(
      XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }),
      options
    );
  }

  /**
   * Import from JSON file
   */
  private static async importFromJSON(
    fileContent: ArrayBuffer,
    options: ImportOptions
  ): Promise<ImportResult> {
    const text = new TextDecoder('utf-8').decode(fileContent);
    const data = JSON.parse(text);

    const result: ImportResult = {
      success: true,
      exams: [],
      questions: {},
      errors: [],
      warnings: [],
      summary: {
        totalRows: 0,
        successfulExams: 0,
        failedExams: 0,
        totalQuestions: 0,
        skippedRows: 0
      }
    };

    // Handle different JSON structures
    let examsData: unknown[] = [];
    let questionsData: Record<string, unknown[]> = {};

    if (Array.isArray(data)) {
      // Simple array of exams
      examsData = data;
    } else if (data.exams) {
      // Structured format with exams and questions
      examsData = data.exams;
      if (data.questions) {
        questionsData = data.questions;
      }
    } else if (data.exam && data.questions) {
      // Single exam format
      examsData = [data.exam];
      questionsData = { [data.exam.id || '0']: data.questions };
    }

    result.summary.totalRows = examsData.length;

    // Process exams
    examsData.forEach((examData, index) => {
      try {
        const processedExam = this.processJSONExamData(examData, options);
        
        if (options.validateData) {
          const validation = this.validateExamData(processedExam);
          if (validation.errors.length > 0) {
            validation.errors.forEach(error => {
              result.errors.push({
                ...error,
                row: index + 1
              });
            });
            
            if (!options.skipErrors) {
              result.summary.failedExams++;
              return;
            }
          }
        }

        result.exams.push(processedExam);
        result.summary.successfulExams++;

        // Process questions for this exam
        const examId = (examData as { id?: string }).id || index.toString();
        if (questionsData[examId]) {
          const questions = questionsData[examId].map((q: unknown) => this.processJSONQuestionData(q));
          result.questions[examId] = questions;
          result.summary.totalQuestions += questions.length;
        }

      } catch (error) {
        result.errors.push({
          type: 'data',
          row: index + 1,
          message: error instanceof Error ? error.message : 'Lỗi xử lý dữ liệu JSON',
          severity: 'error'
        });
        result.summary.failedExams++;
      }
    });

    result.success = result.errors.filter(e => e.severity === 'error').length === 0;
    return result;
  }

  /**
   * Import questions from Excel sheet
   */
  private static async importQuestionsFromSheet(
    sheet: XLSX.WorkSheet,
    exams: ExamFormData[],
    _options: ImportOptions
  ) {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as SheetData;
    const result = {
      questions: {} as Record<string, Question[]>,
      errors: [] as ImportError[],
      warnings: [] as ImportWarning[],
      totalQuestions: 0
    };

    if (data.length < 2) return result;

    const headers = data[0];
    const rows = data.slice(1);

    const fieldMap = this.createFieldMap(headers, {
      'exam_title': ['exam_title', 'tên đề thi', 'exam', 'đề thi'],
      'content': ['content', 'nội dung', 'question', 'câu hỏi'],
      'type': ['type', 'loại', 'question_type'],
      'difficulty': ['difficulty', 'độ khó', 'level'],
      'points': ['points', 'điểm', 'score'],
      'option_a': ['option_a', 'đáp án a', 'a'],
      'option_b': ['option_b', 'đáp án b', 'b'],
      'option_c': ['option_c', 'đáp án c', 'c'],
      'option_d': ['option_d', 'đáp án d', 'd'],
      'correct_answer': ['correct_answer', 'đáp án đúng', 'answer'],
      'explanation': ['explanation', 'giải thích', 'explain']
    });

    rows.forEach((row, index) => {
      try {
        const questionData = this.extractQuestionData(row, fieldMap);
        
        // Find corresponding exam
        const examTitle = questionData.exam_title;
        const exam = exams.find(e => e.title === examTitle);
        
        if (!exam) {
          result.warnings.push({
            type: 'missing_data',
            row: index + 2,
            message: `Không tìm thấy đề thi: ${examTitle}`,
            suggestion: 'Kiểm tra tên đề thi trong sheet câu hỏi'
          });
          return;
        }

        const examId = (exam as ExamFormData & { id?: string }).id || exams.indexOf(exam).toString();
        
        if (!result.questions[examId]) {
          result.questions[examId] = [];
        }

        const question: Question = {
          id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: String(questionData.content || ''),
          rawContent: String(questionData.content || ''),
          type: (questionData.type as QuestionType) || QuestionType.MULTIPLE_CHOICE,
          difficulty: (questionData.difficulty as QuestionDifficulty) || QuestionDifficulty.MEDIUM,
          points: questionData.points,
          answers: [
            { id: 'a', content: String(questionData.option_a || ''), isCorrect: false },
            { id: 'b', content: String(questionData.option_b || ''), isCorrect: false },
            { id: 'c', content: String(questionData.option_c || ''), isCorrect: false },
            { id: 'd', content: String(questionData.option_d || ''), isCorrect: false }
          ].filter(answer => answer.content.trim() !== ''),
          correctAnswer: String(questionData.correct_answer || '') as unknown as CorrectAnswer,
          explanation: String(questionData.explanation || ''),
          tag: [],
          questionCodeId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        result.questions[examId].push(question);
        result.totalQuestions++;

      } catch (error) {
        result.errors.push({
          type: 'data',
          row: index + 2,
          message: error instanceof Error ? error.message : 'Lỗi xử lý câu hỏi',
          severity: 'error'
        });
      }
    });

    return result;
  }

  // Helper methods
  private static readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private static findSheetByName(workbook: XLSX.WorkBook, possibleNames: string[]): string | null {
    const sheetNames = workbook.SheetNames.map(name => name.toLowerCase());
    
    for (const name of possibleNames) {
      const found = sheetNames.find(sheetName => 
        sheetName.includes(name.toLowerCase()) || name.toLowerCase().includes(sheetName)
      );
      if (found) {
        return workbook.SheetNames[sheetNames.indexOf(found)];
      }
    }
    
    return workbook.SheetNames[0] || null; // Return first sheet as fallback
  }

  private static createFieldMap(headers: CellValue[], fieldMappings: Record<string, string[]>): Record<string, number> {
    const map: Record<string, number> = {};
    
    Object.entries(fieldMappings).forEach(([field, possibleNames]) => {
      const headerIndex = headers.findIndex(header => {
        const headerStr = String(header).toLowerCase().trim();
        return possibleNames.some(name => 
          headerStr.includes(name.toLowerCase()) || name.toLowerCase().includes(headerStr)
        );
      });
      
      if (headerIndex !== -1) {
        map[field] = headerIndex;
      }
    });
    
    return map;
  }

  private static extractExamData(row: RowData, fieldMap: Record<string, number>, options: ImportOptions): ExamFormData {
    const getValue = (field: string, defaultValue: CellValue = '') => {
      const index = fieldMap[field];
      return index !== undefined ? (row[index] || defaultValue) : defaultValue;
    };

    const getStringValue = (field: string, defaultValue = ''): string => {
      const value = getValue(field, defaultValue);
      return String(value || defaultValue);
    };

    const tagsValue = getStringValue('tags', '');
    const tags = tagsValue ? tagsValue.split(',').filter((tag: string) => tag.trim()) : [];

    return {
      title: getStringValue('title'),
      subject: getStringValue('subject', options.defaultSubject || ''),
      description: getStringValue('description'),
      instructions: getStringValue('instructions', 'Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.'),
      durationMinutes: Number(getValue('duration_minutes', options.defaultDuration || 60)),
      totalPoints: Number(getValue('total_points', 100)),
      difficulty: getStringValue('difficulty', 'MEDIUM') as QuestionDifficulty,
      status: getStringValue('status', 'PENDING') as ExamStatus,
      examType: getStringValue('exam_type', 'GENERATED') as ExamType,
      passPercentage: Number(getValue('pass_percentage', 70)),
      maxAttempts: 3,
      shuffleQuestions: false,
      shuffleAnswers: false,
      showResults: true,
      allowReview: true,
      tags,
      questionIds: [],
      // createdAt: new Date().toISOString() // Not part of ExamFormData
    };
  }

  private static extractQuestionData(row: RowData, fieldMap: Record<string, number>) {
    const getValue = (field: string, defaultValue: CellValue = '') => {
      const index = fieldMap[field];
      return index !== undefined ? (row[index] || defaultValue) : defaultValue;
    };

    const getStringValue = (field: string, defaultValue = ''): string => {
      const value = getValue(field, defaultValue);
      return String(value || defaultValue);
    };

    return {
      exam_title: getStringValue('exam_title'),
      content: getStringValue('content'),
      type: getStringValue('type', 'MULTIPLE_CHOICE'),
      difficulty: getStringValue('difficulty', 'MEDIUM'),
      points: Number(getValue('points', 1)),
      option_a: getStringValue('option_a'),
      option_b: getStringValue('option_b'),
      option_c: getStringValue('option_c'),
      option_d: getStringValue('option_d'),
      correct_answer: getStringValue('correct_answer'),
      explanation: getStringValue('explanation')
    };
  }

  private static processJSONExamData(data: unknown, options: ImportOptions): ExamFormData {
    const examData = data as Record<string, unknown>;
    return {
      title: (examData.title as string) || '',
      subject: (examData.subject as string) || options.defaultSubject || '',
      description: (examData.description as string) || '',
      instructions: (examData.instructions as string) || 'Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.',
      durationMinutes: Number((examData.duration_minutes || examData.duration) || options.defaultDuration || 60),
      totalPoints: Number((examData.total_points || examData.totalPoints) || 100),
      difficulty: (examData.difficulty as QuestionDifficulty) || QuestionDifficulty.MEDIUM,
      status: (examData.status as ExamStatus) || ExamStatus.PENDING,
      examType: (examData.exam_type || examData.type) as ExamType || ExamType.GENERATED,
      passPercentage: Number(examData.pass_percentage || 70),
      maxAttempts: Number(examData.max_attempts || 3),
      shuffleQuestions: Boolean(examData.shuffle_questions),
      shuffleAnswers: Boolean(examData.shuffle_answers),
      showResults: Boolean(examData.show_results !== false),
      allowReview: Boolean(examData.allow_review !== false),
      tags: Array.isArray(examData.tags) ? examData.tags as string[] : (examData.tags as string || '').split(',').filter((tag: string) => tag.trim()),
      questionIds: Array.isArray(examData.questionIds) ? examData.questionIds as string[] : (Array.isArray(examData.question_ids) ? examData.question_ids as string[] : []),
      // createdAt: data.created_at || new Date().toISOString() // Not part of ExamFormData
    };
  }

  private static processJSONQuestionData(data: unknown): Question {
    const questionData = data as Record<string, unknown>;
    return {
      id: (questionData.id as string) || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: (questionData.content as string) || '',
      rawContent: (questionData.rawContent as string) || (questionData.content as string) || '',
      type: (questionData.type as QuestionType) || QuestionType.MULTIPLE_CHOICE,
      difficulty: (questionData.difficulty as QuestionDifficulty) || QuestionDifficulty.MEDIUM,
      points: Number(questionData.points || 1),
      answers: (questionData.options || questionData.answers || []) as AnswerOption[],
      correctAnswer: (questionData.correct_answer || questionData.correctAnswer) as CorrectAnswer,
      explanation: questionData.explanation as string,
      tag: (questionData.tag as string[]) || [],
      questionCodeId: (questionData.questionCodeId as string) || '',
      createdAt: (questionData.createdAt as string) || new Date().toISOString(),
      updatedAt: (questionData.updatedAt as string) || new Date().toISOString()
    };
  }

  private static validateExamData(examData: ExamFormData) {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    if (!examData.title?.trim()) {
      errors.push({
        type: 'validation',
        field: 'title',
        message: 'Tiêu đề đề thi không được để trống',
        severity: 'error'
      });
    }

    if (!examData.subject?.trim()) {
      warnings.push({
        type: 'missing_data',
        field: 'subject',
        message: 'Môn học không được chỉ định',
        suggestion: 'Nên chỉ định môn học cho đề thi'
      });
    }

    if (examData.durationMinutes < 5) {
      warnings.push({
        type: 'validation',
        field: 'duration_minutes',
        message: 'Thời gian thi có thể quá ngắn',
        suggestion: 'Nên đặt thời gian ít nhất 5 phút'
      });
    }

    return { errors, warnings };
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Generate import template
   */
  static generateImportTemplate(format: 'excel' | 'csv'): Blob {
    const examHeaders = [
      'Tiêu đề',
      'Môn học',
      'Mô tả',
      'Thời gian (phút)',
      'Độ khó',
      'Trạng thái',
      'Loại đề thi',
      'Điểm đạt (%)'
    ];

    const questionHeaders = [
      'Tên đề thi',
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

    if (format === 'excel') {
      const workbook = XLSX.utils.book_new();
      
      // Exam template sheet
      const examSheet = XLSX.utils.aoa_to_sheet([
        examHeaders,
        ['Đề thi mẫu', 'Toán học', 'Đề thi mẫu về đại số', '60', 'MEDIUM', 'PENDING', 'generated', '70']
      ]);
      XLSX.utils.book_append_sheet(workbook, examSheet, 'Đề thi');
      
      // Question template sheet
      const questionSheet = XLSX.utils.aoa_to_sheet([
        questionHeaders,
        ['Đề thi mẫu', 'Tìm nghiệm của phương trình x² - 4 = 0', 'MULTIPLE_CHOICE', 'MEDIUM', '2', 'x = ±2', 'x = 2', 'x = -2', 'x = 4', 'x = ±2', 'Sử dụng công thức nghiệm bậc hai']
      ]);
      XLSX.utils.book_append_sheet(workbook, questionSheet, 'Câu hỏi');
      
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      return new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } else {
      // CSV template
      const csvContent = [
        examHeaders.join(','),
        '"Đề thi mẫu","Toán học","Đề thi mẫu về đại số","60","MEDIUM","PENDING","generated","70"'
      ].join('\n');
      
      return new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    }
  }
}
