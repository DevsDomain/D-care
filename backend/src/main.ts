// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS correto para o frontend em http://localhost:8080
  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true, // só use true se realmente precisar mandar cookies
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Prefixo global da API (ex.: /api/v1)
  const prefix = process.env.API_GLOBAL_PREFIX || 'api/v1';
  app.setGlobalPrefix(prefix);

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`API on http://localhost:${port}/${prefix}`);
}
bootstrap();
