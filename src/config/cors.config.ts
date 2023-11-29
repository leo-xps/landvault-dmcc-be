import {
  CORS_ALLOWED_HEADERS,
  CORS_EXPOSED_HEADERS,
  CORS_WHITELIST,
} from '@common/environment';
import { CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';

const whitelist: string[] = CORS_WHITELIST ? CORS_WHITELIST.split(',') : [];
const allowedHeaders: string[] = CORS_ALLOWED_HEADERS
  ? CORS_ALLOWED_HEADERS.split(',')
  : [];

const exposedHeaders: string[] = CORS_EXPOSED_HEADERS
  ? CORS_EXPOSED_HEADERS.split(',')
  : [];

const origin = (
  requestOrigin: string | undefined,
  callback: (error: Error | null, origin?: boolean) => void,
) => {
  if (whitelist.indexOf('*') !== -1) {
    return callback(null, true);
  }

  if (whitelist.indexOf(requestOrigin) !== -1 || !requestOrigin) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'));
};

export default {
  origin,
  exposedHeaders,
  allowedHeaders,
} as unknown as CorsOptionsDelegate<any>;
