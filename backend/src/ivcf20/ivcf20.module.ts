import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { Ivcf20Controller } from './ivcf20.controller';
import { Ivcf20Service } from './ivcf20.service';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [Ivcf20Controller],
  providers: [Ivcf20Service],
})
export class Ivcf20Module {}
