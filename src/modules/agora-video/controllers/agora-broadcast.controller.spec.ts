import { Test, TestingModule } from '@nestjs/testing';
import { AgoraBroadcasterVideoController } from './agora-broadcast.controller';

describe('AgoraBroadcasterVideoController', () => {
  let controller: AgoraBroadcasterVideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgoraBroadcasterVideoController],
    }).compile();

    controller = module.get<AgoraBroadcasterVideoController>(
      AgoraBroadcasterVideoController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
