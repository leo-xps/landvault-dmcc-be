import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly i18n: I18nService,
    private readonly service: FileService,
  ) {}

  @Post('createlink')
  @UseGuards(RestAuthGuard)
  async createUploadLink(@Body('fileName') fileName: string) {
    if (!fileName) {
      throw new BadRequestException(
        await this.i18n.t('errors.file.fileNameRequired'),
      );
    }

    return this.service.generateUploadUrl(fileName);
  }
}
