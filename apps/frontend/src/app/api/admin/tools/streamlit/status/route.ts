/**
 * API Route để kiểm tra trạng thái Streamlit service
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/tools/streamlit/status
 * Kiểm tra trạng thái Streamlit service
 */
export async function GET(request: NextRequest) {
  try {
    // Import dynamic để tránh lỗi
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    let isRunning = false;
    let processInfo = null;

    try {
      // Kiểm tra process Streamlit
      if (process.platform === 'win32') {
        // Windows
        const { stdout } = await execAsync('tasklist /fi "imagename eq streamlit.exe" /fo csv');
        isRunning = stdout.includes('streamlit.exe');
        
        if (!isRunning) {
          // Kiểm tra theo port
          const { stdout: portCheck } = await execAsync('netstat -ano | findstr :8501');
          isRunning = portCheck.includes(':8501');
        }
      } else {
        // Linux/Mac
        const { stdout } = await execAsync('pgrep -f streamlit');
        isRunning = stdout.trim().length > 0;
        
        if (!isRunning) {
          // Kiểm tra theo port
          const { stdout: portCheck } = await execAsync('lsof -i:8501');
          isRunning = portCheck.includes(':8501');
        }
      }
    } catch (error) {
      // Nếu không tìm thấy process thì coi như không chạy
      isRunning = false;
    }

    // Nếu đang chạy, thử ping để đảm bảo service hoạt động
    if (isRunning) {
      try {
        const response = await fetch('http://localhost:8501/healthz', {
          method: 'GET',
          timeout: 5000
        });
        isRunning = response.ok;
      } catch (pingError) {
        // Nếu không ping được thì có thể service chưa sẵn sàng
        // Nhưng vẫn coi như đang chạy
      }
    }

    return NextResponse.json({
      success: true,
      status: isRunning ? 'running' : 'stopped',
      url: isRunning ? 'http://localhost:8501' : null,
      timestamp: new Date().toISOString(),
      processInfo
    });

  } catch (error) {
    console.error('Error checking Streamlit status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to check Streamlit status',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}
