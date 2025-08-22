import { Module } from '@nestjs/common';
import { DisponibilidadeController } from './disponibilidade.controller';
import { DisponibilidadeService } from './disponibilidade.service';

@Module({
  controllers: [DisponibilidadeController],
  providers: [DisponibilidadeService]
})
export class DisponibilidadeModule {}
