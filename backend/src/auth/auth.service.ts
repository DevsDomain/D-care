import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateLegalTermsDto } from './dto/create-legal-terms.dto';
import { CreateTermsAcceptanceDto } from './dto/create-terms-acceptance.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateLegalTermsDto } from './dto/update-legal-terms.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users, UserProfiles } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(
    dto: CreateUserDto,
  ): Promise<Users & { userProfile: UserProfiles | null }> {
    const hashedPassword: string = await bcrypt.hash(dto.password, 10);
    return this.prisma.users.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role,
        userProfile: {
          create: {
            name: dto.name,
            phone: dto.phone,
            birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
            gender: dto.gender,
          },
        },
      },
      include: { userProfile: true },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
      include: { userProfile: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.userProfile,
      },
    };
  }

  async findAllUsers() {
    return this.prisma.users.findMany({
      include: { userProfile: true },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: { userProfile: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: { userProfile: true },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const data: any = {};
    if (dto.email) data.email = dto.email;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.role) data.role = dto.role;
    if (dto.status) data.status = dto.status;

    return this.prisma.users.update({
      where: { id },
      data,
      include: { userProfile: true },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.users.delete({
      where: { id },
    });
  }

  async createLegalTerms(dto: CreateLegalTermsDto) {
    return this.prisma.legalTerms.create({
      data: {
        version: dto.version,
        content: dto.content,
      },
    });
  }

  async findAllLegalTerms() {
    return this.prisma.legalTerms.findMany({
      include: { acceptances: true },
    });
  }

  async findLegalTermsById(id: string) {
    const terms = await this.prisma.legalTerms.findUnique({
      where: { id },
      include: { acceptances: true },
    });
    if (!terms) {
      throw new NotFoundException(`Legal terms with ID ${id} not found`);
    }
    return terms;
  }

  async updateLegalTerms(id: string, dto: UpdateLegalTermsDto) {
    return this.prisma.legalTerms.update({
      where: { id },
      data: {
        version: dto.version,
        content: dto.content,
      },
    });
  }

  async createTermsAcceptance(dto: CreateTermsAcceptanceDto) {
    return this.prisma.userTermsAcceptance.create({
      data: {
        userId: dto.userId,
        termId: dto.termId,
      },
      include: { user: true, term: true },
    });
  }
}
