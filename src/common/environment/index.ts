import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../', '.env') });

export const APP_PORT = process.env.APP_PORT || 4000;
export const APP_ENV = process.env.APP_ENV || '';
export const APP_VERSION = process.env.APP_VERSION || '0.0.1';

export const CORS_ALLOWED_HEADERS =
  process.env.CORS_ALLOWED_HEADERS ||
  'Access-Control-Allow-Headers,Origin,X-Requested-With,Content-Type,Accept,Authorization';
export const CORS_EXPOSED_HEADERS = process.env.CORS_EXPOSED_HEADERS || '';
export const CORS_WHITELIST = process.env.CORS_WHITELIST || '';

export const JWT_SECRET = process.env.JWT_SECRET || '';
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '';

export const AGORA_APP_ID = process.env.AGORA_APP_ID;
export const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

export const AGORA_REST_ID = process.env.AGORA_REST_ID;
export const AGORA_REST_SECRET = process.env.AGORA_REST_SECRET;

export const AGORA_CHAT_WEBSOCKET_URL =
  process.env.AGORA_CHAT_WEBSOCKET_URL ?? '';
export const AGORA_CHAT_API_URL = process.env.AGORA_CHAT_API_URL ?? '';
export const AGORA_CHAT_ORGNAME = process.env.AGORA_CHAT_ORGNAME ?? '';
export const AGORA_CHAT_APPNAME = process.env.AGORA_CHAT_APPNAME ?? '';
export const AGORA_CHAT_APPKEY = `${AGORA_CHAT_ORGNAME}#${AGORA_CHAT_APPNAME}`;

export const MAILER_BREVO_API_KEY = process.env.MAILER_BREVO_API_KEY ?? '';
export const MAILER_NAME = process.env.MAILER_NAME ?? '';
export const MAILER_EMAILADDRESS = process.env.MAILER_EMAILADDRESS ?? '';
export const AGORA_CHAT_SECRET = process.env.AGORA_CHAT_SECRET ?? '';

export const BASE_URL = process.env.BASE_URL ?? '';
export const ROOM_URL = process.env.ROOM_URL ?? BASE_URL ?? '';
export const AUTO_URL = process.env.AUTO_URL ?? '';
export const APP_URL = process.env.APP_URL ?? BASE_URL ?? '';

export const CHATBASE_APIKEY = process.env.CHATBASE_APIKEY ?? '';
export const CHATBASE_MODELID = process.env.CHATBASE_MODELID ?? '';
export const DEV_HUBSPOT_API_KEY = process.env.DEV_HUBSPOT_API_KEY ?? '';
export const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY ?? '';
export const HUBSPOT_WEBHOOK_VIDEO_CONFERENCE_LINK =
  process.env.HUBSPOT_WEBHOOK_VIDEO_CONFERENCE_LINK ?? '';

export const SERVER_URL = process.env.SERVER_URL ?? '';
export const CRYPTO_UID = process.env.CRYPTO_UID ?? 'cluvr45km004cwumrtpguye5j';
export const CRYPTO_SSO =
  process.env.CRYPTO_SSO ??
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJjbHV2cjQ1a20wMDRjd3VtcnRwZ3V5ZTVqIiwiaWQiOiJjbHV2cjQ1a20wMDRjd3VtcnRwZ3V5ZTVqIiwiZW1haWwiOiJhY3N0dWRpbzMxQGdtYWlsLmNvbSIsImlhdCI6MTcxNTAwMzQzNSwiZXhwIjoxNzE1MDg5ODM1fQ.2xXmhiI-rMo4EAUD7RpXIvgsO4EWMjFAInoiZCY7eP1RXGrMFyV5d-gNSByyucBybwCnQH6GLu1CwDvakcywPQ';

export const HUBSPOT_LANDVAULT_APP_ID =
  process.env.HUBSPOT_LANDVAULT_APP_ID ?? '';
export const HUBSPOT_LANDVAULT_APP_SECRET =
  process.env.HUBSPOT_LANDVAULT_APP_SECRET ?? '';
export const HUBSPOT_LANDVAULT_APP_REDIRECT_URI =
  process.env.HUBSPOT_LANDVAULT_APP_REDIRECT_URI ?? '';
export const HUBSPOT_LANDVAULT_PRIVATE_APP_KEY =
  process.env.HUBSPOT_LANDVAULT_PRIVATE_APP_KEY ?? '';

export const PRICE_TICKER_FINANCIAL_PREP =
  process.env.PRICE_TICKER_FINANCIAL_PREP ?? '';

export const APP_NAME = process.env.APP_NAME ?? 'DMCC';
export const ROOM_TYPES =
  process.env.ROOM_TYPES ??
  '{"Private Room":"private","Meeting Room":"meeting","Co-Working Space":"coworking","Auditorium":"auditorium"}';

export const APP_SUPPORT_EMAIL =
  process.env.APP_SUPPORT_EMAIL ?? 'LVdevs@virtualhq.co';

export const FORCE_2FA = (process.env.FORCE_2FA ?? 'false') === 'true';

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? '';
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? '';
export const TWILIO_VERIFICATION_SID =
  process.env.TWILIO_VERIFICATION_SID ?? '';
