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
import { AgoraChatUserService } from './agora-chat-user.service';

dotenv.config();

describe('AgoraChatUser', () => {
  let service: AgoraChatUserService;

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
      providers: [AgoraChatUserService, AgoraChatTokenService],
    }).compile();

    service = module.get<AgoraChatUserService>(AgoraChatUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.skip('should be able to register user', async () => {
    const resp = await service.registerUser(
      'testUser2',
      'testUser2',
      'testUser2',
    );
    console.log(resp);

    expect(resp).toBeDefined();
  });

  it('should be able to fetch user by userid', async () => {
    const resp = await service.queryUser('testUser2');
    console.log(resp);

    expect(resp).toBeDefined();
  });

  it.skip('should be able to get token by username', async () => {
    const resp = await service.loginUser('testUser2');
    console.log(resp);

    expect(resp).toBeDefined();
  });
});
