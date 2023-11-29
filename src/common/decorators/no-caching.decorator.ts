import { Header, applyDecorators } from '@nestjs/common';

export function NoCaching() {
  return applyDecorators(
    Header('Cache-Control', 'private, no-cache, no-store, must-revalidate'),
    Header('Expires', '-1'),
    Header('Pragma', 'no-cache'),
  );
}
