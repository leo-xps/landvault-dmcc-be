import { AgoraCoreModule } from '@modules/agora-core/agora-core.module';
import { NestCacheModule } from '@modules/cache/cache.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { IAgoraChatRoomResponse } from '../types/AgoraChatREST.types';
import { AgoraChatRoomService } from './agora-chat-room.service';
import { AgoraChatTokenService } from './agora-chat-token.service';
import { AgoraChatUserService } from './agora-chat-user.service';

describe('AgoraChatService', () => {
  let service: AgoraChatRoomService;

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
      providers: [
        AgoraChatTokenService,
        AgoraChatUserService,
        AgoraChatRoomService,
      ],
    }).compile();

    service = module.get<AgoraChatRoomService>(AgoraChatRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let chatRoomToCheck: IAgoraChatRoomResponse = null;

  it('should be able to create a room', async () => {
    const room = await service.createChatRoom('test', 'communication');
    console.log(room);
    chatRoomToCheck = room;
    expect(room).toBeDefined();
  });

  it('should be able to get a room', async () => {
    const room = await service.getChatRoomDetails(chatRoomToCheck.data.id);
    console.log(room);
    expect(room).toBeDefined();
  });

  it('should be able to delete a room', async () => {
    const room = await service.deleteChatRoom(chatRoomToCheck.data.id);
    console.log(room);
    expect(room).toBeDefined();
  });
});
