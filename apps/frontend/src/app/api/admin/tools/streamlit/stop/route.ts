/**
 * API Route để dừng Streamlit service
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/tools/streamlit/stop
 * Dừng Streamlit service
 */
export async function POST(request: NextRequest) {
  try {
    // Import dynamic để tránh lỗi khi module không tồn tại
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Tìm và kill tất cả process Streamlit
    try {
      // Trên Windows
      if (process.platform === 'win32') {
        await execAsync('taskkill /f /im streamlit.exe');
      } else {
        // Trên Linux/Mac
        await execAsync('pkill -f streamlit');
      }
    } catch (killError) {
      // Có thể không có process nào để kill
      console.log('No Streamlit processes found to kill');
    }

    // Cũng kill process theo port
    try {
      if (process.platform === 'win32') {
        // Tìm process sử dụng port 8501 và kill
        const { stdout } = await execAsync('netstat -ano | findstr :8501');
        if (stdout) {
          const lines = stdout.split('\n');
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 4) {
              const pid = parts[parts.length - 1];
              if (pid && !isNaN(parseInt(pid))) {
                try {
                  await execAsync(`taskkill /f /pid ${pid}`);
                } catch (e) {
                  // Ignore errors
                }
              }
            }
          }
        }
      } else {
        await execAsync('lsof -ti:8501 | xargs kill -9');
      }
    } catch (portKillError) {
      console.log('No process found on port 8501');
    }

    return NextResponse.json({
      success: true,
      message: 'Streamlit stopped successfully',
      status: 'stopped'
    });

  } catch (error) {
    console.error('Error stopping Streamlit:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to stop Streamlit',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
