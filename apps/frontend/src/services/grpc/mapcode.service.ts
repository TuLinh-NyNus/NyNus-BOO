/**
 * MapCode Service Client (gRPC-Web)
 * ======================
 * Real gRPC client implementation for MapCodeService
 * Replaces stub implementation with actual backend calls
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Real gRPC Implementation
 * @created 2025-01-19
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// gRPC-Web imports
import { MapcodeServiceClient } from '@/generated/v1/MapcodeServiceClientPb';
import {
  MapCodeVersion as PbMapCodeVersion,
  MapCodeTranslation as PbMapCodeTranslation,
  HierarchyNavigation as PbHierarchyNavigation,
  HierarchyLevel as PbHierarchyLevel,
  StorageInfo as PbStorageInfo,
  CreateVersionRequest,
  GetVersionsRequest,
  GetActiveVersionRequest,
  SetActiveVersionRequest,
  DeleteVersionRequest,
  TranslateCodeRequest,
  TranslateCodesRequest,
  GetHierarchyNavigationRequest,
  GetStorageInfoRequest,
} from '@/generated/v1/mapcode_pb';
import { RpcError } from 'grpc-web';

// gRPC client utilities
import { getGrpcUrl } from '@/lib/config/endpoints';
import { getAuthMetadata } from './client';

// Frontend types (from mapcode-client.ts)
export interface MapCodeVersionData {
  id: string;
  version: string;
  name: string;
  description: string;
  filePath: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapCodeTranslationData {
  questionCode: string;
  translation: string;
  grade?: string;
  subject?: string;
  chapter?: string;
  level?: string;
  lesson?: string;
  form?: string;
}

export interface HierarchyLevelData {
  code: string;
  name: string;
  description: string;
}

export interface HierarchyNavigationData {
  questionCode: string;
  grade?: HierarchyLevelData;
  subject?: HierarchyLevelData;
  chapter?: HierarchyLevelData;
  level?: HierarchyLevelData;
  lesson?: HierarchyLevelData;
  form?: HierarchyLevelData;
  breadcrumbs: string[];
}

export interface StorageInfoData {
  totalVersions: number;
  maxVersions: number;
  availableSlots: number;
  warningLevel: number;
  isNearLimit: boolean;
  isAtLimit: boolean;
  warningMessage: string;
}

// ===== gRPC CLIENT INITIALIZATION =====

const GRPC_ENDPOINT = getGrpcUrl();
const mapcodeServiceClient = new MapcodeServiceClient(GRPC_ENDPOINT);

// ===== OBJECT MAPPERS =====

/**
 * Map protobuf MapCodeVersion to frontend MapCodeVersionData
 */
function mapVersionFromPb(pbVersion: PbMapCodeVersion): MapCodeVersionData {
  const versionObj = pbVersion.toObject();
  
  return {
    id: versionObj.id,
    version: versionObj.version,
    name: versionObj.name,
    description: versionObj.description,
    filePath: versionObj.filePath,
    isActive: versionObj.isActive,
    createdBy: versionObj.createdBy,
    createdAt: versionObj.createdAt?.seconds ? new Date(versionObj.createdAt.seconds * 1000) : new Date(),
    updatedAt: versionObj.updatedAt?.seconds ? new Date(versionObj.updatedAt.seconds * 1000) : new Date(),
  };
}

/**
 * Map protobuf MapCodeTranslation to frontend MapCodeTranslationData
 */
function mapTranslationFromPb(pbTranslation: PbMapCodeTranslation): MapCodeTranslationData {
  const translationObj = pbTranslation.toObject();
  
  return {
    questionCode: translationObj.questionCode,
    translation: translationObj.translation,
    grade: translationObj.grade || undefined,
    subject: translationObj.subject || undefined,
    chapter: translationObj.chapter || undefined,
    level: translationObj.level || undefined,
    lesson: translationObj.lesson || undefined,
    form: translationObj.form || undefined,
  };
}

/**
 * Map protobuf HierarchyLevel to frontend HierarchyLevelData
 */
function mapHierarchyLevelFromPb(pbLevel: PbHierarchyLevel | undefined): HierarchyLevelData | undefined {
  if (!pbLevel) return undefined;
  
  const levelObj = pbLevel.toObject();
  return {
    code: levelObj.code,
    name: levelObj.name,
    description: levelObj.description,
  };
}

/**
 * Map protobuf HierarchyNavigation to frontend HierarchyNavigationData
 */
function mapHierarchyNavigationFromPb(pbNavigation: PbHierarchyNavigation): HierarchyNavigationData {
  const navigationObj = pbNavigation.toObject();
  
  return {
    questionCode: navigationObj.questionCode,
    grade: navigationObj.grade ? mapHierarchyLevelFromPb(pbNavigation.getGrade()) : undefined,
    subject: navigationObj.subject ? mapHierarchyLevelFromPb(pbNavigation.getSubject()) : undefined,
    chapter: navigationObj.chapter ? mapHierarchyLevelFromPb(pbNavigation.getChapter()) : undefined,
    level: navigationObj.level ? mapHierarchyLevelFromPb(pbNavigation.getLevel()) : undefined,
    lesson: navigationObj.lesson ? mapHierarchyLevelFromPb(pbNavigation.getLesson()) : undefined,
    form: navigationObj.form ? mapHierarchyLevelFromPb(pbNavigation.getForm()) : undefined,
    breadcrumbs: navigationObj.breadcrumbsList || [],
  };
}

/**
 * Map protobuf StorageInfo to frontend StorageInfoData
 */
