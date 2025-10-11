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
    try {
      // Validate credentials
      if (!credentials?.email || !credentials?.password) {
        logger.warn('[Auth] Missing credentials in login attempt');
        return null;
      }

      // Call gRPC backend to authenticate
      const response = await AuthService.login(
        credentials.email as string,
        credentials.password as string
      );

      logger.info('[Auth] Login response received', {
        hasResponse: !!response,
        hasAccessToken: !!response?.getAccessToken(),
        hasUser: !!response?.getUser(),
      });

      // Validate response
      if (!response || !response.getAccessToken()) {
        logger.warn('[Auth] No response or no access token from backend');
        return null;
      }

      // Extract user data from gRPC response
      const user = response.getUser();
      if (!user) {
        logger.warn('[Auth] No user data in backend response');
        return null;
      }

      logger.info('[Auth] User authenticated successfully', {
        id: user.getId(),
        email: user.getEmail(),
        role: user.getRole(),
      });

      // Convert protobuf role to string using utility
      const roleString = convertProtobufRoleToString(user.getRole());

      // Return user object with backend tokens
      return {
        id: user.getId(),
        email: user.getEmail(),
        name: `${user.getFirstName()} ${user.getLastName()}`,
        backendAccessToken: response.getAccessToken(),
        backendRefreshToken: response.getRefreshToken(),
        role: roleString,
        level: user.getLevel(),
      };
    } catch (error) {
      logger.error('[Auth] Credentials login failed', {
        error: error instanceof Error ? error.message : String(error),
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
     */
    async jwt({ token, account, user }) {
      // Initial login - save tokens
      if (account && user) {
        // Store Google tokens
        TokenManager.storeGoogleTokens(token, account);

        // Store backend tokens from Credentials provider
        TokenManager.storeCredentialsTokens(token, user);

        // Store backend tokens from OAuth provider
        TokenManager.storeOAuthTokens(token, account);

        // Set default role for OAuth users
        TokenManager.setDefaultRoleForOAuth(token, account.provider);
      }

      // Auto-refresh backend token if expiring soon
      const refreshedToken = await TokenManager.refreshTokenIfNeeded(token);
      if (!refreshedToken) {
        // Refresh failed - force re-login
        return null as unknown as typeof token;
      }

      // Ensure role and level are always set
      TokenManager.ensureRoleAndLevel(refreshedToken);

      return refreshedToken;
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

