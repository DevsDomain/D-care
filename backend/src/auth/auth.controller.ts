import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle, seconds } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterFamilyDto } from './register-family.dto'; // ajuste se seu DTO não estiver em /dto

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/family')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    register: { // <- chave nomeada combinando com a config do módulo
      limit: 5,
      ttl: seconds(60),
    },
  })
  async registerFamily(@Body() dto: RegisterFamilyDto) {
    return this.authService.registerFamily(dto);
  }
}
