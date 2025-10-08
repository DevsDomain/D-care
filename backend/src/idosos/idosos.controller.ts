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
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('idosos')
export class IdososController {
  constructor(private readonly idososService: IdososService) {}

  // TODO: Add JwtAuthGuard
  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() createElderDto: CreateElderDto, // temporário, vamos converter
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<any> {
    return this.idososService.createElder(createElderDto, file);
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
