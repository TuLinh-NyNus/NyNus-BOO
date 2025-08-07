import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard
 * Guard xác thực JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
