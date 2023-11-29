import { DbService } from '@modules/db/db.service';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class DbVerificationService {
  constructor(
    private readonly i18n: I18nService,
    private readonly jwtService: JwtService,
    private readonly db: DbService, // private readonly dbUsersService: DbUsersService,
  ) {}

  async createOTP(email?: string, id?: string) {
    const generateRandomCode = Math.floor(100000 + Math.random() * 900000);

    const user = id
      ? await this.db.users.findUnique({ where: { id } })
      : await this.db.users.findUnique({ where: { email } });

    const jwt: any = {
      id: user.id,
      email: email,
      code: generateRandomCode,
    };

    const accessToken: string = this.jwtService.sign(jwt, {
      expiresIn: '5m',
    });

    await this.db.otp.create({
      data: {
        code: generateRandomCode,
        userID: user.id,
        token: accessToken,
      },
    });

    const OTP = await this.db.otp.findFirst({
      where: { code: generateRandomCode },
    });

    return OTP;
  }

  async validateOTP(code: number, email: string) {
    const user = await this.db.users.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        await this.i18n.translate('user.USER_NOT_FOUND'),
      );
    }
    const OTP = await this.db.otp.findFirst({
      where: { code, userID: user.id },
    });
    if (!OTP) {
      throw new NotFoundException(
        this.i18n.translate('verification.INVALID_CODE'),
      );
    }

    const expired = await this.verifyJWT(OTP.token);

    if (expired.expired) {
      throw new UnprocessableEntityException(
        this.i18n.translate('verification.OTP_EXPIRED'),
      );
    }

    await this.db.users.update({
      where: { id: user.id },
      data: {
        verified: true,
      },
    });

    return { verified: true };
  }

  async verifyJWT(token: string) {
    try {
      return { payload: this.jwtService.verify(token), expired: false };
    } catch (error) {
      if ((error as Error).name == 'TokenExpiredError') {
        return { payload: this.jwtService.verify(token), expired: true };
      }
      throw error;
    }
  }
}
