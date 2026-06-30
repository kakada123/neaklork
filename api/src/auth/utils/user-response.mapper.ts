import { User } from '@prisma/client';
import { SafeUserResponse } from '../types/auth-response';

export function toSafeUser(user: User): SafeUserResponse {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}
