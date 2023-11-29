import { Test, TestingModule } from '@nestjs/testing';
import { AgoraCoreTokenService } from './agora-core-token.service';

describe('AgoraCoreService', () => {
  let service: AgoraCoreTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgoraCoreTokenService],
    }).compile();

    service = module.get<AgoraCoreTokenService>(AgoraCoreTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
