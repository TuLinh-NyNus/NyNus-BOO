/**
 * Admin Authentication Store
 * Store xác thực admin với Zustand và persistence
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

import { adminApiClient } from "../lib/api/client";
import { adminAuthService } from "../lib/api/services";
import {
  validateToken,
  getUserFromToken,
  isTokenExpired,
  isTokenExpiringSoon,
  formatTimeUntilExpiration,
} from "../lib/utils/token.utils";
import {
  setAdminTokens,
  getAdminAccessToken,
  getAdminRefreshToken,
  clearAdminAuth,
  setAdminUserInfo,
  getAdminUserInfo,
  adminStorage,
  addStorageEventListener,
} from "../lib/utils/storage.utils";

/**
 * Admin user interface
 * Interface admin user
 */
interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  lastLoginAt?: string;
  isActive: boolean;
}

/**
 * Authentication state interface
 * Interface trạng thái authentication
 */
interface AuthState {
  // User data
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Token data
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;

  // Session data
  sessionId: string | null;
  lastActivity: Date | null;
  rememberMe: boolean;

  // Error state
  error: string | null;

  // Authentication status
  isInitialized: boolean;
  isRefreshing: boolean;
}

/**
 * Authentication actions interface
 * Interface actions authentication
 */
interface AuthActions {
  // Authentication actions
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;

  // User actions
  updateProfile: (data: Partial<AdminUser>) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;

  // State management
  initialize: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Token management
  checkTokenExpiration: () => boolean;
  scheduleTokenRefresh: () => void;

  // Utility methods
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  getTimeUntilExpiration: () => string;

  // Internal methods
  _setAuthData: (data: {
    user: AdminUser;
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    rememberMe?: boolean;
  }) => void;
  _clearAuthData: () => void;
  _handleAuthError: (error: any) => void;
}

/**
 * Combined store interface
 * Interface store kết hợp
 */
type AdminAuthStore = AuthState & AuthActions;

/**
 * Initial state
 * Trạng thái ban đầu
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null,
  sessionId: null,
  lastActivity: null,
  rememberMe: false,
  error: null,
  isInitialized: false,
  isRefreshing: false,
};

/**
 * Create admin auth store with persistence
 * Tạo admin auth store với persistence
 */
