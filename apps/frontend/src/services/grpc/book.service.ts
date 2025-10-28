/**
 * Book Service Client (gRPC-Web)
 * Minimal wrapper to fetch book data for admin features
 * 
 * ✅ FIX: Added module-level cache to prevent rate limit errors
 * Similar pattern to AdminStatsContext
 */

import { RpcError, StatusCode } from 'grpc-web';

import { BookServiceClient } from '@/generated/v1/BookServiceClientPb';
import {
  ListBooksRequest,
  Book
} from '@/generated/v1/book_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { GRPC_WEB_HOST } from './config';
import { getAuthMetadata } from './client';

// gRPC client configuration (matching other service clients)
const bookServiceClient = new BookServiceClient(GRPC_WEB_HOST, null, {
  format: 'text',
  withCredentials: false,
  unaryInterceptors: [],
  streamInterceptors: []
});

// ===== MODULE-LEVEL SINGLETON CACHE =====
// Prevents duplicate API calls and rate limit errors
// Pattern matches AdminStatsContext implementation

let globalBookCountCache: number | null = null;
let globalBookCountLastFetch: Date | null = null;
let globalBookCountPendingRequest: Promise<number> | null = null;
let globalLastRequestTime: number = 0;

const BOOK_COUNT_CACHE_TIMEOUT = 120000; // 120 seconds (2 minutes)
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds minimum between requests

// Convert gRPC error to user-friendly string
function handleGrpcError(error: RpcError): string {
  if (error.code === StatusCode.UNIMPLEMENTED) {
    console.warn('BookService is not registered on the gRPC backend. Falling back to empty data set.');
    return 'Book service is not available';
  }

  // ✅ FIX: Don't log rate limit errors as errors
  const isRateLimitError = error.message?.toLowerCase().includes('rate limit');
  if (isRateLimitError) {
    console.warn('[BookService] Rate limit exceeded, using cached data if available');
  } else {
    console.error('gRPC BookService error:', error);
  }

  switch (error.code) {
    case StatusCode.RESOURCE_EXHAUSTED: // Rate limit error code
      return 'rate limit exceeded';
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
   * 
   * ✅ FIX: Added module-level caching to prevent rate limit errors
   * Features:
   * - Global cache survives component remounts (120s cache)
   * - Request deduplication (only one request at a time)
   * - Minimum interval enforcement (5s between requests)
   * - Graceful rate limit handling (returns cached value or 0)
   */
  static async getBookCount(): Promise<number> {
    // ===== GLOBAL REQUEST DEDUPLICATION =====
    if (globalBookCountPendingRequest) {
      console.debug('[BookService] Request already in progress, returning existing promise');
      return globalBookCountPendingRequest;
    }

    // ===== MINIMUM INTERVAL CHECK =====
    const timeSinceLastRequest = Date.now() - globalLastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.debug('[BookService] Too soon since last request, using cache', {
        timeSinceLastRequest: `${timeSinceLastRequest}ms`,
        minInterval: `${MIN_REQUEST_INTERVAL}ms`,
        waitTime: `${waitTime}ms`,
      });
      // Return cached value or 0 if no cache
      return globalBookCountCache ?? 0;
    }

    // ===== GLOBAL CACHE CHECK =====
    if (globalBookCountLastFetch && globalBookCountCache !== null) {
      const cacheAge = Date.now() - globalBookCountLastFetch.getTime();
      if (cacheAge < BOOK_COUNT_CACHE_TIMEOUT) {
        console.debug('[BookService] Using global cached book count', {
          cacheAge: `${cacheAge}ms`,
          cacheTimeout: `${BOOK_COUNT_CACHE_TIMEOUT}ms`,
          count: globalBookCountCache,
        });
        return globalBookCountCache;
      }
    }

    // ===== FETCH LOGIC =====
    const fetchPromise = (async () => {
      globalLastRequestTime = Date.now();

      try {
        console.info('[BookService] 🚀 Fetching book count from backend (global singleton)');

        const result = await BookService.listBooks({ pagination: { page: 1, limit: 1 } });

        if (!result.success) {
          const errorMessage = result.errors[0] || result.message || 'Unable to load book statistics';
          
          // ✅ FIX: Check if it's a rate limit error
          const isRateLimitError = errorMessage.toLowerCase().includes('rate limit');
          
          if (isRateLimitError) {
            console.warn('[BookService] ⚠️ Rate limit hit, returning cached value or 0', {
              cachedValue: globalBookCountCache,
            });
            // Return cached value if available, otherwise 0
            return globalBookCountCache ?? 0;
          }
          
          // For other errors, throw
          throw new Error(errorMessage);
        }

        const count = result.pagination?.totalCount ?? result.books.length ?? 0;

        // Update global cache
        globalBookCountCache = count;
        globalBookCountLastFetch = new Date();

        console.info('[BookService] ✅ Book count fetched successfully (cached globally)', {
          count,
          cacheTimeout: `${BOOK_COUNT_CACHE_TIMEOUT}ms`,
        });

        return count;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to load book statistics';
        const isRateLimitError = errorMessage.toLowerCase().includes('rate limit');

        if (isRateLimitError) {
          console.warn('[BookService] ⚠️ Rate limit error caught, returning cached value or 0', {
            cachedValue: globalBookCountCache,
          });
          // Return cached value if available, otherwise 0
          return globalBookCountCache ?? 0;
        }

        // For non-rate-limit errors, log and throw
        console.error('[BookService] ❌ Failed to fetch book count', {
          operation: 'getBookCount',
          errorMessage,
        });
        throw new Error(errorMessage);
      } finally {
        globalBookCountPendingRequest = null;
      }
    })();

    globalBookCountPendingRequest = fetchPromise;
    return fetchPromise;
  }
}

export default BookService;
