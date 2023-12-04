import { Test, TestingModule } from '@nestjs/testing';
import { PriceTickerController } from './price-ticker.controller';

describe('PriceTickerController', () => {
  let controller: PriceTickerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceTickerController],
    }).compile();

    controller = module.get<PriceTickerController>(PriceTickerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
