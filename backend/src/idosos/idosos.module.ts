import { Module } from '@nestjs/common';
import { IdososController } from './idosos.controller';
import { IdososService } from './idosos.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [IdososController],
  providers: [IdososService],
})
export class IdososModule {}
