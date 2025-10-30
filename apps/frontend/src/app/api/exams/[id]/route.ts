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
    const exam = await prisma.exams.findUnique({
      where: {
        id: params.id,
      },
      include: {
        users_exams_created_byTousers: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        exam_questions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                difficulty: true,
                answers: true,
                // Don't return correct_answer for security
              },
            },
          },
          orderBy: {
            order_number: 'asc',
          },
        },
        _count: {
          select: {
            exam_attempts: true,
            exam_feedback: true,
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
    const totalPoints = exam.exam_questions.reduce(
      (sum: number, eq: any) => sum + (eq.points ?? 0),
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

