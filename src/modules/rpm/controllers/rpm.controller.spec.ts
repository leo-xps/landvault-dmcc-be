import { Test, TestingModule } from '@nestjs/testing';
import { RpmController } from './rpm.controller';

describe('RpmController', () => {
  let controller: RpmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RpmController],
    }).compile();

    controller = module.get<RpmController>(RpmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
