import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PerfisModule } from './perfis/perfis.module';
import { IdososModule } from './idosos/idosos.module';
import { DisponibilidadeModule } from './disponibilidade/disponibilidade.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { ReviewsModule } from './reviews/reviews.module';
import { IvcfModule } from './ivcf/ivcf.module';
import { AiProxyModule } from './ai-proxy/ai-proxy.module';
import { UploadsModule } from './uploads/uploads.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AuthModule,
    PerfisModule,
    IdososModule,
    DisponibilidadeModule,
    AgendamentosModule,
    ReviewsModule,
    IvcfModule,
    AiProxyModule,
    UploadsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
