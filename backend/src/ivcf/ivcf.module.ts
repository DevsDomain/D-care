import { Module } from '@nestjs/common';
import { IvcfController } from './ivcf.controller';
import { IvcfService } from './ivcf.service';

@Module({
  controllers: [IvcfController],
  providers: [IvcfService]
})
export class IvcfModule {}
