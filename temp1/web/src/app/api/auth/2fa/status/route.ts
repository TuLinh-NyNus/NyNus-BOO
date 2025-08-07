import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import logger from '@/lib/utils/logger';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * API Route cho 2FA Status
 * 
 * GET /api/auth/2fa/status - Get 2FA status
 */

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get access token
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value || 
                       request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/auth/2fa/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to get 2FA status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    logger.error('Error in 2FA status API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
