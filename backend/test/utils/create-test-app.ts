// test/utils/create-test-app.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

export async function createTestApp(
  moduleFixture: TestingModule,
): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();

  const prefix = process.env.API_GLOBAL_PREFIX ?? 'api/v1';

  // 👇 replicar config do main.ts
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}
