import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { RegisterFamilyDto } from './register-family.dto';
import { Prisma, UserRole } from '../../generated/prisma';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private signTokens(params: { userId: string; role: UserRole }) {
    const nowSec = Math.floor(Date.now() / 1000);
    const jti = randomUUID();

    const accessToken = this.jwt.sign(
      {
        sub: params.userId,
        role: params.role,
        iat: nowSec,
      },
      {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      },
    );

    const refreshToken = this.jwt.sign(
      {
        sub: params.userId,
        jti,
        iat: nowSec,
        typ: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
      },
    );

    return { accessToken, refreshToken };
  }

  async registerFamily(dto: RegisterFamilyDto) {
    // 400 se senhas divergirem
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const email = dto.email.trim().toLowerCase();

    // 409 se e-mail já existir
    const existing = await this.prisma.users.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            email,
            passwordHash,
            role: UserRole.FAMILY,
            status: 'active',
            userProfile: {
              create: {
                name: dto.fullName,
                phone: dto.phone,
              },
            },
            family: { create: [{}] }, // cria Families vinculado por userId (ownership)
          },
          include: { userProfile: true, family: true },
        });

        // Sanity checks: role e ownership
        if (user.role !== UserRole.FAMILY) {
          throw new InternalServerErrorException('Role mismatch: expected FAMILY');
        }
        const createdFamily = user.family?.[0];
        if (!createdFamily || createdFamily.userId !== user.id) {
          throw new InternalServerErrorException('Ownership linkage failed (Family.userId)');
        }

        const tokens = this.signTokens({ userId: user.id, role: user.role });

        return {
          user: {
            id: user.id,
            role: user.role,
            email: user.email,
            createdAt: user.createdAt, // UTC (DB)
            profileId: user.userProfile?.[0]?.id ?? null,
            familyId: createdFamily.id,
          },
          tokens, // { accessToken, refreshToken }
        };
      });

      return result;
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // unique_violation no email
        throw new ConflictException('E-mail já cadastrado');
      }
      throw new InternalServerErrorException('Não foi possível criar a conta');
    }
  }
}
