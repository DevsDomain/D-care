import { Module } from '@nestjs/common';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [
    // Rate limit
    ThrottlerModule.forRoot([
      {
        name: 'register',
        ttl: seconds(60),
        limit: 5,
      },
    ]),
    // JWT para injetar JwtService no AuthService
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret', // use .env
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
