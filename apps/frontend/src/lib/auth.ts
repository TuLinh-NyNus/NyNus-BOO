import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { AuthService } from "@/services/grpc/auth.service";

// Cấu hình NextAuth cho NyNus
export const authConfig: NextAuthConfig = {
  providers: [
    // Chỉ enable Google provider khi có credentials
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            }
          }
        })]
      : []
    )
  ],
  pages: {
    signIn: "/", // Redirect về trang chủ thay vì trang sign-in mặc định
    error: "/", // Redirect về trang chủ khi có lỗi
  },
  callbacks: {
    async signIn({ user: _user, account, profile: _profile }) {
      // Kiểm tra xem user có được phép đăng nhập không
      if (account?.provider === "google" && account.id_token) {
        try {
          // Exchange Google ID token với backend để lấy JWT token của hệ thống
          const response = await AuthService.googleLogin(account.id_token);
          
          if (response && response.getAccessToken()) {
            // Store backend tokens in account for later use in jwt callback
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (account as any).backendAccessToken = response.getAccessToken();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (account as any).backendRefreshToken = response.getRefreshToken();
            
            console.log('Google login successful with backend');
            return true;
          } else {
            console.error('Backend rejected Google login');
            return false;
          }
        } catch (error) {
          console.error('Google login failed:', error);
          return false;
        }
      }
      return true; // Allow other providers for now
    },
    async jwt({ token, account, user }) {
      // Lưu thông tin bổ sung vào JWT token
      if (account && user) {
        // Lưu Google tokens (có thể cần để refresh)
        token.googleAccessToken = account.access_token;
        token.provider = account.provider;
        
        // Lưu backend tokens
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((account as any).backendAccessToken) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          token.backendAccessToken = (account as any).backendAccessToken as string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          token.backendRefreshToken = (account as any).backendRefreshToken as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Gửi thông tin từ token về client
      if (token) {
        session.user.id = token.sub!;
        session.googleAccessToken = token.googleAccessToken as string;
        session.provider = token.provider as string;
        
        // Add backend tokens to session
        session.backendAccessToken = token.backendAccessToken as string;
        session.backendRefreshToken = token.backendRefreshToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect về trang chủ sau khi đăng nhập thành công
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
