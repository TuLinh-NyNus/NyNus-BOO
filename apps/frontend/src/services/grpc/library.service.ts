/**
 * Library Service Client (gRPC-Web)
 * Cung cấp wrapper TypeScript thân thiện cho các RPC LibraryService.
 */

import { RpcError, StatusCode } from 'grpc-web';
import { Int32Value } from 'google-protobuf/google/protobuf/wrappers_pb';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';

import { LibraryServiceClient } from '@/generated/v1/LibraryServiceClientPb';
import {
  LibraryItemType,
  LibraryUploadStatus,
  LibraryItem,
  LibraryFilter,
  ListLibraryItemsRequest,
  ListLibraryItemsResponse,
  GetLibraryItemRequest,
  SearchLibraryItemsRequest,
  ApproveLibraryItemRequest,
  RateLibraryItemRequest,
  BookmarkLibraryItemRequest,
  DownloadLibraryItemRequest,
  CreateLibraryItemRequest,
  UpdateLibraryItemRequest,
  LibraryItemPayload,
} from '@/generated/v1/library_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { GRPC_WEB_HOST } from './config';
import { getAuthMetadata } from './client';

// ====== Kiểu dữ liệu FE ======

export type LibraryItemKind = 'book' | 'exam' | 'video';

export type LibraryUploadState = 'pending' | 'approved' | 'rejected' | 'archived';

export interface LibraryBaseMetadata {
  subject: string;
  grade: string;
}

export interface LibraryBookMetadata extends LibraryBaseMetadata {
  kind: 'book';
  bookType: string;
  author: string;
  publisher: string;
  publicationYear?: number;
  isbn: string;
  pageCount?: number;
  coverImage: string;
}

export interface LibraryExamMetadata extends LibraryBaseMetadata {
  kind: 'exam';
  province: string;
  school: string;
  academicYear: string;
  semester: string;
  examDuration?: number;
  questionCount?: number;
  difficulty: string;
  examType: string;
}

export interface LibraryVideoMetadata extends LibraryBaseMetadata {
  kind: 'video';
  youtubeUrl: string;
  youtubeId: string;
  duration?: number;
  quality: string;
  instructorName: string;
  relatedExamId: string;
}

export type LibraryMetadata =
  | LibraryBookMetadata
  | LibraryExamMetadata
  | LibraryVideoMetadata;

export interface LibraryItemView {
  id: string;
  title: string;
  type: LibraryItemKind;
  description: string;
  category: string;
  fileUrl: string;
  fileId: string;
  thumbnailUrl: string;
  fileSize?: string;
  uploadStatus: LibraryUploadState;
  isActive: boolean;
  uploadedBy: string;
  approvedBy: string;
  tags: string[];
  requiredRole: string;
  requiredLevel?: number;
  targetRoles: string[];
  downloadCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
  metadata: LibraryMetadata;
}

