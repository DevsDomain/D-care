import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { PerfisService } from './perfis.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfessionalIdValidationPipe } from '../common/pipes/professional-id-validation.pipe';
import { CreateCareGiverDto } from './dto/create-caregiver.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';

@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  // Perfil Familia-idoso
  @Post()
  async create(
    @Body() createProfileDto: CreateProfileDto,
    @Param('userId') userId: string,
  ) {
    return this.perfisService.createProfile(createProfileDto, userId);
  }

  // Perfil cuidador ( com validação de CRM/COREN )
  @Post('caregiver')
  async createCaregiver(
    @Body(new ProfessionalIdValidationPipe())
    createCaregiverDto: CreateCareGiverDto,
    @Param('userId') userId: string,
  ) {
    return this.perfisService.createCaregiver(createCaregiverDto, userId);
  }

  // Perfil cuidador ( com validação de CRM/COREN )
  @Patch('caregiver/:userId')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateCaregiver(
    @Param('userId') userId: string,
    @Body(new ProfessionalIdValidationPipe())
    createCaregiverDto: CreateCareGiverDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.perfisService.updateCaregiver(userId, createCaregiverDto, file);
  }

  @Patch('caregiver/:id/availability')
  async toggleCaregiverAvailability(
    @Param('id') id: string,
    @Body('available') available: boolean,
  ) {
    return this.perfisService.toggleCaregiverAvailabilityService(id, available);
  }

  @Patch('caregiver/:id/emergency-availability')
  async toggleCaregiverEmergencyAvailability(
    @Param('id') id: string,
    @Body('available') available: boolean,
  ) {
    return this.perfisService.toggleCaregiverEmergencyAvailabilityService(
      id,
      available,
    );
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

  @Get('caregivers/search')
  async searchCaregivers(
    @Query() query: SearchCaregiversDto,
    @Param('userId') userId: string,
  ) {
    return await this.perfisService.searchCaregivers(userId, query);
  }
}
