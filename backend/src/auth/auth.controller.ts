import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLegalTermsDto } from './dto/create-legal-terms.dto';
import { CreateTermsAcceptanceDto } from './dto/create-terms-acceptance.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateLegalTermsDto } from './dto/update-legal-terms.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async findAllUsers() {
    return this.authService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async findUserById(@Param('id') id: string) {
    return this.authService.findUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('terms')
  async createLegalTerms(@Body() createLegalTermsDto: CreateLegalTermsDto) {
    return this.authService.createLegalTerms(createLegalTermsDto);
  }

  @Get('terms')
  async findAllLegalTerms() {
    return this.authService.findAllLegalTerms();
  }

  @Get('terms/:id')
  async findLegalTermsById(@Param('id') id: string) {
    return this.authService.findLegalTermsById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('terms/:id')
  async updateLegalTerms(
    @Param('id') id: string,
    @Body() updateLegalTermsDto: UpdateLegalTermsDto,
  ) {
    return this.authService.updateLegalTerms(id, updateLegalTermsDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('terms/acceptance')
  async createTermsAcceptance(
    @Body() createTermsAcceptanceDto: CreateTermsAcceptanceDto,
  ) {
    return this.authService.createTermsAcceptance(createTermsAcceptanceDto);
  }
}
