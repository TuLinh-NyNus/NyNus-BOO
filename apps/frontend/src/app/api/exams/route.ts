/**
 * Exams API Routes
 * 
 * GET /api/exams - Lấy danh sách đề thi với filtering
 * POST /api/exams - Tạo đề thi mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/exams - Lấy danh sách đề thi
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Filters
    const examType = searchParams.get('examType');
    const status = searchParams.get('status') || 'ACTIVE';
    const difficulty = searchParams.get('difficulty');
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (examType) where.examType = examType;
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    if (grade) where.grade = parseInt(grade);
    if (subject) where.subject = subject;
    
    // Text search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get exams with pagination
    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          durationMinutes: true,
          totalPoints: true,
          passPercentage: true,
          examType: true,
          status: true,
          difficulty: true,
          grade: true,
          subject: true,
          chapter: true,
          examYear: true,
          sourceInstitution: true,
          publishedAt: true,
          createdAt: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              examQuestions: true,
              examAttempts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.exam.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        exams,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi lấy danh sách đề thi',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/exams - Tạo đề thi mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      instructions,
      durationMinutes = 60,
      passPercentage = 60,
      examType = 'generated',
      difficulty = 'MEDIUM',
      grade,
      subject,
      chapter,
      questionIds = [],
      createdBy,
    } = body;

    // Validate required fields
    if (!title || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          message: 'Thiếu thông tin bắt buộc (title, createdBy)',
        },
        { status: 400 }
      );
    }

    // Validate questions exist
    if (questionIds.length > 0) {
      const questions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          status: 'ACTIVE',
        },
      });

      if (questions.length !== questionIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: 'Một số câu hỏi không tồn tại hoặc không active',
          },
          { status: 400 }
        );
      }
    }

    // Create exam with questions in a transaction
    const exam = await prisma.$transaction(async (tx) => {
      // Create exam
      const newExam = await tx.exam.create({
        data: {
          id: crypto.randomUUID(),
          title,
          description,
          instructions,
          durationMinutes,
          passPercentage,
          examType,
          difficulty,
          grade: grade ? parseInt(grade) : undefined,
          subject,
          chapter,
          status: 'PENDING',
          createdBy,
        },
      });

      // Add questions to exam
      if (questionIds.length > 0) {
        await tx.examQuestion.createMany({
          data: questionIds.map((questionId: string, index: number) => ({
            id: crypto.randomUUID(),
            examId: newExam.id,
            questionId,
            order: index + 1,
            points: 5, // Default 5 points per question
          })),
        });
      }

      // Get exam with questions
      return await tx.exam.findUnique({
        where: { id: newExam.id },
        include: {
          examQuestions: {
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
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo đề thi thành công',
        data: { exam },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi tạo đề thi',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

