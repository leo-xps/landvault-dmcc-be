import { Controller } from '@nestjs/common';
import { BlacklistedService } from '../services/blacklisted.service';

@Controller('blacklisted')
export class BlacklistedController {
  constructor(private readonly blacklistedService: BlacklistedService) {}
}
