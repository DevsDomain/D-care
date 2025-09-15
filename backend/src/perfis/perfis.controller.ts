import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  // TODO: Add JwtAuthGuard
  @Post()
  async create(
    @Body() createProfileDto: CreateProfileDto,
    @Param('userId') userId: string,
  ) {
    return this.perfisService.createProfile(createProfileDto, userId);
  }

  @Get()
  async findAll() {
    return this.perfisService.findAllProfiles();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.perfisService.findProfileById(id);
  }

  // TODO: Add JwtAuthGuard
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.perfisService.updateProfile(id, updateProfileDto);
  }

  // TODO: Add JwtAuthGuard
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.perfisService.deleteProfile(id);
  }
}
