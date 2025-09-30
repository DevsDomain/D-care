// backend/src/database/prisma.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // mantenha sem argumentos para evitar "Expected 0 arguments"
    super();
  }

  async onModuleInit(): Promise<void> {
    try {
      // 👇 cast para evitar o erro de tipagem do TS
      await (this as any).$connect();
      this.logger.log('Connected to the database');
    } catch (error: any) {
      this.logger.error(
        'Failed to connect to the database',
        error?.stack ?? String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    // 👇 mesmo cast aqui
    await (this as any).$disconnect();
    this.logger.log('Disconnected from the database');
  }
}
