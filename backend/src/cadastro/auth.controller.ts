import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle, seconds } from '@nestjs/throttler';
import { AuthService } from './auth.service';

import { RegisterFamilyDto } from './dto/register-family.dto';
import { RegisterCaregiverDto } from './dto/register-caregiver.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/family')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    register: {
      limit: 5,
      ttl: seconds(60),
    },
  })
  async registerFamily(@Body() dto: RegisterFamilyDto) {
    return this.authService.registerFamily(dto);
  }

  @Post('register/caregiver')
  async registerCaregiver(@Body() dto: RegisterCaregiverDto) {
    return this.authService.registerCaregiver(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
