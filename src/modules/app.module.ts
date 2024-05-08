import { HttpExceptionFilter } from '@config/http-exception.filter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { AdsModule } from './ads/ads.module';
import { AgoraChatModule } from './agora-chat/agora-chat.module';
import { AgoraCoreModule } from './agora-core/agora-core.module';
import { AgoraVideoModule } from './agora-video/agora-video.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AvaturnModule } from './avaturn/avaturn.module';
import { BlacklistedModule } from './blacklisted/blacklisted.module';
import { BrevoMailerModule } from './brevo-mailer/brevo-mailer.module';
import { CalendlyModule } from './calendly/calendly.module';
import { ChatListModule } from './chat-list/chat-list.module';
import { CsvGenModule } from './csv-gen/csv-gen.module';
import { DbModule } from './db/db.module';
import { DownloadModule } from './download/download.module';
import { FileModule } from './file/file.module';
import { GameDataModule } from './game-data/game-data.module';
import { HealthModule } from './health/health.module';
import { HubspotWebhookmeetingsModule } from './hubspot-webhookmeetings/hubspot-webhookmeetings.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PriceTickerModule } from './price-ticker/price-ticker.module';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { RpmModule } from './rpm/rpm.module';
import { ServerTokensModule } from './server-tokens/server-tokens.module';
import { UsersModule } from './users/users.module';
import { PriceApiModule } from './price-api/price-api.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveRoot: '/page',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', '.well-known'),
      serveRoot: '/.well-known',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(__dirname, '../lang/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    DbModule,
    ScheduleModule.forRoot(),
    UsersModule,
    RpmModule,
    BlacklistedModule,
    AgoraChatModule,
    AgoraCoreModule,
    BrevoMailerModule,
    ServerTokensModule,
    AgoraVideoModule,
    // CronAgoraDeleteChatroomModule,
    AppointmentsModule,
    AiChatModule,
    HubspotWebhookmeetingsModule,
    DownloadModule,
    CsvGenModule,
    HealthModule,
    PuppeteerModule,
    PriceTickerModule,
    AvaturnModule,
    CalendlyModule,
    ChatListModule,
    GameDataModule,
    LeaderboardModule,
    AdsModule,
    FileModule,
    PriceApiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
