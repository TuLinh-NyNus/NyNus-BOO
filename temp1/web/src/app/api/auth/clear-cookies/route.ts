/**
 * 🍪 API Route for Clearing Authentication Cookies
 * 
 * Endpoint để clear secure httpOnly cookies khi logout.
 * Được gọi từ client khi user logout hoặc session expired.
 */

import { NextRequest, NextResponse } from 'next/server';

import { ServerCookieManager } from '@/lib/auth/cookie-manager';
import { ServerCSRFManager } from '@/lib/auth/csrf';
import logger from '@/lib/utils/logger';

/**
 * POST /api/auth/clear-cookies
 * 
 * Clear all authentication cookies
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('🍪 API: Clearing authentication cookies');
    
    // Clear authentication cookies
    ServerCookieManager.clearTokens();

    // Also clear CSRF token cookie
    ServerCSRFManager.clearCSRFCookie();

    logger.info('✅ API: Authentication và CSRF cookies cleared successfully');
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Authentication cookies cleared successfully'
      },
      { status: 200 }
    );
    
  } catch (error) {
    logger.error('❌ API: Failed to clear authentication cookies:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to clear authentication cookies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/clear-cookies
 * 
 * Alternative endpoint for clearing cookies (for convenience)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return POST(request);
}

/**
 * Method not allowed for other HTTP methods
 */
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
