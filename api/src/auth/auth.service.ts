import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import type { RefreshToken, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { StringValue } from 'ms';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SocialUserInput, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { TelegramCodeAuthDto } from './dto/telegram-code-auth.dto';
import { AuthRequestContext } from './types/auth-request-context';
import { AuthResponse } from './types/auth-response';
import {
  AccessTokenPayload,
  CurrentUserPayload,
  RefreshTokenPayload,
} from './types/jwt-payload';
import { parseDurationToMs } from './utils/duration';
import { toSafeUser } from './utils/user-response.mapper';

const PASSWORD_HASH_ROUNDS = 12;
const TELEGRAM_AUTH_MAX_AGE_SECONDS = 24 * 60 * 60;
const TELEGRAM_OIDC_ISSUER = 'https://oauth.telegram.org';
const TELEGRAM_OIDC_JWKS = createRemoteJWKSet(
  new URL('https://oauth.telegram.org/.well-known/jwks.json'),
);

interface GoogleTokenInfo {
  sub: string;
  aud: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
}

interface FacebookDebugResponse {
  data?: {
    app_id?: string;
    is_valid?: boolean;
    user_id?: string;
  };
}

interface FacebookMeResponse {
  id: string;
  name?: string;
  email?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

interface TelegramTokenResponse {
  id_token?: string;
}

interface TokenPair extends AuthResponse {
  refreshTokenRecordId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async register(
    dto: RegisterDto,
    context: AuthRequestContext,
  ): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_HASH_ROUNDS);

    if (existingUser) {
      if (!existingUser.isActive) {
        throw new UnauthorizedException('User is inactive');
      }

      if (existingUser.passwordHash) {
        throw new ConflictException('Email is already registered');
      }

      const user = await this.usersService.setPasswordForUser(existingUser, {
        passwordHash,
        name: dto.name,
      });

      return this.toAuthResponse(await this.createTokenPair(user, context));
    }

    const user = await this.usersService.createPasswordUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    return this.toAuthResponse(await this.createTokenPair(user, context));
  }

  async login(
    dto: LoginDto,
    context: AuthRequestContext,
  ): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.toAuthResponse(await this.createTokenPair(user, context));
  }

  async refresh(
    refreshToken: string,
    context: AuthRequestContext,
  ): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.findMatchingRefreshToken(
      user.id,
      refreshToken,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokenPair = await this.createTokenPair(user, context);

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { replacedByTokenId: tokenPair.refreshTokenRecordId },
    });

    return this.toAuthResponse(tokenPair);
  }

  async logout(
    refreshToken: string | undefined,
    currentUser: CurrentUserPayload | null,
  ) {
    if (refreshToken) {
      await this.revokeRefreshToken(refreshToken);
      return { message: 'Logged out successfully' };
    }

    if (!currentUser) {
      throw new UnauthorizedException(
        'Access token or refresh token is required',
      );
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        userId: currentUser.id,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out successfully' };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid access token');
    }

    return toSafeUser(user);
  }

  async google(
    token: string,
    context: AuthRequestContext,
  ): Promise<AuthResponse> {
    const profile = await this.verifyGoogleToken(token);
    const user = await this.usersService.findOrCreateSocialUser(profile);
    this.assertActiveUser(user);

    return this.toAuthResponse(await this.createTokenPair(user, context));
  }

  async facebook(
    accessToken: string,
    context: AuthRequestContext,
  ): Promise<AuthResponse> {
    const profile = await this.verifyFacebookToken(accessToken);
    const user = await this.usersService.findOrCreateSocialUser(profile);
    this.assertActiveUser(user);

    return this.toAuthResponse(await this.createTokenPair(user, context));
  }

  async telegram(
    dto: TelegramAuthDto,
    context: AuthRequestContext,
  ): Promise<AuthResponse> {
    const profile = dto.idToken
      ? await this.verifyTelegramIdToken(dto.idToken)
      : this.verifyTelegramPayload(dto);
    const user = await this.usersService.findOrCreateSocialUser(profile);
    this.assertActiveUser(user);

    return this.toAuthResponse(await this.createTokenPair(user, context));
  }

  async telegramCode(
    dto: TelegramCodeAuthDto,
    context: AuthRequestContext,
  ): Promise<AuthResponse> {
    const idToken = await this.exchangeTelegramCodeForIdToken(dto);
    const profile = await this.verifyTelegramIdToken(idToken);
    const user = await this.usersService.findOrCreateSocialUser(profile);
    this.assertActiveUser(user);

    return this.toAuthResponse(await this.createTokenPair(user, context));
  }

  private async createTokenPair(
    user: User,
    context: AuthRequestContext,
  ): Promise<TokenPair> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      PASSWORD_HASH_ROUNDS,
    );
    const refreshTokenExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '30d',
    );

    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(
          Date.now() + parseDurationToMs(refreshTokenExpiresIn),
        ),
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
      },
    });

    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken,
      refreshTokenRecordId: refreshTokenRecord.id,
    };
  }

  private signAccessToken(user: User) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.getJwtExpiresIn('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
  }

  private signRefreshToken(user: User) {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getJwtExpiresIn('JWT_REFRESH_EXPIRES_IN', '30d'),
    });
  }

  private getJwtExpiresIn(key: string, fallback: StringValue): StringValue {
    return this.configService.get<string>(key, fallback) as StringValue;
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async findMatchingRefreshToken(userId: string, rawToken: string) {
    const candidates = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const candidate of candidates) {
      if (await bcrypt.compare(rawToken, candidate.tokenHash)) {
        return candidate;
      }
    }

    return null;
  }

  private async revokeRefreshToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const storedToken = await this.findMatchingRefreshToken(
      payload.sub,
      refreshToken,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.revokeStoredRefreshToken(storedToken);
  }

  private revokeStoredRefreshToken(storedToken: RefreshToken) {
    return this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
  }

  private async verifyGoogleToken(token: string): Promise<SocialUserInput> {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        token,
      )}`,
    );

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const data = (await response.json()) as GoogleTokenInfo;
    const clientId = this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');

    if (
      data.aud !== clientId ||
      !data.sub ||
      (data.email &&
        data.email_verified !== true &&
        data.email_verified !== 'true')
    ) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return {
      provider: AuthProvider.GOOGLE,
      providerUserId: data.sub,
      email: data.email,
      name: data.name,
      avatarUrl: data.picture,
    };
  }

  private async verifyFacebookToken(
    accessToken: string,
  ): Promise<SocialUserInput> {
    const appId = this.configService.getOrThrow<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.getOrThrow<string>(
      'FACEBOOK_APP_SECRET',
    );
    const appAccessToken = `${appId}|${appSecret}`;
    const debugUrl = new URL('https://graph.facebook.com/debug_token');
    debugUrl.searchParams.set('input_token', accessToken);
    debugUrl.searchParams.set('access_token', appAccessToken);

    const debugResponse = await fetch(debugUrl);

    if (!debugResponse.ok) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const debugData = (await debugResponse.json()) as FacebookDebugResponse;

    if (
      !debugData.data?.is_valid ||
      debugData.data.app_id !== appId ||
      !debugData.data.user_id
    ) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const meUrl = new URL('https://graph.facebook.com/me');
    meUrl.searchParams.set('fields', 'id,name,email,picture');
    meUrl.searchParams.set('access_token', accessToken);

    const meResponse = await fetch(meUrl);

    if (!meResponse.ok) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    const me = (await meResponse.json()) as FacebookMeResponse;

    if (me.id !== debugData.data.user_id) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    return {
      provider: AuthProvider.FACEBOOK,
      providerUserId: me.id,
      email: me.email,
      name: me.name,
      avatarUrl: me.picture?.data?.url,
    };
  }

  private verifyTelegramPayload(dto: TelegramAuthDto): SocialUserInput {
    const botToken =
      this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    const authDate = Number(dto.auth_date);
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (
      !Number.isFinite(authDate) ||
      nowSeconds - authDate > TELEGRAM_AUTH_MAX_AGE_SECONDS
    ) {
      throw new UnauthorizedException('Expired Telegram login payload');
    }

    const dataCheckString = this.buildTelegramDataCheckString(dto);
    const secretKey = createHash('sha256').update(botToken).digest();
    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (!this.safeHashEquals(expectedHash, dto.hash)) {
      throw new UnauthorizedException('Invalid Telegram login payload');
    }

    const firstName = dto.first_name?.trim() ?? '';
    const lastName = dto.last_name?.trim() ?? '';
    const name = `${firstName} ${lastName}`.trim() || dto.username || null;

    return {
      provider: AuthProvider.TELEGRAM,
      providerUserId: String(dto.id),
      username: dto.username,
      name,
      avatarUrl: dto.photo_url,
    };
  }

  private async verifyTelegramIdToken(
    idToken: string,
  ): Promise<SocialUserInput> {
    const clientId =
      this.configService.getOrThrow<string>('TELEGRAM_CLIENT_ID');

    try {
      const { payload } = await jwtVerify(idToken, TELEGRAM_OIDC_JWKS, {
        issuer: TELEGRAM_OIDC_ISSUER,
        audience: clientId,
      });

      const providerUserId = payload.id ?? payload.sub;

      if (
        (typeof providerUserId !== 'string' &&
          typeof providerUserId !== 'number') ||
        !providerUserId
      ) {
        throw new UnauthorizedException('Invalid Telegram login token');
      }

      return {
        provider: AuthProvider.TELEGRAM,
        providerUserId: String(providerUserId),
        username:
          typeof payload.preferred_username === 'string'
            ? payload.preferred_username
            : null,
        name: typeof payload.name === 'string' ? payload.name : null,
        avatarUrl: typeof payload.picture === 'string' ? payload.picture : null,
      };
    } catch {
      throw new UnauthorizedException('Invalid Telegram login token');
    }
  }

  private async exchangeTelegramCodeForIdToken(
    dto: TelegramCodeAuthDto,
  ): Promise<string> {
    const clientId =
      this.configService.getOrThrow<string>('TELEGRAM_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>(
      'TELEGRAM_CLIENT_SECRET',
    );
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: dto.code,
      redirect_uri: dto.redirectUri,
      client_id: clientId,
      code_verifier: dto.codeVerifier,
    });

    const response = await fetch('https://oauth.telegram.org/token', {
      method: 'POST',
      headers: {
        authorization: `Basic ${credentials}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Telegram authorization code');
    }

    const tokens = (await response.json()) as TelegramTokenResponse;

    if (!tokens.id_token) {
      throw new UnauthorizedException('Telegram did not return an ID token');
    }

    return tokens.id_token;
  }

  private buildTelegramDataCheckString(dto: TelegramAuthDto) {
    const entries = {
      auth_date: String(dto.auth_date),
      first_name: dto.first_name,
      id: String(dto.id),
      last_name: dto.last_name,
      photo_url: dto.photo_url,
      username: dto.username,
    };

    return Object.entries(entries)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      )
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  }

  private safeHashEquals(left: string, right: string) {
    const leftBuffer = Buffer.from(left, 'hex');
    const rightBuffer = Buffer.from(right, 'hex');

    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }

  private assertActiveUser(user: User) {
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }
  }

  private toAuthResponse(tokenPair: TokenPair): AuthResponse {
    return {
      user: tokenPair.user,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }
}
