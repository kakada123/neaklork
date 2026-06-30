import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { FacebookAuthDto } from './dto/facebook-auth.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { AuthService } from './auth.service';
import type { AuthRequestContext } from './types/auth-request-context';
import type { CurrentUserPayload } from './types/jwt-payload';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, this.getRequestContext(request));
  }

  @Post('signup')
  signup(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.authService.register(dto, this.getRequestContext(request));
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, this.getRequestContext(request));
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request) {
    return this.authService.refresh(
      dto.refreshToken,
      this.getRequestContext(request),
    );
  }

  @Post('logout')
  @UseGuards(OptionalJwtAuthGuard)
  logout(
    @Body() dto: LogoutDto,
    @CurrentUser() currentUser: CurrentUserPayload | null,
  ) {
    return this.authService.logout(dto.refreshToken, currentUser);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.authService.me(currentUser.id);
  }

  @Post('google')
  google(@Body() dto: GoogleAuthDto, @Req() request: Request) {
    return this.authService.google(dto.token, this.getRequestContext(request));
  }

  @Post('facebook')
  facebook(@Body() dto: FacebookAuthDto, @Req() request: Request) {
    return this.authService.facebook(
      dto.accessToken,
      this.getRequestContext(request),
    );
  }

  @Post('telegram')
  telegram(@Body() dto: TelegramAuthDto, @Req() request: Request) {
    return this.authService.telegram(dto, this.getRequestContext(request));
  }

  private getRequestContext(request: Request): AuthRequestContext {
    return {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    };
  }
}
