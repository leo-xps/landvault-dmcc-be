import { Test, TestingModule } from '@nestjs/testing';
import { AgoraVideoTokenService } from './agora-video-token.service';

describe('AgoraVideoService', () => {
  let service: AgoraVideoTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgoraVideoTokenService],
    }).compile();

    service = module.get<AgoraVideoTokenService>(AgoraVideoTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
