import { IsDefined, IsOptional, IsString, ValidateIf } from 'class-validator';

export class TelegramAuthDto {
  @IsOptional()
  @IsString()
  idToken?: string;

  @ValidateIf((o: TelegramAuthDto) => !o.idToken)
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

  @ValidateIf((o: TelegramAuthDto) => !o.idToken)
  @IsDefined()
  auth_date!: string | number;

  @ValidateIf((o: TelegramAuthDto) => !o.idToken)
  @IsString()
  hash!: string;
}
