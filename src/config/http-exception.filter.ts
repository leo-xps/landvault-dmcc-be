import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, _host: ArgumentsHost) {
    const error = await this.i18n.translate(exception.message);
    exception.message = (error as any).message || error;
    exception[`errorCode`] = exception['response'].errorCode;
    if (_host.getType().toString() === 'http') {
      const ctx = _host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();

      response.status(status).json({
        status: exception.getStatus(),
        message: exception.message,
        name: exception.name,
        errorCode: exception['errorCode'],
      });
    }
    return exception;
  }
}
