import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseDto } from '@common/dto/response.dto';
import { BlacklistedService } from '@modules/blacklisted/services/blacklisted.service';
import { DbService } from '@modules/db/db.service';
import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { RegisterUserInput } from '../dto/input/register-user.input';
import {
  SearchByTags,
  UpdateUserInfo,
  UpdateUserInput,
} from '../dto/input/update-user.input';
import { GetUserRequest } from '../dto/interfaces/getuser.interface';
import { UsersMapper } from '../dto/mapper/users.mapper';
import { UserOutput } from '../dto/output/user.output';
import { DbUsersService } from '../services/db-users.service';
import { DbVerificationService } from '../services/verification.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly dbUsersService: DbUsersService,
    private readonly dbVerificationService: DbVerificationService,
    private readonly serverAdminToken: ServerTokensService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly blacklistedService: BlacklistedService,
    private readonly db: DbService,
  ) {}

  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  @Post('login')
  async login(
    @Body('user') emailUser: string,
    @Body('password') password: string,
  ): Promise<ResponseDto<{ accessToken: string }>> {
    const response = await this.dbUsersService.login(emailUser, password);
    return { data: response };
  }

  @Post('register')
  async createUser(
    @Body() registerUserInput: RegisterUserInput,
  ): Promise<UserOutput> {
    const data = await this.dbUsersService.registerUser(registerUserInput);
    return UsersMapper.displayOne(data);
  }

  @Get()
  @UseGuards(RestAuthGuard)
  async getUserInfo(@CurrentUser() user: any) {
    const response = await this.dbUsersService.getUserInfoById(user.id);
    return { data: UsersMapper.displayOne(response) };
  }

  @Post('/verify')
  async verifyToken(@Body('uid') uid, @Body('tok') tok) {
    let data: any;
    try {
      // verify jwt token
      data = this.jwtService.verify(tok);

      if (!data) {
        throw new UnauthorizedException(
          this.i18n.translate(`user.INVALID_TOKEN`),
        );
      }

      if (data.id !== uid) {
        throw new UnauthorizedException(
          this.i18n.translate(`user.INVALID_TOKEN`),
        );
      }

      // check if token is blacklisted
      const isBlacklisted = await this.blacklistedService.isTokenBlacklisted(
        tok,
      );

      if (isBlacklisted) {
        throw new UnauthorizedException(
          this.i18n.translate(`user.INVALID_TOKEN`),
        );
      }
    } catch (error) {
      throw new UnauthorizedException(
        this.i18n.translate(`user.INVALID_TOKEN`),
      );
    }
    return UsersMapper.displayOne(data);
  }

  @Post('logout')
  @UseGuards(RestAuthGuard)
  async logout(@CurrentUser() user: any, @Headers('Authorization') token) {
    const tok = token.split(' ')[1];
    //revoke token
    await this.blacklistedService.addTokenToBlacklist(tok);

    return { message: 'success', id: user.id };
  }

  @Post('guest')
  async generateGuestToken() {
    const token = await this.dbUsersService.generateGuestToken();
    return { token };
  }

  @Get('verify-code')
  async verify(@Body('code') code: number, @Body('email') email: string) {
    return await this.dbVerificationService.validateOTP(code, email);
  }

  @Post('send-forgot-password')
  async forgotPasswordSendEmail(@Body('email') email: string) {
    return await this.dbUsersService.forgotPasswordSendEmail(email);
  }

  @Post('forgot-password')
  async forgotPassword(
    @CurrentUser() user: any,
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.dbUsersService.forgotPasswordWithJWT(token, newPassword);
  }

  @Post('update-password')
  @UseGuards(RestAuthGuard)
  async updatePassword(
    @CurrentUser() user: any,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.dbUsersService.updatePassword(
      user.id,
      oldPassword,
      newPassword,
    );
  }

  @Post('update-role')
  @UseGuards(RestAuthGuard)
  async upgradeToAdmin(@CurrentUser() user: any, @Query('role') role: string) {
    return await this.dbUsersService.updateUserRole(user.id, role ?? 'user');
  }

  @Post('update-user')
  @UseGuards(RestAuthGuard)
  async updateUsername(
    @CurrentUser() user: any,
    @Body() updateUserInput: UpdateUserInput,
  ) {
    return await this.dbUsersService.updateUsernameEmail(
      user.id,
      updateUserInput,
    );
  }

  @Post('express-login')
  async expressLogin(@Body('token') token: string) {
    return await this.dbUsersService.expressLogin(token);
  }

  @Get('appointment-join')
  async appointmentLogin(
    @Query('token') token: string,
    @Query('room') room: string,
    @Res() res,
  ) {
    room = room ?? 'lobby_normal';
    const roomType = room.split('_')[0];
    const roomEnvironment = '';
    const joinData = await this.dbUsersService.roomGuestLogin(
      token,
      roomType,
      roomEnvironment,
    );

    // console.log(joinData);
    // redirect to joinPage
    return res.redirect(joinData.joinURL);
  }

  @Post('create-shareable-link-auto')
  async createRoomAuto(
    @Headers('lv-srv-adm') srvToken: string,
    @Body('roomName') roomName,
    @Body('roomCode') roomCode,
    @Body('roomType') roomType,
    @Body('roomEnvironment') roomEnvironment,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);

    const url = await this.dbUsersService.createJoinLink(
      '',
      false,
      {
        code: roomCode,
        roomName: roomName,
        roomType: roomType,
        roomEnvironment: roomEnvironment,
        startTime: now,
        endTime: endTime,
        guestAppointment: true,
        valid,
      },
      true,
      true,
    );

    return { url };
  }

  @Post('create-shareable-link')
  async createRoom(
    @Headers('lv-srv-adm') srvToken: string,
    @Body('roomName') roomName,
    @Body('roomCode') roomCode,
    @Body('roomType') roomType,
    @Body('roomEnvironment') roomEnvironment,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);

    const url = await this.dbUsersService.createJoinLink(
      '',
      false,
      {
        code: roomCode,
        roomName: roomName,
        roomType: roomType,
        roomEnvironment: roomEnvironment,
        startTime: now,
        endTime: endTime,
        guestAppointment: true,
        valid,
      },
      true,
    );

    return { url };
  }

  @Post('get-user-info')
  async getUsersInfo(@Body() data: GetUserRequest) {
    return this.dbUsersService.getUserTradingGame(data);
  }

  @Post('update-info')
  @UseGuards(RestAuthGuard)
  async updateUserInfo(@CurrentUser() user: any, @Body() data: UpdateUserInfo) {
    return this.dbUsersService.updateUserInfo(user.id, data);
  }

  @Post('search-by-tags')
  @UseGuards(RestAuthGuard)
  async searchByTags(@CurrentUser() user: any, @Body() data: SearchByTags) {
    return this.dbUsersService.searchUserByTags(user.id, data.tags);
  }

  @Post('set-dmcc-member')
  async setDMCCMember(
    @Headers('lv-srv-adm') srvToken: string,
    @Body('data')
    data: {
      userID: string;
      dmccMember: boolean;
    }[],
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      throw new UnauthorizedException('Invalid token');
    }

    for (const item of data) {
      await this.dbUsersService.setDMCCMember(item.userID, item.dmccMember);
    }

    return {
      processed: data.length,
    };
  }

  @Get('dmcc-member')
  async getDMCCMemberList(
    @Headers('lv-srv-adm') srvToken: string,
    @Query('isMember') isMember: string,
    @Query('page') page: string,
    @Query('perPage') perPage: string,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      throw new UnauthorizedException('Invalid token');
    }

    const _page = Number(page) || 1;
    const _perPage = Number(perPage) || 10;

    const data = await this.db.users.findMany({
      where: {
        dmccMember: isMember == 'true' ? true : false,
        email: {
          not: {
            contains: '@guest.io',
          },
        },
      },
      skip: (_page - 1) * _perPage,
      take: _perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: data.map((item) => ({
        id: item.id,
        email: item.email,
        username: item.username,
        dmccMember: item.dmccMember,
        dmccEmail: item.dmccEmail,
        dmccID: item.dmccID,
        phoneNumber: item.phoneNumber,
      })),
    };
  }
}
