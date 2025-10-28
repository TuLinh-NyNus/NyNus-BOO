/**
 * NextAuth Configuration for NyNus Exam Bank System
 * =================================================
 * 
 * Authentication Methods:
 * - Credentials (Email/Password) via gRPC backend
 * - Google OAuth (optional, based on configuration)
 * 
 * Session Strategy:
 * - JWT-based sessions (httpOnly cookies)
 * - Auto-refresh tokens when expiring
 * - Role-based access control (RBAC)
 * 
 * Security Features:
 * - CSRF protection
 * - httpOnly cookies
 * - Token rotation
 * - Secure cookie settings (production)
 * 
 * @author NyNus Development Team
 * @version 2.0.0 - Refactored with Clean Architecture
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { AuthService } from "@/services/grpc/auth.service";
import { TokenManager } from "@/lib/services/token-manager";
import { convertProtobufRoleToString } from "@/lib/utils/role-converter";
import { logger } from "@/lib/utils/logger";
import {
  OAUTH_CONFIG,
  SECURITY_CONFIG,
  SESSION_CONFIG,
  AUTH_ENV,
  JWT_CONFIG,
  isAuthFeatureEnabled
} from "@/lib/config/auth-config";

/**
 * Credentials Provider Configuration
 * Xác thực qua email/password với backend gRPC
 */
const credentialsProvider = Credentials({
  id: "credentials",
  name: "Email and Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    // ✅ ENHANCED LOGGING - Track every step of authorization
    // Technical: Type assertion needed for NextAuth credentials
    const creds = credentials as { email?: string; password?: string } | undefined;
    const maskedEmail = creds?.email
      ? `${creds.email.substring(0, 2)}***@${creds.email.split('@')[1] || '***'}`
      : 'MISSING';

    logger.info('[Auth] authorize() called', {
      operation: 'authorize',
      hasEmail: !!creds?.email,
      hasPassword: !!creds?.password,
      email: maskedEmail,
    });

    try {
      // Step 1: Validate credentials
      if (!creds?.email || !creds?.password) {
        logger.error('[Auth] FAILED - Missing credentials', {
          operation: 'authorize',
          hasEmail: !!creds?.email,
          hasPassword: !!creds?.password,
        });
        return null;
      }

      logger.debug('[Auth] Step 1 PASSED - Credentials validated', {
        operation: 'authorize',
        email: maskedEmail,
      });

      // Step 2: Call gRPC backend to authenticate
      logger.debug('[Auth] Step 2 START - Calling AuthService.login()', {
        operation: 'authorize',
        email: maskedEmail,
      });

      const response = await AuthService.login(
        creds.email as string,
        creds.password as string
      );

      logger.debug('[Auth] Step 2 COMPLETE - Backend response received', {
        operation: 'authorize',
        hasResponse: !!response,
        responseType: response ? typeof response : 'null',
      });

      // Step 3: Validate response object
      if (!response) {
        logger.error('[Auth] FAILED - No response from backend', {
          operation: 'authorize',
          email: maskedEmail,
        });
        return null;
      }

      logger.debug('[Auth] Step 3 PASSED - Response object exists', {
        operation: 'authorize',
      });

      // Step 4: Validate access token
      const accessToken = response.getAccessToken();
      if (!accessToken) {
        logger.error('[Auth] FAILED - No access token in response', {
          operation: 'authorize',
          email: maskedEmail,
          hasResponse: true,
        });
        return null;
      }

      logger.debug('[Auth] Step 4 PASSED - Access token exists', {
        operation: 'authorize',
        tokenLength: accessToken.length,
      });

      // Step 5: Extract user data from gRPC response
      const user = response.getUser();
      if (!user) {
        logger.error('[Auth] FAILED - No user data in backend response', {
          operation: 'authorize',
          email: maskedEmail,
          hasAccessToken: true,
        });
        return null;
      }

      logger.debug('[Auth] Step 5 PASSED - User data exists', {
        operation: 'authorize',
        userId: user.getId(),
        userEmail: user.getEmail(),
      });

      // Step 6: Extract user fields with fallbacks
      const userId = user.getId();
      const userEmail = user.getEmail();
      const firstName = user.getFirstName() || '';
      const lastName = user.getLastName() || '';
      const userRole = user.getRole();
      const userLevel = user.getLevel() || 1;
      const refreshToken = response.getRefreshToken() || '';

      logger.debug('[Auth] Step 6 PASSED - User fields extracted', {
        operation: 'authorize',
        userId,
        userEmail,
        firstName,
        lastName,
        userRole,
        userLevel,
        hasRefreshToken: !!refreshToken,
      });

      // Step 7: Convert protobuf role to string
      const roleString = convertProtobufRoleToString(userRole);

      logger.debug('[Auth] Step 7 PASSED - Role converted', {
        operation: 'authorize',
        protobufRole: userRole,
        roleString,
      });

      // Step 8: Construct user object for NextAuth
      const userObject = {
        id: userId,
        email: userEmail,
        name: `${firstName} ${lastName}`.trim() || userEmail,
        backendAccessToken: accessToken,
        backendRefreshToken: refreshToken,
        role: roleString,
        level: userLevel,
      };

      logger.info('[Auth] SUCCESS - User authenticated, returning user object', {
        operation: 'authorize',
        userId: userObject.id,
        email: userObject.email,
        role: userObject.role,
        level: userObject.level,
        hasBackendTokens: !!(userObject.backendAccessToken && userObject.backendRefreshToken),
      });

      return userObject;
    } catch (error) {
      // ✅ ENHANCED ERROR LOGGING - Capture full error details
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('[Auth] EXCEPTION in authorize()', {
        operation: 'authorize',
        email: maskedEmail,
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: errorStack,
      });

      // Log to console for immediate visibility during testing
      console.error('[Auth] authorize() exception details:', {
        error: errorMessage,
        stack: errorStack,
        credentials: { email: maskedEmail, hasPassword: !!credentials?.password },
      });

      return null;
    }
  }
});

