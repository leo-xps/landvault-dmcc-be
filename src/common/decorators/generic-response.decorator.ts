import { UseInterceptors } from '@nestjs/common';
import { TransformOkResponse } from '../interceptors/transform-ok.interceptor';

export function GenericResponse() {
  return UseInterceptors(new TransformOkResponse());
}
