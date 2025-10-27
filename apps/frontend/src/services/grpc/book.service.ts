/**
 * Book Service Client (gRPC-Web)
 * Minimal wrapper to fetch book data for admin features
 */

import { RpcError, StatusCode } from 'grpc-web';

import { BookServiceClient } from '@/generated/v1/BookServiceClientPb';
import {
  ListBooksRequest,
  Book
} from '@/generated/v1/book_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { GRPC_WEB_HOST, getAuthMetadata } from './client';

// gRPC client configuration (matching other service clients)
const bookServiceClient = new BookServiceClient(GRPC_WEB_HOST, null, {
  format: 'text',
  withCredentials: false,
  unaryInterceptors: [],
  streamInterceptors: []
});

// Convert gRPC error to user-friendly string
function handleGrpcError(error: RpcError): string {
  if (error.code === StatusCode.UNIMPLEMENTED) {
    console.warn('BookService is not registered on the gRPC backend. Falling back to empty data set.');
    return 'Book service is not available';
  }

  console.error('gRPC BookService error:', error);

  switch (error.code) {
    case StatusCode.INVALID_ARGUMENT:
      return error.message || 'Invalid input provided';
    case StatusCode.NOT_FOUND:
      return 'Book data not found';
    case StatusCode.PERMISSION_DENIED:
      return 'Permission denied';
    case StatusCode.UNAVAILABLE:
      return 'Service temporarily unavailable';
    case StatusCode.UNAUTHENTICATED:
      return 'Authentication required';
    default:
      return error.message || 'An unexpected error occurred';
  }
}

export interface BackendBook {
  id: string;
  title: string;
  description: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  tags: string[];
  coverImage: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  isActive: boolean;
  downloadCount: number;
  rating: number;
  reviews: number;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListBooksResult {
  success: boolean;
  message: string;
  errors: string[];
  books: BackendBook[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  totalActive: number;
  isFallback?: boolean;
}

function mapBookFromPb(book: Book): BackendBook {
  const publishedDate = book.getPublishedDate();
  const createdAt = book.getCreatedAt();
  const updatedAt = book.getUpdatedAt();

  return {
    id: book.getId(),
    title: book.getTitle(),
    description: book.getDescription(),
    author: book.getAuthor(),
    isbn: book.getIsbn(),
    publisher: book.getPublisher(),
    category: book.getCategory(),
    tags: book.getTagsList(),
    coverImage: book.getCoverImage(),
    fileUrl: book.getFileUrl(),
    fileSize: book.getFileSize(),
    fileType: book.getFileType(),
    isActive: book.getIsActive(),
    downloadCount: book.getDownloadCount(),
    rating: book.getRating(),
    reviews: book.getReviews(),
    publishedDate: publishedDate ? publishedDate.toDate().toISOString() : undefined,
    createdAt: createdAt ? createdAt.toDate().toISOString() : undefined,
    updatedAt: updatedAt ? updatedAt.toDate().toISOString() : undefined
  };
}

export class BookService {
  /**
   * List books with optional filters.
   * Used primarily to retrieve pagination metadata (total counts).
   */
  static async listBooks(params: {
    pagination?: { page?: number; limit?: number };
    category?: string;
    author?: string;
    fileType?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<ListBooksResult> {
    try {
      const request = new ListBooksRequest();

      if (params.pagination) {
        const pagination = new PaginationRequest();
        pagination.setPage(params.pagination.page ?? 1);
        pagination.setLimit(params.pagination.limit ?? 20);
        request.setPagination(pagination);
      }

      if (params.category) request.setCategory(params.category);
      if (params.author) request.setAuthor(params.author);
      if (params.fileType) request.setFileType(params.fileType);
      if (params.isActive !== undefined) request.setIsActive(params.isActive);
      if (params.search) request.setSearch(params.search);
      if (params.sortBy) request.setSortBy(params.sortBy);
      if (params.sortOrder) request.setSortOrder(params.sortOrder);

      const response = await bookServiceClient.listBooks(request, getAuthMetadata());
      const responseObj = response.toObject();
      const pagination = response.getPagination();

      return {
        success: responseObj.response?.success ?? false,
        message: responseObj.response?.message ?? '',
        errors: responseObj.response?.errorsList ?? [],
        books: response.getBooksList().map(mapBookFromPb),
        pagination: pagination ? {
          page: pagination.getPage(),
          limit: pagination.getLimit(),
          totalCount: pagination.getTotalCount(),
          totalPages: pagination.getTotalPages()
        } : undefined,
        totalActive: response.getTotalActive()
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);

      if (rpcError.code === StatusCode.UNIMPLEMENTED) {
        return {
          success: true,
          message,
          errors: [],
          books: [],
          pagination: {
            page: params.pagination?.page ?? 1,
            limit: params.pagination?.limit ?? 20,
            totalCount: 0,
            totalPages: 0,
          },
          totalActive: 0,
          isFallback: true,
        };
      }

      return {
        success: false,
        message,
        errors: [message],
        books: [],
        totalActive: 0
      };
    }
  }

  /**
   * Convenience helper returning only the total number of books.
   */
  static async getBookCount(): Promise<number> {
    const result = await BookService.listBooks({ pagination: { page: 1, limit: 1 } });

    if (!result.success) {
      const errorMessage = result.errors[0] || result.message || 'Unable to load book statistics';
      throw new Error(errorMessage);
    }

    return result.pagination?.totalCount ?? result.books.length ?? 0;
  }
}

export default BookService;
