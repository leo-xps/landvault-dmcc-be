import { AUTO_URL, ROOM_URL } from '@common/environment';
import { sha256HashString } from '@common/utils/hash';
import { BlacklistedService } from '@modules/blacklisted/services/blacklisted.service';
import { BrevoMailerService } from '@modules/brevo-mailer/services/brevo-mailer.service';
import { DbService } from '@modules/db/db.service';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { I18nService } from 'nestjs-i18n';
import { RegisterUserInput } from '../dto/input/register-user.input';
import {
  UpdateUserInfo,
  UpdateUserInput,
} from '../dto/input/update-user.input';
import {
  GetUserRequest,
  GetUserResponse,
} from '../dto/interfaces/getuser.interface';
import { PayloadInterface } from '../dto/interfaces/payload.interface';
import { DbVerificationService } from './verification.service';

@Injectable()
export class DbUsersService {
  constructor(
    private readonly i18n: I18nService,
    private readonly jwtService: JwtService,
    private readonly db: DbService,
    private readonly blacklistedService: BlacklistedService,
    private readonly verification: DbVerificationService,
    private readonly email: BrevoMailerService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async sendEmailNotifications() {
    console.log('Deleting old short join token entries older than 3 days.');

    // delete room tokens older than 3 days
    const now = moment();
    const threeDaysAgo = now.subtract(3, 'days');

    await this.db.shortenedTokens.deleteMany({
      where: {
        createdAt: {
          lte: threeDaysAgo.toDate(),
        },
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(rawPassword: string, hashedPassword: string) {
    return await bcrypt.compare(rawPassword, hashedPassword);
  }

  async findUserId(id: string) {
    return await this.db.users.findUnique({
      where: { id },
      select: { id: true, password: false },
    });
  }

  async registerUser(registerUserInput: RegisterUserInput) {
    const userExist = await this.db.users.findFirst({
      where: {
        OR: [
          { email: registerUserInput.email.toLowerCase() },
          { username: registerUserInput.username },
        ],
      },
    });

    if (userExist) {
      const duplicateField =
        userExist.email === registerUserInput.email ? 'EMAIL' : 'USERNAME';
      throw new UnprocessableEntityException(
        this.i18n.translate(`user.${duplicateField}_ALREADY_REGISTERED`),
      );
    }

    let code;

    if (registerUserInput.guestId) {
      const guestData = await this.db.users.findUnique({
        where: { id: registerUserInput.guestId, isGuest: true },
      });

      if (!guestData) {
        throw new NotFoundException(this.i18n.translate('user.USER_NOT_FOUND'));
      }

      //optional
      // code = await this.verification.createOTP(
      //   registerUserInput.email.toLowerCase(),
      //   registerUserInput.guestId,
      // );

      //revoke token
      await this.blacklistedService.addTokenToBlacklist(guestData.guestToken);

      await this.db.users.update({
        where: { id: registerUserInput.guestId },
        data: {
          email: registerUserInput.email.toLowerCase(),
          password: await this.hashPassword(registerUserInput.password),
          phoneNumber: registerUserInput?.phoneNumber,
          isGuest: false,
          dmccID: registerUserInput?.dmccID,
          dmccEmail: registerUserInput?.dmccEmail,
          company: registerUserInput?.company,
          position: registerUserInput?.position,
          // guestToken: null,
        },
      });
    } else {
      await this.db.users.create({
        data: {
          email: registerUserInput.email.toLowerCase(),
          username: registerUserInput?.username,
          password: await this.hashPassword(registerUserInput.password),
          phoneNumber: registerUserInput?.phoneNumber,
          dmccID: registerUserInput?.dmccID,
          dmccEmail: registerUserInput?.dmccEmail,
          company: registerUserInput?.company,
          position: registerUserInput?.position,
        },
      });
      //optional
      code = await this.verification.createOTP(
        registerUserInput.email.toLowerCase(),
        undefined,
      );
    }

    //optional sending email verification
    const emailData = {
      email: registerUserInput.email.toLowerCase(),
      subject: 'Registration',
      fileLocation: 'dist/template/email-registration-verification.hbs',
      params: {
        OTP: code.code,
      },
    };

    // await this.email.sendEmailFromTemplate(
    //   emailData.email,
    //   emailData.subject,
    //   emailData.fileLocation,
    //   emailData.params,
    // );

    return this.db.users.findUnique({
      where: { email: registerUserInput.email },
    });
  }

  async login(emailUser: string, password: string) {
    const user = await this.db.users.findFirst({
      where: {
        OR: [{ email: emailUser.toLowerCase() }, { username: emailUser }],
      },
    });

    if (!user) {
      throw new UnprocessableEntityException(
        this.i18n.translate('user.INVALID_CREDENTIALS'),
      );
    }

    //optional
    // if (!user.verified) {
    //   throw new UnprocessableEntityException(
    //     this.i18n.translate('user.NOT_VERIFIED'),
    //   );
    // }

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: PayloadInterface = {
        uid: user.id,
        id: user.id,
        email: user.email,
      };

      const accessToken: string = this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnprocessableEntityException(
        this.i18n.translate('user.INVALID_CREDENTIALS'),
      );
    }
  }

  async getUserInfoById(userId: string) {
    const user = await this.db.users.findUnique({
      where: { id: userId },
      include: {
        TagsInUser: {
          include: {
            tag: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(this.i18n.translate('user.USER_NOT_FOUND'));
    }

    return user;
  }

  async generateGuestToken() {
    const generateGuestUsername = await this.generateGuestUsername();
    const guestEmail = generateGuestUsername + '@guest.io';
    const newGuest = await this.db.users.create({
      data: {
        isGuest: true,
        username: generateGuestUsername,
        email: guestEmail,
      },
    });

    const payload: PayloadInterface = {
      uid: newGuest.id,
      id: newGuest.id,
      email: newGuest.email,
    };

    const accessToken: string = this.jwtService.sign(payload, {
      expiresIn: '99y',
    });

    await this.db.users.update({
      where: { id: newGuest.id },
      data: {
        guestToken: accessToken,
      },
    });

    return { accessToken };
  }

  async forgotPasswordSendEmail(email: string) {
    const userExist = await this.db.users.findUnique({
      where: { email: email },
    });
    if (!userExist) {
      throw new NotFoundException(this.i18n.translate('user.USER_NOT_FOUND'));
    }

    // create jwt to be used for password reset
    const jwtToken = this.jwtService.sign(
      {
        id: userExist.id,
        email: userExist.email,
        username: userExist.username,
        purpose: 'password-reset',
      },
      {
        expiresIn: '15m',
      },
    );

    const passwordResetURL = new URL(`${process.env.SERVER_URL}/page/reset`);
    passwordResetURL.searchParams.append('token', jwtToken);

    //optional sending email verification
    const emailData = {
      email: email.toLowerCase(),
      subject: 'Forgot Password',
      fileLocation: 'dist/template/forgot-password-verification.hbs',
      params: {
        OTP: passwordResetURL.href,
      },
    };

    await this.email.sendEmailFromTemplate(
      emailData.email,
      emailData.subject,
      emailData.fileLocation,
      emailData.params,
    );
    return { data: 'Verification Code Sent Successfully for Password Reset' };
  }

  async forgotPasswordWithJWT(token: string, newPassword: string) {
    let decoded: PayloadInterface;
    try {
      // verify jwt token
      decoded = this.jwtService.verify(token) as PayloadInterface;

      if (!decoded) {
        throw new UnprocessableEntityException(
          this.i18n.translate(`user.INVALID_TOKEN`),
        );
      }
    } catch (error) {
      throw new UnprocessableEntityException(
        this.i18n.translate(`user.INVALID_TOKEN`),
      );
    }

    // get user id from jwt token
    const user = await this.db.users.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('user.USER_NOT_FOUND'));
    }

    // hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // update user password
    await this.db.users.update({
      where: { id: decoded.id },
      data: { password: hashedNewPassword },
    });

    return { data: `Password for ${user.email} updated successfully` };
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string) {
    const hashedNewPassword = await this.hashPassword(newPassword);
    const user = await this.db.users.findFirst({
      where: { id: id },
    });

    if (!user) {
      throw new UnprocessableEntityException(
        this.i18n.translate('user.INVALID_CREDENTIALS'),
      );
    }

    const verified = await this.verifyPassword(oldPassword, user.password);

    if (!verified) {
      throw new UnprocessableEntityException(
        this.i18n.translate('user.INVALID_CREDENTIALS'),
      );
    }

    await this.db.users.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { data: 'Password updated successfully' };
  }

  async updateUsernameEmail(userID: string, updateUserInput: UpdateUserInput) {
    const userExist = await this.db.users.findFirst({
      where: {
        OR: [
          {
            email: updateUserInput.email
              ? updateUserInput.email.toLowerCase()
              : undefined,
          },
          { username: updateUserInput.username },
        ],
      },
    });

    if (userExist) {
      const duplicateField =
        userExist.email === updateUserInput.email ? 'EMAIL' : 'USERNAME';
      throw new UnprocessableEntityException(
        this.i18n.translate(`user.${duplicateField}_ALREADY_REGISTERED`),
      );
    }

    await this.db.users.update({
      where: {
        id: userID,
      },
      data: {
        email: updateUserInput.email
          ? updateUserInput?.email?.toLowerCase()
          : undefined,
        username: updateUserInput?.username,
      },
    });

    return { data: 'User updated successfully' };
  }

  async updateUserInfo(userID: string, updateUserInput: UpdateUserInfo) {
    await this.db.users.update({
      where: {
        id: userID,
      },
      data: {
        firstName: updateUserInput?.firstName,
        lastName: updateUserInput?.lastName,
        countryCode: updateUserInput?.countryCode,
        phoneNumber: updateUserInput?.phoneNumber,
        position: updateUserInput?.position,
        company: updateUserInput?.company,
        dmccID: updateUserInput?.dmccID,
        dmccEmail: updateUserInput?.dmccEmail,
      },
    });

    if (updateUserInput?.tags) {
      // lowercase, remove duplicates, strip
      updateUserInput.tags = updateUserInput.tags
        .map((tag) => tag.toLowerCase().trim())
        .filter((tag, index, self) => self.indexOf(tag) === index);

      // create a record of <tag, tagID>
      const tagList: Record<string, string> = {};

      // get tag ID from the database
      const tags = await this.db.userTags.findMany({
        where: {
          tag: {
            in: updateUserInput.tags,
          },
        },
      });
      for (const tag of tags) {
        tagList[tag.tag] = tag.id;
      }

      // create new tags if not found
      for (const tag of updateUserInput.tags) {
        if (!tagList[tag]) {
          const newTag = await this.db.userTags.create({
            data: {
              tag,
            },
          });
          tagList[tag] = newTag.id;
        }
      }

      // get all user tags
      const existingTagsInUser = await this.db.tagsInUser.findMany({
        where: {
          userID,
        },
        include: {
          tag: true,
        },
      });

      // if there's a tag in existing tags that is not in the new tags, delete it
      for (const tag of existingTagsInUser) {
        if (!tagList[tag.tag.tag]) {
          await this.db.tagsInUser.delete({
            where: {
              id: tag.id,
            },
          });
        }
      }

      // if there's a new tag not in the existing tags, add it
      for (const tag of updateUserInput.tags) {
        if (
          !existingTagsInUser.find((existingTag) => existingTag.tag.tag === tag)
        ) {
          await this.db.tagsInUser.create({
            data: {
              tagID: tagList[tag],
              userID,
            },
          });
        }
      }
    }

    return { data: 'User updated successfully' };
  }

  async searchUserByTags(userID: string, tags: string[]) {
    // lowercase, remove duplicates, strip
    tags = tags
      .map((tag) => tag.toLowerCase().trim())
      .filter((tag, index, self) => self.indexOf(tag) === index);

    const users = await this.db.users.findMany({
      where: {
        TagsInUser: {
          some: {
            tag: {
              tag: {
                in: tags,
              },
            },
          },
        },
        NOT: {
          id: userID,
        },
      },
      include: {
        TagsInUser: {
          include: {
            tag: true,
          },
        },
        AvaturnModels: {
          where: {
            isDefault: true,
          },
        },
      },
    });

    const userList = users.map((user) => {
      const userTags = user.TagsInUser?.map((tag) => tag.tag.tag) ?? [];
      const matchingTags = tags.filter((tag) => userTags.includes(tag));
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        model: user.AvaturnModels?.[0]?.modelID ?? '',
        company: user.company,
        position: user.position,
        tags: userTags,
        matchingTags,
      };
    });

    // sort by matching tags
    userList.sort((a, b) => b.matchingTags.length - a.matchingTags.length);

    return userList;
  }

  async updateUserRole(userID: string, role: string) {
    const user = await this.db.users.findUnique({
      where: { id: userID },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.translate('user.USER_NOT_FOUND'));
    }

    await this.db.users.update({
      where: { id: userID },
      data: { role: role },
    });

    return { data: 'User updated successfully' };
  }

  async expressLogin(token: string) {
    // check if token contains shorted token prefix
    const isShorted = token.includes(this.shortedTokenPrefix);

    if (isShorted) {
      token = token.replace(this.shortedTokenPrefix, '');
      const shortedToken = await this.db.shortenedTokens.findUnique({
        where: { code: token },
      });

      if (!shortedToken) {
        throw new UnprocessableEntityException(
          this.i18n.translate(`user.INVALID_TOKEN`),
        );
      }

      token = shortedToken.token;
    }

    let data: Token;
    try {
      // verify jwt token
      data = this.jwtService.verify(token);

      if (!data) {
        throw new UnprocessableEntityException(
          this.i18n.translate(`user.INVALID_TOKEN`),
        );
      }
    } catch (error) {
      throw new UnprocessableEntityException(
        this.i18n.translate(`user.INVALID_TOKEN`),
      );
    }

    // console.log({ token, data });

    if (!data) {
      throw new UnprocessableEntityException(
        this.i18n.translate(`user.INVALID_TOKEN`),
      );
    }

    if (data.guestAppointment) {
      // Used for the hubspot type of appointment
      const token = await this.generateGuestToken();

      return {
        data: {
          accessToken: token.accessToken,
          roomName: data.name,
          roomCode: data.code,
          roomType: data.roomType,
          roomEnvironment: data.roomEnvironment,
        },
      };
    }

    const appointmentCode = await this.db.appointments.findUnique({
      where: { code: data.code },
    });

    if (!appointmentCode) {
      throw new UnprocessableEntityException(
        this.i18n.translate(`user.INVALID_CODE`),
      );
    }

    const now = moment();
    const validOn = data.validOn;
    const expiredOn = data.expiredOn;

    // console.log({ now, validOn, expiredOn });

    if (!now.isBetween(validOn, expiredOn, null, '[]')) {
      throw new UnprocessableEntityException(
        this.i18n.translate(`user.DATE_IS_OUTSIDE_THE_VALID_RANGE`),
      );
    }

    if (data.isGuest) {
      const checkGuestEmailIfInvited = appointmentCode.guestList.includes(
        data.email,
      );
      if (!checkGuestEmailIfInvited) {
        throw new UnprocessableEntityException(
          this.i18n.translate(`appointment.NOT_INVITED`),
        );
      }

      const token = await this.generateGuestToken();

      return {
        data: {
          accessToken: token.accessToken,
          roomName: data.name,
          roomCode: data.code,
          roomType: data.roomType,
          roomEnvironment: data.roomEnvironment,
        },
      };
    } else {
      const user = await this.db.users.findUnique({
        where: {
          email: data.email,
        },
      });

      const checkUserEmailIfInvited = await this.db.userAppointments.findFirst({
        where: { appointmentId: appointmentCode.id, userId: user.id },
      });

      if (!checkUserEmailIfInvited) {
        throw new UnprocessableEntityException(
          this.i18n.translate(`appointment.NOT_INVITED`),
        );
      }

      const payload: PayloadInterface = {
        uid: user.id,
        id: user.id,
        email: user.email,
      };

      const accessToken: string = this.jwtService.sign(payload);

      return {
        data: {
          accessToken,
          roomCode: data.code,
          roomType: data.roomType,
          roomEnvironment: data.roomEnvironment,
        },
      };
    }
  }

  generateRandomCode(seed: string, length: number) {
    // can only use A-Z, 0-9
    const result = sha256HashString(seed).toUpperCase();

    return result.substring(0, length);
  }

  shortedTokenPrefix = 'lvj-';

  async createJoinLink(
    email,
    checkUserIfGuest,
    appointment: {
      code: string;
      startTime: Date;
      endTime: Date;
      roomName?: string;
      roomType: string;
      roomEnvironment: string;
      guestAppointment?: boolean;
      valid?: boolean;
    },
    shorted = false,
    auto = false,
  ) {
    const jwt = {
      email: email,
      name: appointment.roomName ?? '',
      code: appointment.code,
      roomType: appointment.roomType ?? '',
      roomEnvironment: appointment.roomEnvironment ?? '',
      validOn: appointment.startTime,
      expiredOn: appointment.endTime,
      isGuest: checkUserIfGuest ? false : true,
      guestAppointment: appointment.guestAppointment ?? false,
      valid: appointment.valid ?? false,
      hash: this.generateRandomCode(new Date().toISOString(), 12),
    };

    const token = this.jwtService.sign(jwt, {
      expiresIn: '9999d',
    });

    const bURL = auto ? AUTO_URL : ROOM_URL;

    if (shorted) {
      const shortedID = this.generateRandomCode(token, 12);
      // save url to database
      const shortedEntry = await this.db.shortenedTokens.create({
        data: {
          code: shortedID,
          token: token,
        },
      });

      const urlObject = new URL(ROOM_URL);
      urlObject.searchParams.append(
        'token',
        `${this.shortedTokenPrefix}${shortedEntry.code}`,
      );

      return urlObject;
    }

    const urlObject = new URL(bURL);
    urlObject.searchParams.append('token', token);

    const urlLink = urlObject.href;

    return urlLink;
  }

  // used by hubspot joining
  async roomGuestLogin(
    tokenSeed: string,
    roomType: string,
    roomEnvironment: string,
  ) {
    // const token = await this.generateGuestToken();
    const code = this.generateRandomCode(tokenSeed, 8);

    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);

    const joinURL = await this.createJoinLink(
      tokenSeed,
      false,
      {
        code,
        roomName: `Scheduled Appointment Meeting`,
        roomType: roomType,
        roomEnvironment: roomEnvironment,
        startTime: now,
        endTime: endTime,
        guestAppointment: true,
      },
      true,
    );

    // console.log({ joinURL });

    // save url at database

    return {
      joinURL,
    };
  }

  async generateGuestUsername() {
    const randomDigits = (length) => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
      }
      return result;
    };

    const randomNumbers = randomDigits(7);
    return `GUEST${randomNumbers}`;
  }

  // trading game

  async getUserTradingGame(data: GetUserRequest): Promise<GetUserResponse> {
    const response: GetUserResponse = {
      msg: {
        wsi: '',
        uid: '',
        mcd: 0,
        tim: 0,
        erc: 0,
        ers: '',
        cmd: 0,
      },
      dtl: [],
    };
    let dbData;

    try {
      dbData = await this.db.users.findFirst({
        where: {
          id: data.ecs,
        },
      });

      response.dtl.push({
        lid: dbData.id,
        eid: dbData.email,
        fnm: `${dbData.firstName ?? ''}${
          dbData.lastName ? ` ${dbData.lastName}` : ''
        }`,
        mob: dbData.phoneNumber ?? '',
        rid: Number(dbData.countryCode ?? 0),
      });
    } catch (err) {
      response.msg.erc = 404;
      response.msg.ers = err.message;
    }

    if (!dbData) {
      response.msg.erc = 404;
      response.msg.ers = 'User not found.';
    }

    return response;
  }

  // dmcc memebr

  async setDMCCMember(userID: string, dmccMember: boolean) {
    await this.db.users.update({
      where: { id: userID },
      data: {
        dmccMember,
      },
    });

    return { data: 'User updated successfully' };
  }
}
