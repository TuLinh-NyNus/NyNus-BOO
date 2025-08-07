import { NextResponse } from 'next/server';

/**
 * Health check endpoint cho Next.js Web Application
 * Được sử dụng bởi Docker health checks và monitoring systems
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Kiểm tra các thành phần cơ bản của ứng dụng
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'nynus-web',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      api: {
        url: process.env.API_URL || 'http://localhost:5000',
        public_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      }
    };

    // Kiểm tra kết nối đến API backend (optional)
    let apiStatus = 'unknown';
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:5000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        apiStatus = 'connected';
      } else {
        apiStatus = 'error';
      }
    } catch (error) {
      apiStatus = 'disconnected';
    }

    const responseData = {
      ...healthData,
      dependencies: {
        api: apiStatus
      }
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    // Trả về lỗi nếu có vấn đề
    const errorData = {
      status: 'error',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'nynus-web',
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorData, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
