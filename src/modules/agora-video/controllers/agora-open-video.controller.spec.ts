import { Test, TestingModule } from '@nestjs/testing';
import { AgoraOpenVideoController } from './agora-open-video.controller';

describe('AgoraOpenVideoController', () => {
  let controller: AgoraOpenVideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgoraOpenVideoController],
    }).compile();

    controller = module.get<AgoraOpenVideoController>(AgoraOpenVideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
