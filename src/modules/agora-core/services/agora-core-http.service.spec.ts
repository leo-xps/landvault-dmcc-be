import { Test, TestingModule } from '@nestjs/testing';
import { AgoraCoreHttpService } from './agora-core-http.service';

describe('AgoraCoreService', () => {
  let service: AgoraCoreHttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgoraCoreHttpService],
    }).compile();

    service = module.get<AgoraCoreHttpService>(AgoraCoreHttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
