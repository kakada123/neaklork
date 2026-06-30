import { ConfigService } from '@nestjs/config';

const DEFAULT_DB_CONNECTION = 'postgresql';
const DEFAULT_DB_PORT = '5432';

function requireConfigValue(configService: ConfigService, key: string) {
  const value = configService.get<string>(key)?.trim();

  if (!value) {
    throw new Error(`${key} is required when DATABASE_URL is not set`);
  }

  return value;
}

function normalizeDbConnection(value: string) {
  const connection = value.trim().toLowerCase();

  if (connection === 'postgres') {
    return 'postgresql';
  }

  if (connection === 'postgresql') {
    return connection;
  }

  throw new Error(`Unsupported DB_CONNECTION: ${value}`);
}

export function buildDatabaseUrl(configService: ConfigService) {
  const databaseUrl = configService.get<string>('DATABASE_URL')?.trim();

  if (databaseUrl) {
    return databaseUrl;
  }

  const connection = normalizeDbConnection(
    configService.get<string>('DB_CONNECTION') ?? DEFAULT_DB_CONNECTION,
  );
  const host = requireConfigValue(configService, 'DB_HOST');
  const port = configService.get<string>('DB_PORT')?.trim() || DEFAULT_DB_PORT;
  const username = requireConfigValue(configService, 'DB_USERNAME');
  const password = configService.get<string>('DB_PASSWORD') ?? '';
  const database = requireConfigValue(configService, 'DB_DATABASE');

  const url = new URL(`${connection}://${host}`);
  url.port = port;
  url.username = username;
  url.password = password;
  url.pathname = database.startsWith('/') ? database : `/${database}`;

  return url.toString();
}
