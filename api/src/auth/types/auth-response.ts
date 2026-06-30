import { UserRole } from '@prisma/client';

export interface SafeUserResponse {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export interface AuthResponse {
  user: SafeUserResponse;
  accessToken: string;
  refreshToken: string;
}
