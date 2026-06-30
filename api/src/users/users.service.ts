import { Injectable } from '@nestjs/common';
import { AuthProvider, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface SocialUserInput {
  provider: AuthProvider;
  providerUserId: string;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  createPasswordUser(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: this.normalizeEmail(data.email),
        passwordHash: data.passwordHash,
        name: data.name,
      },
    });
  }

  setPasswordForUser(
    user: User,
    data: {
      passwordHash: string;
      name?: string;
    },
  ) {
    const updateData: Prisma.UserUpdateInput = {
      passwordHash: data.passwordHash,
    };

    if (!user.name && data.name) {
      updateData.name = data.name;
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
  }

  async findOrCreateSocialUser(input: SocialUserInput) {
    const existingAccount = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: input.provider,
          providerUserId: input.providerUserId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      return this.updateSocialUserProfile(existingAccount.user, input);
    }

    const email = input.email ? this.normalizeEmail(input.email) : null;
    const existingUser = email ? await this.findByEmail(email) : null;

    if (existingUser) {
      await this.prisma.socialAccount.create({
        data: {
          provider: input.provider,
          providerUserId: input.providerUserId,
          email,
          username: input.username,
          userId: existingUser.id,
        },
      });

      return this.updateSocialUserProfile(existingUser, input);
    }

    return this.prisma.user.create({
      data: {
        email,
        name: input.name,
        avatarUrl: input.avatarUrl,
        socialAccounts: {
          create: {
            provider: input.provider,
            providerUserId: input.providerUserId,
            email,
            username: input.username,
          },
        },
      },
    });
  }

  private updateSocialUserProfile(user: User, input: SocialUserInput) {
    const data: Prisma.UserUpdateInput = {};

    if (!user.name && input.name) {
      data.name = input.name;
    }

    if (!user.avatarUrl && input.avatarUrl) {
      data.avatarUrl = input.avatarUrl;
    }

    if (!user.email && input.email) {
      data.email = this.normalizeEmail(input.email);
    }

    if (Object.keys(data).length === 0) {
      return user;
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data,
    });
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
