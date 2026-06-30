import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from '../types/jwt-payload';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload | null => {
    const request = context.switchToHttp().getRequest<{
      user?: CurrentUserPayload;
    }>();

    return request.user ?? null;
  },
);
