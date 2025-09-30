// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Prefixo global da API (ex.: /api/v1)
  const prefix = process.env.API_GLOBAL_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);

  // Validação global (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos não declarados nos DTOs
      forbidNonWhitelisted: true,
      transform: true, // transforma tipos conforme DTOs
    }),
  );

  // CORS (ajuste domínios conforme seu frontend)
  app.enableCors({
    origin: ['http://localhost:3001', 'https://seu-frontend.vercel.app'],
    credentials: true,
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`API on http://localhost:${port}/${prefix}`);
}
bootstrap();