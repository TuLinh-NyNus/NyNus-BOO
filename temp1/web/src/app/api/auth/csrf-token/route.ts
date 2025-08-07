/**
 * CSRF Token API Route
 * 
 * Provides CSRF tokens cho client-side applications
 * Implements Double Submit Cookie pattern
 * 
 * Endpoints:
 * - GET /api/auth/csrf-token - Get current CSRF token
 * - POST /api/auth/csrf-token - Generate new CSRF token
 */

import { NextRequest, NextResponse } from 'next/server';

import { ServerCSRFManager, CSRFTokenData } from '@/lib/auth/csrf';
import logger from '@/lib/utils/logger';

/**
 * CSRF token response interface
 */
interface CSRFTokenResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
}

/**
 * GET /api/auth/csrf-token
 * 
 * Lấy CSRF token hiện tại hoặc generate token mới nếu chưa có
 * Token được set trong httpOnly cookie và return trong response
 */
export async function GET(request: NextRequest): Promise<NextResponse<CSRFTokenResponse>> {
  try {
    logger.info('🔍 CSRF Token API: GET request received');

    // Check if CSRF token already exists
    const existingToken = ServerCSRFManager.getCSRFToken();
    
    if (existingToken) {
      logger.info('✅ CSRF Token API: Returning existing token');
      
      return NextResponse.json({
        success: true,
        token: existingToken,
        expiresIn: 24 * 60 * 60, // 24 hours
      });
    }

    // Generate new CSRF token
    logger.info('🔄 CSRF Token API: Generating new CSRF token');
    
    const tokenData: CSRFTokenData = ServerCSRFManager.createTokenData();
    
    // Set CSRF token cookie
    ServerCSRFManager.setCSRFCookie(tokenData);
    
    logger.info('✅ CSRF Token API: New CSRF token generated and set');
    
    return NextResponse.json({
      success: true,
      token: tokenData.token,
      expiresIn: Math.floor((tokenData.expiresAt - Date.now()) / 1000),
    });

  } catch (error) {
    logger.error('❌ CSRF Token API: Error in GET handler:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get CSRF token',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/csrf-token
 * 
 * Force generate một CSRF token mới
 * Useful khi client cần refresh token
 */
export async function POST(request: NextRequest): Promise<NextResponse<CSRFTokenResponse>> {
  try {
    logger.info('🔄 CSRF Token API: POST request received - generating new token');

    // Always generate new token for POST requests
    const tokenData: CSRFTokenData = ServerCSRFManager.createTokenData();
    
    // Set new CSRF token cookie
    ServerCSRFManager.setCSRFCookie(tokenData);
    
    logger.info('✅ CSRF Token API: New CSRF token generated via POST');
    
    return NextResponse.json({
      success: true,
      token: tokenData.token,
      expiresIn: Math.floor((tokenData.expiresAt - Date.now()) / 1000),
    });

  } catch (error) {
    logger.error('❌ CSRF Token API: Error in POST handler:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate new CSRF token',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/csrf-token
 * 
 * Clear CSRF token (useful for logout)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<CSRFTokenResponse>> {
  try {
    logger.info('🧹 CSRF Token API: DELETE request received - clearing token');

    // Clear CSRF token cookie
    ServerCSRFManager.clearCSRFCookie();
    
    logger.info('✅ CSRF Token API: CSRF token cleared');
    
    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    logger.error('❌ CSRF Token API: Error in DELETE handler:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear CSRF token',
      },
      { status: 500 }
    );
  }
}
