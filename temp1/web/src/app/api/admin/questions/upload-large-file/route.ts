import * as fs from 'fs';
import * as path from 'path';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API upload file lớn và tạo background job
 * Tối ưu cho file 300MB, 300k câu hỏi
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy file'
      }, {
        status: 400,
        headers
      });
    }

    // Kiểm tra kích thước file (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: `File quá lớn. Kích thước tối đa: ${maxSize / 1024 / 1024}MB`
      }, {
        status: 400,
        headers
      });
    }

    // Kiểm tra định dạng file
    if (!file.name.endsWith('.tex')) {
      return NextResponse.json({
        success: false,
        message: 'Chỉ hỗ trợ file .tex'
      }, {
        status: 400,
        headers
      });
    }

    console.log(`[Large File Upload] Nhận file: ${file.name} (${file.size} bytes)`);

    // Tạo thư mục uploads nếu chưa có
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Lưu file với tên unique
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    // Ghi file
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    console.log(`[Large File Upload] Đã lưu file: ${filePath}`);

    // Phân tích nhanh để ước tính số câu hỏi
    const quickAnalysis = await analyzeFile(filePath);

    console.log('[Large File Upload] Token info:', {
      hasApiAuthToken: !!apiAuthToken,
      tokenLength: apiAuthToken?.length || 0,
      tokenStart: apiAuthToken?.substring(0, 50) || 'N/A'
    });

    if (!apiAuthToken) {
      // Cleanup file nếu không có token
      fs.unlinkSync(filePath);
      throw new Error('Không tìm thấy backend-compatible token trong cookie');
    }

    // Sử dụng backend-compatible token
    const accessToken = apiAuthToken;
    console.log('[Large File Upload] Sử dụng backend-compatible token, độ dài:', accessToken.length);

    // Decode JWT token để lấy UUID thật
    let backendUserId: string;
    try {
      console.log('[Large File Upload] Bắt đầu decode JWT token...');
      console.log('[Large File Upload] Token parts:', accessToken.split('.').length);

      // Decode JWT payload (phần thứ 2 của JWT)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      backendUserId = payload.sub; // UUID thật từ backend

      console.log('[Large File Upload] JWT Payload:', {
        sub: payload.sub,
        email: payload.email,
        role: payload.role
      });
      console.log('[Large File Upload] Backend User ID từ JWT:', backendUserId);
    } catch (error) {
      console.error('[Large File Upload] Lỗi decode JWT token:', error);
      // Fallback nếu không decode được
      backendUserId = '3862d387-be45-405e-ab24-bfd4eccd229f';
      console.log('[Large File Upload] Fallback User ID:', backendUserId);
    }

    // Tạo background job
    const jobResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/create-import-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        filePath,
        fileSize: file.size,
        estimatedQuestions: quickAnalysis.questionCount,
        userId: backendUserId // UUID thật từ JWT decode
      })
    });

    if (!jobResponse.ok) {
      // Cleanup file nếu tạo job thất bại
      fs.unlinkSync(filePath);
      throw new Error(`Failed to create import job: ${jobResponse.statusText}`);
    }

    const jobResult = await jobResponse.json();

    return NextResponse.json({
      success: true,
      message: 'File đã được upload thành công',
      data: {
        jobId: jobResult.jobId,
        fileName: file.name,
        fileSize: file.size,
        estimatedQuestions: quickAnalysis.questionCount,
        estimatedTime: jobResult.estimatedTime,
        status: 'pending'
      }
    }, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('[Large File Upload] Lỗi:', error);
    
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

/**
 * Phân tích nhanh file để ước tính số câu hỏi
 */
async function analyzeFile(filePath: string): Promise<{ questionCount: number }> {
  try {
    // Đọc 10MB đầu để ước tính
    const sampleSize = 10 * 1024 * 1024; // 10MB
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(sampleSize);
    const bytesRead = fs.readSync(fd, buffer, 0, sampleSize, 0);
    fs.closeSync(fd);

    const sampleContent = buffer.toString('utf8', 0, bytesRead);
    
    // Đếm số lượng \begin{ex} trong sample
    const matches = sampleContent.match(/\\begin\{ex\}/g);
    const sampleQuestionCount = matches ? matches.length : 0;

    // Ước tính tổng số câu hỏi dựa trên tỷ lệ
    const fileStats = fs.statSync(filePath);
    const totalSize = fileStats.size;
    const ratio = totalSize / bytesRead;
    const estimatedQuestionCount = Math.round(sampleQuestionCount * ratio);

    console.log(`[File Analysis] Sample: ${sampleQuestionCount} câu hỏi trong ${bytesRead} bytes`);
    console.log(`[File Analysis] Ước tính: ${estimatedQuestionCount} câu hỏi trong ${totalSize} bytes`);

    return { questionCount: estimatedQuestionCount };
  } catch (error) {
    console.error('[File Analysis] Lỗi:', error);
    return { questionCount: 0 };
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
