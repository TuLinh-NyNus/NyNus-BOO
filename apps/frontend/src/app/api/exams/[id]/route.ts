/**
 * Exam Detail API Routes
 * 
 * GET /api/exams/[id] - Lấy thông tin chi tiết đề thi
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/exams/[id] - Lấy thông tin chi tiết đề thi
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: {
        id: params.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                difficulty: true,
                answers: true,
                // Don't return correctAnswer for security
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            examAttempts: true,
            examFeedback: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy đề thi',
        },
        { status: 404 }
      );
    }

    // Calculate total points
    const totalPoints = exam.examQuestions.reduce(
      (sum, eq) => sum + eq.points,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        exam: {
          ...exam,
          totalPoints,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi lấy thông tin đề thi',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

