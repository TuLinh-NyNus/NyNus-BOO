import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * API lấy trạng thái import job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Kiểm tra authentication
    const cookieStore = cookies();
    const apiAuthToken = cookieStore.get('api_auth_token')?.value;

    if (!apiAuthToken) {
      return NextResponse.json({
        success: false,
        message: 'Không có quyền truy cập'
      }, {
        status: 403,
        headers
      });
    }

    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json({
        success: false,
        message: 'Job ID không hợp lệ'
      }, {
        status: 400,
        headers
      });
    }

    // Gọi API backend để lấy job status
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/job-status/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiAuthToken || 'temp-token'}`,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json(result, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('[Job Status] Lỗi:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, {
      status: 500,
      headers
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
