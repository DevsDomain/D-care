import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { createTestApp } from '../../test/utils/create-test-app';
import { IdososModule } from './idosos.module';

describe('EldersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IdososModule],
    }).compile();

    app = await createTestApp(moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  const validPayload = {
    name: 'Mona',
    birthdate: '1975-09-08T03:00:00.000Z',
    conditions: ['Diabetes', 'Hipertensão'],
    medications: ['Metformina', 'Losartan'],
    address: 'Rua Betim, 520',
    city: 'São José dos Campos',
    state: 'SP',
    zipCode: '12228-080',
  };

  it('/api/v1/idosos (POST) → 201 Created', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/idosos')
      .send(validPayload)
      .expect(201);

    expect(res.body).toMatchObject({
      name: validPayload.name,
      city: validPayload.city,
      state: validPayload.state,
      zipCode: validPayload.zipCode,
    });
  });

  it('/api/v1/idosos (POST) → 400 Bad Request (invalid date)', async () => {
    const invalidPayload = { ...validPayload, birthdate: 'not-a-date' };

    await request(app.getHttpServer())
      .post('/api/v1/idosos')
      .send(invalidPayload)
      .expect(400);
  });
});
