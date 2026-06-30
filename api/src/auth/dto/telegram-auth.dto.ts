import { IsDefined, IsOptional, IsString } from 'class-validator';

export class TelegramAuthDto {
  @IsDefined()
  id!: string | number;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsDefined()
  auth_date!: string | number;

  @IsString()
  hash!: string;
}
