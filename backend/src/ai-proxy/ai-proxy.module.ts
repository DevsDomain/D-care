import { Module } from '@nestjs/common';
import { AiProxyController } from './ai-proxy.controller';
import { AiProxyService } from './ai-proxy.service';

@Module({
  controllers: [AiProxyController],
  providers: [AiProxyService]
})
export class AiProxyModule {}
