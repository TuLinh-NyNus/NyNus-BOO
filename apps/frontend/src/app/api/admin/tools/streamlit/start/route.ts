/**
 * API Route để khởi động Streamlit service
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// Global variable để lưu trữ Streamlit process
let streamlitProcess: ChildProcess | null = null;

/**
 * POST /api/admin/tools/streamlit/start
 * Khởi động Streamlit service cho LaTeX Question Parser
 */
export async function POST(request: NextRequest) {
  try {
    // Kiểm tra xem Streamlit đã chạy chưa
    if (streamlitProcess && !streamlitProcess.killed) {
      return NextResponse.json({
        success: true,
        message: 'Streamlit is already running',
        url: 'http://localhost:8501',
        status: 'running'
      });
    }

    // Đường dẫn đến thư mục parsing-question
    const toolsPath = path.join(process.cwd(), '..', '..', 'tools', 'parsing-question');
    
    // Khởi động Streamlit
    streamlitProcess = spawn('streamlit', ['run', 'streamlit_app.py', '--server.port=8501'], {
      cwd: toolsPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    // Handle process events
    streamlitProcess.on('error', (error) => {
      console.error('Streamlit process error:', error);
    });

    streamlitProcess.on('exit', (code, signal) => {
      console.log(`Streamlit process exited with code ${code} and signal ${signal}`);
      streamlitProcess = null;
    });

    // Đợi một chút để Streamlit khởi động
    await new Promise(resolve => setTimeout(resolve, 3000));

    return NextResponse.json({
      success: true,
      message: 'Streamlit started successfully',
      url: 'http://localhost:8501',
      status: 'running',
      pid: streamlitProcess.pid
    });

  } catch (error) {
    console.error('Error starting Streamlit:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to start Streamlit',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/tools/streamlit/start
 * Kiểm tra trạng thái Streamlit
 */
export async function GET() {
  try {
    const isRunning = streamlitProcess && !streamlitProcess.killed;
    
    return NextResponse.json({
      success: true,
      status: isRunning ? 'running' : 'stopped',
      url: isRunning ? 'http://localhost:8501' : null,
      pid: isRunning ? streamlitProcess?.pid : null
    });

  } catch (error) {
    console.error('Error checking Streamlit status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to check Streamlit status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
