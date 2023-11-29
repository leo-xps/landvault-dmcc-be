import { DbService } from '@modules/db/db.service';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class RestAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly db: DbService,
    private readonly i18n: I18nService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;

    if (!result) {
      return false;
    }

    const request = this.getRequest(context);
    const token = this.getTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.TOKEN_NOT_FOUND'),
      );
    }

    const isBlacklisted = await this.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException(this.i18n.translate('auth.UNAUTHORIZED'));
    }

    return true;
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }

  getTokenFromRequest(request) {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.db.blacklistedToken.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }
}
