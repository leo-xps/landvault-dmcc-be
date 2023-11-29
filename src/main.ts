import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app.module';
import { APP_ENV, APP_PORT } from '@common/environment';
import corsConfig from '@config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(corsConfig);

  if (APP_ENV === 'local' || 'dev' || 'staging') {
  }

  await app.listen(APP_PORT, '0.0.0.0').then(async () => {
    Logger.log(
      `✅  Application is running on: ${await app.getUrl()}`,
      'NestJS',
    );

    if (APP_ENV !== 'local') {
      return;
    } else {
      console.info(`Server Details:
          port: ${APP_PORT},
          environment: ${APP_ENV},
          
          `);
    }
  });
}
bootstrap().catch((e) => {
  Logger.error('❌  Error starting server', e, 'NestJS', false);
  throw e;
});
