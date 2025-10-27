/**
 * Profile Service gRPC Client
 * ===========================
 * Handles user profile, sessions, and preferences
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ProfileServiceClient } from '@/generated/v1/ProfileServiceClientPb';
import {
  GetProfileRequest,
  UpdateProfileRequest,
  GetSessionsRequest,
  TerminateSessionRequest,
  TerminateAllSessionsRequest,
  GetPreferencesRequest,
  UpdatePreferencesRequest,
  UserProfile,
  UserSession,
  UserPreferences,
} from '@/generated/v1/profile_pb';
import { RpcError } from 'grpc-web';
import { GRPC_WEB_HOST } from './client';

// gRPC client configuration
// Uses GRPC_WEB_HOST which routes through API proxy (/api/grpc) by default
// ✅ FIX: Add format option to match proto generation config (mode=grpcwebtext)
const profileServiceClient = new ProfileServiceClient(GRPC_WEB_HOST, null, {
  format: 'text', // Use text format for consistency with proto generation
  withCredentials: false,
  unaryInterceptors: [],
  streamInterceptors: []
});

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

// Map UserProfile from protobuf
function mapProfileFromPb(profile: UserProfile): any {
  return {
    id: profile.getId(),
    email: profile.getEmail(),
    username: profile.getUsername(),
    first_name: profile.getFirstName(),
    last_name: profile.getLastName(),
    avatar: profile.getAvatar(),
    bio: profile.getBio(),
    phone: profile.getPhone(),
    address: profile.getAddress(),
    school: profile.getSchool(),
    date_of_birth: profile.getDateOfBirth(),
    gender: profile.getGender(),
    role: profile.getRole(),
    level: profile.getLevel(),
    status: profile.getStatus(),
    email_verified: profile.getEmailVerified(),
    created_at: profile.getCreatedAt(),
    updated_at: profile.getUpdatedAt(),
  };
}

// Map UserSession from protobuf
function mapSessionFromPb(session: UserSession): any {
  return {
    id: session.getId(),
    user_id: session.getUserId(),
    session_token: session.getSessionToken(),
    ip_address: session.getIpAddress(),
    user_agent: session.getUserAgent(),
    device_fingerprint: session.getDeviceFingerprint(),
    location: session.getLocation(),
    is_active: session.getIsActive(),
    last_activity: session.getLastActivity(),
    expires_at: session.getExpiresAt(),
    created_at: session.getCreatedAt(),
  };
}

// Map UserPreferences from protobuf
function mapPreferencesFromPb(prefs: UserPreferences): any {
  return {
    // Notifications
    email_notifications: prefs.getEmailNotifications(),
    push_notifications: prefs.getPushNotifications(),
    sms_notifications: prefs.getSmsNotifications(),
    
    // Learning
    auto_play_videos: prefs.getAutoPlayVideos(),
    default_video_quality: prefs.getDefaultVideoQuality(),
    playback_speed: prefs.getPlaybackSpeed(),
    
    // Privacy
    profile_visibility: prefs.getProfileVisibility(),
    show_online_status: prefs.getShowOnlineStatus(),
    allow_direct_messages: prefs.getAllowDirectMessages(),
    
    // Localization
    timezone: prefs.getTimezone(),
    language: prefs.getLanguage(),
    date_format: prefs.getDateFormat(),
    
    // UI Preferences
    time_format: prefs.getTimeFormat(),
    theme: prefs.getTheme(),
    font_size: prefs.getFontSize(),
    high_contrast: prefs.getHighContrast(),
    reduced_motion: prefs.getReducedMotion(),
    screen_reader_mode: prefs.getScreenReaderMode(),
    
    // Features
    keyboard_shortcuts: prefs.getKeyboardShortcuts(),
    two_factor_enabled: prefs.getTwoFactorEnabled(),
    
    // Email Settings
    login_alerts: prefs.getLoginAlerts(),
    marketing_emails: prefs.getMarketingEmails(),
    product_updates: prefs.getProductUpdates(),
    security_alerts: prefs.getSecurityAlerts(),
    weekly_digest: prefs.getWeeklyDigest(),
  };
}

export class ProfileService {
  /**
   * Get user profile
   */
  static async getProfile(userId?: string): Promise<any> {
    try {
      const request = new GetProfileRequest();
      if (userId) {
        request.setUserId(userId);
      }

      const response = await profileServiceClient.getProfile(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        profile: responseObj.profile ? mapProfileFromPb(response.getProfile()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        profile: undefined
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: any): Promise<any> {
    try {
      const request = new UpdateProfileRequest();
      if (data.username) request.setUsername(data.username);
      if (data.first_name) request.setFirstName(data.first_name);
      if (data.last_name) request.setLastName(data.last_name);
      if (data.avatar) request.setAvatar(data.avatar);
      if (data.bio) request.setBio(data.bio);
      if (data.phone) request.setPhone(data.phone);
      if (data.address) request.setAddress(data.address);
      if (data.school) request.setSchool(data.school);
      if (data.date_of_birth) request.setDateOfBirth(data.date_of_birth);
      if (data.gender) request.setGender(data.gender);

      const response = await profileServiceClient.updateProfile(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        profile: responseObj.profile ? mapProfileFromPb(response.getProfile()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        profile: undefined
      };
    }
  }

  /**
   * Get user sessions
   */
  static async getSessions(): Promise<any> {
    try {
      const request = new GetSessionsRequest();

      const response = await profileServiceClient.getSessions(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        sessions: response.getSessionsList().map(mapSessionFromPb),
        active_count: responseObj.activeCount,
        max_allowed: responseObj.maxAllowed,
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        sessions: [],
        active_count: 0,
        max_allowed: 0
      };
    }
  }

  /**
   * Terminate a session
   */
  static async terminateSession(sessionId: string): Promise<any> {
    try {
      const request = new TerminateSessionRequest();
      request.setSessionId(sessionId);

      const response = await profileServiceClient.terminateSession(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        terminated: responseObj.terminated
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        terminated: false
      };
    }
  }

  /**
   * Terminate all sessions
   */
  static async terminateAllSessions(exceptCurrent: boolean = true): Promise<any> {
    try {
      const request = new TerminateAllSessionsRequest();
      request.setExceptCurrent(exceptCurrent);

      const response = await profileServiceClient.terminateAllSessions(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        terminated_count: responseObj.terminatedCount
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        terminated_count: 0
      };
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<any> {
    try {
      const request = new GetPreferencesRequest();

      const response = await profileServiceClient.getPreferences(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        preferences: responseObj.preferences ? mapPreferencesFromPb(response.getPreferences()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        preferences: undefined
      };
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(preferences: any): Promise<any> {
    try {
      const request = new UpdatePreferencesRequest();
      const prefs = new UserPreferences();
      
      // Set notification preferences
      if (preferences.email_notifications !== undefined) 
        prefs.setEmailNotifications(preferences.email_notifications);
      if (preferences.push_notifications !== undefined) 
        prefs.setPushNotifications(preferences.push_notifications);
      if (preferences.sms_notifications !== undefined) 
        prefs.setSmsNotifications(preferences.sms_notifications);
      
      // Set learning preferences
      if (preferences.auto_play_videos !== undefined) 
        prefs.setAutoPlayVideos(preferences.auto_play_videos);
      if (preferences.default_video_quality) 
        prefs.setDefaultVideoQuality(preferences.default_video_quality);
      if (preferences.playback_speed !== undefined) 
        prefs.setPlaybackSpeed(preferences.playback_speed);
      
      // Set privacy preferences
      if (preferences.profile_visibility) 
        prefs.setProfileVisibility(preferences.profile_visibility);
      if (preferences.show_online_status !== undefined) 
        prefs.setShowOnlineStatus(preferences.show_online_status);
      if (preferences.allow_direct_messages !== undefined) 
        prefs.setAllowDirectMessages(preferences.allow_direct_messages);
      
      // Set localization preferences
      if (preferences.timezone) prefs.setTimezone(preferences.timezone);
      if (preferences.language) prefs.setLanguage(preferences.language);
      if (preferences.date_format) prefs.setDateFormat(preferences.date_format);
      
      // Set UI preferences
      if (preferences.time_format) prefs.setTimeFormat(preferences.time_format);
      if (preferences.theme) prefs.setTheme(preferences.theme);
      if (preferences.font_size) prefs.setFontSize(preferences.font_size);
      if (preferences.high_contrast !== undefined) 
        prefs.setHighContrast(preferences.high_contrast);
      if (preferences.reduced_motion !== undefined) 
        prefs.setReducedMotion(preferences.reduced_motion);
      if (preferences.screen_reader_mode !== undefined) 
        prefs.setScreenReaderMode(preferences.screen_reader_mode);
      
      // Set feature preferences
      if (preferences.keyboard_shortcuts !== undefined) 
        prefs.setKeyboardShortcuts(preferences.keyboard_shortcuts);
      if (preferences.two_factor_enabled !== undefined) 
        prefs.setTwoFactorEnabled(preferences.two_factor_enabled);
      
      // Set email settings
      if (preferences.login_alerts !== undefined) 
        prefs.setLoginAlerts(preferences.login_alerts);
      if (preferences.marketing_emails !== undefined) 
        prefs.setMarketingEmails(preferences.marketing_emails);
      if (preferences.product_updates !== undefined) 
        prefs.setProductUpdates(preferences.product_updates);
      if (preferences.security_alerts !== undefined) 
        prefs.setSecurityAlerts(preferences.security_alerts);
      if (preferences.weekly_digest !== undefined) 
        prefs.setWeeklyDigest(preferences.weekly_digest);

      request.setPreferences(prefs);

      const response = await profileServiceClient.updatePreferences(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        preferences: responseObj.preferences ? mapPreferencesFromPb(response.getPreferences()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        preferences: undefined
      };
    }
  }
}