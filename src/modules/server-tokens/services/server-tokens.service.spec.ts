import { Test, TestingModule } from '@nestjs/testing';
import { ServerTokensService } from './server-tokens.service';

describe('ServerTokensService', () => {
  let service: ServerTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServerTokensService],
    }).compile();

    service = module.get<ServerTokensService>(ServerTokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
