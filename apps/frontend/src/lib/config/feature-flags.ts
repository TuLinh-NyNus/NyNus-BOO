/**
 * Feature Flags Configuration
 * ============================
 * Centralized feature flags to control feature visibility
 */

import { logger } from '@/lib/logger';

/**
 * Environment-based configuration
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

/**
 * Feature flags type definition
 */
export interface FeatureFlags {
  // LaTeX Processing
  enableLatexParser: boolean;
  enableLatexImport: boolean;
  showParsePreview: boolean;
  
  // Image Processing
  enableImageProcessing: boolean;
  enableTikZRendering: boolean;
  enableGoogleDriveUpload: boolean;
  showImageProcessingStatus: boolean;
  
  // Question Management
  enableQuestionCodeAutoCreate: boolean;
  enableBulkImport: boolean;
  enableMatchingQuestions: boolean; // MA type questions
  
  // UI Features
  showBetaBadge: boolean;
  showDebugInfo: boolean;
  showAdvancedFilters: boolean;
  enableDarkMode: boolean;
  
  // Authentication
  enableGoogleOAuth: boolean;
  enableEmailVerification: boolean;
  enableTwoFactor: boolean;
  
  // Admin Features
  enableAdminDashboard: boolean;
  enableUserManagement: boolean;
  enableSystemLogs: boolean;
  
  // Performance
  enableCaching: boolean;
  enableLazyLoading: boolean;
  enableServiceWorker: boolean;
}

/**
 * Default feature flags configuration
 */
const defaultFlags: FeatureFlags = {
  // LaTeX Processing - Enable in development, disable in production until ready
  enableLatexParser: isDevelopment || isStaging,
  enableLatexImport: isDevelopment,
  showParsePreview: isDevelopment,
  
  // Image Processing - Disable by default until TeX Live is configured
  enableImageProcessing: false,
  enableTikZRendering: false,
  enableGoogleDriveUpload: false,
  showImageProcessingStatus: isDevelopment,
  
  // Question Management
  enableQuestionCodeAutoCreate: true,
  enableBulkImport: isDevelopment || isStaging,
  enableMatchingQuestions: false, // Not fully supported yet
  
  // UI Features
  showBetaBadge: !isProduction,
  showDebugInfo: isDevelopment,
  showAdvancedFilters: true,
  enableDarkMode: true,
  
  // Authentication
  enableGoogleOAuth: true,
  enableEmailVerification: isProduction,
  enableTwoFactor: false,
  
  // Admin Features
  enableAdminDashboard: true,
  enableUserManagement: true,
  enableSystemLogs: isDevelopment,
  
  // Performance
  enableCaching: isProduction,
  enableLazyLoading: true,
  enableServiceWorker: isProduction,
};

/**
 * Override flags from environment variables
 */
const environmentOverrides: Partial<FeatureFlags> = {
  // LaTeX Processing
  enableLatexParser: process.env.NEXT_PUBLIC_ENABLE_LATEX_PARSER === 'true',
  enableLatexImport: process.env.NEXT_PUBLIC_ENABLE_LATEX_IMPORT === 'true',
  showParsePreview: process.env.NEXT_PUBLIC_SHOW_PARSE_PREVIEW === 'true',
  
  // Image Processing
  enableImageProcessing: process.env.NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING === 'true',
  enableTikZRendering: process.env.NEXT_PUBLIC_ENABLE_TIKZ_RENDERING === 'true',
  enableGoogleDriveUpload: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE === 'true',
  
  // Question Management
  enableQuestionCodeAutoCreate: process.env.NEXT_PUBLIC_ENABLE_AUTO_CREATE_CODE !== 'false',
  enableBulkImport: process.env.NEXT_PUBLIC_ENABLE_BULK_IMPORT === 'true',
  enableMatchingQuestions: process.env.NEXT_PUBLIC_ENABLE_MA_QUESTIONS === 'true',
};

/**
 * Merge environment overrides with defaults
 *
 * @description
 * Merges default feature flags with environment-specific overrides.
 * Only applies overrides that are explicitly set (not undefined).
 *
 * @returns {FeatureFlags} Merged feature flags configuration
 */
const mergeFlags = (): FeatureFlags => {
  const merged: Partial<FeatureFlags> = { ...defaultFlags };

  // Apply environment overrides only if explicitly set
  Object.keys(environmentOverrides).forEach(key => {
    const envValue = environmentOverrides[key as keyof FeatureFlags];
    if (envValue !== undefined) {
      merged[key as keyof FeatureFlags] = envValue;
    }
  });

  return merged as FeatureFlags;
};

/**
 * Final feature flags configuration
 */
export const featureFlags: FeatureFlags = mergeFlags();

/**
 * Feature flag checker utility
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature] === true;
};

/**
 * Feature flag hook for React components
 */
export const useFeatureFlag = (feature: keyof FeatureFlags): boolean => {
  // In a real app, this might use context or state management
  // For now, it's a simple wrapper
  return isFeatureEnabled(feature);
};

/**
 * Debug utility to log all feature flags (development only)
 * Business Logic: Hiển thị tất cả feature flags trong development mode
 * - Giúp developers kiểm tra feature flags đang enabled/disabled
 */
export const logFeatureFlags = (): void => {
  if (isDevelopment) {
    const flagsWithStatus = Object.entries(featureFlags).map(([key, value]) => ({
      flag: key,
      enabled: value,
    }));

    logger.debug('[FeatureFlags] Current feature flags configuration', {
      operation: 'logFeatureFlags',
      environment: process.env.NODE_ENV,
      totalFlags: flagsWithStatus.length,
      enabledFlags: flagsWithStatus.filter(f => f.enabled).length,
      flags: flagsWithStatus,
    });
  }
};

/**
 * Export individual flag checkers for convenience
 */
export const features = {
  // LaTeX
  hasLatexParser: () => isFeatureEnabled('enableLatexParser'),
  hasLatexImport: () => isFeatureEnabled('enableLatexImport'),
  hasParsePreview: () => isFeatureEnabled('showParsePreview'),
  
  // Images
  hasImageProcessing: () => isFeatureEnabled('enableImageProcessing'),
  hasTikZRendering: () => isFeatureEnabled('enableTikZRendering'),
  hasGoogleDrive: () => isFeatureEnabled('enableGoogleDriveUpload'),
  
  // Questions
  hasAutoCreateCode: () => isFeatureEnabled('enableQuestionCodeAutoCreate'),
  hasBulkImport: () => isFeatureEnabled('enableBulkImport'),
  hasMatchingQuestions: () => isFeatureEnabled('enableMatchingQuestions'),
  
  // UI
  hasBetaBadge: () => isFeatureEnabled('showBetaBadge'),
  hasDebugInfo: () => isFeatureEnabled('showDebugInfo'),
  hasAdvancedFilters: () => isFeatureEnabled('showAdvancedFilters'),
  hasDarkMode: () => isFeatureEnabled('enableDarkMode'),
  
  // Auth
  hasGoogleOAuth: () => isFeatureEnabled('enableGoogleOAuth'),
  hasEmailVerification: () => isFeatureEnabled('enableEmailVerification'),
  hasTwoFactor: () => isFeatureEnabled('enableTwoFactor'),
  
  // Admin
  hasAdminDashboard: () => isFeatureEnabled('enableAdminDashboard'),
  hasUserManagement: () => isFeatureEnabled('enableUserManagement'),
  hasSystemLogs: () => isFeatureEnabled('enableSystemLogs'),
};

export default featureFlags;
