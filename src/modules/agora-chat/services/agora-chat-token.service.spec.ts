import { AgoraCoreModule } from '@modules/agora-core/agora-core.module';
import { NestCacheModule } from '@modules/cache/cache.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { AgoraChatTokenService } from './agora-chat-token.service';

dotenv.config();

describe('AgoraChatToken', () => {
  let service: AgoraChatTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loader: I18nJsonLoader,
          loaderOptions: {
            path: join(__dirname, '../../../lang/'),
            watch: true,
          },
          resolvers: [
            { use: QueryResolver, options: ['lang'] },
            AcceptLanguageResolver,
          ],
        }),
        NestCacheModule,
        HttpModule,
        AgoraCoreModule,
      ],
      providers: [AgoraChatTokenService],
    }).compile();

    service = module.get<AgoraChatTokenService>(AgoraChatTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to get token by username', async () => {
    const resp = await service.createUserToken('testUser'); // this will error tbh
    console.log('App Token', resp);

    expect(resp).toBeDefined();
  });
});
