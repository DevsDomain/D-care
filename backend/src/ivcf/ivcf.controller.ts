import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { IvcfService } from './ivcf.service';
import { CreateIvcfResponseDto } from './dto/create-ivcf-response.dto';
import { UpdateIvcfResponseDto } from './dto/update-ivcf-response.dto';

@Controller('ivcf')
export class IvcfController {
  constructor(private readonly ivcfService: IvcfService) {}

  // TODO: Add JwtAuthGuard
  @Post()
  async create(@Body() createIvcfResponseDto: CreateIvcfResponseDto) {
    return this.ivcfService.createIvcfResponse(createIvcfResponseDto);
  }

  @Get()
  async findAll() {
    return this.ivcfService.findAllIvcfResponses();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ivcfService.findIvcfResponseById(id);
  }

  // TODO: Add JwtAuthGuard
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIvcfResponseDto: UpdateIvcfResponseDto,
  ) {
    return this.ivcfService.updateIvcfResponse(id, updateIvcfResponseDto);
  }

  // TODO: Add JwtAuthGuard
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ivcfService.deleteIvcfResponse(id);
  }
}
