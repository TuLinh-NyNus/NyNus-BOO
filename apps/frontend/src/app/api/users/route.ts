/**
 * Users API Routes
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
 * GET /api/users - Lấy danh sách users với filtering
 * POST /api/users - Tạo user mới
 *
 * Target implementation (FUTURE):
 * - Use gRPC UserService from Backend
 * - Remove Prisma imports
 * - Remove direct database access
 */

import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { executePrismaOperation } from '@/lib/prisma/error-handler';
import {
  successResponseWithPagination,
  createdResponse,
  errorResponse,
  validationErrorResponse,
  conflictResponse,
  calculatePagination,
} from '@/lib/api/response-helper';
import { hashPassword } from '@/lib/auth/password';
import { createUserSchema, userQuerySchema, formatZodErrors } from '@/lib/validation/schemas';

// GET /api/users - Lấy danh sách users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query params với Zod
    const queryValidation = userQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      role: searchParams.get('role'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    });

    if (!queryValidation.success) {
      const { errors, failedFields } = formatZodErrors(queryValidation.error);
      return validationErrorResponse('Query parameters không hợp lệ', {
        errors,
        failedFields,
      });
    }

    const { page, limit, role, status, search } = queryValidation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      role?: string;
      status?: string;
      OR?: Array<{ email?: { contains: string }; first_name?: { contains: string }; last_name?: { contains: string } }>;
    } = {};

    if (role) where.role = role;
    if (status) where.status = status;

    // Add search filter
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { first_name: { contains: search } },
        { last_name: { contains: search } },
      ];
    }

    // Execute Prisma operation with error handling and retry logic
    const [users, total] = await executePrismaOperation(() =>
      Promise.all([
        prisma.users.findMany({
          where,
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            username: true,
            avatar: true,
            role: true,
            status: true,
            email_verified: true,
            last_login_at: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.users.count({ where }),
      ])
    );

    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total);

    return successResponseWithPagination(users, pagination);
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi lấy danh sách users',
    });
  }
}

// POST /api/users - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body với Zod
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      const { errors, failedFields } = formatZodErrors(validation.error);
      return validationErrorResponse('Dữ liệu không hợp lệ', {
        errors,
        failedFields,
      });
    }

    const { email, password, firstName, lastName, username, role, phone, avatar } = validation.data;

    // Check if email already exists
    const existingUser = await executePrismaOperation(() =>
      prisma.users.findUnique({
        where: { email },
      })
    );

    if (existingUser) {
      return conflictResponse('Email đã tồn tại', {
        field: 'email',
        value: email,
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await executePrismaOperation(() =>
        prisma.users.findFirst({
          where: { username },
        })
      );

      if (existingUsername) {
        return conflictResponse('Username đã tồn tại', {
          field: 'username',
          value: username,
        });
      }
    }

    // Hash password với bcrypt
    const passwordHash = await hashPassword(password);

    // Create user with error handling
    const user = await executePrismaOperation(() =>
      prisma.users.create({
        data: {
          id: randomUUID(),
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          username,
          phone,
          avatar,
          role,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          username: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          created_at: true,
        },
      })
    );

    return createdResponse(
      { user },
      'Tạo user thành công'
    );
  } catch (error) {
    return errorResponse({
      error,
      customMessage: 'Lỗi khi tạo user',
    });
  }
}

