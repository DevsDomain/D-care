/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../app.module';
import { createTestApp } from '../../test/utils/create-test-app';

describe('PerfisController (e2e)', () => {
  let app: INestApplication;
  const prefix = process.env.API_GLOBAL_PREFIX ?? 'api/v1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 400 for invalid crm_coren', async () => {
    const res: Response = await request(app.getHttpServer())
      .post(`/${prefix}/perfis/caregiver`)
      .send({ userId: '1', crm_coren: 'INVALIDO' })
      .expect(400);

    expect(res.body.message).toContain('crm_coren inválido');
  });

  it('should create caregiver for valid crm_coren', async () => {
    const res: Response = await request(app.getHttpServer())
      .post(`/${prefix}/perfis/caregiver`)
      .send({ userId: '1', crm_coren: 'COREN-SP 123456', bio: 'Teste' })
      .expect(201);

    expect(res.body.crmCoren).toBe('COREN-SP 123456');
    expect(res.body.validated).toBe(false);
  });
});
