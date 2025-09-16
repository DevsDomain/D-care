import { Module } from '@nestjs/common';
import { IvcfController } from './ivcf.controller';
import { IvcfService } from './ivcf.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [IvcfController],
  providers: [IvcfService],
})
export class IvcfModule {}
