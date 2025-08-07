import jwt from 'jsonwebtoken';

import logger from '@/lib/utils/logger';

/**
 * Interface cho JWT payload tương thích với backend
 */
interface BackendJwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

/**
 * Service để tạo JWT token tương thích với backend NestJS
 * Sử dụng cùng secret và format như backend
 */
export class BackendJwtService {
  private static readonly JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || 'nynus_access_secret_key_2025';
  private static readonly JWT_EXPIRES_IN = '15m'; // Đồng bộ với backend

  /**
   * Tạo access token tương thích với backend
   */
  static generateAccessToken(payload: BackendJwtPayload): string {
    try {
      const tokenPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions || [],
        iat: Math.floor(Date.now() / 1000),
      };

      const token = jwt.sign(tokenPayload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN,
      });

      logger.debug('[BackendJWT] Token generated successfully', {
        userId: payload.sub,
        role: payload.role,
        tokenLength: token.length
      });

      return token;
    } catch (error) {
      logger.error('[BackendJWT] Error generating token:', error);
      throw new Error('Failed to generate backend-compatible token');
    }
  }

  /**
   * Verify token với backend secret
   */
  static verifyToken(token: string): BackendJwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as BackendJwtPayload;
      return decoded;
    } catch (error) {
      logger.error('[BackendJWT] Token verification failed:', error);
      return null;
    }
  }

  /**
   * Lấy permissions dựa trên role (đồng bộ với backend)
   */
  static getPermissionsByRole(role: string): string[] {
    const permissions: string[] = [];

    switch (role) {
      case 'GUEST':
        permissions.push('READ_COURSE', 'READ_CATEGORY');
        break;
      case 'STUDENT':
        permissions.push(
          'CREATE_ENROLLMENT',
          'READ_ENROLLMENT', 
          'UPDATE_ENROLLMENT'
        );
        break;
      case 'INSTRUCTOR':
        permissions.push(
          'CREATE_COURSE',
          'UPDATE_COURSE',
          'DELETE_COURSE',
          'PUBLISH_COURSE',
          'CREATE_LESSON',
          'UPDATE_LESSON',
          'DELETE_LESSON'
        );
        break;
      case 'ADMIN':
        // Admin có tất cả permissions
        permissions.push(
          'CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER',
          'CREATE_COURSE', 'READ_COURSE', 'UPDATE_COURSE', 'DELETE_COURSE', 'PUBLISH_COURSE',
          'CREATE_LESSON', 'READ_LESSON', 'UPDATE_LESSON', 'DELETE_LESSON',
          'CREATE_ENROLLMENT', 'READ_ENROLLMENT', 'UPDATE_ENROLLMENT', 'DELETE_ENROLLMENT',
          'CREATE_CATEGORY', 'READ_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
          'CREATE_EXAM', 'READ_EXAM', 'UPDATE_EXAM', 'DELETE_EXAM',
          'CREATE_QUESTION', 'READ_QUESTION', 'UPDATE_QUESTION', 'DELETE_QUESTION'
        );
        break;
    }

    return permissions;
  }

  /**
   * Tạo token từ user data (helper function)
   */
  static createTokenFromUser(user: {
    id: string;
    email: string;
    role: string;
  }): string {
    const permissions = this.getPermissionsByRole(user.role);
    
    return this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions
    });
  }
}
