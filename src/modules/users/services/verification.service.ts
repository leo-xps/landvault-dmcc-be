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

    return {
      otp: OTP,
      email: user.email,
    };
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

  async createOTPPass(contact: string, type: string) {
    const generateRandomCode = Math.floor(100000 + Math.random() * 900000);

    const jwt: any = {
      contact: contact,
      type: type,
      code: generateRandomCode,
    };

    const accessToken: string = this.jwtService.sign(jwt, {
      expiresIn: '1d',
    });

    await this.db.otpPass.create({
      data: {
        code: generateRandomCode,
        token: accessToken,
      },
    });

    const OTP = await this.db.otpPass.findFirst({
      where: { code: generateRandomCode },
    });

    return {
      otp: OTP,
      contact: contact,
      type: type,
    };
  }

  async validateOTPPass(code: number, contact: string) {
    const OTP = await this.db.otpPass.findFirst({
      where: { code },
    });

    if (!OTP) {
      throw new NotFoundException(
        this.i18n.translate('verification.INVALID_CODE'),
      );
    }

    const token = await this.verifyJWT(OTP.token);

    if (token.expired) {
      throw new UnprocessableEntityException(
        this.i18n.translate('verification.OTP_EXPIRED'),
      );
    }

    switch (token.payload.type) {
      case 'email':
        if (contact !== token.payload.contact) {
          throw new UnprocessableEntityException(
            this.i18n.translate('verification.INVALID_EMAIL'),
          );
        }
        break;
      case 'sms':
        if (contact !== token.payload.contact) {
          throw new UnprocessableEntityException(
            this.i18n.translate('verification.INVALID_PHONE'),
          );
        }
        break;
    }

    return { verified: true, token: OTP.token };
  }

  async validateOTPToken(
    tokenString: string,
    contact: {
      email?: string;
      phone?: string;
    },
  ) {
    const token = await this.verifyJWT(tokenString);

    if (token.expired) {
      throw new UnprocessableEntityException(
        this.i18n.translate('verification.OTP_EXPIRED'),
      );
    }

    switch (token.payload.type) {
      case 'email':
        if (contact.email !== token.payload.contact) {
          throw new UnprocessableEntityException(
            this.i18n.translate('verification.INVALID_EMAIL'),
          );
        }
        break;
      case 'sms':
        if (contact.phone !== token.payload.contact) {
          throw new UnprocessableEntityException(
            this.i18n.translate('verification.INVALID_PHONE'),
          );
        }
        break;
    }

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