export interface LibraryListResult {
  success: boolean;
  message: string;
  errors: string[];
  items: LibraryItemView[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  isFallback?: boolean;
}

export interface LibraryItemResult {
  success: boolean;
  message: string;
  errors: string[];
  item?: LibraryItemView;
}

export interface RateItemResult {
  success: boolean;
  message: string;
  errors: string[];
  averageRating?: number;
  reviewCount?: number;
}

export interface BookmarkItemResult {
  success: boolean;
  message: string;
  errors: string[];
  bookmarked: boolean;
}

export interface DownloadItemResult {
  success: boolean;
  message: string;
  errors: string[];
  downloadUrl?: string;
}

// ====== Helper ======

const libraryServiceClient = new LibraryServiceClient(GRPC_WEB_HOST, null, {
  format: 'text',
  withCredentials: false,
});

function handleGrpcError(error: RpcError): string {
  switch (error.code) {
    case StatusCode.INVALID_ARGUMENT:
      return error.message || 'Yêu cầu không hợp lệ';
    case StatusCode.NOT_FOUND:
      return 'Không tìm thấy nội dung';
    case StatusCode.PERMISSION_DENIED:
      return 'Bạn không có quyền thực hiện thao tác này';
    case StatusCode.UNAUTHENTICATED:
      return 'Vui lòng đăng nhập để tiếp tục';
    case StatusCode.UNAVAILABLE:
      return 'Dịch vụ tạm thời không khả dụng';
    default:
      return error.message || 'Đã xảy ra lỗi không xác định';
  }
}

function metadataFromWrapper(value?: Int32Value): number | undefined {
  if (!value) return undefined;
  const v = value.getValue();
  return Number.isFinite(v) ? v : undefined;
}

function timestampToIso(value?: Timestamp): string | undefined {
  if (!value) return undefined;
  try {
    return value.toDate().toISOString();
  } catch {
    return undefined;
  }
}

function toUploadState(status: LibraryUploadStatus): LibraryUploadState {
  switch (status) {
    case LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_APPROVED:
      return 'approved';
    case LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_REJECTED:
      return 'rejected';
    case LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_ARCHIVED:
      return 'archived';
    default:
      return 'pending';
  }
}

function toItemKind(type: LibraryItemType): LibraryItemKind {
  switch (type) {
    case LibraryItemType.LIBRARY_ITEM_TYPE_EXAM:
      return 'exam';
    case LibraryItemType.LIBRARY_ITEM_TYPE_VIDEO:
      return 'video';
    case LibraryItemType.LIBRARY_ITEM_TYPE_BOOK:
    default:
      return 'book';
  }
}

function fromItemKind(kind: LibraryItemKind): LibraryItemType {
  switch (kind) {
    case 'exam':
      return LibraryItemType.LIBRARY_ITEM_TYPE_EXAM;
    case 'video':
      return LibraryItemType.LIBRARY_ITEM_TYPE_VIDEO;
    default:
      return LibraryItemType.LIBRARY_ITEM_TYPE_BOOK;
  }
}

function mapMetadata(item: LibraryItem): LibraryMetadata {
  switch (item.getMetadataCase()) {
    case LibraryItem.MetadataCase.EXAM: {
      const exam = item.getExam();
      return {
        kind: 'exam',
        subject: exam?.getSubject() ?? '',
        grade: exam?.getGrade() ?? '',
        province: exam?.getProvince() ?? '',
        school: exam?.getSchool() ?? '',
        academicYear: exam?.getAcademicYear() ?? '',
        semester: exam?.getSemester() ?? '',
        examDuration: exam?.getExamDuration()?.getValue(),
        questionCount: exam?.getQuestionCount()?.getValue(),
        difficulty: exam?.getDifficultyLevel() ?? '',
        examType: exam?.getExamType() ?? '',
      };
    }
    case LibraryItem.MetadataCase.VIDEO: {
      const video = item.getVideo();
      return {
        kind: 'video',
        subject: video?.getSubject() ?? '',
        grade: video?.getGrade() ?? '',
        youtubeUrl: video?.getYoutubeUrl() ?? '',
        youtubeId: video?.getYoutubeId() ?? '',
        duration: video?.getDuration()?.getValue(),
        quality: video?.getQuality() ?? '',
        instructorName: video?.getInstructorName() ?? '',
        relatedExamId: video?.getRelatedExamId() ?? '',
      };
    }
    case LibraryItem.MetadataCase.BOOK:
    default: {
      const book = item.getBook();
      return {
        kind: 'book',
        subject: book?.getSubject() ?? '',
        grade: book?.getGrade() ?? '',
        bookType: book?.getBookType() ?? '',
        author: book?.getAuthor() ?? '',
        publisher: book?.getPublisher() ?? '',
        publicationYear: book?.getPublicationYear()?.getValue(),
        isbn: book?.getIsbn() ?? '',
        pageCount: book?.getPageCount()?.getValue(),
        coverImage: book?.getCoverImage() ?? '',
      };
    }
  }
}

function mapLibraryItem(item: LibraryItem): LibraryItemView {
  const fileSizeWrapper = item.getFileSize();
  const fileSize = fileSizeWrapper
    ? String(fileSizeWrapper.getValue())
    : undefined;

  return {
    id: item.getId(),
    title: item.getName(),
    type: toItemKind(item.getType()),
    description: item.getDescription(),
    category: item.getRequiredRole() || 'general',
    fileUrl: item.getFileUrl(),
    fileId: item.getFileId(),
    thumbnailUrl: item.getThumbnailUrl(),
    fileSize,
    uploadStatus: toUploadState(item.getUploadStatus()),
    isActive: item.getIsActive(),
    uploadedBy: item.getUploadedBy(),
    approvedBy: item.getApprovedBy(),
    tags: item.getTagsList(),
    requiredRole: item.getRequiredRole(),
    requiredLevel: metadataFromWrapper(item.getRequiredLevel()),
    targetRoles: item.getTargetRolesList(),
    downloadCount: item.getDownloadCount(),
    averageRating: item.getAverageRating(),
    reviewCount: item.getReviewCount(),
    createdAt: timestampToIso(item.getCreatedAt()),
    updatedAt: timestampToIso(item.getUpdatedAt()),
    metadata: mapMetadata(item),
  };
}

function extractResponseErrors(response?: ListLibraryItemsResponse | null): string[] {
  const base = response?.getResponse();
  if (!base) return [];
  const errors = base.getErrorsList().filter(Boolean);
  if (!errors.length && base.getSuccess() === false && base.getMessage()) {
    return [base.getMessage()];
  }
  return errors;
}

// ====== Request helpers ======

export interface LibraryFilterInput {
  types?: LibraryItemKind[];
  subjects?: string[];
  grades?: string[];
  province?: string;
  academicYear?: string;
  semester?: string;
  difficultyLevel?: string;
  examType?: string;
  bookType?: string;
  videoQuality?: string;
  tags?: string[];
  onlyActive?: boolean;
  minLevel?: number;
  maxLevel?: number;
  requiredRole?: string;
}

export interface LibraryListParams {
  pagination?: { page?: number; limit?: number };
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: LibraryFilterInput;
}

function buildFilter(input?: LibraryFilterInput): LibraryFilter | undefined {
  if (!input) return undefined;
  const filter = new LibraryFilter();

  if (input.types?.length) {
    filter.setTypesList(input.types.map(fromItemKind));
  }
  if (input.subjects?.length) filter.setSubjectsList(input.subjects);
  if (input.grades?.length) filter.setGradesList(input.grades);
  if (input.tags?.length) filter.setTagsList(input.tags);

  if (input.province) filter.setProvince(input.province);
  if (input.academicYear) filter.setAcademicYear(input.academicYear);
  if (input.semester) filter.setSemester(input.semester);
  if (input.difficultyLevel) filter.setDifficultyLevel(input.difficultyLevel);
  if (input.examType) filter.setExamType(input.examType);
  if (input.bookType) filter.setBookType(input.bookType);
  if (input.videoQuality) filter.setVideoQuality(input.videoQuality);

  if (input.onlyActive !== undefined) filter.setOnlyActive(input.onlyActive);
  if (input.requiredRole) filter.setRequiredRole(input.requiredRole);

  if (input.minLevel !== undefined) {
    const min = new Int32Value();
    min.setValue(input.minLevel);
    filter.setMinLevel(min);
  }
  if (input.maxLevel !== undefined) {
    const max = new Int32Value();
    max.setValue(input.maxLevel);
    filter.setMaxLevel(max);
  }
  return filter;
}

function buildPagination(pagination?: { page?: number; limit?: number }): PaginationRequest | undefined {
  if (!pagination) return undefined;
  const payload = new PaginationRequest();
  if (pagination.page) payload.setPage(pagination.page);
  if (pagination.limit) payload.setLimit(pagination.limit);
  return payload;
}

// ====== Service ======

export class LibraryService {
  static async listItems(params: LibraryListParams = {}): Promise<LibraryListResult> {
    const request = new ListLibraryItemsRequest();

    const pagination = buildPagination(params.pagination);
    if (pagination) request.setPagination(pagination);

    const filter = buildFilter(params.filter);
    if (filter) request.setFilter(filter);

    if (params.search) request.setSearch(params.search);
    if (params.sortBy) request.setSortBy(params.sortBy);
    if (params.sortOrder) request.setSortOrder(params.sortOrder);

    try {
      const response = await libraryServiceClient.listItems(request, getAuthMetadata());
      const responseObj = response.getResponse();
      const errors = extractResponseErrors(response);

      if (responseObj && responseObj.getSuccess() === false) {
        return {
          success: false,
          message: responseObj.getMessage(),
          errors,
          items: [],
        };
      }

      const paginationResp = response.getPagination();
      return {
        success: true,
        message: responseObj?.getMessage() ?? '',
        errors,
        items: response.getItemsList().map(mapLibraryItem),
        pagination: paginationResp
          ? {
              page: paginationResp.getPage(),
              limit: paginationResp.getLimit(),
              totalCount: paginationResp.getTotalCount(),
              totalPages: paginationResp.getTotalPages(),
            }
          : undefined,
      };
    } catch (error) {
      const rpcError = error as RpcError;
      if (rpcError.code === StatusCode.UNIMPLEMENTED) {
        return {
          success: true,
          message: 'LibraryService chưa được kích hoạt trên môi trường hiện tại',
          errors: [],
          items: [],
          pagination: {
            page: params.pagination?.page ?? 1,
            limit: params.pagination?.limit ?? 20,
            totalCount: 0,
            totalPages: 0,
          },
          isFallback: true,
        };
      }

      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
        items: [],
      };
    }
  }

