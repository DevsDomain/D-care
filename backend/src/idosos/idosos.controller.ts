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
} from '@nestjs/common';
import { IdososService } from './idosos.service';
import { UpdateElderDto } from './dto/update-elder.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateElderDto } from './dto/create-elder.dto';
import safeParseArray from 'src/common/pipes/safe-parse-array.pipe';

@Controller('idosos')
export class IdososController {
  constructor(private readonly idososService: IdososService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/elders',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname.replace(/\s+/g, '-');
          callback(null, `${uniqueSuffix}-${originalName}`);
        },
      }),
    }),
  )
  async create(
    @Body() body: Record<string, any>, // temporário, vamos converter
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<any> {
    // converte string para tipos corretos
    const dto: CreateElderDto = {
      familyId: body.familyId as string,
      name: body.name as string,
      avatarPath: file ? `/uploads/elders/${file.filename}` : undefined,
      birthdate: body.birthdate
        ? new Date(body.birthdate).toISOString()
        : undefined,
      conditions: safeParseArray(body.conditions),
      medications: safeParseArray(body.medications),
      address: body.address as string,
      city: body.city as string,
      state: body.state as string,
      zipCode: body.zipCode as string,
    };

    return this.idososService.createElder(dto, file);
  }

  @Get()
  async findAll() {
    return this.idososService.findAllElders();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.idososService.findElderById(id);
  }

  // TODO: Add JwtAuthGuard
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateElderDto: UpdateElderDto,
  ) {
    return this.idososService.updateElder(id, updateElderDto);
  }

  // TODO: Add JwtAuthGuard
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.idososService.deleteElder(id);
  }
}
