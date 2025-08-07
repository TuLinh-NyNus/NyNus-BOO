import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API tối ưu cho batch import câu hỏi lớn
 */
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Lấy dữ liệu từ request
    const { questions, batchNumber, totalBatches } = await request.json();

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Dữ liệu câu hỏi không hợp lệ'
      }, {
        status: 400,
        headers
      });
    }

    // Log thông tin batch
    console.log(`[Batch Import] Xử lý batch ${batchNumber}/${totalBatches} với ${questions.length} câu hỏi`);

    // Gọi API backend với timeout tăng cao
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/batch-import-optimized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
      },
      body: JSON.stringify({
        questions,
        batchNumber,
        totalBatches,
        userId: 'admin' // TODO: Extract user ID from token if needed
      }),
      // Tăng timeout cho batch lớn
      signal: AbortSignal.timeout(300000) // 5 phút
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend API error: ${backendResponse.status} - ${errorText}`);
    }

    const result = await backendResponse.json();

    return NextResponse.json({
      success: true,
      batchNumber,
      totalBatches,
      successCount: result.successCount || 0,
      failureCount: result.failureCount || 0,
      errors: result.errors || [],
      message: `Batch ${batchNumber}/${totalBatches} hoàn thành`
    }, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('[Batch Import] Lỗi:', error);
    
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
