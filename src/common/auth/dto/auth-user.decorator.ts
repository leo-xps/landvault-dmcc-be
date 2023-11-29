import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RestAuthUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req.user;
  },
);
