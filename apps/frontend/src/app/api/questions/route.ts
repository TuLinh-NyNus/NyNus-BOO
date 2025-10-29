/**
 * Questions API Routes
 *
 * GET /api/questions - Lấy danh sách câu hỏi với filtering
 * POST /api/questions - Tạo câu hỏi mới
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { executePrismaOperation } from '@/lib/prisma/error-handler';
import {
  successResponseWithPagination,
  createdResponse,
  errorResponse,
  validationErrorResponse,
  calculatePagination,
} from '@/lib/api/response-helper';
import { createQuestionSchema, questionQuerySchema, formatZodErrors } from '@/lib/validation/schemas';

// GET /api/questions - Lấy danh sách câu hỏi
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters với Zod
    const queryValidation = questionQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      type: searchParams.get('type'),
      difficulty: searchParams.get('difficulty'),
      status: searchParams.get('status'),
      grade: searchParams.get('grade'),
      subject: searchParams.get('subject'),
      chapter: searchParams.get('chapter'),
      search: searchParams.get('search'),
    });

    if (!queryValidation.success) {
      const { errors, failedFields } = formatZodErrors(queryValidation.error);
      return validationErrorResponse('Query parameters không hợp lệ', {
        errors,
        failedFields,
      });
    }

    const { page, limit, type, difficulty, status, grade, subject, chapter, search } = queryValidation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {}; // Use any for flexibility with Prisma types

    if (type) where.type = type as 'MC' | 'TF' | 'SA' | 'ES' | 'MA';
    if (difficulty) where.difficulty = difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    if (status) where.status = status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'ARCHIVED';
    if (grade) where.grade = grade;
    if (subject) where.subject = subject;
    if (chapter) where.chapter = chapter;

    // Text search in content
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { raw_content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get questions with pagination using error handler
    const [questions, total] = await executePrismaOperation(() =>
      Promise.all([
        prisma.question.findMany({
          where,
          select: {
            id: true,
            content: true,
            type: true,
            difficulty: true,
            grade: true,
            subject: true,
            chapter: true,
            level: true,
            status: true,
            usage_count: true,
            tag: true,
            created_at: true,
            // Don't return answers and correct_answer for security
          },
          orderBy: [
            { usage_count: 'asc' }, // Ưu tiên câu hỏi ít được dùng
            { created_at: 'desc' },
          ],
          skip,
          take: limit,
        }),
        prisma.question.count({ where }),
      ])
    );

    const pagination = calculatePagination(page, limit, total);
    return successResponseWithPagination(questions, pagination);
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi lấy danh sách câu hỏi',
    });
  }
}

// POST /api/questions - Tạo câu hỏi mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body với Zod
    const validation = createQuestionSchema.safeParse(body);

    if (!validation.success) {
      const { errors, failedFields } = formatZodErrors(validation.error);
      return validationErrorResponse('Dữ liệu không hợp lệ', {
        errors,
        failedFields,
      });
    }

    const {
      content,
      rawContent,
      type,
      difficulty,
      grade,
      subject,
      chapter,
      level,
      answers,
      correctAnswer,
      solution,
      tag,
    } = validation.data;

    // Generate question code ID (simplified - should use proper logic)
    const questionCodeId = `Q${Date.now().toString().slice(-6)}`;

    // Create question using error handler
    const question = await executePrismaOperation(() =>
      prisma.question.create({
        data: {
          id: crypto.randomUUID(),
          content,
          raw_content: rawContent,
          type,
          difficulty,
          grade,
          subject,
          chapter,
          level,
          answers,
          correct_answer: correctAnswer,
          solution,
          tag,
          question_code_id: questionCodeId,
          status: 'ACTIVE',
          creator: 'ADMIN',
        },
        select: {
          id: true,
          content: true,
          type: true,
          difficulty: true,
          grade: true,
          subject: true,
          chapter: true,
          status: true,
          created_at: true,
        },
      })
    );

    return createdResponse({ question }, 'Tạo câu hỏi thành công');
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi tạo câu hỏi',
    });
  }
}

