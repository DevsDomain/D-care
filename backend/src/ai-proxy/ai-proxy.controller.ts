import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AiProxyService } from './ai-proxy.service';
import { CreateFaqQueryDto } from './dto/create-faq-query.dto';
import { UpdateFaqQueryDto } from './dto/update-faq-query.dto';

@Controller('ai-proxy')
export class AiProxyController {
  constructor(private readonly aiProxyService: AiProxyService) {}

  // TODO: Add JwtAuthGuard
  @Post()
  async create(@Body() createFaqQueryDto: CreateFaqQueryDto) {
    return this.aiProxyService.createFaqQuery(createFaqQueryDto);
  }

  @Get()
  async findAll() {
    return this.aiProxyService.findAllFaqQueries();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.aiProxyService.findFaqQueryById(id);
  }

  // TODO: Add JwtAuthGuard
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFaqQueryDto: UpdateFaqQueryDto,
  ) {
    return this.aiProxyService.updateFaqQuery(id, updateFaqQueryDto);
  }

  // TODO: Add JwtAuthGuard
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.aiProxyService.deleteFaqQuery(id);
  }
}
