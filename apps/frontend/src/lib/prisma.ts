/**
 * Prisma Client Instance for NyNus Exam Bank System
 * 
 * This file creates a singleton instance of Prisma Client to prevent
 * multiple instances in development (hot reload) and production.
 * 
 * Usage:
 * ```typescript
 * import { prisma } from '@/lib/prisma';
 * 
 * const users = await prisma.user.findMany();
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

