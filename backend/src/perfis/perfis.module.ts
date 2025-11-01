import { Module } from '@nestjs/common';
import { PerfisController } from './perfis.controller';
import { PerfisService } from './perfis.service';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [PerfisController],
  providers: [PerfisService],
})
export class PerfisModule {}
