/**
 * Enhanced CSRF Token API Route
 * 
 * Provides enhanced CSRF tokens với rotation và fingerprinting
 */

import { NextRequest, NextResponse } from 'next/server';

import { 
  EnhancedServerCSRFManager, 
  ENHANCED_CSRF_CONFIG 
} from '@/lib/auth/enhanced-csrf';
import logger from '@/lib/utils/logger';

/**
 * GET /api/auth/csrf-token-enhanced
 * 
 * Generate và return enhanced CSRF token
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Generate request fingerprint
    const fingerprint = EnhancedServerCSRFManager.generateFingerprint(request);
    
    // Create new token data
    const tokenData = EnhancedServerCSRFManager.createTokenData(fingerprint);
    
    // Create response
    const response = NextResponse.json({
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      rotationDue: tokenData.rotationDue,
    });

    // Set enhanced CSRF cookie
    EnhancedServerCSRFManager.setCookie(response, tokenData);

    logger.info('Enhanced CSRF: Token generated', {
      fingerprint: fingerprint.slice(0, 8) + '...',
      expiresAt: new Date(tokenData.expiresAt),
      rotationDue: new Date(tokenData.rotationDue),
    });

    return response;

  } catch (error) {
    logger.error('Enhanced CSRF: Token generation failed', error);
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/csrf-token-enhanced
 * 
 * Validate và potentially rotate CSRF token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const method = request.method;
    const cookieToken = request.cookies.get(ENHANCED_CSRF_CONFIG.COOKIE_NAME)?.value;
    const headerToken = request.headers.get(ENHANCED_CSRF_CONFIG.HEADER_NAME);
    const fingerprint = EnhancedServerCSRFManager.generateFingerprint(request);

    // Validate CSRF token
    const validation = EnhancedServerCSRFManager.validateToken(
      cookieToken,
      headerToken || undefined,
      method,
      fingerprint
    );

    if (!validation.isValid) {
      logger.warn('Enhanced CSRF: Validation failed', {
        error: validation.error,
        method,
        hasToken: !!headerToken,
      });

      return NextResponse.json(
        { error: validation.error || 'CSRF validation failed' },
        { status: 403 }
      );
    }

    // Create response
    const responseData: any = {
      valid: true,
      rotated: validation.shouldRotate,
    };

    const response = NextResponse.json(responseData);

    // Handle token rotation if needed
    if (validation.shouldRotate && validation.newToken) {
      const newTokenData = JSON.parse(
        Buffer.from(validation.newToken, 'base64').toString('utf-8')
      );
      
      // Set new cookie
      EnhancedServerCSRFManager.setCookie(response, newTokenData);
      
      // Add rotation header for client
      response.headers.set(ENHANCED_CSRF_CONFIG.ROTATION_HEADER, newTokenData.token);
      
      responseData.newToken = newTokenData.token;
      responseData.expiresAt = newTokenData.expiresAt;
      
      logger.info('Enhanced CSRF: Token rotated', {
        fingerprint: fingerprint.slice(0, 8) + '...',
      });
    }

    return response;

  } catch (error) {
    logger.error('Enhanced CSRF: Validation error', error);
    
    return NextResponse.json(
      { error: 'CSRF validation error' },
      { status: 500 }
    );
  }
}
