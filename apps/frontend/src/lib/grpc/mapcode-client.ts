/**
 * MapCode gRPC Client
 * Handles communication with MapCode management service
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// TODO: Generate mapcode protobuf files
// import { grpc } from '@improbable-eng/grpc-web';
// import { MapCodeServiceClient } from '@/generated/v1/mapcode_grpc_web_pb';
// import {
//   CreateVersionRequest,
//   CreateVersionResponse,
//   GetVersionsRequest,
//   GetVersionsResponse,
//   GetActiveVersionRequest,
//   GetActiveVersionResponse,
//   SetActiveVersionRequest,
//   SetActiveVersionResponse,
//   DeleteVersionRequest,
//   DeleteVersionResponse,
//   TranslateCodeRequest,
//   TranslateCodeResponse,
//   TranslateCodesRequest,
//   TranslateCodesResponse,
//   GetHierarchyNavigationRequest,
//   GetHierarchyNavigationResponse,
//   GetStorageInfoRequest,
//   GetStorageInfoResponse,
//   MapCodeVersion,
//   MapCodeTranslation,
//   HierarchyNavigation,
//   StorageInfo
// } from '@/generated/v1/mapcode_pb';

// Temporary types until protobuf files are generated
interface _MapCodeVersion {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface _MapCodeTranslation {
  originalCode: string;
  translatedCode: string;
}

interface _HierarchyNavigation {
  path: string[];
  currentLevel: string;
}

interface _StorageInfo {
  totalSize: number;
  usedSize: number;
  availableSize: number;
}

// Configuration
const _GRPC_ENDPOINT = process.env.NEXT_PUBLIC_GRPC_ENDPOINT || 'http://localhost:8080';

// TODO: Create client instance when protobuf files are generated
// const client = new MapCodeServiceClient(GRPC_ENDPOINT);

// Types for easier usage
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

export interface HierarchyNavigationData {
  questionCode: string;
  grade?: { code: string; name: string; description: string };
  subject?: { code: string; name: string; description: string };
  chapter?: { code: string; name: string; description: string };
  level?: { code: string; name: string; description: string };
  lesson?: { code: string; name: string; description: string };
  form?: { code: string; name: string; description: string };
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

export interface MetricsData {
  totalTranslations: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  avgTranslationTimeMs: number;
  activeVersionId: string;
  lastVersionSwitch?: Date;
  translationErrors: number;
}

// TODO: Helper function to convert proto to data - implement when protobuf files are generated
// function convertVersionToData(version: MapCodeVersion): MapCodeVersionData {
//   return {
//     id: version.getId(),
//     version: version.getVersion(),
//     name: version.getName(),
//     description: version.getDescription(),
//     filePath: version.getFilePath(),
//     isActive: version.getIsActive(),
//     createdBy: version.getCreatedBy(),
//     createdAt: version.getCreatedAt()?.toDate() || new Date(),
//     updatedAt: version.getUpdatedAt()?.toDate() || new Date(),
//   };
// }

// TODO: MapCode Service Client - implement when protobuf files are generated
export class MapCodeClient {
  /**
   * Create a new MapCode version
   */
  static async createVersion(
    version: string,
    name: string,
    description: string,
    createdBy: string,
    content?: string
  ): Promise<MapCodeVersionData> {
    // Stub implementation
    console.warn('MapCodeClient.createVersion: Stub implementation - protobuf files not generated');
    
    // Log content size if provided
    if (content) {
      console.log(`Creating version with content (${content.length} bytes)`);
    }
    
    return Promise.resolve({
      id: `version-${Date.now()}`,
      version,
      name,
      description,
      filePath: `/mapcode/${version}`,
      isActive: false,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Get all versions with pagination
   */
  static async getVersions(page: number = 1, pageSize: number = 10): Promise<{
    versions: MapCodeVersionData[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    // Stub implementation
    console.warn('MapCodeClient.getVersions: Stub implementation - protobuf files not generated');
    return Promise.resolve({
      versions: [],
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
  }

  /**
   * Get the currently active version
   */
  static async getActiveVersion(): Promise<MapCodeVersionData> {
    // Stub implementation
    console.warn('MapCodeClient.getActiveVersion: Stub implementation - protobuf files not generated');
    return Promise.resolve({
      id: 'active-version-1',
      version: '1.0.0',
      name: 'Active Version',
      description: 'Currently active mapcode version',
      filePath: '/mapcode/active',
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Set a version as active
   */
  static async setActiveVersion(versionId: string): Promise<string> {
    // Stub implementation
    console.warn('MapCodeClient.setActiveVersion: Stub implementation - protobuf files not generated');
    return Promise.resolve(`Version ${versionId} activated successfully`);
  }

  /**
   * Delete a version
   */
  static async deleteVersion(versionId: string): Promise<string> {
    // Stub implementation
    console.warn('MapCodeClient.deleteVersion: Stub implementation - protobuf files not generated');
    return Promise.resolve(`Version ${versionId} deleted successfully`);
  }

  /**
   * Translate a single question code
   */
  static async translateCode(questionCode: string): Promise<MapCodeTranslationData> {
    // Stub implementation
    console.warn('MapCodeClient.translateCode: Stub implementation - protobuf files not generated');
    return Promise.resolve({
      questionCode,
      translation: `Translated: ${questionCode}`,
      grade: 'Grade 10',
      subject: 'Math',
      chapter: 'Chapter 1',
      level: 'Basic',
      lesson: 'Lesson 1',
      form: 'Form A',
    });
  }

  /**
   * Translate multiple question codes
   */
  static async translateCodes(questionCodes: string[]): Promise<Record<string, string>> {
    // Stub implementation
    console.warn('MapCodeClient.translateCodes: Stub implementation - protobuf files not generated');
    const result: Record<string, string> = {};
    questionCodes.forEach(code => {
      result[code] = `Translated: ${code}`;
    });
    return Promise.resolve(result);
  }

  /**
   * Get hierarchy navigation for a question code
   */
  static async getHierarchyNavigation(questionCode: string): Promise<HierarchyNavigationData> {
    // Stub implementation
    console.warn('MapCodeClient.getHierarchyNavigation: Stub implementation - protobuf files not generated');
    return Promise.resolve({
      questionCode,
      breadcrumbs: ['Grade 10', 'Math', 'Chapter 1'],
      grade: { code: 'G10', name: 'Grade 10', description: 'Grade 10 level' },
      subject: { code: 'MATH', name: 'Mathematics', description: 'Mathematics subject' },
      chapter: { code: 'C1', name: 'Chapter 1', description: 'First chapter' },
    });
  }

  /**
   * Get storage information
   */
  static async getStorageInfo(): Promise<StorageInfoData> {
    // Stub implementation
    console.warn('MapCodeClient.getStorageInfo: Stub implementation - protobuf files not generated');
    return Promise.resolve({
      totalVersions: 5,
      maxVersions: 10,
      availableSlots: 5,
      warningLevel: 8,
      isNearLimit: false,
      isAtLimit: false,
      warningMessage: '',
    });
  }

  /**
   * Get performance metrics
   */
  static async getMetrics(): Promise<MetricsData> {
    // TODO: Replace with real gRPC call when protobuf files are generated
    // For now, make HTTP call to gRPC-Gateway endpoint
    try {
      const response = await fetch(`${_GRPC_ENDPOINT}/api/v1/mapcode/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert response to MetricsData
      return {
        totalTranslations: data.metrics?.totalTranslations || data.metrics?.total_translations || 0,
        cacheHits: data.metrics?.cacheHits || data.metrics?.cache_hits || 0,
        cacheMisses: data.metrics?.cacheMisses || data.metrics?.cache_misses || 0,
        cacheHitRate: data.metrics?.cacheHitRate || data.metrics?.cache_hit_rate || 0,
        avgTranslationTimeMs: data.metrics?.avgTranslationTimeMs || data.metrics?.avg_translation_time_ms || 0,
        activeVersionId: data.metrics?.activeVersionId || data.metrics?.active_version_id || '',
        lastVersionSwitch: data.metrics?.lastVersionSwitch || data.metrics?.last_version_switch 
          ? new Date(data.metrics.lastVersionSwitch || data.metrics.last_version_switch)
          : undefined,
        translationErrors: data.metrics?.translationErrors || data.metrics?.translation_errors || 0,
      };
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Return empty metrics on error
      return {
        totalTranslations: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0,
        avgTranslationTimeMs: 0,
        activeVersionId: '',
        translationErrors: 0,
      };
    }
  }

  /**
   * Export a MapCode version in the specified format
   */
  static async exportVersion(versionId: string, format: 'markdown' | 'json' | 'csv' = 'markdown'): Promise<{
    content: string;
    filename: string;
  }> {
    // TODO: Replace with real gRPC call when protobuf files are generated
    // For now, make HTTP call to gRPC-Gateway endpoint
    try {
      const response = await fetch(
        `${_GRPC_ENDPOINT}/api/v1/mapcode/versions/${versionId}/export?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.status?.success) {
        throw new Error(data.status?.message || 'Export failed');
      }

      return {
        content: data.content || '',
        filename: data.filename || `MapCode-export-${Date.now()}.${format}`,
      };
    } catch (error) {
      console.error('Failed to export version:', error);
      throw error;
    }
  }
}
