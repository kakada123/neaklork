import { UserRole } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  email?: string | null;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export interface CurrentUserPayload {
  id: string;
  email?: string | null;
  role: UserRole;
}
