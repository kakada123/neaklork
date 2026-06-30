import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const DEFAULT_WEB_ORIGIN = 'http://localhost:3000';
const DEFAULT_PORT = 3001;

function parseAllowedOrigins(value?: string) {
  const origins = value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : [DEFAULT_WEB_ORIGIN];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: parseAllowedOrigins(configService.get<string>('NUXT_WEB_ORIGIN')),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configuredPort = Number(
    configService.get<string>('PORT') ?? DEFAULT_PORT,
  );
  const port = Number.isFinite(configuredPort) ? configuredPort : DEFAULT_PORT;

  await app.listen(port);
}
void bootstrap();
