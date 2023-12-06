import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseDto } from '@common/dto/response.dto';
import { BlacklistedService } from '@modules/blacklisted/services/blacklisted.service';
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
import { UpdateUserInput } from '../dto/input/update-user.input';
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
    return data;
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
    const roomEnvironment = room.split('_')[1];
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
}
