import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser | null {
    if (err) {
      return null;
    }

    return user ?? null;
  }

  getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest();
  }
}
