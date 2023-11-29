import { JWT_SECRET } from '@common/environment';
import { DbUsersService } from '@modules/users/services/db-users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly dbUser: DbUsersService,
    private readonly i18n: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.dbUser.findUserId(payload.id);
    if (!user) {
      throw new NotFoundException(this.i18n.translate('user.USER.NOT_FOUND'));
    }
    return user;
  }
}
