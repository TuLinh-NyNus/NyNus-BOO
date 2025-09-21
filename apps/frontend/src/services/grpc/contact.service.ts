/**
 * Contact Service gRPC Client
 * Service for handling contact form submissions
 *
 * @author NyNus Team
 * @version 2.0.0
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContactServiceClient } from '@/generated/v1/ContactServiceClientPb';
import {
  ContactFormRequest,
  ListContactsRequest,
  GetContactRequest,
  UpdateContactStatusRequest,
  DeleteContactRequest,
  ContactSubmission,
} from '@/generated/v1/contact_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { RpcError } from 'grpc-web';

// gRPC client configuration
const GRPC_ENDPOINT = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080';
const contactServiceClient = new ContactServiceClient(GRPC_ENDPOINT);

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
    case 7: return 'Permission denied';
    case 14: return 'Service temporarily unavailable';
    case 16: return 'Authentication required';
    default: return error.message || 'An unexpected error occurred';
  }
}

// Map ContactSubmission from protobuf
function mapContactFromPb(contact: ContactSubmission): any {
  return {
    id: contact.getId(),
    name: contact.getName(),
    email: contact.getEmail(),
    subject: contact.getSubject(),
    message: contact.getMessage(),
    phone: contact.getPhone(),
    status: contact.getStatus(),
    submission_id: contact.getSubmissionId(),
    created_at: contact.getCreatedAt()?.toDate(),
    updated_at: contact.getUpdatedAt()?.toDate(),
  };
}

export class ContactService {
  /**
   * Submit contact form
   */
  static async submitContactForm(data: any): Promise<any> {
    try {
      const request = new ContactFormRequest();
      request.setName(data.name);
      request.setEmail(data.email);
      request.setSubject(data.subject);
      request.setMessage(data.message);
      if (data.phone) request.setPhone(data.phone);

      // No auth metadata needed for public endpoint
      const response = await contactServiceClient.submitContactForm(request, {});
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        submission: responseObj.submission ? mapContactFromPb(response.getSubmission()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        submission: undefined
      };
    }
  }

  /**
   * List contact submissions (Admin)
   */
  static async listContacts(req: any = {}): Promise<any> {
    try {
      const request = new ListContactsRequest();
      
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

      const response = await contactServiceClient.listContacts(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        submissions: response.getSubmissionsList().map(mapContactFromPb),
        pagination: responseObj.pagination,
        total_unread: responseObj.totalUnread
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        submissions: [],
        pagination: undefined,
        total_unread: 0
      };
    }
  }

  /**
   * Get single contact submission (Admin)
   */
  static async getContact(id: string): Promise<any> {
    try {
      const request = new GetContactRequest();
      request.setId(id);

      const response = await contactServiceClient.getContact(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        submission: responseObj.submission ? mapContactFromPb(response.getSubmission()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        submission: undefined
      };
    }
  }

  /**
   * Update contact status (Admin)
   */
  static async updateContactStatus(id: string, status: string): Promise<any> {
    try {
      const request = new UpdateContactStatusRequest();
      request.setId(id);
      request.setStatus(status);

      const response = await contactServiceClient.updateContactStatus(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        submission: responseObj.submission ? mapContactFromPb(response.getSubmission()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        submission: undefined
      };
    }
  }

  /**
   * Delete contact submission (Admin)
   */
  static async deleteContact(id: string): Promise<any> {
    try {
      const request = new DeleteContactRequest();
      request.setId(id);

      const response = await contactServiceClient.deleteContact(request, getAuthMetadata());
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
