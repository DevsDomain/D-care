import { Module } from '@nestjs/common';
import { PerfisController } from './perfis.controller';
import { PerfisService } from './perfis.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PerfisController],
  providers: [PerfisService],
})
export class PerfisModule {}
