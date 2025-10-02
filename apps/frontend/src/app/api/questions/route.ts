/**
 * Questions API Routes
 * 
 * GET /api/questions - Lấy danh sách câu hỏi với filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/questions - Lấy danh sách câu hỏi
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Filters
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status') || 'ACTIVE';
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');
    const search = searchParams.get('search');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (grade) where.grade = grade;
    if (subject) where.subject = subject;
    if (chapter) where.chapter = chapter;
    
    // Text search in content
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { rawContent: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get questions with pagination
    const [questions, total] = await Promise.all([
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
          usageCount: true,
          tag: true,
          createdAt: true,
          // Don't return answers and correctAnswer for security
        },
        orderBy: [
          { usageCount: 'asc' }, // Ưu tiên câu hỏi ít được dùng
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi lấy danh sách câu hỏi',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/questions - Tạo câu hỏi mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content,
      rawContent,
      type,
      difficulty = 'MEDIUM',
      grade,
      subject,
      chapter,
      level,
      answers,
      correctAnswer,
      solution,
      tag = [],
    } = body;

    // Validate required fields
    if (!content || !rawContent || !type) {
      return NextResponse.json(
        {
          success: false,
          message: 'Thiếu thông tin bắt buộc (content, rawContent, type)',
        },
        { status: 400 }
      );
    }

    // Generate question code ID (simplified - should use proper logic)
    const questionCodeId = `Q${Date.now().toString().slice(-6)}`;

    // Create question
    const question = await prisma.question.create({
      data: {
        id: crypto.randomUUID(),
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
        questionCodeId,
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
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Tạo câu hỏi thành công',
        data: { question },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi tạo câu hỏi',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