/**
 * Google OAuth Provider Configuration
 * Enabled based on environment configuration
 */
const googleProvider = isAuthFeatureEnabled('ENABLE_GOOGLE_OAUTH')
  ? [Google({
      clientId: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
      clientSecret: OAUTH_CONFIG.GOOGLE.CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })]
  : [];

/**
 * NextAuth Configuration
 */
export const authConfig: NextAuthConfig = {
  providers: [credentialsProvider, ...googleProvider],
  
  // Custom pages configuration
  pages: {
    signIn: '/login',
  },
  
  // Callbacks
  callbacks: {
    /**
     * SignIn Callback
     * Xử lý Google OAuth integration với backend
     */
    async signIn({ user: _user, account, profile: _profile }) {
      logger.info('[Auth] SignIn callback', { provider: account?.provider });

      // Handle Google OAuth integration with backend
      if (account?.provider === "google" && account.id_token) {
        try {
          logger.info('[Auth] Google login - integrating with backend');

          // Exchange Google ID token với backend để lấy JWT token
          const response = await AuthService.googleLogin(account.id_token);

          if (response && response.getAccessToken()) {
            // Store backend tokens in account for jwt callback
            const accountWithTokens = account as typeof account & {
              backendAccessToken: string;
              backendRefreshToken: string;
              backendRole: string;
              backendLevel: number;
            };

            accountWithTokens.backendAccessToken = response.getAccessToken();
            accountWithTokens.backendRefreshToken = response.getRefreshToken();

            // Store user role and level from backend
            const backendUser = response.getUser();
            if (backendUser) {
              accountWithTokens.backendRole = convertProtobufRoleToString(backendUser.getRole());
              accountWithTokens.backendLevel = backendUser.getLevel();
            }

            logger.info('[Auth] Google login successful with backend integration');
            return true;
          } else {
            logger.error('[Auth] Backend rejected Google login');
            return false;
          }
        } catch (error) {
          logger.error('[Auth] Google login backend integration failed', {
            error: error instanceof Error ? error.message : String(error),
          });
          // Fallback: allow login but without backend integration
          logger.warn('[Auth] Falling back to NextAuth-only login');
          return true;
        }
      }

      return true; // Allow other providers
    },

    /**
     * JWT Callback
     * Quản lý tokens trong JWT
     * ✅ FIX: Separate NextAuth session lifecycle từ backend token refresh
     */
    async jwt({ token, account, user }) {
      // Persist backend tokens returned from credentials flow (account is undefined for credentials)
      if (user) {
        TokenManager.storeCredentialsTokens(token, user);
      }

      if (account) {
        // Store OAuth-specific tokens (Google + future providers)
        TokenManager.storeGoogleTokens(token, account);
        TokenManager.storeOAuthTokens(token, account);
        TokenManager.setDefaultRoleForOAuth(token, account.provider);
      }

      // ✅ FIX: Separate backend token refresh từ NextAuth session lifecycle
      // NextAuth session không phụ thuộc vào backend token refresh success/failure
      try {
        const refreshedToken = await TokenManager.refreshTokenIfNeeded(token);
        if (refreshedToken) {
          // Backend token refresh thành công - use refreshed token
          TokenManager.ensureRoleAndLevel(refreshedToken);
          return refreshedToken;
        }
      } catch (error) {
        // ✅ FIX: Log error nhưng không destroy NextAuth session
        logger.error('[NextAuth] Backend token refresh failed, continuing with existing session', {
          operation: 'jwt_callback',
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // ✅ FIX: Luôn return valid token để maintain NextAuth session
      // Ngay cả khi backend token refresh failed, user vẫn có thể sử dụng app với limited functionality
      TokenManager.ensureRoleAndLevel(token);
      return token;
    },

    /**
     * Session Callback
     * Expose data to client session
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.googleAccessToken = token.googleAccessToken as string;
        session.provider = token.provider as string;
        session.backendAccessToken = token.backendAccessToken as string;
        session.backendRefreshToken = token.backendRefreshToken as string;
        session.role = token.role as string;
        session.level = token.level as number;
      }
      return session;
    },

    /**
     * Redirect Callback
     * Handle redirects after authentication
     */
    async redirect({ url, baseUrl }) {
      // Redirect về trang chủ sau khi đăng nhập thành công
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: SESSION_CONFIG.TIMEOUT_SECONDS,
  },
  
  // Cookie configuration
  cookies: {
    sessionToken: {
      name: JWT_CONFIG.COOKIE_NAMES.SESSION_TOKEN,
      options: {
        httpOnly: SESSION_CONFIG.HTTP_ONLY,
        sameSite: SESSION_CONFIG.SAME_SITE,
        path: '/',
        secure: SESSION_CONFIG.REQUIRE_HTTPS,
        domain: SECURITY_CONFIG.COOKIE_DOMAIN
      }
    },
    callbackUrl: {
      name: JWT_CONFIG.COOKIE_NAMES.CALLBACK_URL,
      options: {
        httpOnly: SESSION_CONFIG.HTTP_ONLY,
        sameSite: SESSION_CONFIG.SAME_SITE,
        path: '/',
        secure: SESSION_CONFIG.REQUIRE_HTTPS
      }
    },
    csrfToken: {
      name: JWT_CONFIG.COOKIE_NAMES.CSRF_TOKEN,
      options: {
        // CSRF token MUST be httpOnly: false for custom signin pages
        httpOnly: false,
        sameSite: SESSION_CONFIG.SAME_SITE,
        path: '/',
        secure: SESSION_CONFIG.REQUIRE_HTTPS
      }
    }
  },
  
  // Security configuration
  secret: AUTH_ENV.NEXTAUTH_SECRET,
  debug: isAuthFeatureEnabled('ENABLE_DEBUG_LOGGING'),
  trustHost: SECURITY_CONFIG.TRUST_HOST
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

