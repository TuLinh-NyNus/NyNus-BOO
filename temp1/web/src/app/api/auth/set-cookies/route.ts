/**
 * 🍪 API Route for Setting Authentication Cookies
 * 
 * Endpoint để set secure httpOnly cookies cho authentication tokens.
 * Được gọi từ client sau khi login/register thành công.
 */

import { NextRequest, NextResponse } from 'next/server';

import { ServerCookieManager, type TokenData } from '@/lib/auth/cookie-manager';
import logger from '@/lib/utils/logger';

/**
 * Request body interface
 */
interface SetCookiesRequest {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
  expiresIn?: number;
}

/**
 * POST /api/auth/set-cookies
 * 
 * Set authentication tokens in secure httpOnly cookies
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('🍪 API: Setting authentication cookies');
    
    // Parse request body
    const body: SetCookiesRequest = await request.json();
    
    // Validate required fields
    if (!body.accessToken || !body.refreshToken) {
      logger.error('❌ API: Missing required tokens');
      return NextResponse.json(
        { error: 'Access token and refresh token are required' },
        { status: 400 }
      );
    }
    
    // Prepare token data
    const tokenData: TokenData = {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      sessionId: body.sessionId,
      expiresIn: body.expiresIn,
    };
    
    // Set cookies using ServerCookieManager
    ServerCookieManager.setTokens(tokenData);
    
    logger.info('✅ API: Authentication cookies set successfully');
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Authentication cookies set successfully'
      },
      { status: 200 }
    );
    
  } catch (error) {
    logger.error('❌ API: Failed to set authentication cookies:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to set authentication cookies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Method not allowed for other HTTP methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
