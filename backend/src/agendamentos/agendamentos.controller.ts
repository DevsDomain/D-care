import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentRequestDto } from './dto/update-appointment-request.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  // TODO: Add JwtAuthGuard
  @Post()
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.agendamentosService.createAppointment(createAppointmentDto);
  }

  @Get()
  async findAllAppointments() {
    return this.agendamentosService.findAllAppointments();
  }

  @Get(':id')
  async findOneAppointment(@Param('id') id: string) {
    return this.agendamentosService.findAppointmentById(id);
  }

  // TODO: Add JwtAuthGuard
  @Patch(':id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.agendamentosService.updateAppointment(id, updateAppointmentDto);
  }

  // TODO: Add JwtAuthGuard
  @Delete(':id')
  async deleteAppointment(@Param('id') id: string) {
    return this.agendamentosService.deleteAppointment(id);
  }

  // TODO: Add JwtAuthGuard
  @Post('requests')
  async createRequest(@Body() createRequestDto: CreateAppointmentRequestDto) {
    return this.agendamentosService.createAppointmentRequest(createRequestDto);
  }

  // TODO: Add JwtAuthGuard
  @Patch('requests/:id')
  async updateRequest(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateAppointmentRequestDto,
  ) {
    return this.agendamentosService.updateAppointmentRequest(
      id,
      updateRequestDto,
    );
  }
}