function mapStorageInfoFromPb(pbStorage: PbStorageInfo): StorageInfoData {
  const storageObj = pbStorage.toObject();
  
  return {
    totalVersions: storageObj.totalVersions,
    maxVersions: storageObj.maxVersions,
    availableSlots: storageObj.availableSlots,
    warningLevel: storageObj.warningLevel,
    isNearLimit: storageObj.isNearLimit,
    isAtLimit: storageObj.isAtLimit,
    warningMessage: storageObj.warningMessage,
  };
}

// ===== ERROR HANDLING =====

/**
 * Handle gRPC errors and convert to user-friendly messages
 */
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Dữ liệu không hợp lệ';
    case 5: return 'Không tìm thấy MapCode version';
    case 7: return 'Bạn không có quyền thực hiện thao tác này';
    case 14: return 'Dịch vụ tạm thời không khả dụng';
    case 16: return 'Vui lòng đăng nhập để tiếp tục';
    default: return error.message || 'Đã xảy ra lỗi không xác định';
  }
}

// ===== MAPCODE SERVICE IMPLEMENTATION =====

export const MapCodeService = {
  /**
   * Create a new MapCode version
   * Tạo version mới cho MapCode
   */
  createVersion: async (
    version: string,
    name: string,
    description: string,
    createdBy: string
  ): Promise<MapCodeVersionData> => {
    try {
      const request = new CreateVersionRequest();
      request.setVersion(version);
      request.setName(name);
      request.setDescription(description);
      request.setCreatedBy(createdBy);

      const response = await mapcodeServiceClient.createVersion(request, getAuthMetadata());
      const versionData = response.getVersion();
      
      if (!versionData) {
        throw new Error('No version returned from server');
      }

      return mapVersionFromPb(versionData);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all versions with pagination
   * Lấy danh sách tất cả versions
   */
  getVersions: async (page: number = 1, pageSize: number = 10): Promise<{
    versions: MapCodeVersionData[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> => {
    try {
      const request = new GetVersionsRequest();
      request.setPage(page);
      request.setPageSize(pageSize);

      const response = await mapcodeServiceClient.getVersions(request, getAuthMetadata());
      const versions = response.getVersionsList().map(mapVersionFromPb);
      const paginationResponse = response.getPagination();
      
      const totalPages = paginationResponse?.getTotalPages() || 1;
      const totalItems = paginationResponse?.getTotalCount() || 0;
      
      return {
        versions,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages,
          totalItems,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get the currently active version
   * Lấy version đang active
   */
  getActiveVersion: async (): Promise<MapCodeVersionData> => {
    try {
      const request = new GetActiveVersionRequest();

      const response = await mapcodeServiceClient.getActiveVersion(request, getAuthMetadata());
      const version = response.getVersion();
      
      if (!version) {
        throw new Error('No active version found');
      }

      return mapVersionFromPb(version);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Set a version as active
   * Đặt version làm active
   */
  setActiveVersion: async (versionId: string): Promise<string> => {
    try {
      const request = new SetActiveVersionRequest();
      request.setVersionId(versionId);

      const response = await mapcodeServiceClient.setActiveVersion(request, getAuthMetadata());
      const status = response.getStatus();

      return status?.getMessage() || 'Version activated successfully';
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete a version
   * Xóa version
   */
  deleteVersion: async (versionId: string): Promise<string> => {
    try {
      const request = new DeleteVersionRequest();
      request.setVersionId(versionId);

      const response = await mapcodeServiceClient.deleteVersion(request, getAuthMetadata());
      const status = response.getStatus();

      return status?.getMessage() || 'Version deleted successfully';
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Translate a single question code
   * Dịch một mã câu hỏi
   */
  translateCode: async (questionCode: string): Promise<MapCodeTranslationData> => {
    try {
      const request = new TranslateCodeRequest();
      request.setQuestionCode(questionCode);

      const response = await mapcodeServiceClient.translateCode(request, getAuthMetadata());
      const translation = response.getTranslation();

      if (!translation) {
        throw new Error('No translation returned from server');
      }

      return mapTranslationFromPb(translation);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Translate multiple question codes
   * Dịch nhiều mã câu hỏi
   */
  translateCodes: async (questionCodes: string[]): Promise<Record<string, string>> => {
    try {
      const request = new TranslateCodesRequest();
      request.setQuestionCodesList(questionCodes);

      const response = await mapcodeServiceClient.translateCodes(request, getAuthMetadata());
      const translationsMap = response.getTranslationsMap();

      const result: Record<string, string> = {};
      translationsMap.forEach((value: string, key: string) => {
        result[key] = value;
      });

      return result;
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get hierarchy navigation for a question code
   * Lấy cấu trúc phân cấp cho mã câu hỏi
   */
  getHierarchyNavigation: async (questionCode: string): Promise<HierarchyNavigationData> => {
    try {
      const request = new GetHierarchyNavigationRequest();
      request.setQuestionCode(questionCode);

      const response = await mapcodeServiceClient.getHierarchyNavigation(request, getAuthMetadata());
      const navigation = response.getNavigation();

      if (!navigation) {
        throw new Error('No navigation returned from server');
      }

      return mapHierarchyNavigationFromPb(navigation);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get storage information
   * Lấy thông tin lưu trữ
   */
  getStorageInfo: async (): Promise<StorageInfoData> => {
    try {
      const request = new GetStorageInfoRequest();

      const response = await mapcodeServiceClient.getStorageInfo(request, getAuthMetadata());
      const storage = response.getStorage();

      if (!storage) {
        throw new Error('No storage info returned from server');
      }

      return mapStorageInfoFromPb(storage);
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      throw new Error(errorMessage);
    }
  },
};

export default MapCodeService;

