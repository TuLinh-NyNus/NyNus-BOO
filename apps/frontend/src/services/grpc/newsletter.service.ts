/**
 * Newsletter Service (gRPC-Mock)
 * Service for handling newsletter subscriptions
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

export interface NewsletterSubscribeRequest {
  email: string;
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    subscribedAt: string;
    status: string;
    subscriptionId: string;
  };
}

// ===== SERVICE IMPLEMENTATION =====

export class NewsletterService {
  /**
   * Subscribe to newsletter (Mock implementation)
   * TODO: Replace with actual gRPC call when backend is ready
   */
  static async subscribe(request: NewsletterSubscribeRequest): Promise<NewsletterSubscribeResponse> {
    // Validate email
    if (!request.email) {
      const error = new Error('Email là bắt buộc') as Error & { code: number };
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

    // Simulate gRPC call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate some error cases for testing
    if (request.email.includes('test@error.com')) {
      const error = new Error('Email đã được đăng ký trước đó') as Error & { code: number };
      error.code = 6; // ALREADY_EXISTS
      throw error;
    }
    
    if (request.email.includes('invalid@')) {
      const error = new Error('Email không hợp lệ') as Error & { code: number };
      error.code = 3; // INVALID_ARGUMENT
      throw error;
    }

    if (request.email.includes('server@error.com')) {
      const error = new Error('Service đang bảo trì, vui lòng thử lại sau') as Error & { code: number };
      error.code = 14; // UNAVAILABLE
      throw error;
    }

    // Mock successful subscription
    const subscriptionId = `newsletter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const subscribedAt = new Date().toISOString();
    
    // Log the newsletter subscription (in real implementation, this would be sent to backend)
    console.log('Newsletter subscription:', {
      email: request.email,
      subscriptionId,
      subscribedAt,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Đăng ký thành công! Cảm ơn bạn đã quan tâm đến NyNus.',
      data: {
        email: request.email,
        subscribedAt,
        status: 'active',
        subscriptionId
      }
    };
  }

  /**
   * Unsubscribe from newsletter (Mock implementation)
   * TODO: Replace with actual gRPC call when backend is ready
   */
  static async unsubscribe(request: { email: string }): Promise<{ success: boolean; message: string }> {
    // Validate email
    if (!request.email) {
      const error = new Error('Email là bắt buộc') as Error & { code: number };
      error.code = 3; // INVALID_ARGUMENT
      throw error;
    }

    // Simulate gRPC call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Newsletter unsubscription:', {
      email: request.email,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Hủy đăng ký thành công!'
    };
  }
}

// ===== ERROR HANDLING HELPER =====

/**
 * Handle Newsletter service errors with proper gRPC error handling
 */
export function handleNewsletterError(error: unknown, operation: string): never {
  logGrpcError(error, `NewsletterService.${operation}`);
  
  let errorMessage = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.';
  
  if (isGrpcError(error)) {
    errorMessage = getGrpcErrorMessage(error);
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  throw new Error(errorMessage);
}