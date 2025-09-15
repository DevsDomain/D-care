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
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // TODO: Add JwtAuthGuard
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.createDocument(createDocumentDto, file);
  }

  @Get()
  async findAll() {
    return this.uploadsService.findAllDocuments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.uploadsService.findDocumentById(id);
  }

  // TODO: Add JwtAuthGuard
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.uploadsService.updateDocument(id, updateDocumentDto);
  }

  // TODO: Add JwtAuthGuard
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.uploadsService.deleteDocument(id);
  }
}
