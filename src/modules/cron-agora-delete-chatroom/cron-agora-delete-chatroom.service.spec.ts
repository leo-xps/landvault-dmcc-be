import { Test, TestingModule } from '@nestjs/testing';
import { CronAgoraDeleteChatroomService } from './cron-agora-delete-chatroom.service';

describe('CronAgoraDeleteChatroomService', () => {
  let service: CronAgoraDeleteChatroomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronAgoraDeleteChatroomService],
    }).compile();

    service = module.get<CronAgoraDeleteChatroomService>(
      CronAgoraDeleteChatroomService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
