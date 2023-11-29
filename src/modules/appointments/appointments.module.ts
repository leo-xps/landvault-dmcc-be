import { JWT_EXPIRATION, JWT_SECRET } from '@common/environment';
import { BrevoMailerModule } from '@modules/brevo-mailer/brevo-mailer.module';
import { DbModule } from '@modules/db/db.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppointmentsController } from './controllers/appointments.controller';
import { AppointmentsService } from './services/appointments.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: JWT_SECRET,
        signOptions: {
          expiresIn: JWT_EXPIRATION,
        },
      }),
    }),
    DbModule,
    BrevoMailerModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
