/**
 * User Detail API Routes
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
 * GET /api/users/[id] - Lấy thông tin chi tiết user
 * PUT /api/users/[id] - Cập nhật thông tin user
 * DELETE /api/users/[id] - Xóa user
 *
 * Target implementation (FUTURE):
 * - Use gRPC UserService from Backend
 * - Remove Prisma imports
 * - Remove direct database access
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executePrismaOperation } from '@/lib/prisma/error-handler';
import {
  successResponse,
  noContentResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from '@/lib/api/response-helper';
import { updateUserSchema, formatZodErrors } from '@/lib/validation/schemas';

// GET /api/users/[id] - Lấy thông tin chi tiết user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await executePrismaOperation(() =>
      prisma.users.findUnique({
        where: {
          id: params.id,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          username: true,
          avatar: true,
          bio: true,
          phone: true,
          address: true,
          school: true,
          date_of_birth: true,
          gender: true,
          role: true,
          level: true,
          status: true,
          email_verified: true,
          last_login_at: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              exam_attempts: true,
              notifications: true,
            },
          },
        },
      })
    );

    if (!user) {
      return notFoundResponse('Không tìm thấy user');
    }

    return successResponse({ data: { user } });
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi lấy thông tin user',
    });
  }
}

// PUT /api/users/[id] - Cập nhật thông tin user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate request body với Zod
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      const { errors, failedFields } = formatZodErrors(validation.error);
      return validationErrorResponse('Dữ liệu không hợp lệ', {
        errors,
        failedFields,
      });
    }

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
    } = validation.data;

    // Check if user exists
    const existingUser = await executePrismaOperation(() =>
      prisma.users.findUnique({
        where: { id: params.id },
      })
    );

    if (!existingUser) {
      return notFoundResponse('Không tìm thấy user');
    }

    // Update user using error handler
    const user = await executePrismaOperation(() =>
      prisma.users.update({
        where: {
          id: params.id,
        },
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
          bio,
          phone,
          address,
          school,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          username: true,
          bio: true,
          phone: true,
          address: true,
          school: true,
          date_of_birth: true,
          gender: true,
          updated_at: true,
        },
      })
    );

    return successResponse({
      data: { user },
      message: 'Cập nhật user thành công',
    });
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi cập nhật user',
    });
  }
}

// DELETE /api/users/[id] - Xóa user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingUser = await executePrismaOperation(() =>
      prisma.users.findUnique({
        where: { id: params.id },
      })
    );

    if (!existingUser) {
      return notFoundResponse('Không tìm thấy user');
    }

    // Delete user (cascade will delete related records) using error handler
    await executePrismaOperation(() =>
      prisma.users.delete({
        where: {
          id: params.id,
        },
      })
    );

    return noContentResponse();
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi xóa user',
    });
  }
}

