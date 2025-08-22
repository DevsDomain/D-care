import { Module } from '@nestjs/common';
import { PerfisController } from './perfis.controller';
import { PerfisService } from './perfis.service';

@Module({
  controllers: [PerfisController],
  providers: [PerfisService]
})
export class PerfisModule {}
