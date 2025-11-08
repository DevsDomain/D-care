// src/idosos/idosos.controller.ts
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
import { IdososService } from './idosos.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('idosos')
export class IdososController {
  constructor(private readonly idososService: IdososService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @Body() dto: CreateElderDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.idososService.createElder(dto, file);
  }

  @Get()
  findAll() {
    return this.idososService.findAllElders();
  }

  @Get('family')
  findByFamily(@Query('familyId') familyId: string) {
    return this.idososService.findAllByFamily(familyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.idososService.findElderById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateElderDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.idososService.updateElder(id, dto, file);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.idososService.deleteElder(id);
  }
}
