import { NextRequest, NextResponse } from 'next/server';
import { ContactService, handleContactError } from '@/services/grpc/contact.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Use gRPC Contact Service instead of inline validation and processing
    const result = await ContactService.submitContactForm({
      name,
      email,
      subject,
      message
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // Handle gRPC errors properly
    try {
      handleContactError(error, 'submitContactForm');
    } catch (handledError) {
      const errorMessage = handledError instanceof Error ? handledError.message : 'Có lỗi xảy ra khi gửi tin nhắn';
      
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























