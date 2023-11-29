import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { GENERIC_SUCCESS_MESSAGE } from '../common.const';

export class TransformOkResponse implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((result: { message: string; data: any; total: number }) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: result.message || GENERIC_SUCCESS_MESSAGE,
        data: result.data,
        total: result?.total,
      })),
    );
  }
}
