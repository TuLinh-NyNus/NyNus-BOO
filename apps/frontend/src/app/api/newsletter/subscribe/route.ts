import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService, handleNewsletterError } from '@/services/grpc/newsletter.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Use gRPC Newsletter Service
    const result = await NewsletterService.subscribe({ email });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // Handle gRPC errors properly
    try {
      handleNewsletterError(error, 'subscribe');
    } catch (handledError) {
      const errorMessage = handledError instanceof Error ? handledError.message : 'Có lỗi xảy ra khi đăng ký';
      
      // gRPC validation errors (INVALID_ARGUMENT)
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 3) {
        return NextResponse.json(
          { 
            success: false, 
            message: errorMessage 
          },
          { status: 400 }
        );
      }
      
      // gRPC already exists errors (ALREADY_EXISTS)
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 6) {
        return NextResponse.json(
          { 
            success: false, 
            message: errorMessage 
          },
          { status: 409 }
        );
      }
      
      // gRPC unavailable errors
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 14) {
        return NextResponse.json(
          { 
            success: false, 
            message: errorMessage 
          },
          { status: 503 }
        );
      }
      
      // General server errors
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage 
        },
        { status: 500 }
      );
    }
  }
}























