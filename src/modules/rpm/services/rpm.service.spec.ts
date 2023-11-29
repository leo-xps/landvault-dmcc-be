import { Test, TestingModule } from '@nestjs/testing';
import { RpmService } from './rpm.service';

describe('RpmService', () => {
  let service: RpmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RpmService],
    }).compile();

    service = module.get<RpmService>(RpmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
