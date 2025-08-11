import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

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
      if (account?.provider === "google") {
        // Có thể thêm logic kiểm tra email domain, whitelist, etc.
        return true;
      }
      return false;
    },
    async jwt({ token, account, user }) {
      // Lưu thông tin bổ sung vào JWT token
      if (account && user) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Gửi thông tin từ token về client
      if (token) {
        session.user.id = token.sub!;
        session.accessToken = token.accessToken as string;
        session.provider = token.provider as string;
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
