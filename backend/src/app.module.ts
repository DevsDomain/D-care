import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PerfisModule } from './perfis/perfis.module';
import { IdososModule } from './idosos/idosos.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AiProxyModule } from './ai-proxy/ai-proxy.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    PerfisModule,
    IdososModule,
    ReviewsModule,
    AiProxyModule,
    DatabaseModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
