import { JwtStrategy } from '@common/auth/strategy/jwt.strategy';
import { JWT_EXPIRATION, JWT_SECRET } from '@common/environment';
import { BlacklistedModule } from '@modules/blacklisted/blacklisted.module';
import { BrevoMailerModule } from '@modules/brevo-mailer/brevo-mailer.module';
import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './controllers/users.controller';
import { DbUsersService } from './services/db-users.service';
import { DbVerificationService } from './services/verification.service';

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
    BlacklistedModule,
    BrevoMailerModule,
    ServerTokensModule,
  ],
  controllers: [UsersController],
  providers: [JwtStrategy, DbUsersService, DbVerificationService],
  exports: [DbUsersService],
})
export class UsersModule {}
