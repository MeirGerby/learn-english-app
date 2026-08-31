import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Default Express JSON body limit (100kb) is too small for base64-
  // encoded PDF uploads (materials.upload) - raised to fit the ~8MB
  // decoded-file cap (see apps/api/src/materials/dto/materials.dto.ts)
  // plus base64's ~33% inflation and some headroom.
  app.useBodyParser('json', { limit: '12mb' });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
