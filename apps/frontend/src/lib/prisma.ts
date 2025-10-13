/**
 * Prisma Client Instance for NyNus Exam Bank System
 * =================================================
 * ⚠️ USAGE RESTRICTION WARNING
 *
 * This Prisma Client should ONLY be used for:
 * - Database seeding (prisma/seed.ts and related scripts)
 * - Integration testing
 * - Development utilities
 *
 * ❌ DO NOT USE in production API routes!
 * ❌ DO NOT USE for business logic!
 * ❌ DO NOT USE in client-side code!
 *
 * Why restricted:
 * - Creates dual database access anti-pattern
 * - Bypasses backend security layers (Go + gRPC)
 * - Direct database access from frontend is security risk
 * - Backend uses Go with raw SQL, not Prisma ORM
 *
 * For production API routes, use gRPC services instead:
 * - Import from '@/services/grpc/...'
 * - All database operations should go through Backend (Go)
 *
 * Migration guide: docs/database/PGADMIN_SETUP.md
 * Database management: Use pgAdmin 4 (.\scripts\pgadmin.ps1 start)
 *
 * This file creates a singleton instance of Prisma Client to prevent
 * multiple instances in development (hot reload) and production.
 *
 * Allowed usage example:
 * ```typescript
 * // ✅ ALLOWED: In seed scripts
 * import { prisma } from '@/lib/prisma';
 * await prisma.users.create({ data: seedData });
 *
 * // ❌ FORBIDDEN: In API routes
 * // Use gRPC services instead!
 * ```
 */

// Changed from '../../generated/prisma' to '@prisma/client' to fix Windows MAX_PATH / EPERM errors
// See: https://github.com/vercel/next.js/discussions/62281
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

