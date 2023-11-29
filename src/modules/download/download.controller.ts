import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { DownloadService } from './download.service';

@Controller('download')
export class DownloadController {
  constructor(
    private readonly i18n: I18nService,
    private readonly service: DownloadService,
    private readonly serverAdminToken: ServerTokensService,
  ) {}

  async checkAdminTokenValidity(token: string) {
    if (!token)
      throw new BadRequestException(this.i18n.translate('RBAC.UNAUHTORIZED'));
    return this.serverAdminToken.validateToken(token);
  }

  // create chatroom
  @Get('/users')
  async downloadUsersCSV(
    @Headers('lv-srv-adm') srvToken: string,
    @Query('includeGuests') includeGuests: string,
    @Res() res: Response,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);
    if (!valid) {
      throw new BadRequestException(this.i18n.translate('RBAC.UNAUHTORIZED'));
    }

    const { readStream, filename } = await this.service.generateListOfUsers({
      includeGuests: includeGuests === 'true',
    });

    // send the readstream to express response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    // set file size
    res.setHeader('Content-Length', readStream.string.length);
    res.send(readStream.string);

    // // set response headers to csv
    // res.setHeader('Content-Type', 'text/csv');
    // readStream.pipe(res);
  }
}
