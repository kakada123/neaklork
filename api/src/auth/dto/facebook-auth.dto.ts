import { IsString, MinLength } from 'class-validator';

export class FacebookAuthDto {
  @IsString()
  @MinLength(20)
  accessToken!: string;
}
