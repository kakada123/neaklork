import { ConfigService } from '@nestjs/config';

function requireConfigValue(configService: ConfigService, key: string) {
  const value = configService.get<string>(key)?.trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

export function buildDatabaseUrl(configService: ConfigService) {
  return requireConfigValue(configService, 'DATABASE_URL');
}
