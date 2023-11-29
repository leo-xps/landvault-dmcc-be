export class ResponseDto<T> {
  readonly message?: string;

  readonly data: T;

  readonly total?: number;
}
