import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

/**
 * Module augmentation for NextAuth types
 * Extends default session and JWT types to include custom properties
 */
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    provider?: string;
    googleAccessToken?: string;
    backendAccessToken?: string;
    backendRefreshToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    accessToken?: string;
    provider?: string;
    googleAccessToken?: string;
    backendAccessToken?: string;
    backendRefreshToken?: string;
  }
}
