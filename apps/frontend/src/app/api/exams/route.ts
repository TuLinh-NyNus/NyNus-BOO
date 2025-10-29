/**
 * Exams API Routes
 * =================================================
 * ⚠️ DEPRECATION WARNING - DUAL DATABASE ACCESS ANTI-PATTERN
 *
 * This API route uses Prisma ORM for direct database access.
 * This creates a security risk and architectural anti-pattern.
 *
 * TODO: Migrate to gRPC services
 * - Backend (Go) should handle all database operations
 * - Frontend should call gRPC services, not database directly
 * - Migration guide: docs/database/PGADMIN_SETUP.md
 *
 * Current implementation (TEMPORARY):
 * GET /api/exams - Lấy danh sách đề thi với filtering
 * POST /api/exams - Tạo đề thi mới
 *
 * Target implementation (FUTURE):
 * - Use gRPC ExamService from Backend
 * - Remove Prisma imports
 * - Remove direct database access
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
import { createExamSchema, examQuerySchema, formatZodErrors } from '@/lib/validation/schemas';

// GET /api/exams - Lấy danh sách đề thi
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters với Zod
    const queryValidation = examQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      subject: searchParams.get('subject'),
      grade: searchParams.get('grade'),
      difficulty: searchParams.get('difficulty'),
      search: searchParams.get('search'),
    });

    if (!queryValidation.success) {
      const { errors, failedFields } = formatZodErrors(queryValidation.error);
      return validationErrorResponse('Query parameters không hợp lệ', {
        errors,
        failedFields,
      });
    }

    const { page, limit, status, subject, grade, difficulty, search } = queryValidation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {}; // Use any for flexibility with Prisma types

    if (status) where.status = status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'ARCHIVED';
    if (difficulty) where.difficulty = difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    if (grade) where.grade = parseInt(grade);
    if (subject) where.subject = subject;

    // Text search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get exams with pagination using error handler
    const [exams, total] = await executePrismaOperation(() =>
      Promise.all([
        prisma.exams.findMany({
          where,
          select: {
            id: true,
            title: true,
            description: true,
            duration_minutes: true,
            total_points: true,
            pass_percentage: true,
            exam_type: true,
            status: true,
            difficulty: true,
            grade: true,
            subject: true,
            chapter: true,
            exam_year: true,
            source_institution: true,
            published_at: true,
            created_at: true,
            users_exams_created_byTousers: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
            _count: {
              select: {
                exam_questions: true,
                exam_attempts: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.exams.count({ where }),
      ])
    );

    const pagination = calculatePagination(page, limit, total);
    return successResponseWithPagination(exams, pagination);
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi lấy danh sách đề thi',
    });
  }
}

// POST /api/exams - Tạo đề thi mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body với Zod
    const validation = createExamSchema.safeParse(body);

    if (!validation.success) {
      const { errors, failedFields } = formatZodErrors(validation.error);
      return validationErrorResponse('Dữ liệu không hợp lệ', {
        errors,
        failedFields,
      });
    }

    const {
      title,
      description,
      instructions,
      durationMinutes,
      passPercentage,
      totalPoints,
      examType,
      status,
      subject,
      grade,
      difficulty,
      tags,
      shuffleQuestions,
      showResults,
      maxAttempts,
      questionIds,
    } = validation.data;

    // Validate questions exist if provided
    if (questionIds.length > 0) {
      const questions = await executePrismaOperation(() =>
        prisma.question.findMany({
          where: {
            id: { in: questionIds },
            status: 'ACTIVE',
          },
        })
      );

      if (questions.length !== questionIds.length) {
        return validationErrorResponse('Một số câu hỏi không tồn tại hoặc không active', {
          providedCount: questionIds.length,
          foundCount: questions.length,
        });
      }
    }

    // Create exam with questions in a transaction using error handler
    const exam = await executePrismaOperation(() =>
      prisma.$transaction(async (tx: any) => {
        // Create exam
        const newExam = await tx.exams.create({
          data: {
            id: crypto.randomUUID(),
            title,
            description,
            instructions,
            duration_minutes: durationMinutes,
            total_points: totalPoints,
            pass_percentage: passPercentage,
            exam_type: examType,
            difficulty,
            grade: grade ? parseInt(grade) : undefined,
            subject,
            status,
            tags,
            shuffle_questions: shuffleQuestions,
            show_results: showResults,
            max_attempts: maxAttempts,
            created_by: crypto.randomUUID(), // TODO: Get from auth session
          },
        });

        // Add questions to exam
        if (questionIds.length > 0) {
          await tx.exam_questions.createMany({
            data: questionIds.map((questionId: string, index: number) => ({
              id: crypto.randomUUID(),
              exam_id: newExam.id,
              question_id: questionId,
              order_number: index + 1,
              points: 5, // Default 5 points per question
            })),
          });
        }

        // Get exam with questions
        return await tx.exams.findUnique({
          where: { id: newExam.id },
          include: {
            exam_questions: {
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    type: true,
                    difficulty: true,
                  },
                },
              },
            },
          },
        });
      })
    );

    return createdResponse({ exam }, 'Tạo đề thi thành công');
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi tạo đề thi',
    });
  }
}

