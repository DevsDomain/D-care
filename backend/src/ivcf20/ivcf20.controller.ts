import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { Ivcf20Service } from './ivcf20.service';
import { IvcfResultDto } from './dto/ivcf20.dto';

@Controller('ivcf20')
export class Ivcf20Controller {
  constructor(private readonly ivcf20Service: Ivcf20Service) {}

  @Post()
  create(@Body() dto: IvcfResultDto) {
    return this.ivcf20Service.createIVCF20(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ivcf20Service.getIVCF20ByElderId(id);
  }
}
