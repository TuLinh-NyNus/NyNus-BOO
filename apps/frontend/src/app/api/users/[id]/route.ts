/**
 * User Detail API Routes
 * 
 * GET /api/users/[id] - Lấy thông tin chi tiết user
 * PUT /api/users/[id] - Cập nhật thông tin user
 * DELETE /api/users/[id] - Xóa user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Lấy thông tin chi tiết user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        bio: true,
        phone: true,
        address: true,
        school: true,
        dateOfBirth: true,
        gender: true,
        role: true,
        level: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            examAttempts: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy user',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi lấy thông tin user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Cập nhật thông tin user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      username,
      bio,
      phone,
      address,
      school,
      dateOfBirth,
      gender,
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy user',
        },
        { status: 404 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        firstName,
        lastName,
        username,
        bio,
        phone,
        address,
        school,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        phone: true,
        address: true,
        school: true,
        dateOfBirth: true,
        gender: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật user thành công',
      data: { user },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi cập nhật user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Xóa user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy user',
        },
        { status: 404 }
      );
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa user thành công',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi xóa user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

