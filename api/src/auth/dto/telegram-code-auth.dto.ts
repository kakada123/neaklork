import { IsString } from 'class-validator';

export class TelegramCodeAuthDto {
  @IsString()
  code!: string;

  @IsString()
  codeVerifier!: string;

  @IsString()
  redirectUri!: string;
}
