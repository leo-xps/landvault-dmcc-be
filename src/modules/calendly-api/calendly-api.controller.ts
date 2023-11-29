import { Body, Controller, Headers, Post } from '@nestjs/common';
import { CalendlyApiService } from './calendly-api.service';

@Controller('calendly-api')
export class CalendlyApiController {
  constructor(private readonly service: CalendlyApiService) {}

  @Post('/callback')
  async callback(@Body() body: any, @Headers() headers: any) {
    console.log(headers);
    console.log(body);
    console.log('sending response');
    return 'Ok';
  }
}