  static async searchItems(params: LibraryListParams = {}): Promise<LibraryListResult> {
    const request = new SearchLibraryItemsRequest();

    const pagination = buildPagination(params.pagination);
    if (pagination) request.setPagination(pagination);

    const filter = buildFilter(params.filter);
    if (filter) request.setFilter(filter);

    if (params.search) request.setQuery(params.search);

    try {
      const response = await libraryServiceClient.searchItems(request, getAuthMetadata());
      const base = response.getResponse();
      const errors = base?.getErrorsList() ?? [];

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors,
          items: [],
        };
      }

      const paginationResp = response.getPagination();
      return {
        success: true,
        message: base?.getMessage() ?? '',
        errors,
        items: response.getItemsList().map(mapLibraryItem),
        pagination: paginationResp
          ? {
              page: paginationResp.getPage(),
              limit: paginationResp.getLimit(),
              totalCount: paginationResp.getTotalCount(),
              totalPages: paginationResp.getTotalPages(),
            }
          : undefined,
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
        items: [],
      };
    }
  }

  static async getItem(id: string): Promise<LibraryItemResult> {
    const request = new GetLibraryItemRequest();
    request.setId(id);

    try {
      const response = await libraryServiceClient.getItem(request, getAuthMetadata());
      const base = response.getResponse();
      const item = response.getItem();

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors: base.getErrorsList(),
        };
      }

      if (!item) {
        return {
          success: false,
          message: 'Không tìm thấy nội dung',
          errors: ['Item not found'],
        };
      }

      return {
        success: true,
        message: base?.getMessage() ?? '',
        errors: base?.getErrorsList() ?? [],
        item: mapLibraryItem(item),
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
      };
    }
  }

  static async approveItem(id: string, status: LibraryUploadState): Promise<LibraryItemResult> {
    const request = new ApproveLibraryItemRequest();
    request.setId(id);
    request.setStatus(
      {
        approved: LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_APPROVED,
        rejected: LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_REJECTED,
        archived: LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_ARCHIVED,
        pending: LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_PENDING,
      }[status] ?? LibraryUploadStatus.LIBRARY_UPLOAD_STATUS_APPROVED,
    );

    try {
      const response = await libraryServiceClient.approveItem(request, getAuthMetadata());
      const base = response.getResponse();
      const item = response.getItem();

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors: base.getErrorsList(),
        };
      }

      return {
        success: true,
        message: base?.getMessage() ?? 'Cập nhật trạng thái thành công',
        errors: base?.getErrorsList() ?? [],
        item: item ? mapLibraryItem(item) : undefined,
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
      };
    }
  }

  static async rateItem(id: string, rating: number, review?: string): Promise<RateItemResult> {
    const request = new RateLibraryItemRequest();
    request.setId(id);
    request.setRating(rating);
    if (review) request.setReview(review);

    try {
      const response = await libraryServiceClient.rateItem(request, getAuthMetadata());
      const base = response.getResponse();

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors: base.getErrorsList(),
        };
      }

      return {
        success: true,
        message: base?.getMessage() ?? 'Đánh giá thành công',
        errors: base?.getErrorsList() ?? [],
        averageRating: response.getAverageRating(),
        reviewCount: response.getReviewCount(),
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
      };
    }
  }

  static async bookmarkItem(id: string, bookmarked: boolean): Promise<BookmarkItemResult> {
    const request = new BookmarkLibraryItemRequest();
    request.setId(id);
    request.setBookmark(bookmarked);

    try {
      const response = await libraryServiceClient.bookmarkItem(request, getAuthMetadata());
      const base = response.getResponse();

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors: base.getErrorsList(),
          bookmarked: bookmarked,
        };
      }

      return {
        success: true,
        message: base?.getMessage() ?? (bookmarked ? 'Đã thêm vào bookmark' : 'Đã gỡ khỏi bookmark'),
        errors: base?.getErrorsList() ?? [],
        bookmarked: response.getBookmarked(),
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
        bookmarked,
      };
    }
  }

  static async downloadItem(id: string): Promise<DownloadItemResult> {
    const request = new DownloadLibraryItemRequest();
    request.setId(id);

    try {
      const response = await libraryServiceClient.downloadItem(request, getAuthMetadata());
      const base = response.getResponse();

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors: base.getErrorsList(),
        };
      }

      return {
        success: true,
        message: base?.getMessage() ?? 'Tải xuống thành công',
        errors: base?.getErrorsList() ?? [],
        downloadUrl: response.getDownloadUrl(),
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
      };
    }
  }

  /**
   * (Optional) tạo item mới – hiện tại backend chỉ hỗ trợ sách.
   * Hàm này để chuẩn bị cho tương lai khi UI cho phép upload.
   */
  static async createItem(payload: LibraryItemPayload): Promise<LibraryItemResult> {
    const request = new CreateLibraryItemRequest();
    request.setItem(payload);

    try {
      const response = await libraryServiceClient.createItem(request, getAuthMetadata());
      const base = response.getResponse();
      const item = response.getItem();

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors: base.getErrorsList(),
        };
      }

      return {
        success: true,
        message: base?.getMessage() ?? 'Tạo nội dung thành công',
        errors: base?.getErrorsList() ?? [],
        item: item ? mapLibraryItem(item) : undefined,
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
      };
    }
  }

  static async updateItem(id: string, payload: LibraryItemPayload): Promise<LibraryItemResult> {
    const request = new UpdateLibraryItemRequest();
    request.setId(id);
    request.setItem(payload);

    try {
      const response = await libraryServiceClient.updateItem(request, getAuthMetadata());
      const base = response.getResponse();
      const item = response.getItem();

      if (base && base.getSuccess() === false) {
        return {
          success: false,
          message: base.getMessage(),
          errors: base.getErrorsList(),
        };
      }

      return {
        success: true,
        message: base?.getMessage() ?? 'Cập nhật nội dung thành công',
        errors: base?.getErrorsList() ?? [],
        item: item ? mapLibraryItem(item) : undefined,
      };
    } catch (error) {
      const rpcError = error as RpcError;
      const message = handleGrpcError(rpcError);
      return {
        success: false,
        message,
        errors: [message],
      };
    }
  }
}

export default LibraryService;
