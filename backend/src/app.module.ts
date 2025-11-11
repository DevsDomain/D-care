import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PerfisModule } from './perfis/perfis.module';
import { IdososModule } from './idosos/idosos.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AiProxyModule } from './ai-proxy/ai-proxy.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './cadastro/auth.module';
import { AppointmentModule } from './appointment/appointment.module';
import { Ivcf20Module } from './ivcf20/ivcf20.module';

@Module({
  imports: [
    PerfisModule,
    IdososModule,
    ReviewsModule,
    AppointmentModule,
    AiProxyModule,
    DatabaseModule,
    AuthModule,
    Ivcf20Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
