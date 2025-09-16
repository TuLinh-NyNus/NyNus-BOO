/**
 * Contact Service (gRPC-Mock)
 * Service for handling contact form submissions
 * TODO: Replace with actual gRPC service when backend implements it
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { 
  isGrpcError, 
  getGrpcErrorMessage, 
  logGrpcError 
} from '@/lib/grpc/errors';

// ===== TYPES =====

export interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  data?: {
    name: string;
    email: string;
    subject: string;
    submissionId: string;
  };
}

// ===== SERVICE IMPLEMENTATION =====

export class ContactService {
  /**
   * Submit contact form (Mock implementation)
   * TODO: Replace with actual gRPC call when backend is ready
   */
  static async submitContactForm(request: ContactFormRequest): Promise<ContactFormResponse> {
    // Validate required fields
    if (!request.name || !request.email || !request.subject || !request.message) {
      const error = new Error('Tất cả các trường là bắt buộc') as Error & { code: number };
      error.code = 3; // INVALID_ARGUMENT
      throw error;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      const error = new Error('Email không hợp lệ') as Error & { code: number };
      error.code = 3; // INVALID_ARGUMENT
      throw error;
    }

    // Validate message length
    if (request.message.length < 10) {
      const error = new Error('Nội dung tin nhắn phải có ít nhất 10 ký tự') as Error & { code: number };
      error.code = 3; // INVALID_ARGUMENT
      throw error;
    }

    // Simulate gRPC call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate some error cases for testing
    if (request.email.includes('test@error.com')) {
      const error = new Error('Server đang bảo trì, vui lòng thử lại sau') as Error & { code: number };
      error.code = 14; // UNAVAILABLE
      throw error;
    }

    // Mock successful submission
    const submissionId = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the contact form submission (in real implementation, this would be sent to backend)
    console.log('Contact form submission:', {
      ...request,
      submissionId,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
      data: {
        name: request.name,
        email: request.email,
        subject: request.subject,
        submissionId
      }
    };
  }
}

// ===== ERROR HANDLING HELPER =====

/**
 * Handle Contact service errors with proper gRPC error handling
 */
export function handleContactError(error: unknown, operation: string): never {
  logGrpcError(error, `ContactService.${operation}`);
  
  let errorMessage = 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.';
  
  if (isGrpcError(error)) {
    errorMessage = getGrpcErrorMessage(error);
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  throw new Error(errorMessage);
}