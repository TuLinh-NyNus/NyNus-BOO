/**
 * Auth Service Client STUB
 * ====================
 * Temporary stub implementation to resolve protobuf import issues
 * This will be replaced when protobuf generation is working properly
 */

// Stub classes to replace protobuf imports
class MockLoginResponse {
  private accessToken = '';
  private refreshToken = '';
  private user: MockUser | null = null;

  getAccessToken() { return this.accessToken; }
  getRefreshToken() { return this.refreshToken; }
  getUser() { return this.user; }
  
  setAccessToken(token: string) { this.accessToken = token; }
  setRefreshToken(token: string) { this.refreshToken = token; }
  setUser(user: MockUser) { this.user = user; }
}

class MockRegisterResponse {
  private success = true;
  private message = 'Registration successful';
  private user: MockUser | null = null;

  getSuccess() { return this.success; }
  getMessage() { return this.message; }
  getUser() { return this.user; }
}

class MockRefreshTokenResponse {
  private accessToken = '';
  getAccessToken() { return this.accessToken; }
}

class MockUser {
  private id = '';
  private email = '';
  private name = '';
  private role = 1;
  private level = 3;
  private avatar = '';
  private emailVerified = true;
  private createdAt = '';
  private updatedAt = '';

  getId() { return this.id; }
  getEmail() { return this.email; }
  getName() { return this.name; }
  getRole() { return this.role; }
  getLevel() { return this.level; }
  getAvatar() { return this.avatar; }
  getEmailVerified() { return this.emailVerified; }
  getCreatedAt() { return this.createdAt; }
  getUpdatedAt() { return this.updatedAt; }

  setId(value: string) { this.id = value; }
  setEmail(value: string) { this.email = value; }
  setName(value: string) { this.name = value; }
  setRole(value: number) { this.role = value; }
  setLevel(value: number) { this.level = value; }
  setAvatar(value: string) { this.avatar = value; }
  setEmailVerified(value: boolean) { this.emailVerified = value; }
  setCreatedAt(value: string) { this.createdAt = value; }
  setUpdatedAt(value: string) { this.updatedAt = value; }
}

class MockGetCurrentUserResponse {
  private user: MockUser;

  constructor() {
    this.user = new MockUser();
    // Set some default values for stub
    this.user.setId('stub-user-id');
    this.user.setEmail('stub@example.com');
    this.user.setName('Stub User');
    this.user.setRole(1); // STUDENT
    this.user.setLevel(3); // HIGH
    this.user.setEmailVerified(true);
    this.user.setCreatedAt(new Date().toISOString());
    this.user.setUpdatedAt(new Date().toISOString());
  }

  getUser() { return this.user; }
}

/**
 * Auth Service STUB
 */
export class AuthService {
  /**
   * Login with email and password
   */
  static async login(_email: string, _password: string): Promise<MockLoginResponse> {
    const response = new MockLoginResponse();
    response.setAccessToken('stub-access-token');
    response.setRefreshToken('stub-refresh-token');
    
    const user = new MockUser();
    user.setId('stub-user-id');
    user.setEmail(_email);
    user.setName('Stub User');
    user.setRole(1);
    user.setLevel(3);
    response.setUser(user);
    
    return Promise.resolve(response);
  }

  /**
   * Register new user
   */
  static async register(
    _email: string, 
    _password: string, 
    _name: string,
    _role: number = 1,
    _level: number = 3
  ): Promise<MockRegisterResponse> {
    const response = new MockRegisterResponse();
    const user = new MockUser();
    user.setId('stub-user-id');
    user.setEmail(_email);
    user.setName(_name);
    user.setRole(_role);
    user.setLevel(_level);
    return Promise.resolve(response);
  }

  /**
   * Login with Google OAuth
   */
  static async googleLogin(_idToken: string): Promise<MockLoginResponse> {
    const response = new MockLoginResponse();
    response.setAccessToken('stub-google-access-token');
    response.setRefreshToken('stub-google-refresh-token');
    
    const user = new MockUser();
    user.setId('stub-google-user-id');
    user.setEmail('google-stub@example.com');
    user.setName('Google Stub User');
    user.setRole(1);
    user.setLevel(3);
    response.setUser(user);
    
    return Promise.resolve(response);
  }

  /**
   * Refresh access token
   */
  static async refreshToken(_refreshToken: string): Promise<MockRefreshTokenResponse> {
    const response = new MockRefreshTokenResponse();
    return Promise.resolve(response);
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<MockGetCurrentUserResponse> {
    return Promise.resolve(new MockGetCurrentUserResponse());
  }
}

/**
 * Auth helper functions
 */
export class AuthHelpers {
  /**
   * Save tokens to localStorage
   */
  static saveTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('nynus-auth-token', accessToken);
    if (refreshToken) {
      localStorage.setItem('nynus-refresh-token', refreshToken);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('nynus-auth-token');
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('nynus-refresh-token');
  }

  /**
   * Clear tokens (logout)
   */
  static clearTokens() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('nynus-auth-token');
    localStorage.removeItem('nynus-refresh-token');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

/**
 * Simplified auth service for new pages
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  level?: number;
  [key: string]: unknown;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async register(data: RegisterData): Promise<ApiResponse> {
    try {
      await AuthService.register(
        data.email,
        data.password,
        data.name,
        data.role === 'STUDENT' ? 1 : data.role === 'TEACHER' ? 2 : data.role === 'ADMIN' ? 3 : 1,
        data.level || 10
      );
      return {
        success: true,
        message: 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Registration failed'
      };
    }
  },

  async forgotPassword(_email: string): Promise<ApiResponse> {
    return Promise.resolve({ 
      success: true, 
      message: 'Password reset email sent' 
    });
  },

  async resetPassword(_data: { token: string; password: string }): Promise<ApiResponse> {
    return Promise.resolve({ 
      success: true,
      message: 'Password reset successfully'
    });
  },

  async getSessions(): Promise<{ sessions: unknown[] }> {
    return Promise.resolve({ sessions: [] });
  },

  async revokeSession(_sessionId: string): Promise<ApiResponse> {
    return Promise.resolve({
      success: true,
      message: 'Session revoked successfully'
    });
  }
};