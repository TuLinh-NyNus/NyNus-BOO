import { z } from 'zod';

/**
 * Environment Variables Schema
 * Validates all required environment variables at runtime
 * 
 * Throws error if any required variable is missing or invalid
 */
const envSchema = z.object({
  // Public Environment Variables (accessible in browser)
  NEXT_PUBLIC_GRPC_URL: z.string().url({
    message: 'NEXT_PUBLIC_GRPC_URL must be a valid URL (e.g., http://localhost:8080)'
  }),
  
  NEXT_PUBLIC_API_URL: z.string().url({
    message: 'NEXT_PUBLIC_API_URL must be a valid URL (e.g., http://localhost:8080)'
  }),

  // Server-side Environment Variables
  DATABASE_URL: z.string().min(1, {
    message: 'DATABASE_URL is required for Prisma connection'
  }),

  NEXTAUTH_SECRET: z.string().min(32, {
    message: 'NEXTAUTH_SECRET must be at least 32 characters long'
  }),

  NEXTAUTH_URL: z.string().url({
    message: 'NEXTAUTH_URL must be a valid URL (e.g., http://localhost:3000)'
  }),

  // Optional: JWT Secrets
  JWT_SECRET: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),

  // Optional: Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validated Environment Variables
 * Type-safe access to environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Throws ZodError if validation fails
 */
function parseEnv(): Env {
  try {
    return envSchema.parse({
      // Public variables
      NEXT_PUBLIC_GRPC_URL: process.env.NEXT_PUBLIC_GRPC_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

      // Server-side variables
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,

      // Optional variables
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

      // Node environment
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Environment validation failed. Check your .env.local file.');
    }
    throw error;
  }
}

/**
 * Validated and type-safe environment variables
 * Use this instead of process.env for type safety
 * 
 * Example:
 * import { env } from '@/lib/config/env';
 * const apiUrl = env.NEXT_PUBLIC_API_URL;
 */
export const env = parseEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get gRPC URL (client-side safe)
 */
export function getGrpcUrl(): string {
  return env.NEXT_PUBLIC_GRPC_URL;
}

/**
 * Get API URL (client-side safe)
 */
export function getApiUrl(): string {
  return env.NEXT_PUBLIC_API_URL;
}

/**
 * Get Database URL (server-side only)
 * Throws error if accessed on client-side
 */
export function getDatabaseUrl(): string {
  if (typeof window !== 'undefined') {
    throw new Error('DATABASE_URL cannot be accessed on client-side');
  }
  return env.DATABASE_URL;
}

/**
 * Get NextAuth Secret (server-side only)
 * Throws error if accessed on client-side
 */
export function getNextAuthSecret(): string {
  if (typeof window !== 'undefined') {
    throw new Error('NEXTAUTH_SECRET cannot be accessed on client-side');
  }
  return env.NEXTAUTH_SECRET;
}

/**
 * Environment configuration summary (for debugging)
 */
export function getEnvSummary() {
  return {
    nodeEnv: env.NODE_ENV,
    grpcUrl: env.NEXT_PUBLIC_GRPC_URL,
    apiUrl: env.NEXT_PUBLIC_API_URL,
    nextAuthUrl: env.NEXTAUTH_URL,
    hasGoogleOAuth: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    hasJwtSecrets: !!(env.JWT_SECRET && env.JWT_ACCESS_SECRET && env.JWT_REFRESH_SECRET),
  };
}

// Log environment summary in development
if (isDevelopment) {
  console.log('🔧 Environment Configuration:', getEnvSummary());
}

