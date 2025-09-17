/**
 * Newsletter Service gRPC Client
 * Service for handling newsletter subscriptions
 * 
 * @author NyNus Team
 * @version 2.0.0
 */

import { NewsletterServiceClient } from '@/generated/v1/NewsletterServiceClientPb';
import {
  NewsletterSubscribeRequest,
  NewsletterSubscribeResponse,
  NewsletterUnsubscribeRequest,
  NewsletterUnsubscribeResponse,
  ListSubscriptionsRequest,
  ListSubscriptionsResponse,
  GetSubscriptionRequest,
  GetSubscriptionResponse,
  UpdateSubscriptionTagsRequest,
  UpdateSubscriptionTagsResponse,
  DeleteSubscriptionRequest,
  DeleteSubscriptionResponse,
  NewsletterSubscription,
  SubscriptionStats,
} from '@/generated/v1/newsletter_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { RpcError } from 'grpc-web';

// gRPC client configuration
const GRPC_ENDPOINT = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';
const newsletterServiceClient = new NewsletterServiceClient(GRPC_ENDPOINT);

// Helper to get auth metadata
function getAuthMetadata(): { [key: string]: string } {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nynus-auth-token');
    if (token) {
      return { 'authorization': `Bearer ${token}` };
    }
  }
  return {};
}

// Handle gRPC errors
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Invalid input provided';
    case 6: return 'Email already subscribed';
    case 7: return 'Permission denied';
    case 14: return 'Service temporarily unavailable';
    case 16: return 'Authentication required';
    default: return error.message || 'An unexpected error occurred';
  }
}

// Map NewsletterSubscription from protobuf
function mapSubscriptionFromPb(sub: NewsletterSubscription): any {
  return {
    id: sub.getId(),
    email: sub.getEmail(),
    status: sub.getStatus(),
    subscription_id: sub.getSubscriptionId(),
    confirmed_at: sub.getConfirmedAt()?.toDate(),
    unsubscribed_at: sub.getUnsubscribedAt()?.toDate(),
    unsubscribe_reason: sub.getUnsubscribeReason(),
    source: sub.getSource(),
    tags: sub.getTagsList(),
    metadata: sub.getMetadataMap().toObject(),
    created_at: sub.getCreatedAt()?.toDate(),
    updated_at: sub.getUpdatedAt()?.toDate(),
  };
}

// Map SubscriptionStats from protobuf
function mapStatsFromPb(stats: SubscriptionStats): any {
  return {
    total_active: stats.getTotalActive(),
    total_unsubscribed: stats.getTotalUnsubscribed(),
    total_bounced: stats.getTotalBounced(),
    total_pending: stats.getTotalPending(),
    new_this_week: stats.getNewThisWeek(),
    new_this_month: stats.getNewThisMonth(),
  };
}

export class NewsletterService {
  /**
   * Subscribe to newsletter
   */
  static async subscribe(data: any): Promise<any> {
    try {
      const request = new NewsletterSubscribeRequest();
      request.setEmail(data.email);
      if (data.tags) request.setTagsList(data.tags);
      if (data.metadata) {
        const map = request.getMetadataMap();
        Object.entries(data.metadata).forEach(([key, value]) => {
          map.set(key, value as string);
        });
      }

      // No auth metadata needed for public endpoint
      const response = await newsletterServiceClient.subscribe(request, {});
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        subscription: responseObj.subscription ? mapSubscriptionFromPb(response.getSubscription()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        subscription: undefined
      };
    }
  }

  /**
   * Unsubscribe from newsletter
   */
  static async unsubscribe(data: any): Promise<any> {
    try {
      const request = new NewsletterUnsubscribeRequest();
      request.setEmail(data.email);
      if (data.reason) request.setReason(data.reason);

      // No auth metadata needed for public endpoint
      const response = await newsletterServiceClient.unsubscribe(request, {});
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || []
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    }
  }

  /**
   * List subscriptions (Admin)
   */
  static async listSubscriptions(req: any = {}): Promise<any> {
    try {
      const request = new ListSubscriptionsRequest();
      
      // Set pagination
      if (req.pagination) {
        const pagination = new PaginationRequest();
        pagination.setPage(req.pagination.page || 1);
        pagination.setLimit(req.pagination.limit || 20);
        request.setPagination(pagination);
      }
      
      // Set filters
      if (req.status) request.setStatus(req.status);
      if (req.search) request.setSearch(req.search);
      if (req.tags) request.setTagsList(req.tags);

      const response = await newsletterServiceClient.listSubscriptions(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        subscriptions: response.getSubscriptionsList().map(mapSubscriptionFromPb),
        pagination: responseObj.pagination,
        stats: responseObj.stats ? mapStatsFromPb(response.getStats()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        subscriptions: [],
        pagination: undefined,
        stats: undefined
      };
    }
  }

  /**
   * Get subscription by email (Admin)
   */
  static async getSubscription(email: string): Promise<any> {
    try {
      const request = new GetSubscriptionRequest();
      request.setEmail(email);

      const response = await newsletterServiceClient.getSubscription(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        subscription: responseObj.subscription ? mapSubscriptionFromPb(response.getSubscription()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        subscription: undefined
      };
    }
  }

  /**
   * Update subscription tags (Admin)
   */
  static async updateSubscriptionTags(email: string, tags: string[]): Promise<any> {
    try {
      const request = new UpdateSubscriptionTagsRequest();
      request.setEmail(email);
      request.setTagsList(tags);

      const response = await newsletterServiceClient.updateSubscriptionTags(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        subscription: responseObj.subscription ? mapSubscriptionFromPb(response.getSubscription()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        subscription: undefined
      };
    }
  }

  /**
   * Delete subscription (Admin - complete removal)
   */
  static async deleteSubscription(id: string): Promise<any> {
    try {
      const request = new DeleteSubscriptionRequest();
      request.setId(id);

      const response = await newsletterServiceClient.deleteSubscription(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || []
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    }
  }
}
