import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard, seconds } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'register',
        ttl: seconds(60), // janela de 60s
        limit: 5,        // máx. 5 req por IP
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
