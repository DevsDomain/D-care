import { Module } from '@nestjs/common';
import { IdososController } from './idosos.controller';
import { IdososService } from './idosos.service';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [IdososController],
  providers: [IdososService],
})
export class IdososModule {}