export const useAdminAuth = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Initialize authentication state
       * Khởi tạo trạng thái authentication
       */
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });

          // Get tokens from storage
          const accessToken = getAdminAccessToken();
          const refreshToken = getAdminRefreshToken();
          const userInfo = getAdminUserInfo();

          if (!accessToken || !refreshToken) {
            set({ isInitialized: true, isLoading: false });
            return;
          }

          // Validate access token
          const validation = validateToken(accessToken);

          if (validation.isValid && userInfo) {
            // Token is valid, restore authentication state
            set({
              user: userInfo,
              isAuthenticated: true,
              accessToken,
              refreshToken,
              tokenExpiresAt: validation.expiresAt,
              isInitialized: true,
              isLoading: false,
              lastActivity: new Date(),
            });

            // Schedule token refresh if needed
            get().scheduleTokenRefresh();
          } else if (validation.isExpired && refreshToken) {
            // Access token expired, try to refresh
            try {
              await get().refreshTokens();
            } catch (error) {
              // Refresh failed, clear auth data
              get()._clearAuthData();
            }
          } else {
            // Invalid token, clear auth data
            get()._clearAuthData();
          }

          set({ isInitialized: true, isLoading: false });
        } catch (error) {
          console.error("Auth initialization error:", error);
          get()._handleAuthError(error);
          set({ isInitialized: true, isLoading: false });
        }
      },

      /**
       * Login with credentials
       * Đăng nhập với thông tin xác thực
       */
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });

          // Set remember me preference
          adminStorage.setRememberMe(credentials.rememberMe || false);

          // Call login API
          const response = await adminAuthService.login(credentials);

          // Set authentication data
          get()._setAuthData({
            user: response.user,
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            sessionId: response.sessionId,
            rememberMe: credentials.rememberMe,
          });

          toast.success("Đăng nhập thành công!");
          set({ isLoading: false });
        } catch (error) {
          get()._handleAuthError(error);
          throw error;
        }
      },

      /**
       * Logout user
       * Đăng xuất user
       */
      logout: async () => {
        try {
          set({ isLoading: true });

          // Call logout API
          await adminAuthService.logout();

          toast.success("Đăng xuất thành công!");
        } catch (error) {
          console.error("Logout error:", error);
          // Continue with logout even if API call fails
        } finally {
          // Clear authentication data
          get()._clearAuthData();
          set({ isLoading: false });
        }
      },

      /**
       * Refresh access token
       * Refresh access token
       */
      refreshTokens: async () => {
        const { isRefreshing, refreshToken } = get();

        if (isRefreshing || !refreshToken) {
          return;
        }

        try {
          set({ isRefreshing: true, error: null });

          // Use API client's refresh method
          await adminApiClient.refreshToken();

          // Get updated tokens
          const newAccessToken = getAdminAccessToken();
          const newRefreshToken = getAdminRefreshToken();

          if (newAccessToken && newRefreshToken) {
            const validation = validateToken(newAccessToken);
            const userInfo = getUserFromToken(newAccessToken);

            if (validation.isValid && userInfo) {
              set({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                tokenExpiresAt: validation.expiresAt,
                user: {
                  id: userInfo.id,
                  email: userInfo.email,
                  role: userInfo.role,
                  permissions: userInfo.permissions,
                  firstName: get().user?.firstName || "",
                  lastName: get().user?.lastName || "",
                  isActive: true,
                },
                lastActivity: new Date(),
              });

              // Schedule next refresh
              get().scheduleTokenRefresh();
            }
          }
        } catch (error) {
          console.error("Token refresh error:", error);
          get()._handleAuthError(error);
          get()._clearAuthData();
          throw error;
        } finally {
          set({ isRefreshing: false });
        }
      },

      /**
       * Update user profile
       * Cập nhật profile user
       */
      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });

          const updatedUser = await adminAuthService.updateProfile(data);

          set((state) => ({
            user: updatedUser,
            isLoading: false,
          }));

          // Update stored user info
          setAdminUserInfo(updatedUser);

          toast.success("Cập nhật profile thành công!");
        } catch (error) {
          get()._handleAuthError(error);
          throw error;
        }
      },

      /**
       * Change password
       * Đổi mật khẩu
       */
      changePassword: async (data) => {
        try {
          set({ isLoading: true, error: null });

          await adminAuthService.changePassword(data);

          toast.success("Đổi mật khẩu thành công!");
          set({ isLoading: false });
        } catch (error) {
          get()._handleAuthError(error);
          throw error;
        }
      },

      /**
       * Clear error state
       * Xóa trạng thái lỗi
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set loading state
       * Set trạng thái loading
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Check if token is expiring
       * Kiểm tra xem token có sắp hết hạn không
       */
      checkTokenExpiration: () => {
        const { accessToken } = get();
        if (!accessToken) return false;

        return isTokenExpiringSoon(accessToken);
      },

      /**
       * Schedule token refresh
       * Lên lịch refresh token
       */
      scheduleTokenRefresh: () => {
        const { accessToken } = get();
        if (!accessToken) return;

        // This will be handled by AdminApiClient's scheduler
        // Just ensure the client has the latest token
        if (adminApiClient.isAuthenticated()) {
          // Token refresh scheduling is handled by AdminApiClient
        }
      },

      /**
       * Check if user has specific permission
       * Kiểm tra xem user có permission cụ thể không
       */
      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      /**
       * Check if user has specific role
       * Kiểm tra xem user có role cụ thể không
       */
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      /**
       * Get formatted time until token expiration
       * Lấy thời gian còn lại đến khi token hết hạn
       */
      getTimeUntilExpiration: () => {
        const { accessToken } = get();
        if (!accessToken) return "Không có token";

        return formatTimeUntilExpiration(accessToken);
      },

      /**
       * Set authentication data
       * Set dữ liệu authentication
       */
      _setAuthData: (data) => {
        const validation = validateToken(data.accessToken);

        set({
          user: data.user,
          isAuthenticated: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenExpiresAt: validation.expiresAt,
          sessionId: data.sessionId,
          rememberMe: data.rememberMe || false,
          lastActivity: new Date(),
          error: null,
        });

        // Store tokens and user info
        setAdminTokens(data.accessToken, data.refreshToken);
        setAdminUserInfo(data.user);

        // Schedule token refresh
        get().scheduleTokenRefresh();
      },

      /**
       * Clear authentication data
       * Xóa dữ liệu authentication
       */
      _clearAuthData: () => {
        clearAdminAuth();

        set({
          ...initialState,
          isInitialized: true,
        });
      },

      /**
       * Handle authentication errors
       * Xử lý lỗi authentication
       */
      _handleAuthError: (error) => {
        let errorMessage = "Đã xảy ra lỗi không xác định";

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        set({
          error: errorMessage,
          isLoading: false,
          isRefreshing: false,
        });

        toast.error(errorMessage);
      },
    }),
    {
      name: "admin-auth-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // Only persist basic state, not sensitive data
          const stored = adminStorage.getItem(name, { persistent: true });
          return stored ? JSON.parse(stored) : null;
        },
        setItem: (name, value) => {
          // Only persist non-sensitive state
          if (typeof value === "object" && value !== null) {
            const { accessToken, refreshToken: refreshTokenValue, ...safeState } = value as any;
            adminStorage.setItem(name, JSON.stringify(safeState), { persistent: true });
          }
        },
        removeItem: (name) => {
          adminStorage.removeItem(name, { persistent: true });
        },
      })),
      partialize: (state) => ({
        // Only persist safe, non-sensitive data
        rememberMe: state.rememberMe,
        lastActivity: state.lastActivity,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

/**
 * Setup cross-tab synchronization
 * Thiết lập đồng bộ cross-tab
 */
if (typeof window !== "undefined") {
  addStorageEventListener((key, newValue) => {
    const store = useAdminAuth.getState();

    if (key === "ACCESS_TOKEN" && !newValue) {
      // Token was cleared in another tab, logout
      store._clearAuthData();
    } else if (key === "ACCESS_TOKEN" && newValue) {
      // Token was updated in another tab, reinitialize
      store.initialize();
    }
  });
}
