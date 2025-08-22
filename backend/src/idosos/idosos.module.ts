import { Module } from '@nestjs/common';
import { IdososController } from './idosos.controller';
import { IdososService } from './idosos.service';

@Module({
  controllers: [IdososController],
  providers: [IdososService]
})
export class IdososModule {}
