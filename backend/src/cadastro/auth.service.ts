// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { PrismaService } from '../database/prisma.service';
import { RegisterFamilyDto } from './dto/register-family.dto';
import { RegisterCaregiverDto } from './dto/register-caregiver.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client'; 



type JwtPayload = { sub: string; email: string; role: UserRole };

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
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
        role: UserRole.FAMILY,              // 👈 enum
        passwordHash,
        userProfile: {                      // 👈 cria o perfil (Users ➜ UserProfiles[])
          create: {
            name: dto.fullName,             // 👈 no schema é "name", não "fullName"
            phone: dto.phone,
          },
        },
        // se quiser já criar um registro em Families, faça aqui (opcional)
      },
      include: { userProfile: true },       // opcional, caso queira retornar
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
        role: UserRole.CAREGIVER,           // 👈 enum
        passwordHash,
        userProfile: {                      // 👈 perfil com nome/telefone
          create: {
            name: dto.fullName,
            phone: dto.phone,
          },
        },
        caregiver: {                        // 👈 cria o caregiver (Users ➜ Caregivers[])
          create: {
            crmCoren: dto.crmCoren ?? null, // no schema é String? (nullable)
          },
        },
      },
      include: { userProfile: true, caregiver: true }, // opcional
    });

    const tokens = this.signTokens(user.id, user.email, user.role);
    return { user: this.safeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const ok = await this.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const tokens = this.signTokens(user.id, user.email, user.role);
    return { user: this.safeUser(user), ...tokens };
  }

  /**
   * (Opcional) Fluxo de social login.
   * Use este método se você integrar OAuth (Google, Apple, etc.).
   * A ideia: se existir usuário por e-mail, retorna token; senão cria um usuário "sem senha" (hash randômico).
   */
  async socialLogin(params: {
    email: string;
    fullName?: string;
    role?: UserRole; // 👈 aceita ADMIN também; defina o default abaixo
  }) {
    const email = params.email.toLowerCase();

    let user = await this.prisma.users.findUnique({ where: { email } });

    if (!user) {
      const randomHash = await this.hash(this.randomPasswordSeed());
      user = await this.prisma.users.create({
        data: {
          email,
          role: params.role ?? UserRole.FAMILY, // 👈 default
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

  private signTokens(userId: string, email: string, role: UserRole) { // 👈 enum aqui
    const payload: JwtPayload = { sub: userId, email, role };
    const accessToken = this.jwt.sign(payload);
    const decoded: any = this.jwt.decode(accessToken);
    const expiresAt =
      typeof decoded === 'object' && decoded?.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : null;
    return { accessToken, expiresAt };
  }

  private safeUser<T extends { passwordHash?: string }>(u: T) {
    const { passwordHash, ...rest } = u;
    return rest;
  }

  private async hash(plain: string) {
    return bcrypt.hash(plain, this.SALT_ROUNDS);
  }

  private async compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  private randomPasswordSeed() {
    return `oauth-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
}
