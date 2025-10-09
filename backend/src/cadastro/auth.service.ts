// src/auth/auth.service.ts
import {
  Inject,
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { RegisterFamilyDto } from './dto/register-family.dto';
import { RegisterCaregiverDto } from './dto/register-caregiver.dto';
import { LoginDto } from './dto/login.dto';
import { Users, UserProfiles, UserRole } from '@prisma/client';

type JwtPayload = { sub: string; email: string; role: UserRole };
type UserWithProfile = Users & {
  userProfile: UserProfiles[];
};

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ========== PUBLIC API ==========

  async registerFamily(dto: RegisterFamilyDto) {
    this.ensurePasswordsMatch(dto.password, dto.confirmPassword);
    await this.ensureEmailIsFree(dto.email);

    const passwordHash = await this.hash(dto.password);

    const user = await this.prisma.users.create({
      data: {
        email: dto.email.toLowerCase(),
        role: UserRole.FAMILY,
        passwordHash,
        userProfile: {
          create: {
            name: dto.fullName,
            phone: dto.phone,
          },
        },
      },
      include: { userProfile: true },
    });

    const tokens = this.signTokens(user.id, user.email, user.role);
    return { user: this.safeUser(user), ...tokens };
  }

  async registerCaregiver(dto: RegisterCaregiverDto) {
    this.ensurePasswordsMatch(dto.password, dto.confirmPassword);
    await this.ensureEmailIsFree(dto.email);

    const passwordHash = await this.hash(dto.password);

    const user = await this.prisma.users.create({
      data: {
        email: dto.email.toLowerCase(),
        role: UserRole.CAREGIVER,
        passwordHash,
        userProfile: {
          create: {
            name: dto.fullName,
            phone: dto.phone,
          },
        },
        caregiver: {
          create: {
            crmCoren: dto.crmCoren ?? null,
          },
        },
      },
      include: { userProfile: true, caregiver: true },
    });

    const tokens = this.signTokens(user.id, user.email, user.role);
    return { user: this.safeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    // The type error is now resolved because UserWithProfile matches the return type.
    const user: UserWithProfile | null = await this.prisma.users.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { userProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const ok = await this.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const tokens = this.signTokens(user.id, user.email, user.role);
    return { user: this.safeUser(user), ...tokens };
  }

  async socialLogin(params: {
    email: string;
    fullName?: string;
    role?: UserRole;
  }) {
    const email = params.email.toLowerCase();

    let user = await this.prisma.users.findUnique({
      where: { email },
      include: { userProfile: true },
    });

    if (!user) {
      const randomHash = await this.hash(this.randomPasswordSeed());
      user = await this.prisma.users.create({
        data: {
          email,
          role: params.role ?? UserRole.FAMILY,
          passwordHash: randomHash,
          userProfile: {
            create: {
              name: params.fullName ?? email.split('@')[0],
              phone: '',
            },
          },
        },
        include: { userProfile: true },
      });
    }

    const tokens = this.signTokens(user.id, user.email, user.role);
    return { user: this.safeUser(user), ...tokens };
  }

  // ========== HELPERS ==========

  private ensurePasswordsMatch(password: string, confirm: string) {
    if (password !== confirm) {
      throw new BadRequestException('As senhas não coincidem.');
    }
  }

  private async ensureEmailIsFree(email: string) {
    const exists = await this.prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    if (exists) {
      throw new ConflictException('E-mail já cadastrado.');
    }
  }

  private signTokens(userId: string, email: string, role: UserRole) {
    const payload: JwtPayload = { sub: userId, email, role };
    const accessToken = this.jwt.sign(payload);

    // Let TypeScript infer the type (string | { [key: string]: any } | null)
    const decoded = this.jwt.decode(accessToken);

    // Use a runtime check (type guard) to safely narrow the type
    const expiresAt =
      typeof decoded === 'object' && decoded && typeof decoded.exp === 'number'
        ? new Date(decoded.exp * 1000).toISOString()
        : null;

    return { accessToken, expiresAt };
  }

  private safeUser(u: Users & { userProfile?: UserProfiles[] }) {
    const profile = u.userProfile?.[0]; // pega o primeiro perfil (geralmente 1:1)

    return {
      id: u.id,
      role: u.role,
      email: u.email,
      status: u.status,
      createdAt: u.createdAt,
      deletedAt: u.deletedAt,
      updatedAt: u.updatedAt,
      name: profile?.name ?? null,
      phone: profile?.phone ?? null,
      birthdate: profile?.birthdate ?? null,
      gender: profile?.gender ?? null,
    };
  }

  private async hash(plain: string) {
    return bcrypt.hash(plain, this.SALT_ROUNDS);
  }

  private async compare(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }

  private randomPasswordSeed() {
    return `oauth-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
}
