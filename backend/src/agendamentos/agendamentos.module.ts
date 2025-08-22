import { Module } from '@nestjs/common';
import { AgendamentosController } from './agendamentos.controller';
import { AgendamentosService } from './agendamentos.service';

@Module({
  controllers: [AgendamentosController],
  providers: [AgendamentosService]
})
export class AgendamentosModule {}
