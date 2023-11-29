import { Test, TestingModule } from '@nestjs/testing';
import { AgoraChatController } from './agora-chat.controller';

describe('AgoraChatController', () => {
  let controller: AgoraChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgoraChatController],
    }).compile();

    controller = module.get<AgoraChatController>(AgoraChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
